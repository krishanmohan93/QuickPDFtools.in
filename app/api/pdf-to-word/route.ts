import { NextRequest, NextResponse } from "next/server";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak } from "docx";
import { PDFDocument } from "pdf-lib";

export const runtime = "nodejs";
export const maxDuration = 300;

// Import pdf-parse with fallback for build compatibility
let pdfParse: any;
try {
    pdfParse = require("pdf-parse");
} catch (e) {
    console.warn("pdf-parse not available");
}

let pdfjsLib: any;
const loadPdfJs = async () => {
    if (!pdfjsLib) {
        const module = await import("pdfjs-dist/legacy/build/pdf.js");
        pdfjsLib = (module as any).default || module;
    }
    return pdfjsLib;
};

type TextItem = {
    str: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize: number;
};

type Line = {
    text: string;
    fontSize: number;
    y: number;
};

type PageExtraction = {
    lines: Line[];
    hasText: boolean;
};

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, " ").trim();

const median = (values: number[]) => {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
};

const groupItemsIntoLines = (items: TextItem[]): Line[] => {
    const sorted = [...items].sort((a, b) => {
        const yDiff = b.y - a.y;
        return Math.abs(yDiff) > 0.5 ? yDiff : a.x - b.x;
    });

    const lines: { y: number; items: TextItem[]; fontSizes: number[] }[] = [];

    for (const item of sorted) {
        if (!item.str.trim()) continue;
        const tolerance = Math.max(2, item.fontSize * 0.35);
        const current = lines[lines.length - 1];
        if (current && Math.abs(item.y - current.y) <= tolerance) {
            current.items.push(item);
            current.fontSizes.push(item.fontSize);
            current.y = (current.y + item.y) / 2;
        } else {
            lines.push({ y: item.y, items: [item], fontSizes: [item.fontSize] });
        }
    }

    return lines.map((line) => {
        const itemsSorted = line.items.sort((a, b) => a.x - b.x);
        let text = "";
        let prev: TextItem | null = null;

        for (const item of itemsSorted) {
            const segment = item.str;
            if (!segment) continue;
            if (prev) {
                const gap = item.x - (prev.x + prev.width);
                const threshold = Math.max(prev.fontSize * 0.2, 1);
                if (gap > threshold && !text.endsWith(" ")) {
                    text += " ";
                }
            }
            text += segment;
            prev = item;
        }

        const fontSize = median(line.fontSizes);
        return {
            text: normalizeWhitespace(text),
            fontSize,
            y: line.y,
        };
    }).filter((line) => line.text.length > 0);
};

const buildParagraphsFromLines = (lines: Line[], useHeadings: boolean) => {
    if (!lines.length) return [];
    const fontSizes = lines.map((line) => line.fontSize).filter((v) => v > 0);
    const baseFontSize = median(fontSizes) || 12;
    const paragraphs: { text: string; headingLevel?: HeadingLevel }[] = [];

    let current = "";
    let currentIsHeading = false;
    let prevY: number | null = null;
    let prevFontSize = baseFontSize;

    const flush = () => {
        if (!current.trim()) return;
        paragraphs.push({
            text: current.trim(),
            headingLevel: currentIsHeading ? HeadingLevel.HEADING_2 : undefined,
        });
        current = "";
        currentIsHeading = false;
    };

    for (const line of lines) {
        const gap = prevY !== null ? prevY - line.y : 0;
        const largeGap = prevY !== null && gap > prevFontSize * 1.8;

        const isHeading =
            useHeadings &&
            line.fontSize >= baseFontSize * 1.3 &&
            line.text.length < 120 &&
            !/[\.]/.test(line.text);

        if (largeGap || isHeading || currentIsHeading) {
            flush();
        }

        if (!current) {
            current = line.text;
            currentIsHeading = isHeading;
        } else {
            current += " " + line.text;
        }

        prevY = line.y;
        prevFontSize = line.fontSize || prevFontSize;
    }

    flush();
    return paragraphs;
};

