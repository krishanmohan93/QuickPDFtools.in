import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import mammoth from "mammoth";

// Import pdfkit using require for CommonJS compatibility
const PDFKit = require("pdfkit");

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

        // Validate file type
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
            'application/msword', // .doc
        ];

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: "Please upload a valid Word document (.doc or .docx)" },
                { status: 400 }
            );
        }

        // Read file content
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Extract text from Word document using mammoth
        const result = await mammoth.extractRawText({ buffer });
        const text = result.value;

        if (!text || text.trim().length === 0) {
            throw new Error("No text content found in the Word document");
        }

        // Create PDF using PDFKit
        const pdfBuffer = await createPDFFromText(text, getFileNameWithoutExtension(file.name));

        // Validate the output
        if (pdfBuffer.length < 1000) {
            throw new Error("Generated PDF is too small or invalid");
        }

        // Verify PDF can be loaded back
        try {
            await PDFDocument.load(pdfBuffer);
        } catch (validationError) {
            throw new Error("Generated PDF is corrupted and cannot be validated");
        }

        // Return the PDF
        const response = new NextResponse(Buffer.from(pdfBuffer), {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename=${getFileNameWithoutExtension(file.name)}.pdf`,
                "X-Original-Format": file.type,
                "X-Text-Length": text.length.toString(),
                "X-Conversion-Type": "word-to-pdf",
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
 * Create PDF from text content using PDFKit
 */
function createPDFFromText(text: string, title: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFKit({
                size: 'A4',
                margin: 50,
                bufferPages: true,
            });

            const buffers: Buffer[] = [];

            doc.on('data', (chunk: Buffer) => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            // Add title
            doc.fontSize(24).font('Helvetica-Bold').text(title, { align: 'center' });
            doc.moveDown(2);

            // Add metadata
            doc.fontSize(12).font('Helvetica').text(`Converted from Word document`, { align: 'center' });
            doc.text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
            doc.moveDown(2);

            // Process text content
            const paragraphs = text.split('\n\n').filter(p => p.trim());

            for (const paragraph of paragraphs) {
                const lines = paragraph.split('\n').filter(line => line.trim());

                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (!trimmedLine) continue;

                    // Check if line looks like a heading (simple heuristic)
                    const isHeading = trimmedLine.length < 100 &&
                                    !trimmedLine.includes('.') &&
                                    !trimmedLine.includes(',') &&
                                    /^[A-Z\s]+$/.test(trimmedLine.toUpperCase());

                    if (isHeading) {
                        // Heading style
                        doc.moveDown(1);
                        doc.fontSize(16).font('Helvetica-Bold').text(trimmedLine);
                        doc.fontSize(12).font('Helvetica');
                        doc.moveDown(0.5);
                    } else {
                        // Regular paragraph
                        doc.text(trimmedLine);
                        doc.moveDown(0.5);
                    }
                }

                doc.moveDown(1);
            }

            // Check if we need a new page
            if (doc.y > 600) {
                doc.addPage();
            }

            // Add footer
            const totalPages = doc.bufferedPageRange().count;
            for (let i = 0; i < totalPages; i++) {
                doc.switchToPage(i);
                doc.fontSize(8).text(
                    `Page ${i + 1} of ${totalPages}`,
                    50,
                    doc.page.height - 50,
                    { align: 'center' }
                );
            }

            doc.end();

        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Get filename without extension
 */
function getFileNameWithoutExtension(filename: string): string {
    return filename.replace(/\.[^/.]+$/, "");
}

