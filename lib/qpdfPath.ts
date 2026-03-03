import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";

function normalizeEnvPath(raw?: string) {
    if (!raw) return "";
    const trimmed = raw.trim();
    if (!trimmed) return "";
    if (fs.existsSync(trimmed) && fs.statSync(trimmed).isDirectory()) {
        return path.join(trimmed, process.platform === "win32" ? "qpdf.exe" : "qpdf");
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

/** Resolve qpdf executable path from env, common install paths, or PATH command fallback. */
export async function resolveQpdfPath() {
    const envPath = normalizeEnvPath(process.env.QPDF_PATH);

    const candidates = new Set<string>();
    if (envPath) candidates.add(envPath);

    if (process.platform === "win32") {
        const localAppData = process.env.LOCALAPPDATA || "";
        const userProfile = process.env.USERPROFILE || "";
        const programFiles = process.env.ProgramFiles || "C:\\Program Files";
        const programFilesX86 = process.env["ProgramFiles(x86)"] || "C:\\Program Files (x86)";

        [
            "C:\\Program Files\\qpdf\\bin\\qpdf.exe",
            "C:\\Program Files (x86)\\qpdf\\bin\\qpdf.exe",
            "C:\\ProgramData\\chocolatey\\bin\\qpdf.exe",
            path.join(localAppData, "Microsoft", "WinGet", "Packages"),
            path.join(userProfile, "scoop", "apps", "qpdf", "current", "bin", "qpdf.exe"),
            path.join(process.cwd(), "bin", "qpdf.exe"),
            path.join(process.cwd(), "tools", "qpdf", "bin", "qpdf.exe"),
        ].forEach((candidate) => {
            if (candidate) candidates.add(candidate);
        });

        for (const item of Array.from(candidates)) {
            if (!item.includes("WinGet\\Packages")) continue;
            try {
                const entries = await fsp.readdir(item, { withFileTypes: true });
                for (const entry of entries) {
                    if (!entry.isDirectory()) continue;
                    if (!entry.name.toLowerCase().includes("qpdf")) continue;
                    candidates.add(path.join(item, entry.name, "qpdf.exe"));
                }
            } catch {
                // ignore
            }
        }

        for (const baseDir of [programFiles, programFilesX86]) {
            try {
                const entries = await fsp.readdir(baseDir, { withFileTypes: true });
                for (const entry of entries) {
                    if (!entry.isDirectory()) continue;
                    if (!entry.name.toLowerCase().startsWith("qpdf")) continue;
                    candidates.add(path.join(baseDir, entry.name, "bin", "qpdf.exe"));
                    candidates.add(path.join(baseDir, entry.name, "qpdf.exe"));
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

        return envPath || "qpdf.exe";
    }

    [
        "/usr/bin/qpdf",
        "/usr/local/bin/qpdf",
        "/opt/homebrew/bin/qpdf",
        path.join(process.cwd(), "bin", "qpdf"),
        path.join(process.cwd(), "tools", "qpdf", "bin", "qpdf"),
    ].forEach((candidate) => candidates.add(candidate));

    for (const candidate of candidates) {
        if (candidate.includes("/") && (await existsFile(candidate))) {
            return candidate;
        }
    }

    return envPath || "qpdf";
}
