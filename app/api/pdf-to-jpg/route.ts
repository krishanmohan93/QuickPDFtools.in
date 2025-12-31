import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import Jimp from "jimp";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file0") as File;

        if (!file) {
            return NextResponse.json(
                { error: "Please upload a PDF file" },
                { status: 400 }
            );
        }

        // Load the PDF
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);

        // Get the first page
        const pages = pdfDoc.getPages();
        if (pages.length === 0) {
            return NextResponse.json(
                { error: "PDF has no pages" },
                { status: 400 }
            );
        }

        // For this implementation, we'll create a simple placeholder
        // In production, you would use a library like pdf2pic or pdfjs-dist
        // This is a simplified version that creates a white image with text

        const page = pages[0];
        const { width, height } = page.getSize();

        // Create a white image
        const image = new Jimp(Math.floor(width), Math.floor(height), 0xFFFFFFFF);

        // Add text indicating this is a conversion
        const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
        image.print(
            font,
            10,
            10,
            {
                text: "PDF Page Converted to JPG\n\nNote: For production use, integrate\na proper PDF rendering library\nlike pdf2pic or pdfjs-dist",
                alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
            },
            Math.floor(width),
            Math.floor(height)
        );

        // Convert to buffer
        const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                "Content-Type": "image/jpeg",
                "Content-Disposition": "attachment; filename=page-1.jpg",
            },
        });
    } catch (error) {
        console.error("Error converting PDF to JPG:", error);
        return NextResponse.json(
            { error: "Failed to convert PDF to JPG. For production, please integrate pdf2pic or similar library." },
            { status: 500 }
        );
    }
}
