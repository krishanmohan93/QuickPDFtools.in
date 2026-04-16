import { NextRequest, NextResponse } from "next/server";
import { renderPdfPageToImageBuffer, getPdfMetadata, getFormatInfo } from "@/lib/pdfPageRenderer";
import JSZip from "jszip";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = (formData.get("file0") || formData.get("file")) as File;
        const formatParam = (formData.get("format") as string || "jpg").toLowerCase();
        const scaleParam = parseInt(formData.get("scale") as string) || 2;
        const qualityParam = parseInt(formData.get("quality") as string) || 85;
        const pagesToConvert = (formData.get("pages") as string) || "all";

        if (!file) {
            return NextResponse.json(
                { error: "Please upload a PDF file" },
                { status: 400 }
            );
        }

        // Validate format
        const format = ["jpeg", "jpg", "png", "webp"].includes(formatParam) 
            ? formatParam.replace("jpg", "jpeg") 
            : "jpeg";
        const scale = Math.min(Math.max(1, scaleParam), 3);
        const quality = Math.min(Math.max(1, qualityParam), 100);

        console.log(`Converting PDF to ${format} (scale: ${scale}x, quality: ${quality})`);

        const arrayBuffer = await file.arrayBuffer();
        const pdfBuffer = Buffer.from(arrayBuffer);

        // Get PDF metadata
        const metadata = await getPdfMetadata(pdfBuffer);
        if (!metadata.isValid || metadata.numPages === 0) {
            return NextResponse.json(
                { error: "Invalid PDF file or PDF has no pages", details: metadata.error },
                { status: 400 }
            );
        }

        console.log(`PDF has ${metadata.numPages} pages`);

        // Determine which pages to convert
        let pageNumbers: number[] = [];
        if (pagesToConvert === "all") {
            pageNumbers = Array.from({ length: metadata.numPages }, (_, i) => i + 1);
        } else if (pagesToConvert === "first") {
            pageNumbers = [1];
        } else {
            // Parse page numbers like "1,2,3" or "1-5"
            const parts = pagesToConvert.split(",");
            for (const part of parts) {
                if (part.includes("-")) {
                    const [start, end] = part.split("-").map(p => parseInt(p.trim()));
                    if (!isNaN(start) && !isNaN(end)) {
                        for (let i = start; i <= end && i <= metadata.numPages; i++) {
                            if (i > 0) pageNumbers.push(i);
                        }
                    }
                } else {
                    const pageNum = parseInt(part.trim());
                    if (!isNaN(pageNum) && pageNum > 0 && pageNum <= metadata.numPages) {
                        pageNumbers.push(pageNum);
                    }
                }
            }
        }

        if (pageNumbers.length === 0) {
            return NextResponse.json(
                { error: "No valid pages specified" },
                { status: 400 }
            );
        }

        console.log(`Converting pages: ${pageNumbers.join(", ")}`);

        // Render pages
        const { mimeType, extension } = getFormatInfo(format);
        const baseFileName = file.name.replace(/\.pdf$/i, "");
        let responseBuffer: Buffer;
        let contentType: string;
        let fileName: string;

        if (pageNumbers.length === 1) {
            // Single page: return image directly
            const result = await renderPdfPageToImageBuffer(pdfBuffer, pageNumbers[0], {
                scale,
                format: format as "jpeg" | "png" | "webp",
                quality,
            });

            responseBuffer = result.buffer;
            contentType = result.mimeType;
            fileName = `${baseFileName}-page-${pageNumbers[0]}.${extension}`;
        } else {
            // Multiple pages: create ZIP archive
            const zip = new JSZip();

            for (const pageNum of pageNumbers) {
                const result = await renderPdfPageToImageBuffer(pdfBuffer, pageNum, {
                    scale,
                    format: format as "jpeg" | "png" | "webp",
                    quality,
                });
                zip.file(`${baseFileName}-page-${pageNum}.${extension}`, result.buffer);
            }

            responseBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
            contentType = "application/zip";
            fileName = `${baseFileName}-pages-${pageNumbers[0]}-to-${pageNumbers[pageNumbers.length - 1]}.zip`;
        }

        console.log(`Conversion complete: ${fileName} (size: ${responseBuffer.length} bytes)`);

        return new NextResponse(responseBuffer, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": `attachment; filename="${fileName}"`,
                "X-Total-Pages": metadata.numPages.toString(),
                "X-Converted-Pages": pageNumbers.length.toString(),
                "X-Page-List": pageNumbers.join(","),
                "X-Format": format,
                "X-Scale": scale.toString(),
                "X-Quality": quality.toString(),
            },
        });
    } catch (error) {
        console.error("Error converting PDF to image:", error);
        return NextResponse.json(
            {
                error: "Failed to convert PDF to image",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}

/**
 * GET endpoint for testing / status
 */
export async function GET() {
    return NextResponse.json({
        status: "ready",
        formats: ["jpg", "png", "webp"],
        maxScale: 3,
        maxQuality: 100,
        note: "POST a PDF file to convert pages to images",
    });
}
