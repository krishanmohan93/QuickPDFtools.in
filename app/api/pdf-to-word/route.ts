import { NextRequest, NextResponse } from "next/server";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { PDFDocument } from "pdf-lib";

// Import pdf-parse with fallback for build compatibility
let pdfParse: any;
try {
    pdfParse = require("pdf-parse");
} catch (e) {
    console.warn("pdf-parse not available");
}

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

        // Extract text from PDF with better error handling
        const pdfBuffer = Buffer.from(arrayBuffer);
        let pdfData;
        let textContent = "";

        try {
            if (pdfParse) {
                pdfData = await pdfParse(pdfBuffer, {
                    // Increase max buffer size
                    max: 0,
                    // Normalize whitespace
                    normalizeWhitespace: true,
                });
                textContent = pdfData.text || "";
            } else {
                throw new Error("pdf-parse not available");
            }
        } catch (parseError) {
            console.warn("PDF parsing warning:", parseError);
            // Fallback: create a basic document
            textContent = `This PDF contains ${totalPages} page(s).\n\nThe text content could not be extracted automatically. This may be because the PDF contains scanned images or uses a complex layout.\n\nPlease try using OCR software if you need to extract text from this document.`;
            pdfData = {
                text: textContent,
                numpages: totalPages,
            };
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

        // Process text content
        if (conversionMode === "formatted") {
            // Try to preserve some formatting
            const paragraphs = textContent.split('\n\n').filter((p: string) => p.trim());

            for (const paragraph of paragraphs) {
                const lines = paragraph.split('\n').filter((line: string) => line.trim());

                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (!trimmedLine) continue;

                    // Detect headings (simple heuristic)
                    const isHeading = trimmedLine.length < 100 &&
                        !trimmedLine.includes('.') &&
                        !trimmedLine.includes(',') &&
                        /^[A-Z\s]+$/.test(trimmedLine.toUpperCase());

                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: trimmedLine,
                                    size: isHeading ? 28 : 24,
                                    bold: isHeading,
                                }),
                            ],
                            spacing: { after: 200 },
                        })
                    );
                }
            }
        } else {
            // Simple text conversion
            const paragraphs = textContent.split('\n\n').filter((p: string) => p.trim());

            for (const paragraph of paragraphs) {
                if (paragraph.trim()) {
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
            }
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
        const response = new NextResponse(Buffer.from(buffer), {
            status: 200,
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "Content-Disposition": `attachment; filename=${getFileNameWithoutExtension(file.name)}.docx`,
                "X-Original-Pages": totalPages.toString(),
                "X-Conversion-Mode": conversionMode,
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

