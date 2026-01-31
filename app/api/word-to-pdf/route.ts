import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import mammoth from "mammoth";

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

        // Read file content
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Extract text from Word document
        const textResult = await mammoth.extractRawText({ buffer });
        const text = textResult.value;

        if (!text || text.trim().length === 0) {
            throw new Error("No text content found in the Word document");
        }

        // Create PDF using pdf-lib (no external font dependencies)
        const pdfDoc = await PDFDocument.create();

        // Embed standard fonts (these are built-in, no file system access needed)
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        const pageWidth = 595.28; // A4 width in points
        const pageHeight = 841.89; // A4 height in points
        const margin = 72; // 1 inch margin
        const fontSize = 12;
        const lineHeight = fontSize * 1.5;
        const maxWidth = pageWidth - (margin * 2);

        let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        let yPosition = pageHeight - margin;

        // Add title
        const title = getFileNameWithoutExtension(file.name);
        currentPage.drawText(title, {
            x: margin,
            y: yPosition,
            size: 18,
            font: helveticaBold,
            color: rgb(0, 0, 0),
        });
        yPosition -= 30;

        // Add metadata line
        const metadata = `Converted from Word Document`;
        currentPage.drawText(metadata, {
            x: margin,
            y: yPosition,
            size: 10,
            font: helveticaFont,
            color: rgb(0.4, 0.4, 0.4),
        });
        yPosition -= 30;

        // Process text content
        const paragraphs = text.split('\n').filter(p => p.trim());

        for (const paragraph of paragraphs) {
            const trimmedParagraph = paragraph.trim();
            if (!trimmedParagraph) continue;

            // Word wrap the paragraph
            const words = trimmedParagraph.split(' ');
            let currentLine = '';

            for (const word of words) {
                const testLine = currentLine ? `${currentLine} ${word}` : word;
                const textWidth = helveticaFont.widthOfTextAtSize(testLine, fontSize);

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
                        font: helveticaFont,
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
                    font: helveticaFont,
                    color: rgb(0, 0, 0),
                });
                yPosition -= lineHeight;
            }

            // Add extra space between paragraphs
            yPosition -= lineHeight * 0.5;
        }

        // Add page numbers
        const pages = pdfDoc.getPages();
        const totalPages = pages.length;

        for (let i = 0; i < totalPages; i++) {
            const page = pages[i];
            const pageNumber = `Page ${i + 1} of ${totalPages}`;
            const textWidth = helveticaFont.widthOfTextAtSize(pageNumber, 9);

            page.drawText(pageNumber, {
                x: (pageWidth - textWidth) / 2,
                y: 30,
                size: 9,
                font: helveticaFont,
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
