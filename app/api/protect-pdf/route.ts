import { NextRequest, NextResponse } from "next/server";
import {
    ProtectPdfError,
    assertPdfHeader,
    detectEncryptedPdf,
    protectPdfWithQpdf,
    sanitizeBaseName,
    saveFileToTemp,
    type PdfPermissions,
} from "@/lib/protectPdf";

export const runtime = "nodejs";
export const maxDuration = 300;

const DEFAULT_MAX_MB = 50;

/** Calculate the maximum file size for uploads. */
function getMaxFileSizeBytes() {
    const maxMbEnv = Number(process.env.PROTECT_PDF_MAX_MB || DEFAULT_MAX_MB);
    return Math.max(1, maxMbEnv) * 1024 * 1024;
}

/** Parse permissions string from the client into booleans. */
function parsePermissions(rawPermissions?: string | null): PdfPermissions {
    const list = (rawPermissions || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

    return {
        print: list.includes("print"),
        copy: list.includes("copy"),
        modify: list.includes("modify"),
        annotate: list.includes("annotate"),
    };
}

/** Protect a PDF by applying encryption with a user password. */
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
        const userPasswordRaw = formData.get("userPassword");
        const ownerPasswordRaw = formData.get("ownerPassword");
        const userPassword = typeof userPasswordRaw === "string" ? userPasswordRaw : "";
        const ownerPassword = typeof ownerPasswordRaw === "string" ? ownerPasswordRaw : "";
        const permissionsRaw = formData.get("permissions") as string | null;

        if (!file) {
            return NextResponse.json(
                { error: "Please upload a PDF file." },
                { status: 400 }
            );
        }

        if (!userPassword.trim()) {
            return NextResponse.json(
                { error: "User password is required to open the PDF." },
                { status: 400 }
            );
        }

        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
            return NextResponse.json(
                { error: "Only PDF files are supported." },
                { status: 400 }
            );
        }

        const maxBytes = getMaxFileSizeBytes();
        if (file.size > maxBytes) {
            return NextResponse.json(
                { error: `File too large. Max allowed is ${Math.round(maxBytes / 1024 / 1024)}MB.` },
                { status: 413 }
            );
        }

        const tempFile = await saveFileToTemp(file, "protect-pdf");
        cleanup = tempFile.cleanup;

        await assertPdfHeader(tempFile.filePath);
        await detectEncryptedPdf(tempFile.filePath);

        const permissions = parsePermissions(permissionsRaw);
        const baseName = sanitizeBaseName(file.name);
        const result = await protectPdfWithQpdf({
            inputPath: tempFile.filePath,
            outputBaseName: baseName,
            userPassword,
            ownerPassword,
            permissions,
            signal: request.signal,
            timeoutMs: Number(process.env.PROTECT_PDF_TIMEOUT_MS || 120000),
        });

        const headers = new Headers();
        headers.set("Content-Type", result.contentType);
        headers.set("Content-Disposition", `attachment; filename="${result.fileName}"`);
        headers.set("Cache-Control", "no-store, max-age=0");
        headers.set("X-Protection-Type", "qpdf-encrypt");
        headers.set("X-User-Password-Set", "true");
        headers.set("X-Owner-Password-Set", ownerPassword ? "true" : "false");
        headers.set("X-Permissions", permissionsRaw || "");
        if (result.contentLength) {
            headers.set("Content-Length", result.contentLength.toString());
        }

        return new NextResponse(result.stream, {
            status: 200,
            headers,
        });
    } catch (error) {
        if (error instanceof ProtectPdfError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }

        if ((error as any)?.name === "AbortError") {
            return NextResponse.json({ error: "Protection cancelled." }, { status: 400 });
        }

        return NextResponse.json(
            { error: `Failed to protect PDF: ${error instanceof Error ? error.message : "Unknown error"}` },
            { status: 500 }
        );
    } finally {
        if (cleanup) {
            await cleanup();
        }
    }
}
