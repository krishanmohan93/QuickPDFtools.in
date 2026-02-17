import { NextRequest, NextResponse } from "next/server";
import {
    PdfToPptxError,
    assertPdfHeader,
    convertPdfToPptx,
    detectEncryptedPdf,
    sanitizeBaseName,
    saveFileToTemp,
} from "@/lib/pdfToPptx";

export const runtime = "nodejs";
export const maxDuration = 300;

const DEFAULT_MAX_MB = 50;

function getMaxFileSizeBytes() {
    const maxMbEnv = Number(process.env.PDF_TO_PPT_MAX_MB || DEFAULT_MAX_MB);
    return Math.max(1, maxMbEnv) * 1024 * 1024;
}

export async function POST(request: NextRequest) {
    let cleanup: (() => Promise<void>) | null = null;

    try {
        if (request.signal.aborted) {
            return NextResponse.json({ error: "Upload cancelled." }, { status: 400 });
        }

        const formData = await request.formData();
        const file =
            (formData.get("file0") as File | null) ||
            (formData.get("file") as File | null);

        if (!file) {
            return NextResponse.json({ error: "Please upload a PDF file." }, { status: 400 });
        }

        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
            return NextResponse.json({ error: "Only PDF files are supported." }, { status: 400 });
        }

        const maxBytes = getMaxFileSizeBytes();
        if (file.size > maxBytes) {
            return NextResponse.json(
                { error: `File too large. Max allowed is ${Math.round(maxBytes / 1024 / 1024)}MB.` },
                { status: 413 }
            );
        }

        const tempFile = await saveFileToTemp(file, "pdf-to-ppt");
        cleanup = tempFile.cleanup;

        await assertPdfHeader(tempFile.filePath);
        await detectEncryptedPdf(tempFile.filePath);

        const baseName = sanitizeBaseName(file.name);
        const conversion = await convertPdfToPptx({
            filePath: tempFile.filePath,
            originalName: baseName,
            signal: request.signal,
            provider: "convertapi",
            timeoutMs: Number(process.env.PDF_TO_PPT_TIMEOUT_MS || 120000),
        });

        const headers = new Headers();
        headers.set(
            "Content-Type",
            conversion.contentType
        );
        headers.set(
            "Content-Disposition",
            `attachment; filename="${conversion.fileName}"`
        );
        headers.set("Cache-Control", "no-store, max-age=0");
        if (conversion.contentLength) {
            headers.set("Content-Length", conversion.contentLength.toString());
        }

        return new NextResponse(conversion.stream, {
            status: 200,
            headers,
        });
    } catch (error) {
        if (error instanceof PdfToPptxError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }

        if ((error as any)?.name === "AbortError") {
            return NextResponse.json({ error: "Conversion cancelled." }, { status: 400 });
        }

        return NextResponse.json(
            { error: `Failed to convert PDF to PPTX: ${error instanceof Error ? error.message : "Unknown error"}` },
            { status: 500 }
        );
    } finally {
        if (cleanup) {
            await cleanup();
        }
    }
}
