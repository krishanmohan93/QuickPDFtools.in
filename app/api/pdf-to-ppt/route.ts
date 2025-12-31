import { NextRequest, NextResponse } from "next/server";
import PptxGenJS from "pptxgenjs";
import { PDFDocument } from "pdf-lib";
import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { tmpdir } from 'os';

// Import pdf-parse using require for CommonJS compatibility
const pdfParse = require("pdf-parse");

export async function POST(request: NextRequest) {
    let tempFiles: string[] = [];

    try {
        const formData = await request.formData();
        const file = formData.get("file0") as File;
        const conversionMode = formData.get("conversionMode") as string || "images"; // images, text

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

        if (conversionMode === "images") {
            // Convert each page to image and add as slides
            const images = await convertPDFPagesToImages(arrayBuffer, totalPages);

            for (let i = 0; i < images.length; i++) {
                const slide = pptx.addSlide();

                // Add page image as background fill
                slide.background = { data: `data:image/png;base64,${images[i]}` };

                // Add slide title
                slide.addText(`Page ${i + 1} of ${totalPages}`, {
                    x: 0.5,
                    y: 0.2,
                    w: 9,
                    h: 0.5,
                    fontSize: 18,
                    color: 'FFFFFF',
                    bold: true,
                    align: 'center',
                    shadow: { type: 'outer', color: '000000', blur: 1, opacity: 0.5 }
                });
            }
        } else {
            // Extract text and create text-based slides
            const pdfBuffer = Buffer.from(arrayBuffer);
            const pdfData = await pdfParse(pdfBuffer);
            const textContent = pdfData.text;

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
        }

        // Generate PowerPoint file
        const pptxBuffer = await pptx.write({ outputType: 'uint8array' }) as Uint8Array;

        // Validate the output
        if (pptxBuffer.length < 10000) {
            throw new Error("Generated PowerPoint file is too small or invalid");
        }

        // Return the PowerPoint file
        const response = new NextResponse(pptxBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                "Content-Disposition": `attachment; filename=${getFileNameWithoutExtension(file.name)}.pptx`,
                "X-Original-Pages": totalPages.toString(),
                "X-Conversion-Mode": conversionMode,
                "X-Slides-Generated": conversionMode === "images" ? totalPages.toString() : "text-based",
            },
        });

        return response;

    } catch (error) {
        console.error("Error converting PDF to PowerPoint:", error);
        return NextResponse.json(
            { error: `Failed to convert PDF to PowerPoint: ${error instanceof Error ? error.message : 'Unknown error'}` },
            { status: 500 }
        );
    } finally {
        // Cleanup temp files
        for (const tempFile of tempFiles) {
            try {
                await fs.unlink(tempFile);
            } catch (e) {
                console.warn(`Failed to cleanup temp file: ${tempFile}`);
            }
        }
    }
}

/**
 * Convert PDF pages to images using pdf2pic
 */
async function convertPDFPagesToImages(pdfBuffer: ArrayBuffer, totalPages: number): Promise<string[]> {
    const images: string[] = [];

    try {
        // Import pdf2pic dynamically
        const pdf2pic = (await import('pdf2pic')).default;

        // Create temp file
        const tempDir = tmpdir();
        const tempPdfPath = path.join(tempDir, `temp_${Date.now()}.pdf`);
        await fs.writeFile(tempPdfPath, Buffer.from(pdfBuffer));

        // Convert each page to image
        const convert = pdf2pic.fromPath(tempPdfPath, {
            density: 150,
            saveFilename: "page",
            savePath: tempDir,
            format: "png",
            width: 1024,
            height: 768
        });

        for (let i = 1; i <= Math.min(totalPages, 50); i++) { // Limit to 50 pages for performance
            try {
                const result = await convert(i);
                if (result && typeof result === 'object' && 'base64' in result) {
                    images.push((result as any).base64);
                }
            } catch (pageError) {
                console.warn(`Failed to convert page ${i}:`, pageError);
            }
        }

        // Cleanup temp file
        try {
            await fs.unlink(tempPdfPath);
        } catch (e) {
            console.warn('Failed to cleanup temp PDF file');
        }

    } catch (error) {
        console.warn('pdf2pic conversion failed, using fallback:', error);
        // Fallback: create placeholder images
        for (let i = 0; i < Math.min(totalPages, 10); i++) {
            images.push(createPlaceholderImage(i + 1, totalPages));
        }
    }

    return images;
}

/**
 * Create a placeholder image for slides
 */
function createPlaceholderImage(pageNum: number, totalPages: number): string {
    // Create a simple colored rectangle with text using a data URL
    // In a real implementation, you'd use canvas or a proper image library
    const svg = `
        <svg width="1024" height="768" xmlns="http://www.w3.org/2000/svg">
            <rect width="1024" height="768" fill="#f0f0f0"/>
            <text x="512" y="384" font-family="Arial" font-size="48" text-anchor="middle" fill="#666">
                Page ${pageNum} of ${totalPages}
            </text>
            <text x="512" y="450" font-family="Arial" font-size="24" text-anchor="middle" fill="#999">
                (Image conversion failed)
            </text>
        </svg>
    `;

    // Convert SVG to base64
    const base64 = Buffer.from(svg).toString('base64');
    return base64;
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
