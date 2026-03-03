import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";

function normalizeEnvPath(raw?: string) {
    if (!raw) return "";
    const trimmed = raw.trim();
    if (!trimmed) return "";
    if (fs.existsSync(trimmed) && fs.statSync(trimmed).isDirectory()) {
        return path.join(trimmed, process.platform === "win32" ? "soffice.exe" : "soffice");
    }
    return trimmed;
}

async function existsFile(filePath: string) {
    try {
        const stat = await fsp.stat(filePath);
        return stat.isFile();
    } catch {
        return false;
    }
}

/** Resolve LibreOffice soffice executable path from env, common install paths, or PATH fallback. */
export async function resolveLibreOfficePath() {
    const envPath = normalizeEnvPath(process.env.LIBREOFFICE_PATH || process.env.SOFFICE_PATH);

    const candidates = new Set<string>();
    if (envPath) candidates.add(envPath);

    if (process.platform === "win32") {
        const programFiles = process.env.ProgramFiles || "C:\\Program Files";
        const programFilesX86 = process.env["ProgramFiles(x86)"] || "C:\\Program Files (x86)";

        [
            path.join(programFiles, "LibreOffice", "program", "soffice.exe"),
            path.join(programFilesX86, "LibreOffice", "program", "soffice.exe"),
            path.join(process.cwd(), "bin", "soffice.exe"),
        ].forEach((candidate) => candidates.add(candidate));

        for (const candidate of candidates) {
            if (candidate.toLowerCase().endsWith(".exe") && (await existsFile(candidate))) {
                return candidate;
            }
        }

        return envPath || "soffice.exe";
    }

    [
        "/usr/bin/soffice",
        "/usr/local/bin/soffice",
        "/opt/homebrew/bin/soffice",
        path.join(process.cwd(), "bin", "soffice"),
    ].forEach((candidate) => candidates.add(candidate));

    for (const candidate of candidates) {
        if (candidate.includes("/") && (await existsFile(candidate))) {
            return candidate;
        }
    }

    return envPath || "soffice";
}
