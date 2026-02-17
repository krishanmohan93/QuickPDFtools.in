import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { spawn } from "node:child_process";

export class PdfToPptxError extends Error {
    status: number;
    code?: string;

    constructor(message: string, status = 500, code?: string) {
        super(message);
        this.status = status;
        this.code = code;
    }
}

export interface TempFileResult {
    tempDir: string;
    filePath: string;
    cleanup: () => Promise<void>;
}

export interface ConversionResult {
    stream: ReadableStream<Uint8Array>;
    fileName: string;
    contentType: string;
    contentLength?: number;
}

const DEFAULT_TIMEOUT_MS = 2 * 60 * 1000;

export function sanitizeBaseName(name: string) {
    const base = name.replace(/\.[^/.]+$/, "");
    const safe = base.replace(/[^a-z0-9-_]+/gi, "_").replace(/^_+|_+$/g, "");
    return safe.slice(0, 80) || "converted";
}

export async function saveFileToTemp(file: File, prefix = "pdf-to-ppt") {
    const tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), `${prefix}-`));
    const extension = path.extname(file.name || ".pdf") || ".pdf";
    const fileName = `${prefix}-${crypto.randomUUID()}${extension}`;
    const filePath = path.join(tempDir, fileName);

    const nodeStream = Readable.fromWeb(file.stream() as any);
    await pipeline(nodeStream, fs.createWriteStream(filePath));

    return {
        tempDir,
        filePath,
        cleanup: async () => {
            await fsp.rm(tempDir, { recursive: true, force: true });
        },
    } satisfies TempFileResult;
}

export async function assertPdfHeader(filePath: string) {
    const fd = await fsp.open(filePath, "r");
    try {
        const buffer = Buffer.alloc(5);
        await fd.read(buffer, 0, 5, 0);
        const header = buffer.toString("utf8");
        if (header !== "%PDF-") {
            throw new PdfToPptxError("Invalid PDF file. Please upload a valid PDF.", 400, "invalid_pdf");
        }
    } finally {
        await fd.close();
    }
}

export async function detectEncryptedPdf(filePath: string) {
    const fd = await fsp.open(filePath, "r");
    try {
        const maxBytes = 2 * 1024 * 1024;
        const buffer = Buffer.alloc(maxBytes);
        const { bytesRead } = await fd.read(buffer, 0, maxBytes, 0);
        const chunk = buffer.subarray(0, bytesRead);
        if (chunk.includes("/Encrypt")) {
            throw new PdfToPptxError(
                "This PDF appears to be encrypted or password-protected. Please unlock it and try again.",
                400,
                "encrypted_pdf"
            );
        }
    } finally {
        await fd.close();
    }
}

export async function convertPdfToPptx(options: {
    filePath: string;
    originalName: string;
    signal?: AbortSignal;
    provider?: "auto" | "convertapi" | "libreoffice";
    timeoutMs?: number;
}): Promise<ConversionResult> {
    const provider = options.provider ?? "auto";
    const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

    if (provider === "libreoffice") {
        return convertWithLibreOffice(options.filePath, options.originalName);
    }

    if (provider === "convertapi") {
        return convertWithConvertApi(options.filePath, options.originalName, options.signal, timeoutMs);
    }

    // Auto selection
    if (process.env.CONVERTAPI_SECRET) {
        return convertWithConvertApi(options.filePath, options.originalName, options.signal, timeoutMs);
    }

    if (process.env.LIBREOFFICE_PATH || process.env.SOFFICE_PATH) {
        return convertWithLibreOffice(options.filePath, options.originalName);
    }

    throw new PdfToPptxError(
        "PDF to PPTX conversion service is not configured. Please set CONVERTAPI_SECRET or LIBREOFFICE_PATH.",
        500,
        "provider_not_configured"
    );
}

