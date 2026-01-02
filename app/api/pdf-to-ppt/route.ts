import { NextRequest, NextResponse } from "next/server";
import PptxGenJS from "pptxgenjs";
import { PDFDocument } from "pdf-lib";

// Import pdf-parse with fallback for build compatibility
let pdfParse: any;
try {
    pdfParse = require("pdf-parse");
} catch (e) {
    console.warn("pdf-parse not available, text extraction will be limited");
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        // Try to get file with different possible keys
        let file = formData.get("file0") as File;
        if (!file) {
            file = formData.get("file") as File;
        }

        const conversionMode = formData.get("conversionMode") as string || "text"; // text mode only (serverless-safe)

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

        // Create PowerPoint presentation
        const pptx = new PptxGenJS();

        // Set presentation properties
        pptx.defineLayout({ name: 'PDF_SLIDE', width: 10, height: 5.625 });
        pptx.layout = 'PDF_SLIDE';

        pptx.title = getFileNameWithoutExtension(file.name);
        pptx.subject = `Converted from PDF - ${totalPages} pages`;
        pptx.author = 'PDF Master Tools';

        // Extract text and create text-based slides (serverless-compatible)
        const pdfBuffer = Buffer.from(arrayBuffer);
        let textContent = "";

        try {
            const pdfData = await pdfParse(pdfBuffer, {
                max: 0,
                normalizeWhitespace: true,
            });
            textContent = pdfData.text || "";
        } catch (parseError) {
            console.warn("PDF parsing warning:", parseError);
            textContent = `PDF Content (${totalPages} pages)\n\nText extraction failed. This PDF may contain scanned images or complex layouts.`;
        }

        // Split text into slides (roughly 500 characters per slide)
        const slideTexts = splitTextIntoSlides(textContent, 500);

        for (let i = 0; i < slideTexts.length; i++) {
            const slide = pptx.addSlide();

            // Add title slide for first slide
            if (i === 0) {
                slide.addText(getFileNameWithoutExtension(file.name), {
                    x: 1,
                    y: 1,
                    w: 8,
                    h: 1,
                    fontSize: 32,
                    bold: true,
                    align: 'center'
                });

                slide.addText(`Converted from PDF • ${totalPages} pages`, {
                    x: 1,
                    y: 2.5,
                    w: 8,
                    h: 0.5,
                    fontSize: 18,
                    color: '666666',
                    align: 'center'
                });
            } else {
                // Content slides
                slide.addText(`Page ${i} of ${slideTexts.length - 1}`, {
                    x: 0.5,
                    y: 0.2,
                    w: 9,
                    h: 0.3,
                    fontSize: 14,
                    color: '666666'
                });

                slide.addText(slideTexts[i], {
                    x: 0.5,
                    y: 0.6,
                    w: 9,
                    h: 4.5,
                    fontSize: 16,
                    valign: 'top',
                    wrap: true
                });
            }
        }

        // Generate PowerPoint file
        const pptxBuffer = await pptx.write({ outputType: 'uint8array' }) as Uint8Array;

        // Validate the output
        if (pptxBuffer.length < 10000) {
            throw new Error("Generated PowerPoint file is too small or invalid");
        }

        // Return the PowerPoint file
        const response = new NextResponse(Buffer.from(pptxBuffer), {
            status: 200,
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                "Content-Disposition": `attachment; filename=${getFileNameWithoutExtension(file.name)}.pptx`,
                "X-Original-Pages": totalPages.toString(),
                "X-Conversion-Mode": conversionMode,
                "X-Slides-Generated": slideTexts.length.toString(),
            },
        });

        return response;

    } catch (error) {
        console.error("Error converting PDF to PowerPoint:", error);
        return NextResponse.json(
            { error: `Failed to convert PDF to PowerPoint: ${error instanceof Error ? error.message : 'Unknown error'}` },
            { status: 500 }
        );
    }
}

/**
 * Split text into slides of approximately equal length
 */
function splitTextIntoSlides(text: string, maxCharsPerSlide: number): string[] {
    const slides: string[] = [];
    const paragraphs = text.split('\n\n').filter(p => p.trim());

    let currentSlide = '';

    for (const paragraph of paragraphs) {
        const lines = paragraph.split('\n').filter(line => line.trim());

        for (const line of lines) {
            if ((currentSlide + line + '\n').length > maxCharsPerSlide && currentSlide.length > 0) {
                slides.push(currentSlide.trim());
                currentSlide = line + '\n';
            } else {
                currentSlide += line + '\n';
            }
        }

        currentSlide += '\n';
    }

    if (currentSlide.trim()) {
        slides.push(currentSlide.trim());
    }

    // Ensure at least one slide
    if (slides.length === 0) {
        slides.push('No text content found in PDF');
    }

    return slides;
}

/**
 * Get filename without extension
 */
function getFileNameWithoutExtension(filename: string): string {
    return filename.replace(/\.[^/.]+$/, "");
}

