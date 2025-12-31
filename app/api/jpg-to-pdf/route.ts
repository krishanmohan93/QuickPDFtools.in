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

        if (files.length === 0) {
            return NextResponse.json(
                { error: "Please upload at least one JPG image" },
                { status: 400 }
            );
        }

        // Create a new PDF document
        const pdfDoc = await PDFDocument.create();

        // Process each image file
        for (const file of files) {
            const imageBytes = await file.arrayBuffer();

            // Embed the image (supports both JPG and PNG)
            let image;
            if (file.type === "image/jpeg" || file.type === "image/jpg") {
                image = await pdfDoc.embedJpg(imageBytes);
            } else if (file.type === "image/png") {
                image = await pdfDoc.embedPng(imageBytes);
            } else {
                continue; // Skip unsupported formats
            }

            // Create a page with the same dimensions as the image
            const page = pdfDoc.addPage([image.width, image.height]);

            // Draw the image on the page
            page.drawImage(image, {
                x: 0,
                y: 0,
                width: image.width,
                height: image.height,
            });
        }

        // Save the PDF
        const pdfBytes = await pdfDoc.save();

        return new NextResponse(new Uint8Array(pdfBytes), {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": "attachment; filename=converted.pdf",
            },
        });
    } catch (error) {
        console.error("Error converting JPG to PDF:", error);
        return NextResponse.json(
            { error: "Failed to convert images to PDF" },
            { status: 500 }
        );
    }
}
