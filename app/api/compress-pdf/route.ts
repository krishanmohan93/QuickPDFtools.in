import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { resolveQpdfPath } from "@/lib/qpdfPath";
import { resolveGhostscriptPath } from "@/lib/ghostscriptPath";
import { saveFileToTemp, assertPdfHeader, detectEncryptedPdf } from "@/lib/unlockPdf";
import { ENCRYPTED_PDF_MESSAGE } from "@/lib/pdfErrors";

export const runtime = "nodejs";
export const maxDuration = 180;

type CompressionLevel = "low" | "medium" | "high" | "ultra";

type CompressionSettings = {
    level: CompressionLevel;
    stripMetadata: boolean;
    objectStreams: "preserve" | "generate";
    recompressFlate: boolean;
    timeoutMs: number;
    allowLossy: boolean;
    minSavingsBytes?: number;
    gsProfile: GhostscriptProfile;
    gsResolution: number;
    gsJpegQuality: number;
    gsForceRecompressJpeg: boolean;
    gsAggressiveProfile: GhostscriptProfile;
    gsAggressiveResolution: number;
    gsAggressiveJpegQuality: number;
    gsAggressiveForceRecompressJpeg: boolean;
};

const DEFAULT_TIMEOUT_MS = 2 * 60 * 1000;

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file0") as File;
        const compressionLevel = (formData.get("compressionLevel") as string) || "medium";

        if (!file) {
            return NextResponse.json({ error: "Please upload a PDF file" }, { status: 400 });
        }

        const originalSize = file.size;
        const compressionSettings = getCompressionSettings(compressionLevel);

        const temp = await saveFileToTemp(file, "compress-pdf");
        let engine = "pdf-lib";
        let warning: string | null = null;
        let profile: string | null = null;

        try {
            await assertPdfHeader(temp.filePath);
            const isEncrypted = await detectEncryptedPdf(temp.filePath);
            if (isEncrypted) {
                return NextResponse.json({ error: ENCRYPTED_PDF_MESSAGE }, { status: 400 });
            }

            const preparedInput = await prepareInputFile(temp.filePath, temp.tempDir, compressionSettings);

            let compressedPdfBytes: Uint8Array | null = null;

            if (compressionSettings.allowLossy) {
                const gsResult = await tryGhostscriptCompression(
                    preparedInput,
                    originalSize,
                    compressionSettings
                );
                if (gsResult) {
                    compressedPdfBytes = gsResult.bytes;
                    engine = "ghostscript";
                    profile = gsResult.profile;
                } else {
                    warning = "ghostscript_unavailable";
                }
            }

            if (!compressedPdfBytes) {
                compressedPdfBytes = await tryQpdfCompression(preparedInput, compressionSettings);
                if (compressedPdfBytes) {
                    engine = "qpdf";
                } else {
                    compressedPdfBytes = await compressWithPdfLib(preparedInput, compressionSettings);
                }
            }

            const compressedSize = compressedPdfBytes.length;
            const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);

            if (compressedSize === 0 || compressedPdfBytes.length < 100) {
                throw new Error("Generated PDF is invalid or empty");
            }

            try {
                await PDFDocument.load(compressedPdfBytes);
            } catch {
                throw new Error("Generated PDF is corrupted and cannot be validated");
            }

            return new NextResponse(Buffer.from(compressedPdfBytes), {
                status: 200,
                headers: {
                    "Content-Type": "application/pdf",
                    "Content-Disposition": `attachment; filename=${getFileNameWithoutExtension(file.name)}_compressed.pdf`,
                    "X-Original-Size": originalSize.toString(),
                    "X-Compressed-Size": compressedSize.toString(),
                    "X-Compression-Ratio": `${compressionRatio}%`,
                    "X-Compression-Engine": engine,
                    ...(profile ? { "X-Compression-Profile": profile } : {}),
                    ...(warning ? { "X-Compression-Warning": warning } : {}),
                },
            });
        } finally {
            await temp.cleanup();
        }
    } catch (error) {
        console.error("Error compressing PDF:", error);
        return NextResponse.json(
            { error: `Failed to compress PDF: ${error instanceof Error ? error.message : "Unknown error"}` },
            { status: 500 }
        );
    }
}

/**
 * Get compression settings based on level
 */
