import { NextRequest, NextResponse } from "next/server";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { PDFDocument } from "pdf-lib";

// Import pdf-parse using require for CommonJS compatibility
const pdfParse = require("pdf-parse");

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file0") as File;
        const conversionMode = formData.get("conversionMode") as string || "text"; // text, formatted

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

        // Extract text from PDF
        const pdfBuffer = Buffer.from(arrayBuffer);
        const pdfData = await pdfParse(pdfBuffer);

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
                        text: `Converted from PDF • ${totalPages} pages • ${pdfData.numpages} text pages`,
                        size: 20,
                        color: "666666",
                    }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 },
            }),
        ];

        // Process text content
        const textContent = pdfData.text;

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

        // Return the Word document
        const response = new NextResponse(new Uint8Array(buffer), {
            status: 200,
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "Content-Disposition": `attachment; filename=${getFileNameWithoutExtension(file.name)}.docx`,
                "X-Original-Pages": totalPages.toString(),
                "X-Text-Pages": pdfData.numpages.toString(),
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
