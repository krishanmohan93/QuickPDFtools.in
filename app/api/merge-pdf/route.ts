import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const files: File[] = [];

        // Collect all uploaded files
        for (const [key, value] of formData.entries()) {
            if (key.startsWith("file") && value instanceof File) {
                files.push(value);
            }
        }

        if (files.length < 2) {
            return NextResponse.json(
                { error: "Please upload at least 2 PDF files to merge" },
                { status: 400 }
            );
        }

        // Create a new PDF document
        const mergedPdf = await PDFDocument.create();

        // Process each file
        for (const file of files) {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        // Save the merged PDF
        const mergedPdfBytes = await mergedPdf.save();

        // Return the merged PDF
        return new NextResponse(new Uint8Array(mergedPdfBytes), {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": "attachment; filename=merged.pdf",
            },
        });
    } catch (error) {
        console.error("Error merging PDFs:", error);
        return NextResponse.json(
            { error: "Failed to merge PDF files" },
            { status: 500 }
        );
    }
}
