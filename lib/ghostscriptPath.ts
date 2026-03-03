import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";

function normalizeEnvPath(raw?: string) {
    if (!raw) return "";
    const trimmed = raw.trim();
    if (!trimmed) return "";
    if (fs.existsSync(trimmed) && fs.statSync(trimmed).isDirectory()) {
        const exe = process.platform === "win32" ? "gswin64c.exe" : "gs";
        return path.join(trimmed, exe);
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

/** Resolve Ghostscript executable path from env, common install paths, or PATH fallback. */
export async function resolveGhostscriptPath() {
    const envPath = normalizeEnvPath(process.env.GHOSTSCRIPT_PATH || process.env.GS_PATH);

    const candidates = new Set<string>();
    if (envPath) candidates.add(envPath);

    if (process.platform === "win32") {
        const programFiles = process.env.ProgramFiles || "C:\\Program Files";
        const programFilesX86 = process.env["ProgramFiles(x86)"] || "C:\\Program Files (x86)";

        [
            "C:\\ProgramData\\chocolatey\\bin\\gswin64c.exe",
            "C:\\ProgramData\\chocolatey\\bin\\gswin32c.exe",
            path.join(process.cwd(), "bin", "gswin64c.exe"),
            path.join(process.cwd(), "tools", "gs", "bin", "gswin64c.exe"),
        ].forEach((candidate) => {
            if (candidate) candidates.add(candidate);
        });

        for (const baseDir of [programFiles, programFilesX86]) {
            try {
                const entries = await fsp.readdir(baseDir, { withFileTypes: true });
                for (const entry of entries) {
                    if (!entry.isDirectory()) continue;
                    if (!entry.name.toLowerCase().startsWith("gs")) continue;
                    candidates.add(path.join(baseDir, entry.name, "bin", "gswin64c.exe"));
                    candidates.add(path.join(baseDir, entry.name, "bin", "gswin32c.exe"));
                }
            } catch {
                // ignore
            }
        }

        for (const candidate of candidates) {
            if (candidate.toLowerCase().endsWith(".exe") && (await existsFile(candidate))) {
                return candidate;
            }
        }

        return envPath || "gswin64c.exe";
    }

    [
        "/usr/bin/gs",
        "/usr/local/bin/gs",
        "/opt/homebrew/bin/gs",
        path.join(process.cwd(), "bin", "gs"),
        path.join(process.cwd(), "tools", "gs", "bin", "gs"),
    ].forEach((candidate) => candidates.add(candidate));

    for (const candidate of candidates) {
        if (candidate.includes("/") && (await existsFile(candidate))) {
            return candidate;
        }
    }

    return envPath || "gs";
}
