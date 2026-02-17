import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { spawn } from "node:child_process";

const DEFAULT_TIMEOUT_MS = 2 * 60 * 1000;

export class ProtectPdfError extends Error {
    status: number;
    code?: string;

    /** Create a typed protection error with an HTTP status. */
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

export interface ProtectionResult {
    stream: ReadableStream<Uint8Array>;
    fileName: string;
    contentType: string;
    contentLength?: number;
}

export interface PdfPermissions {
    print: boolean;
    copy: boolean;
    modify: boolean;
    annotate: boolean;
}

/** Sanitize a filename base for safe output naming. */
export function sanitizeBaseName(name: string) {
    const base = name.replace(/\.[^/.]+$/, "");
    const safe = base.replace(/[^a-z0-9-_]+/gi, "_").replace(/^_+|_+$/g, "");
    return safe.slice(0, 80) || "protected";
}

/** Persist an uploaded file into a temporary directory on disk. */
export async function saveFileToTemp(file: File, prefix = "protect-pdf"): Promise<TempFileResult> {
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
    };
}

/** Validate that the uploaded file is a PDF by checking its header. */
export async function assertPdfHeader(filePath: string) {
    const fd = await fsp.open(filePath, "r");
    try {
        const buffer = Buffer.alloc(5);
        const { bytesRead } = await fd.read(buffer, 0, 5, 0);
        if (bytesRead < 5 || buffer.toString("utf8") !== "%PDF-") {
            throw new ProtectPdfError("Invalid PDF file. Please upload a valid PDF.", 400, "invalid_pdf");
        }
    } finally {
        await fd.close();
    }
}

/** Detect encrypted PDFs by scanning for encryption markers. */
export async function detectEncryptedPdf(filePath: string) {
    const fd = await fsp.open(filePath, "r");
    try {
        const maxBytes = 2 * 1024 * 1024;
        const stat = await fd.stat();

        const headBuffer = Buffer.alloc(Math.min(maxBytes, stat.size));
        const headRead = await fd.read(headBuffer, 0, headBuffer.length, 0);
        const headChunk = headBuffer.subarray(0, headRead.bytesRead);

        if (headChunk.includes("/Encrypt")) {
            throw new ProtectPdfError(
                "This PDF is already password-protected. Please unlock it first and then apply new protection.",
                400,
                "encrypted_pdf"
            );
        }

        if (stat.size > maxBytes) {
            const tailBuffer = Buffer.alloc(maxBytes);
            const start = Math.max(0, stat.size - maxBytes);
            const tailRead = await fd.read(tailBuffer, 0, tailBuffer.length, start);
            const tailChunk = tailBuffer.subarray(0, tailRead.bytesRead);
            if (tailChunk.includes("/Encrypt")) {
                throw new ProtectPdfError(
                    "This PDF is already password-protected. Please unlock it first and then apply new protection.",
                    400,
                    "encrypted_pdf"
                );
            }
        }
    } finally {
        await fd.close();
    }
}

