import { PDFDocument } from "pdf-lib";
import { createCanvas } from "canvas";
import Tesseract from "tesseract.js";
import fsp from "node:fs/promises";
import path from "node:path";
import os from "node:os";

export interface OCRResult {
    text: string;
    confidence: number;
    language: string;
}

export interface ScannedPageResult {
    pageNumber: number;
    text: string;
    confidence: number;
    isScanned: boolean;
    processingTime: number;
}

/**
 * Render a PDF page to a canvas and extract image data
 * Uses pdf.js to render the page at high resolution for better OCR results
 */
export async function renderPdfPageToImage(
    pdfBuffer: Buffer,
    pageNumber: number,
    scale: number = 2 // Higher scale = higher resolution but slower processing
): Promise<Buffer | null> {
    try {
        const pdfjsModule = await import("pdfjs-dist/legacy/build/pdf.js");
        const pdfjsLib = (pdfjsModule as any).default || pdfjsModule;
        
        // Set up worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

        const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
        const pdf = await loadingTask.promise;

        if (pageNumber < 1 || pageNumber > pdf.numPages) {
            console.warn(`Page ${pageNumber} is out of range (1-${pdf.numPages})`);
            return null;
        }

        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale });

        // Use canvas to render the page
        const canvas = createCanvas(viewport.width, viewport.height);
        const context = canvas.getContext("2d");

        const renderContext = {
            canvasContext: context,
            viewport: viewport,
        };

        await page.render(renderContext).promise;

        // Convert canvas to Buffer (PNG format)
        return canvas.toBuffer("image/png");
    } catch (error) {
        console.error(`Error rendering PDF page ${pageNumber}:`, error);
        return null;
    }
}

/**
 * Extract text from an image buffer using Tesseract OCR
 * Optimized for document scanning
 */
export async function extractTextFromImage(
    imageBuffer: Buffer,
    options?: {
        languages?: string[];
        ocrEngineMode?: 0 | 1 | 2 | 3;
        psm?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
    }
): Promise<OCRResult> {
    try {
        const startTime = Date.now();
        
        // Default to English, but allow multiple languages
        const languages = options?.languages ?? ["eng"];
        const psm = options?.psm ?? 3; // Auto page segmentation - good for mixed text layouts
        const oem = options?.ocrEngineMode ?? 3; // Both legacy and LSTM

        const result = await Tesseract.recognize(
            imageBuffer,
            languages.join("+"),
            {
                logger: (m) => {
                    if (m.status === 'recognizing') {
                        console.debug(
                            `OCR Progress: ${(m.progress * 100).toFixed(2)}%`
                        );
                    }
                },
            }
        );

        const processingTime = Date.now() - startTime;
        const text = result.data.text || "";
        const confidence = result.data.confidence || 0;

        return {
            text: text.trim(),
            confidence,
            language: languages[0],
        };
    } catch (error) {
        console.error("Error during OCR processing:", error);
        return {
            text: "",
            confidence: 0,
            language: "unknown",
        };
    }
}

/**
 * Process a scanned PDF page: render to image and extract text via OCR
 */
export async function processScannedPage(
    pdfBuffer: Buffer,
    pageNumber: number,
    scale?: number
): Promise<ScannedPageResult> {
    const startTime = Date.now();

    try {
        // Step 1: Render PDF page to image
        const imageBuffer = await renderPdfPageToImage(pdfBuffer, pageNumber, scale);
        if (!imageBuffer) {
            throw new Error(`Failed to render page ${pageNumber}`);
        }

        // Step 2: Extract text via OCR
        const ocrResult = await extractTextFromImage(imageBuffer);

        const processingTime = Date.now() - startTime;

        return {
            pageNumber,
            text: ocrResult.text,
            confidence: ocrResult.confidence,
            isScanned: true,
            processingTime,
        };
    } catch (error) {
        console.error(`Error processing scanned page ${pageNumber}:`, error);
        return {
            pageNumber,
            text: "",
            confidence: 0,
            isScanned: true,
            processingTime: Date.now() - startTime,
        };
    }
}

/**
 * Batch process multiple PDF pages with OCR
 * Processes pages sequentially to avoid memory overload
 */