async function convertWithConvertApi(
    filePath: string,
    originalName: string,
    signal?: AbortSignal,
    timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<ConversionResult> {
    const secret = process.env.CONVERTAPI_SECRET;
    if (!secret) {
        throw new PdfToPptxError("ConvertAPI secret is not configured.", 500, "convertapi_missing");
    }

    const endpoint = process.env.CONVERTAPI_ENDPOINT || "https://v2.convertapi.com/convert/pdf/to/pptx";
    const fileName = `${sanitizeBaseName(originalName)}.pptx`;

    const { boundary, stream, contentLength } = await createMultipartStream({
        filePath,
        fileName: path.basename(filePath),
        fieldName: "File",
        contentType: "application/pdf",
        fields: {
            StoreFile: "true",
        },
    });

    const controller = new AbortController();
    const mergedSignal = mergeSignals([signal, controller.signal].filter(Boolean) as AbortSignal[]);
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(`${endpoint}?Secret=${encodeURIComponent(secret)}`, {
            method: "POST",
            headers: {
                "Content-Type": `multipart/form-data; boundary=${boundary}`,
                "Content-Length": contentLength.toString(),
            },
            body: Readable.toWeb(stream) as ReadableStream<Uint8Array>,
            signal: mergedSignal,
            duplex: "half",
        });

        const json = await safeParseJson(response);
        if (!response.ok) {
            const message = json?.Message || json?.error || "ConvertAPI conversion failed.";
            throw new PdfToPptxError(message, response.status >= 400 && response.status < 600 ? response.status : 502, "convertapi_error");
        }

        const fileInfo = json?.Files?.[0];
        if (!fileInfo) {
            throw new PdfToPptxError("ConvertAPI returned an empty response.", 502, "convertapi_empty");
        }

        if (fileInfo.Url) {
            const downloadResponse = await fetch(fileInfo.Url, { signal: mergedSignal });
            if (!downloadResponse.ok || !downloadResponse.body) {
                throw new PdfToPptxError("Failed to download converted PPTX.", 502, "convertapi_download_failed");
            }
            return {
                stream: downloadResponse.body,
                fileName,
                contentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                contentLength: parseInt(downloadResponse.headers.get("content-length") || "", 10) || undefined,
            };
        }

        if (fileInfo.FileData) {
            const buffer = Buffer.from(fileInfo.FileData, "base64");
            const nodeStream = Readable.from(buffer);
            return {
                stream: Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>,
                fileName,
                contentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                contentLength: buffer.length,
            };
        }

        throw new PdfToPptxError("ConvertAPI did not return a downloadable file.", 502, "convertapi_missing_file");
    } catch (error) {
        if (error instanceof PdfToPptxError) throw error;
        if ((error as any)?.name === "AbortError") {
            throw new PdfToPptxError("Conversion timed out or was cancelled.", 504, "convertapi_timeout");
        }
        throw new PdfToPptxError(
            `ConvertAPI conversion failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            502,
            "convertapi_error"
        );
    } finally {
        clearTimeout(timeoutId);
    }
}

async function convertWithLibreOffice(filePath: string, originalName: string): Promise<ConversionResult> {
    const sofficePath = process.env.LIBREOFFICE_PATH || process.env.SOFFICE_PATH || "soffice";
    const outputDir = await fsp.mkdtemp(path.join(os.tmpdir(), "pdf-to-pptx-out-"));
    const baseName = sanitizeBaseName(originalName);

    await new Promise<void>((resolve, reject) => {
        const processHandle = spawn(sofficePath, ["--headless", "--convert-to", "pptx", "--outdir", outputDir, filePath], {
            stdio: "ignore",
        });

        processHandle.on("error", (err) => reject(err));
        processHandle.on("exit", (code) => {
            if (code === 0) resolve();
            else reject(new Error(`LibreOffice exited with code ${code}`));
        });
    });

    const outputPath = path.join(outputDir, `${baseName}.pptx`);
    const exists = await fileExists(outputPath);
    if (!exists) {
        throw new PdfToPptxError("LibreOffice failed to generate PPTX output.", 500, "libreoffice_failed");
    }

    const stat = await fsp.stat(outputPath);
    const nodeStream = fs.createReadStream(outputPath);
    nodeStream.on("close", async () => {
        await fsp.rm(outputDir, { recursive: true, force: true });
    });

    return {
        stream: Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>,
        fileName: `${baseName}.pptx`,
        contentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        contentLength: stat.size,
    };
}

async function createMultipartStream(options: {
    filePath: string;
    fileName: string;
    fieldName: string;
    contentType: string;
    fields?: Record<string, string>;
}) {
    const boundary = `----PDFMasterTools${crypto.randomUUID()}`;
    const fileStats = await fsp.stat(options.filePath);

    let fieldSection = "";
    if (options.fields) {
        for (const [key, value] of Object.entries(options.fields)) {
            fieldSection += `--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${value}\r\n`;
        }
    }

    const fileHeader =
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="${options.fieldName}"; filename="${options.fileName}"\r\n` +
        `Content-Type: ${options.contentType}\r\n\r\n`;

    const fileFooter = `\r\n--${boundary}--\r\n`;

    const contentLength =
        Buffer.byteLength(fieldSection) +
        Buffer.byteLength(fileHeader) +
        fileStats.size +
        Buffer.byteLength(fileFooter);

    const stream = Readable.from(
        (async function* () {
            if (fieldSection) {
                yield Buffer.from(fieldSection);
            }
            yield Buffer.from(fileHeader);
            yield* fs.createReadStream(options.filePath);
            yield Buffer.from(fileFooter);
        })()
    );

    return { boundary, stream, contentLength };
}

function mergeSignals(signals: AbortSignal[]) {
    const controller = new AbortController();
    const onAbort = () => controller.abort();

    for (const signal of signals) {
        if (signal?.aborted) {
            controller.abort();
            break;
        }
        signal?.addEventListener("abort", onAbort, { once: true });
    }

    return controller.signal;
}

async function safeParseJson(response: Response) {
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) return null;
    try {
        return await response.json();
    } catch {
        return null;
    }
}

async function fileExists(filePath: string) {
    try {
        await fsp.access(filePath);
        return true;
    } catch {
        return false;
    }
}