/** Encrypt a PDF with qpdf and return a streaming response. */
export async function protectPdfWithQpdf(options: {
    inputPath: string;
    outputBaseName: string;
    userPassword: string;
    ownerPassword?: string;
    permissions: PdfPermissions;
    signal?: AbortSignal;
    timeoutMs?: number;
}): Promise<ProtectionResult> {
    const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const qpdfPath = process.env.QPDF_PATH || "qpdf";
    const outputDir = await fsp.mkdtemp(path.join(os.tmpdir(), "protect-pdf-out-"));
    const outputPath = path.join(outputDir, `${options.outputBaseName}_protected.pdf`);

    const ownerPassword = options.ownerPassword?.trim()
        ? options.ownerPassword
        : crypto.randomBytes(16).toString("hex");

    validatePassword(options.userPassword, "user");
    validatePassword(ownerPassword, "owner");

    const args = buildQpdfArgs({
        inputPath: options.inputPath,
        outputPath,
        userPassword: options.userPassword,
        ownerPassword,
        permissions: options.permissions,
    });

    let abortHandler: (() => void) | null = null;

    try {
        await new Promise<void>((resolve, reject) => {
            let settled = false;

            const finish = (error?: Error) => {
                if (settled) return;
                settled = true;
                if (abortHandler && options.signal) {
                    options.signal.removeEventListener("abort", abortHandler);
                }
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            };

            const processHandle = spawn(qpdfPath, args, { stdio: "ignore" });

            const timeoutId = setTimeout(() => {
                processHandle.kill("SIGKILL");
                finish(new ProtectPdfError("Protection timed out. Please try again.", 504, "qpdf_timeout"));
            }, timeoutMs);

            abortHandler = () => {
                processHandle.kill("SIGKILL");
                clearTimeout(timeoutId);
                finish(new ProtectPdfError("Protection cancelled.", 400, "protection_cancelled"));
            };

            if (options.signal) {
                if (options.signal.aborted) {
                    abortHandler();
                    return;
                }
                options.signal.addEventListener("abort", abortHandler, { once: true });
            }

            processHandle.on("error", (err: NodeJS.ErrnoException) => {
                clearTimeout(timeoutId);
                if (err.code === "ENOENT") {
                    finish(
                        new ProtectPdfError(
                            "qpdf was not found. Install qpdf and set QPDF_PATH if needed.",
                            500,
                            "qpdf_missing"
                        )
                    );
                    return;
                }
                finish(err);
            });

            processHandle.on("exit", (code) => {
                clearTimeout(timeoutId);
                if (code === 0) {
                    finish();
                } else {
                    finish(new ProtectPdfError(`qpdf exited with code ${code}`, 500, "qpdf_failed"));
                }
            });
        });

        const stat = await fsp.stat(outputPath);
        const nodeStream = fs.createReadStream(outputPath);
        nodeStream.on("close", async () => {
            await fsp.rm(outputDir, { recursive: true, force: true });
        });

        return {
            stream: Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>,
            fileName: path.basename(outputPath),
            contentType: "application/pdf",
            contentLength: stat.size,
        };
    } catch (error) {
        await fsp.rm(outputDir, { recursive: true, force: true });
        if (error instanceof ProtectPdfError) throw error;
        throw new ProtectPdfError(
            `Failed to protect PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
            500,
            "qpdf_error"
        );
    }
}

/** Build qpdf encryption arguments from user permissions. */
function buildQpdfArgs(options: {
    inputPath: string;
    outputPath: string;
    userPassword: string;
    ownerPassword: string;
    permissions: PdfPermissions;
}) {
    const printOpt = options.permissions.print ? "full" : "none";
    const modifyOpt = options.permissions.modify
        ? "all"
        : options.permissions.annotate
            ? "annotate"
            : "none";
    const extractOpt = options.permissions.copy ? "y" : "n";
    const annotateOpt = options.permissions.annotate ? "y" : "n";

    return [
        "--encrypt",
        options.userPassword,
        options.ownerPassword,
        "256",
        `--print=${printOpt}`,
        `--modify=${modifyOpt}`,
        `--extract=${extractOpt}`,
        `--annotate=${annotateOpt}`,
        "--",
        options.inputPath,
        options.outputPath,
    ];
}

/** Validate passwords for qpdf CLI safety. */
function validatePassword(password: string, label: "user" | "owner") {
    if (!password) return;
    if (password.startsWith("-")) {
        throw new ProtectPdfError(
            `${label === "user" ? "User" : "Owner"} password cannot start with "-". Please choose another password.`,
            400,
            "invalid_password"
        );
    }
    if (/[\r\n]/.test(password)) {
        throw new ProtectPdfError(
            `${label === "user" ? "User" : "Owner"} password contains invalid characters.`,
            400,
            "invalid_password"
        );
    }
}