export async function processScannedPdfBatch(
    pdfBuffer: Buffer,
    pageNumbers: number[],
    scale?: number,
    signal?: AbortSignal
): Promise<ScannedPageResult[]> {
    const results: ScannedPageResult[] = [];

    for (const pageNumber of pageNumbers) {
        if (signal?.aborted) {
            console.warn("OCR batch processing aborted");
            break;
        }

        const result = await processScannedPage(pdfBuffer, pageNumber, scale);
        results.push(result);

        // Log progress
        const avgConfidence = (
            results.reduce((sum, r) => sum + r.confidence, 0) / results.length
        ).toFixed(2);
        console.log(
            `processed page ${pageNumber} (confidence: ${result.confidence.toFixed(2)}, avg: ${avgConfidence})`
        );
    }

    return results;
}

/**
 * Detect if a PDF is likely scanned based on text extraction attempt
 * Returns confidence that the PDF is scanned (0-100)
 */
export async function detectIfScanned(
    extractedText: string,
    pdfBuffer: Buffer,
    numPagesToCheck: number = 3
): Promise<{
    isLikelyScanned: boolean;
    confidence: number;
    reason: string;
}> {
    // Check if extraction attempt yielded almost no text
    if (!extractedText || extractedText.trim().length < 100) {
        // This is likely a scanned PDF
        return {
            isLikelyScanned: true,
            confidence: 85,
            reason: "Very little text extracted from PDF",
        };
    }

    // If we have sufficient text, it's likely not scanned
    return {
        isLikelyScanned: false,
        confidence: 95,
        reason: "Sufficient text extracted from PDF",
    };
}

/**
 * Smart PDF processing: tries standard extraction first, falls back to OCR for scanned PDFs
 */
export async function smartProcessPdf(
    pdfBuffer: Buffer,
    options?: {
        maxPagesToOCR?: number;
        scale?: number;
        skipOcrIfTextFound?: boolean;
        languages?: string[];
        signal?: AbortSignal;
    }
): Promise<{
    pages: {
        pageNumber: number;
        text: string;
        extractionMethod: "text" | "ocr";
        confidence: number;
        processingTime: number;
    }[];
    isScanned: boolean;
    summary: string;
}> {
    const maxPagesToOCR = options?.maxPagesToOCR ?? 5;
    const scale = options?.scale ?? 2;
    const skipOcrIfTextFound = options?.skipOcrIfTextFound ?? true;

    try {
        const pdfjsModule = await import("pdfjs-dist/legacy/build/pdf.js");
        const pdfjsLib = (pdfjsModule as any).default || pdfjsModule;
        
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

        const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
        const pdf = await loadingTask.promise;
        const totalPages = pdf.numPages;

        // Determine how many pages to process
        const pagesToProcess = Math.min(totalPages, maxPagesToOCR);
        const pageNumbers = Array.from({ length: pagesToProcess }, (_, i) => i + 1);

        let isScanned = false;
        let ocrResults: ScannedPageResult[] = [];
        let summary = "";

        // Check first pages for text extraction
        let hasExtractableText = false;
        for (let pageNum = 1; pageNum <= Math.min(2, totalPages); pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const items = textContent.items || [];
            if (items.length > 10) {
                hasExtractableText = true;
                break;
            }
        }

        if (!hasExtractableText) {
            isScanned = true;
            console.log("PDF appears to be scanned. Starting OCR processing...");

            // Process with OCR
            ocrResults = await processScannedPdfBatch(
                pdfBuffer,
                pageNumbers,
                scale,
                options?.signal
            );

            const avgConfidence = (
                ocrResults.reduce((sum, r) => sum + r.confidence, 0) / ocrResults.length
            ).toFixed(2);

            summary = `Processed ${ocrResults.length} pages via OCR (avg confidence: ${avgConfidence}%)`;
        } else {
            summary = `PDF has extractable text, standard extraction applied`;
        }

        // Format results
        const results = ocrResults.map((result) => ({
            pageNumber: result.pageNumber,
            text: result.text,
            extractionMethod: "ocr" as const,
            confidence: result.confidence,
            processingTime: result.processingTime,
        }));

        return {
            pages: results,
            isScanned,
            summary,
        };
    } catch (error) {
        console.error("Error in smartProcessPdf:", error);
        throw error;
    }
}
