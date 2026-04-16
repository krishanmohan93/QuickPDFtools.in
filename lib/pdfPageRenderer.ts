/**
 * Server-side PDF page rendering utility
 * Converts PDF pages to image buffers (JPG, PNG, WebP)
 */

import { createCanvas } from "canvas";
import sharp from "sharp";

export interface RenderOptions {
    scale?: number;        // DPI multiplier (1-3, default: 2)
    format?: "jpeg" | "png" | "webp";  // Output format
    quality?: number;      // Quality 1-100 for JPEG/WebP (default: 85)
}

export interface PageRenderResult {
    buffer: Buffer;
    format: "jpeg" | "png" | "webp";
    width: number;
    height: number;
    mimeType: string;
    fileExtension: string;
}

/**
 * Render a PDF page to an image buffer using canvas
 * Uses pdf.js to render the page
 */
export async function renderPdfPageToImageBuffer(
    pdfBuffer: Buffer,
    pageNumber: number,
    options?: RenderOptions
): Promise<PageRenderResult> {
    try {
        const pdfjsModule = await import("pdfjs-dist/legacy/build/pdf.js");
        const pdfjsLib = (pdfjsModule as any).default || pdfjsModule;

        const scale = options?.scale ?? 2;
        const format = options?.format ?? "jpeg";
        const quality = options?.quality ?? 85;

        // Load PDF
        const loadingTask = pdfjsLib.getDocument({
            data: pdfBuffer,
            disableWorker: true,
        });
        const pdf = await loadingTask.promise;

        if (pageNumber < 1 || pageNumber > pdf.numPages) {
            throw new Error(`Page ${pageNumber} is out of range (1-${pdf.numPages})`);
        }

        // Get page
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale });

        // Create canvas
        const canvas = createCanvas(viewport.width, viewport.height);
        const context = canvas.getContext("2d");

        // Render page to canvas
        await page.render({
            canvasContext: context,
            viewport: viewport,
        }).promise;

        // Get canvas as PNG buffer first
        const canvasBuffer = canvas.toBuffer("image/png");

        // Convert to requested format
        let outputBuffer: Buffer;
        let mimeType: string;

        if (format === "jpeg") {
            outputBuffer = await sharp(canvasBuffer)
                .jpeg({ quality, progressive: true })
                .toBuffer();
            mimeType = "image/jpeg";
        } else if (format === "webp") {
            outputBuffer = await sharp(canvasBuffer)
                .webp({ quality })
                .toBuffer();
            mimeType = "image/webp";
        } else {
            // PNG (default, lossless)
            outputBuffer = canvasBuffer;
            mimeType = "image/png";
        }

        return {
            buffer: outputBuffer,
            format,
            width: Math.floor(viewport.width),
            height: Math.floor(viewport.height),
            mimeType,
            fileExtension: format === "jpeg" ? "jpg" : format,
        };
    } catch (error) {
        console.error(`Error rendering PDF page ${pageNumber}:`, error);
        throw error;
    }
}

/**
 * Batch render multiple pages as ZIP archive
 * Returns a ZIP file containing all rendered images
 */
export async function renderPdfPagesToZip(
    pdfBuffer: Buffer,
    pageNumbers: number[],
    baseName: string = "page",
    options?: RenderOptions
): Promise<Buffer> {
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();

    for (const pageNum of pageNumbers) {
        const result = await renderPdfPageToImageBuffer(pdfBuffer, pageNum, options);
        const fileName = `${baseName}-${pageNum}.${result.fileExtension}`;
        zip.file(fileName, result.buffer);
    }

    return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}

/**
 * Get PDF metadata for rendering
 */
export async function getPdfMetadata(pdfBuffer: Buffer): Promise<{
    numPages: number;
    pageWidth?: number;
    pageHeight?: number;
    isValid: boolean;
    error?: string;
}> {
    try {
        const pdfjsModule = await import("pdfjs-dist/legacy/build/pdf.js");
        const pdfjsLib = (pdfjsModule as any).default || pdfjsModule;

        const loadingTask = pdfjsLib.getDocument({
            data: pdfBuffer,
            disableWorker: true,
        });
        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;

        // Get first page dimensions
        let pageWidth: number | undefined;
        let pageHeight: number | undefined;
        try {
            const firstPage = await pdf.getPage(1);
            const viewport = firstPage.getViewport({ scale: 1 });
            pageWidth = Math.floor(viewport.width);
            pageHeight = Math.floor(viewport.height);
        } catch (e) {
            console.warn("Could not get first page dimensions:", e);
        }

        return {
            numPages,
            pageWidth,
            pageHeight,
            isValid: true,
        };
    } catch (error) {
        console.error("Error getting PDF metadata:", error);
        return {
            numPages: 0,
            isValid: false,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}

/**
 * Generate file extension and MIME type for format
 */
export function getFormatInfo(format: string): {
    extension: string;
    mimeType: string;
} {
    switch (format.toLowerCase()) {
        case "jpeg":
        case "jpg":
            return { extension: "jpg", mimeType: "image/jpeg" };
        case "png":
            return { extension: "png", mimeType: "image/png" };
        case "webp":
            return { extension: "webp", mimeType: "image/webp" };
        default:
            return { extension: "jpg", mimeType: "image/jpeg" };
    }
}