const extractWithPdfJs = async (pdfBuffer: Buffer): Promise<{ pages: PageExtraction[]; numPages: number }> => {
    const lib = await loadPdfJs();
    const loadingTask = lib.getDocument({
        data: pdfBuffer,
        disableWorker: true,
    });
    const pdf = await loadingTask.promise;
    const pages: PageExtraction[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const items: TextItem[] = (textContent.items || [])
            .map((item: any) => {
                if (!item.str || !item.str.trim()) return null;
                const transform = item.transform;
                const fontSize = Math.abs(transform[3]) || 12;
                return {
                    str: item.str,
                    x: transform[4],
                    y: transform[5],
                    width: item.width || 0,
                    height: item.height || fontSize,
                    fontSize,
                };
            })
            .filter(Boolean) as TextItem[];

        const lines = groupItemsIntoLines(items);
        pages.push({
            lines,
            hasText: lines.length > 0,
        });
    }

    return { pages, numPages: pdf.numPages };
};

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        // Log all form data keys for debugging
        console.log("FormData keys:", Array.from(formData.keys()));

        // Try to get file with different possible keys
        let file = formData.get("file0") as File;
        if (!file) {
            file = formData.get("file") as File;
        }

        const conversionMode = formData.get("conversionMode") as string || "text"; // text, formatted

        console.log("File received:", file ? file.name : "NO FILE");
        console.log("File type:", file ? file.type : "N/A");
        console.log("File size:", file ? file.size : "N/A");

        if (!file) {
            return NextResponse.json(
                { error: "Please upload a PDF file" },
                { status: 400 }
            );
        }

        // Load PDF for validation
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const totalPages = pdfDoc.getPageCount();

        const pdfBuffer = Buffer.from(arrayBuffer);
        let textContent = "";
        let extractedPages: PageExtraction[] = [];
        let extractedWithPdfJs = false;

        try {
            const pdfjsResult = await extractWithPdfJs(pdfBuffer);
            extractedPages = pdfjsResult.pages;
            extractedWithPdfJs = extractedPages.some((page) => page.hasText);
        } catch (error) {
            console.warn("pdf.js extraction failed:", error);
        }

        if (!extractedWithPdfJs) {
            try {
                if (pdfParse) {
                    const pdfData = await pdfParse(pdfBuffer, {
                        max: 0,
                        normalizeWhitespace: true,
                    });
                    textContent = pdfData.text || "";
                } else {
                    throw new Error("pdf-parse not available");
                }
            } catch (parseError) {
                console.warn("PDF parsing warning:", parseError);
                textContent = "";
            }
        }

        // Build document children array
        const children: any[] = [
            // Title
            new Paragraph({
                children: [
                    new TextRun({
                        text: getFileNameWithoutExtension(file.name),
                        bold: true,
                        size: 32,
                    }),
                ],
                heading: HeadingLevel.TITLE,
                alignment: AlignmentType.CENTER,
            }),
            // Metadata
            new Paragraph({
                children: [
                    new TextRun({
                        text: `Converted from PDF • ${totalPages} pages`,
                        size: 20,
                        color: "666666",
                    }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 },
            }),
        ];

        if (extractedWithPdfJs) {
            extractedPages.forEach((page, index) => {
                if (index > 0) {
                    children.push(new Paragraph({ children: [new PageBreak()] }));
                }

                if (!page.hasText) {
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `Page ${index + 1}: No extractable text found.`,
                                    italic: true,
                                    color: "666666",
                                    size: 22,
                                }),
                            ],
                            spacing: { after: 200 },
                        })
                    );
                    return;
                }

                const paragraphs = buildParagraphsFromLines(page.lines, conversionMode === "formatted");
                paragraphs.forEach((paragraph) => {
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: paragraph.text,
                                    size: paragraph.headingLevel ? 28 : 24,
                                    bold: Boolean(paragraph.headingLevel),
                                }),
                            ],
                            heading: paragraph.headingLevel,
                            spacing: { after: paragraph.headingLevel ? 240 : 200 },
                        })
                    );
                });
            });
        } else if (textContent && textContent.trim()) {
            const paragraphs = textContent.split('\n\n').filter((p: string) => p.trim());
            for (const paragraph of paragraphs) {
                if (!paragraph.trim()) continue;
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: paragraph.trim(),
                                size: 24,
                            }),
                        ],
                        spacing: { after: 200 },
                    })
                );
            }
        } else {
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `This PDF contains ${totalPages} page(s).`,
                            size: 24,
                        }),
                    ],
                    spacing: { after: 200 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "No extractable text was found. This PDF appears to be scanned or uses complex layout/encoding.",
                            size: 22,
                            color: "666666",
                        }),
                    ],
                    spacing: { after: 200 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "For best results, run OCR on the PDF and try again.",
                            size: 22,
                            color: "666666",
                        }),
                    ],
                    spacing: { after: 200 },
                })
            );
        }

        // Create Word document
        const doc = new Document({
            sections: [{
                properties: {},
                children: children,
            }],
        });

        // Generate Word document
        const buffer = await Packer.toBuffer(doc);

        // Validate the output
        if (buffer.length < 1000) {
            throw new Error("Generated Word document is too small or invalid");
        }

        console.log("Conversion successful! Document size:", buffer.length, "bytes");

        // Return the Word document
        const extractionMode = extractedWithPdfJs
            ? "pdfjs"
            : textContent && textContent.trim()
                ? "pdf-parse"
                : "none";

        const response = new NextResponse(Buffer.from(buffer), {
            status: 200,
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "Content-Disposition": `attachment; filename=${getFileNameWithoutExtension(file.name)}.docx`,
                "X-Original-Pages": totalPages.toString(),
                "X-Conversion-Mode": conversionMode,
                "X-Extraction-Mode": extractionMode,
            },
        });

        return response;

    } catch (error) {
        console.error("Error converting PDF to Word:", error);
        return NextResponse.json(
            { error: `Failed to convert PDF to Word: ${error instanceof Error ? error.message : 'Unknown error'}` },
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

