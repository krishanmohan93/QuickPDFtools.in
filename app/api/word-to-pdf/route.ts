import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts, PDFFont } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import mammoth from "mammoth";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { saveFileToTemp } from "@/lib/unlockPdf";
import { resolveLibreOfficePath } from "@/lib/libreOfficePath";

export const runtime = "nodejs";
export const maxDuration = 300;

const FONT_DIR = path.join(process.cwd(), "public", "fonts");
const FONT_SANS_PATH = path.join(FONT_DIR, "DejaVuSans.ttf");
const FONT_SANS_BOLD_PATH = path.join(FONT_DIR, "DejaVuSans-Bold.ttf");

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file0") as File;

        if (!file) {
            return NextResponse.json(
                { error: "Please upload a Word document" },
                { status: 400 }
            );
        }

        // Validate file type - check both MIME type and extension
        const fileName = file.name.toLowerCase();
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
            'application/msword', // .doc
        ];
        const hasValidExtension = fileName.endsWith('.doc') || fileName.endsWith('.docx');
        const hasValidMimeType = allowedTypes.includes(file.type);

        if (!hasValidExtension && !hasValidMimeType) {
            return NextResponse.json(
                { error: "Please upload a valid Word document (.doc or .docx)" },
                { status: 400 }
            );
        }

        const shouldUseLibreOffice = process.env.WORD_TO_PDF_USE_LIBREOFFICE === "1";
        let libreOfficeResult: { bytes: Uint8Array } | null = null;

        if (shouldUseLibreOffice) {
            const temp = await saveFileToTemp(file, "word-to-pdf");
            try {
                libreOfficeResult = await tryConvertWithLibreOffice(temp.filePath);
            } finally {
                await temp.cleanup();
            }
        }

        if (libreOfficeResult) {
            return new NextResponse(Buffer.from(libreOfficeResult.bytes), {
                status: 200,
                headers: {
                    "Content-Type": "application/pdf",
                    "Content-Disposition": `attachment; filename=${getFileNameWithoutExtension(file.name)}.pdf`,
                    "X-Original-Format": file.type,
                    "X-Conversion-Type": "word-to-pdf",
                    "X-Conversion-Engine": "libreoffice",
                },
            });
        }

        // ---- Fallback (pure JS, no external apps) ----
        // Best-effort conversion that preserves text flow and embeds images inline.

        // Read file content
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Extract text and HTML from Word document
        const textResult = await mammoth.extractRawText({ buffer });
        const htmlResult = await mammoth.convertToHtml({ buffer }, {
            convertImage: mammoth.images.imgElement(async (image) => {
                return image.read("base64").then((imageBuffer) => {
                    return {
                        src: `data:${image.contentType};base64,${imageBuffer}`,
                    };
                });
            }),
        });

        const text = textResult.value;
        const html = htmlResult.value || "";

        if (!text || text.trim().length === 0) {
            throw new Error("No text content found in the Word document");
        }

        // Create PDF using pdf-lib
        const pdfDoc = await PDFDocument.create();

        // Embed Unicode-capable fonts to avoid WinAnsi encoding errors
        const { regularFont, boldFont, usedStandardFonts } = await embedWordFonts(pdfDoc);
        const sanitize = usedStandardFonts ? sanitizeWinAnsi : (value: string) => value;

        const pageWidth = 595.28; // A4 width in points
        const pageHeight = 841.89; // A4 height in points
        const margin = 72; // 1 inch margin
        const fontSize = 12;
        const lineHeight = fontSize * 1.5;
        const maxWidth = pageWidth - (margin * 2);

        let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        let yPosition = pageHeight - margin;

        // Add title
        const title = sanitize(getFileNameWithoutExtension(file.name));
        currentPage.drawText(title, {
            x: margin,
            y: yPosition,
            size: 18,
            font: boldFont,
            color: rgb(0, 0, 0),
        });
        yPosition -= 30;

        // Add metadata line
        const metadata = `Converted from Word Document`;
        currentPage.drawText(sanitize(metadata), {
            x: margin,
            y: yPosition,
            size: 10,
            font: regularFont,
            color: rgb(0.4, 0.4, 0.4),
        });
        yPosition -= 30;

        // Process text content + inline images (best-effort)
        const blocks = parseHtmlBlocks(html, sanitize);
        const normalizedText = sanitize(text);
        if (blocks.length === 0 && normalizedText) {
            blocks.push({ type: "text", text: normalizedText });
        }

        for (const block of blocks) {
            if (block.type === "text") {
                const paragraphs = block.text.split('\n').filter(p => p.trim());
                for (const paragraph of paragraphs) {
                    const trimmedParagraph = paragraph.trim();
                    if (!trimmedParagraph) continue;

                    // Word wrap the paragraph
                    const words = trimmedParagraph.split(' ');
                    let currentLine = '';

                    for (const word of words) {
                        const testLine = currentLine ? `${currentLine} ${word}` : word;
                        const textWidth = regularFont.widthOfTextAtSize(testLine, fontSize);

                        if (textWidth > maxWidth && currentLine) {
                            // Draw the current line
                            if (yPosition < margin + 20) {
                                // Add new page
                                currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
                                yPosition = pageHeight - margin;
                            }

                            currentPage.drawText(currentLine, {
                                x: margin,
                                y: yPosition,
                                size: fontSize,
                                font: regularFont,
                                color: rgb(0, 0, 0),
                            });
                            yPosition -= lineHeight;
                            currentLine = word;
                        } else {
                            currentLine = testLine;
                        }
                    }

                    // Draw the last line of the paragraph
                    if (currentLine) {
                        if (yPosition < margin + 20) {
                            currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
                            yPosition = pageHeight - margin;
                        }

                        currentPage.drawText(currentLine, {
                            x: margin,
                            y: yPosition,
                            size: fontSize,
                            font: regularFont,
                            color: rgb(0, 0, 0),
                        });
                        yPosition -= lineHeight;
                    }

                    // Add extra space between paragraphs
                    yPosition -= lineHeight * 0.5;
                }
            } else if (block.type === "image") {
                const imageBytes = block.bytes;
                if (!imageBytes || imageBytes.length === 0) continue;
                let embedded;
                try {
                    if (block.mime.includes("png")) {
                        embedded = await pdfDoc.embedPng(imageBytes);
                    } else {
                        embedded = await pdfDoc.embedJpg(imageBytes);
                    }
                } catch {
                    continue;
                }

                const { width: imgW, height: imgH } = embedded.scale(1);
                const maxImgWidth = maxWidth;
                const maxImgHeight = pageHeight - margin * 2;
                const scale = Math.min(1, maxImgWidth / imgW, maxImgHeight / imgH);
                const drawW = imgW * scale;
                const drawH = imgH * scale;

                if (yPosition - drawH < margin) {
                    currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
                    yPosition = pageHeight - margin;
                }

                currentPage.drawImage(embedded, {
                    x: margin,
                    y: yPosition - drawH,
                    width: drawW,
                    height: drawH,
                });

                yPosition -= drawH + lineHeight;
            }
        }

        // Add page numbers
        const pages = pdfDoc.getPages();
        const totalPages = pages.length;

        for (let i = 0; i < totalPages; i++) {
            const page = pages[i];
            const pageNumber = `Page ${i + 1} of ${totalPages}`;
            const textWidth = regularFont.widthOfTextAtSize(pageNumber, 9);

            page.drawText(pageNumber, {
                x: (pageWidth - textWidth) / 2,
                y: 30,
                size: 9,
                font: regularFont,
                color: rgb(0.5, 0.5, 0.5),
            });
        }

        // Save the PDF
        const pdfBytes = await pdfDoc.save();

        // Validate the output
        if (pdfBytes.length < 500) {
            throw new Error("Generated PDF is too small or invalid");
        }

        console.log("Conversion successful! Document size:", pdfBytes.length, "bytes");

        // Return the PDF
        const response = new NextResponse(Buffer.from(pdfBytes), {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename=${getFileNameWithoutExtension(file.name)}.pdf`,
                "X-Original-Format": file.type,
                "X-Text-Length": text.length.toString(),
                "X-Conversion-Type": "word-to-pdf",
                "X-Total-Pages": totalPages.toString(),
                "X-Conversion-Engine": "basic-js",
                "X-Conversion-Warning": "layout_may_differ",
            },
        });

        return response;

    } catch (error) {
        console.error("Error converting Word to PDF:", error);
        return NextResponse.json(
            { error: `Failed to convert Word to PDF: ${error instanceof Error ? error.message : 'Unknown error'}` },
            { status: 500 }
        );
    }
}

/**
 * Get filename without extension
 */
function getFileNameWithoutExtension(filename: string): string {
    return filename.replace(/\.[^/.]+$/, "");
}

async function tryConvertWithLibreOffice(inputPath: string): Promise<{ bytes: Uint8Array } | null> {
    const sofficePath = await resolveLibreOfficePath();
    const outputDir = await fsp.mkdtemp(path.join(os.tmpdir(), "word-to-pdf-out-"));
    const expectedBase = path.parse(inputPath).name;
    const outputPath = path.join(outputDir, `${expectedBase}.pdf`);

    try {
        await runProcess(
            sofficePath,
            ["--headless", "--convert-to", "pdf", "--outdir", outputDir, inputPath],
            2 * 60 * 1000
        );
        const exists = await fileExists(outputPath);
        if (!exists) {
            const fallback = await findFirstPdf(outputDir);
            if (!fallback) {
                throw new Error("LibreOffice did not generate a PDF output.");
            }
            return { bytes: await fsp.readFile(fallback) };
        }
        return { bytes: await fsp.readFile(outputPath) };
    } catch (error) {
        if (isMissingExecutable(error)) {
            return null;
        }
        throw error;
    } finally {
        await fsp.rm(outputDir, { recursive: true, force: true });
    }
}

function isMissingExecutable(error: unknown) {
    if (!error) return false;
    const anyErr = error as NodeJS.ErrnoException;
    if (anyErr.code === "ENOENT") return true;
    if (typeof anyErr.message === "string" && anyErr.message.toLowerCase().includes("not found")) {
        return true;
    }
    return false;
}

async function fileExists(filePath: string) {
    try {
        const stat = await fsp.stat(filePath);
        return stat.isFile();
    } catch {
        return false;
    }
}

async function findFirstPdf(dir: string) {
    try {
        const entries = await fsp.readdir(dir);
        const pdf = entries.find((entry) => entry.toLowerCase().endsWith(".pdf"));
        return pdf ? path.join(dir, pdf) : null;
    } catch {
        return null;
    }
}

function runProcess(command: string, args: string[], timeoutMs: number): Promise<void> {
    return new Promise((resolve, reject) => {
        let settled = false;
        let stderr = "";

        const finish = (error?: Error) => {
            if (settled) return;
            settled = true;
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        };

        const processHandle = spawn(command, args, { stdio: ["ignore", "ignore", "pipe"] });

        const timeoutId = setTimeout(() => {
            processHandle.kill("SIGKILL");
            finish(new Error("LibreOffice conversion timed out."));
        }, timeoutMs);

        processHandle.stderr?.on("data", (chunk) => {
            stderr += chunk.toString();
        });

        processHandle.on("error", (err: NodeJS.ErrnoException) => {
            clearTimeout(timeoutId);
            finish(err);
        });

        processHandle.on("exit", (code) => {
            clearTimeout(timeoutId);
            if (code === 0) {
                finish();
                return;
            }
            finish(new Error(stderr || `LibreOffice exited with code ${code ?? "unknown"}`));
        });
    });
}

async function embedWordFonts(pdfDoc: PDFDocument): Promise<{
    regularFont: PDFFont;
    boldFont: PDFFont;
    usedStandardFonts: boolean;
}> {
    try {
        const [regularBytes, boldBytes] = await Promise.all([
            fsp.readFile(FONT_SANS_PATH),
            fsp.readFile(FONT_SANS_BOLD_PATH),
        ]);
        pdfDoc.registerFontkit(fontkit);
        const regularFont = await pdfDoc.embedFont(regularBytes);
        const boldFont = await pdfDoc.embedFont(boldBytes);
        return { regularFont, boldFont, usedStandardFonts: false };
    } catch (error) {
        console.warn("Custom font embedding failed, falling back to standard fonts.", error);
        const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        return { regularFont, boldFont, usedStandardFonts: true };
    }
}

const WINANSI_REPLACEMENTS: Record<string, string> = {
    "–": "-",
    "—": "-",
    "“": "\"",
    "”": "\"",
    "‘": "'",
    "’": "'",
    "…": "...",
    "•": "*",
    "≈": "~",
    "≤": "<=",
    "≥": ">=",
    "≠": "!=",
    "×": "x",
    "÷": "/",
    "µ": "u",
    "°": "deg",
    "€": "EUR",
    "™": "TM",
    "©": "(c)",
    "®": "(r)",
};

function sanitizeWinAnsi(value: string): string {
    let result = "";
    for (const char of value) {
        const replacement = WINANSI_REPLACEMENTS[char];
        if (replacement) {
            result += replacement;
            continue;
        }
        const code = char.codePointAt(0) ?? 0;
        if (code <= 0xff) {
            result += char;
            continue;
        }
        result += "?";
    }
    return result;
}

type HtmlBlock =
    | { type: "text"; text: string }
    | { type: "image"; mime: string; bytes: Uint8Array };

function parseHtmlBlocks(html: string, sanitize: (value: string) => string): HtmlBlock[] {
    if (!html) return [];
    const blocks: HtmlBlock[] = [];
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    const pushText = (raw: string) => {
        const stripped = stripHtml(raw);
        const text = sanitize(stripped);
        if (text.trim()) {
            blocks.push({ type: "text", text });
        }
    };

    while ((match = imgRegex.exec(html)) !== null) {
        const before = html.slice(lastIndex, match.index);
        pushText(before);
        const dataUrl = match[1];
        const parsed = parseDataUrl(dataUrl);
        if (parsed) {
            blocks.push({ type: "image", mime: parsed.mime, bytes: parsed.bytes });
        }
        lastIndex = match.index + match[0].length;
    }

    pushText(html.slice(lastIndex));
    return blocks;
}

function stripHtml(input: string) {
    return decodeHtmlEntities(
        input
            .replace(/<\/p>/gi, "\n\n")
            .replace(/<br\s*\/?>/gi, "\n")
            .replace(/<\/li>/gi, "\n")
            .replace(/<\/h[1-6]>/gi, "\n\n")
            .replace(/<[^>]+>/g, " ")
            .replace(/\n{3,}/g, "\n\n")
            .replace(/[ \t]{2,}/g, " ")
            .trim()
    );
}

function decodeHtmlEntities(input: string) {
    return input
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&quot;/gi, "\"")
        .replace(/&#39;/gi, "'");
}

function parseDataUrl(dataUrl: string): { mime: string; bytes: Uint8Array } | null {
    const match = /^data:([^;]+);base64,(.+)$/i.exec(dataUrl);
    if (!match) return null;
    const mime = match[1];
    const data = match[2];
    try {
        return { mime, bytes: Buffer.from(data, "base64") };
    } catch {
        return null;
    }
}