function getCompressionSettings(level: string): CompressionSettings {
    switch (level) {
        case "low":
            return {
                level: "low",
                stripMetadata: false,
                objectStreams: "preserve",
                recompressFlate: false,
                timeoutMs: DEFAULT_TIMEOUT_MS,
                allowLossy: false,
                gsProfile: "ebook",
                gsResolution: 150,
                gsJpegQuality: 80,
                gsForceRecompressJpeg: false,
                gsAggressiveProfile: "screen",
                gsAggressiveResolution: 96,
                gsAggressiveJpegQuality: 65,
                gsAggressiveForceRecompressJpeg: false,
            };
        case "high":
            return {
                level: "high",
                stripMetadata: true,
                objectStreams: "generate",
                recompressFlate: true,
                timeoutMs: DEFAULT_TIMEOUT_MS,
                allowLossy: true,
                minSavingsBytes: 2 * 1024 * 1024,
                gsProfile: "ebook",
                gsResolution: 150,
                gsJpegQuality: 75,
                gsForceRecompressJpeg: false,
                gsAggressiveProfile: "screen",
                gsAggressiveResolution: 96,
                gsAggressiveJpegQuality: 65,
                gsAggressiveForceRecompressJpeg: false,
            };
        case "ultra":
            return {
                level: "ultra",
                stripMetadata: true,
                objectStreams: "generate",
                recompressFlate: true,
                timeoutMs: DEFAULT_TIMEOUT_MS,
                allowLossy: true,
                minSavingsBytes: 1 * 1024 * 1024,
                gsProfile: "screen",
                gsResolution: 96,
                gsJpegQuality: 60,
                gsForceRecompressJpeg: true,
                gsAggressiveProfile: "screen",
                gsAggressiveResolution: 72,
                gsAggressiveJpegQuality: 50,
                gsAggressiveForceRecompressJpeg: true,
            };
        default:
            return {
                level: "medium",
                stripMetadata: true,
                objectStreams: "generate",
                recompressFlate: false,
                timeoutMs: DEFAULT_TIMEOUT_MS,
                allowLossy: false,
                gsProfile: "ebook",
                gsResolution: 150,
                gsJpegQuality: 75,
                gsForceRecompressJpeg: false,
                gsAggressiveProfile: "screen",
                gsAggressiveResolution: 96,
                gsAggressiveJpegQuality: 65,
                gsAggressiveForceRecompressJpeg: false,
            };
    }
}

async function prepareInputFile(inputPath: string, tempDir: string, settings: CompressionSettings) {
    if (!settings.stripMetadata) return inputPath;
    const bytes = await fsp.readFile(inputPath);
    const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    removeMetadata(pdfDoc);
    const strippedBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: 50,
    });
    const strippedPath = path.join(tempDir, `metadata-stripped-${Date.now()}.pdf`);
    await fsp.writeFile(strippedPath, strippedBytes);
    return strippedPath;
}

type GhostscriptProfile = "ebook" | "screen";

async function tryGhostscriptCompression(
    inputPath: string,
    originalSize: number,
    settings: CompressionSettings
): Promise<{ bytes: Uint8Array; profile: GhostscriptProfile } | null> {
    try {
        const first = await compressWithGhostscript(
            inputPath,
            settings.gsProfile,
            settings.gsResolution,
            settings.gsJpegQuality,
            settings.gsForceRecompressJpeg,
            settings
        );
        let best = { bytes: first, profile: settings.gsProfile as GhostscriptProfile };

        const minSavings = settings.minSavingsBytes ?? 0;
        const currentSavings = originalSize - best.bytes.length;
        const shouldTryAggressive =
            settings.level === "ultra" ||
            (minSavings > 0 && currentSavings < minSavings && originalSize >= minSavings * 2);

        if (shouldTryAggressive) {
            const second = await compressWithGhostscript(
                inputPath,
                settings.gsAggressiveProfile,
                settings.gsAggressiveResolution,
                settings.gsAggressiveJpegQuality,
                settings.gsAggressiveForceRecompressJpeg,
                settings
            );
            if (second.length < best.bytes.length) {
                best = { bytes: second, profile: settings.gsAggressiveProfile };
            }
        }

        return best;
    } catch (error) {
        console.warn("ghostscript compression failed:", error);
        return null;
    }
}

async function compressWithGhostscript(
    inputPath: string,
    profile: GhostscriptProfile,
    resolution: number,
    jpegQuality: number,
    forceRecompressJpeg: boolean,
    settings: CompressionSettings
): Promise<Uint8Array> {
    const gsPath = await resolveGhostscriptPath();
    const outputDir = await fsp.mkdtemp(path.join(os.tmpdir(), "compress-pdf-gs-"));
    const outputPath = path.join(outputDir, "compressed.pdf");

    const args = buildGhostscriptArgs(
        inputPath,
        outputPath,
        profile,
        resolution,
        jpegQuality,
        forceRecompressJpeg
    );

    try {
        await runProcess(gsPath, args, settings.timeoutMs);
        return await fsp.readFile(outputPath);
    } finally {
        await fsp.rm(outputDir, { recursive: true, force: true });
    }
}

