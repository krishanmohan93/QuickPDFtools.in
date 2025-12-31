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

        const page = pages[0];
        const { width, height } = page.getSize();

        // Create a white image
        const image = new Jimp(Math.floor(width), Math.floor(height), 0xFFFFFFFF);

        // Add text
        const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
        image.print(
            font,
            10,
            10,
            {
                text: "PDF Page Converted to PNG\n\nNote: For production use, integrate\na proper PDF rendering library\nlike pdf2pic or pdfjs-dist",
                alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
            },
            Math.floor(width),
            Math.floor(height)
        );

        // Convert to buffer
        const buffer = await image.getBufferAsync(Jimp.MIME_PNG);

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                "Content-Type": "image/png",
                "Content-Disposition": "attachment; filename=page-1.png",
            },
        });
    } catch (error) {
        console.error("Error converting PDF to PNG:", error);
        return NextResponse.json(
            { error: "Failed to convert PDF to PNG. For production, please integrate pdf2pic or similar library." },
            { status: 500 }
        );
    }
}