function buildGhostscriptArgs(
    inputPath: string,
    outputPath: string,
    profile: GhostscriptProfile,
    resolution: number,
    jpegQuality: number,
    forceRecompressJpeg: boolean
) {
    const monoResolution = Math.max(300, resolution * 2);

    return [
        "-sDEVICE=pdfwrite",
        "-dCompatibilityLevel=1.4",
        "-dNOPAUSE",
        "-dBATCH",
        "-dQUIET",
        "-dDetectDuplicateImages=true",
        "-dCompressFonts=true",
        "-dSubsetFonts=true",
        "-dAutoRotatePages=/None",
        `-dPDFSETTINGS=/${profile}`,
        ...(forceRecompressJpeg ? ["-dPassThroughJPEGImages=false"] : []),
        "-dDownsampleColorImages=true",
        "-dDownsampleGrayImages=true",
        "-dDownsampleMonoImages=true",
        "-dColorImageDownsampleType=/Bicubic",
        "-dGrayImageDownsampleType=/Bicubic",
        "-dMonoImageDownsampleType=/Subsample",
        `-dColorImageResolution=${resolution}`,
        `-dGrayImageResolution=${resolution}`,
        `-dMonoImageResolution=${monoResolution}`,
        `-dJPEGQ=${jpegQuality}`,
        `-sOutputFile=${outputPath}`,
        inputPath,
    ];
}

async function tryQpdfCompression(inputPath: string, settings: CompressionSettings): Promise<Uint8Array | null> {
    try {
        return await compressWithQpdf(inputPath, settings);
    } catch (error) {
        console.warn("qpdf compression failed, falling back to pdf-lib:", error);
        return null;
    }
}

async function compressWithQpdf(inputPath: string, settings: CompressionSettings): Promise<Uint8Array> {
    const qpdfPath = await resolveQpdfPath();
    const outputDir = await fsp.mkdtemp(path.join(os.tmpdir(), "compress-pdf-out-"));
    const outputPath = path.join(outputDir, "compressed.pdf");

    const args = [
        `--object-streams=${settings.objectStreams}`,
        "--stream-data=compress",
        "--compress-streams=y",
        ...(settings.recompressFlate ? ["--recompress-flate"] : []),
        "--",
        inputPath,
        outputPath,
    ];

    try {
        await runProcess(qpdfPath, args, settings.timeoutMs);
        return await fsp.readFile(outputPath);
    } finally {
        await fsp.rm(outputDir, { recursive: true, force: true });
    }
}

async function compressWithPdfLib(inputPath: string, settings: CompressionSettings): Promise<Uint8Array> {
    const bytes = await fsp.readFile(inputPath);
    const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    if (settings.stripMetadata) {
        removeMetadata(pdfDoc);
    }
    return pdfDoc.save({
        useObjectStreams: settings.objectStreams === "generate",
        addDefaultPage: false,
        objectsPerTick: 50,
    });
}

function runProcess(command: string, args: string[], timeoutMs: number): Promise<void> {
    return new Promise((resolve, reject) => {
        let settled = false;
        let stderr = "";

        const finish = (error?: Error) => {
            if (settled) return;
            settled = true;
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        };

        const processHandle = spawn(command, args, { stdio: ["ignore", "ignore", "pipe"] });

        const timeoutId = setTimeout(() => {
            processHandle.kill("SIGKILL");
            finish(new Error("Compression timed out."));
        }, timeoutMs);

        processHandle.stderr?.on("data", (chunk) => {
            stderr += chunk.toString();
        });

        processHandle.on("error", (err: NodeJS.ErrnoException) => {
            clearTimeout(timeoutId);
            finish(err);
        });

        processHandle.on("exit", (code) => {
            clearTimeout(timeoutId);
            if (code === 0) {
                finish();
                return;
            }
            finish(new Error(stderr || `Compression process failed with exit code ${code ?? "unknown"}`));
        });
    });
}

/**
 * Remove metadata from PDF to reduce size
 */
function removeMetadata(pdfDoc: PDFDocument): void {
    try {
        pdfDoc.setTitle('');
        pdfDoc.setAuthor('');
        pdfDoc.setSubject('');
        pdfDoc.setKeywords([]);
        pdfDoc.setProducer('');
        pdfDoc.setCreator('');
    } catch (error) {
        console.warn('Could not remove metadata:', error);
    }
}

/**
 * Get filename without extension
 */
function getFileNameWithoutExtension(filename: string): string {
    return filename.replace(/\.[^/.]+$/, "");
}

