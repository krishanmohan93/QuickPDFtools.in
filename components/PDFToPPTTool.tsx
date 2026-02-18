"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import DragDropUpload from "@/components/DragDropUpload";
import { buildDownloadName, splitFileName } from "@/lib/fileName";

type Status = "idle" | "uploading" | "converting" | "success" | "error";

const MAX_FILE_SIZE_MB = Number(process.env.NEXT_PUBLIC_PDF_TO_PPT_MAX_MB || 50);

function parseFileNameFromDisposition(disposition: string | null) {
    if (!disposition) return null;
    const match = disposition.match(/filename="?([^"]+)"?/i);
    return match?.[1] || null;
}

export default function PDFToPPTTool() {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<Status>("idle");
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [downloadName, setDownloadName] = useState<string>("converted.pptx");
    const [downloadBaseName, setDownloadBaseName] = useState<string>("converted");
    const [downloadExtension, setDownloadExtension] = useState<string>(".pptx");
    const xhrRef = useRef<XMLHttpRequest | null>(null);

    const isBusy = status === "uploading" || status === "converting";

    useEffect(() => {
        return () => {
            if (downloadUrl) {
                URL.revokeObjectURL(downloadUrl);
            }
            xhrRef.current?.abort();
        };
    }, [downloadUrl]);

    const reset = () => {
        if (downloadUrl) {
            URL.revokeObjectURL(downloadUrl);
        }
        setFile(null);
        setStatus("idle");
        setProgress(0);
        setError(null);
        setDownloadUrl(null);
        setDownloadName("converted.pptx");
        setDownloadBaseName("converted");
        setDownloadExtension(".pptx");
    };

    const validateFile = (selectedFile: File) => {
        if (!selectedFile.name.toLowerCase().endsWith(".pdf")) {
            return "Please upload a PDF file.";
        }
        if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            return `File too large. Max size is ${MAX_FILE_SIZE_MB}MB.`;
        }
        return null;
    };

    const handleFileSelect = (selectedFiles: File[]) => {
        const selectedFile = selectedFiles[0];
        if (!selectedFile) return;

        const validationError = validateFile(selectedFile);
        if (validationError) {
            setError(validationError);
            setFile(null);
            return;
        }

        if (downloadUrl) {
            URL.revokeObjectURL(downloadUrl);
        }
        setFile(selectedFile);
        setError(null);
        setStatus("idle");
        setProgress(0);
        setDownloadUrl(null);
        setDownloadName("converted.pptx");
        setDownloadBaseName("converted");
        setDownloadExtension(".pptx");
    };

    const handleConvert = () => {
        if (!file || isBusy) return;

        setStatus("uploading");
        setProgress(0);
        setError(null);

        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;
        let uploadComplete = false;

        xhr.open("POST", "/api/pdf-to-ppt", true);
        xhr.responseType = "blob";

        xhr.upload.onprogress = (event) => {
            if (!event.lengthComputable) return;
            const percent = Math.round((event.loaded / event.total) * 60);
            setProgress(Math.min(percent, 60));
        };

        xhr.upload.onload = () => {
            uploadComplete = true;
            setStatus("converting");
            setProgress((prev) => Math.max(prev, 70));
        };

        xhr.onprogress = (event) => {
            if (!uploadComplete || !event.lengthComputable) return;
            const percent = 70 + Math.round((event.loaded / event.total) * 25);
            setProgress(Math.min(percent, 95));
        };

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                const blob = xhr.response;
                const url = URL.createObjectURL(blob);
                const disposition = xhr.getResponseHeader("Content-Disposition");
                const fileName =
                    parseFileNameFromDisposition(disposition) ||
                    `${file.name.replace(/\.[^/.]+$/, "")}.pptx`;

                setDownloadUrl(url);
                setDownloadName(fileName);
                const parts = splitFileName(fileName);
                setDownloadBaseName(parts.base || "converted");
                setDownloadExtension(parts.ext || ".pptx");
                setProgress(100);
                setStatus("success");
            } else {
                const blob = xhr.response;
                blob?.text?.().then((text: string) => {
                    try {
                        const data = JSON.parse(text);
                        setError(data.error || "Conversion failed.");
                    } catch {
                        setError(text || "Conversion failed.");
                    }
                });
                setStatus("error");
                setProgress(0);
            }
        };

        xhr.onerror = () => {
            setError("Network error. Please try again.");
            setStatus("error");
            setProgress(0);
        };

        xhr.onabort = () => {
            setError("Upload cancelled.");
            setStatus("error");
            setProgress(0);
        };

        const formData = new FormData();
        formData.append("file0", file);
        xhr.send(formData);
    };

    const handleCancel = () => {
        xhrRef.current?.abort();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                        📽️ PDF to PPTX Converter
                    </h1>
                    <p className="text-gray-600 dark:text-slate-300 text-lg">
                        Convert PDF files to editable PowerPoint presentations with preserved layout and images.
                    </p>
                </div>

                {!file && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 mb-8 border border-blue-100/40 dark:border-slate-800">
                        <DragDropUpload
                            onFileSelect={handleFileSelect}
                            accept=".pdf"
                            multiple={false}
                            maxSize={MAX_FILE_SIZE_MB}
                            disabled={isBusy}
                            icon="📄"
                            title="Click to select a PDF file"
                            subtitle="or drag and drop here"
                            borderColor="border-blue-300"
                            hoverColor="border-blue-500 bg-blue-50"
                        />
                    </div>
                )}

                {!file && (
                    <div className="mt-8 bg-blue-50 dark:bg-slate-900 rounded-2xl p-8 border-2 border-blue-200 dark:border-slate-800">
                        <h3 className="text-xl font-bold text-blue-900 dark:text-slate-100 mb-4">
                            📖 How to use:
                        </h3>
                        <ol className="space-y-2 text-blue-800 dark:text-slate-300">
                            <li>1. Upload your PDF file</li>
                            <li>2. Click "Convert to PPTX"</li>
                            <li>3. Download the PowerPoint presentation</li>
                        </ol>
                    </div>
                )}

                {file && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 mb-8 border border-blue-100/40 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="text-4xl">📄</div>
                                <div>
                                    <div className="font-semibold text-gray-800 dark:text-slate-100">{file.name}</div>
                                    <div className="text-sm text-gray-500 dark:text-slate-400">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB • Max {MAX_FILE_SIZE_MB}MB
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={reset}
                                disabled={isBusy}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                )}

                {error && (
                    <div
                        className="bg-red-50 dark:bg-red-950/40 border-2 border-red-200 dark:border-red-900 rounded-2xl p-6 mb-8"
                        role="alert"
                        aria-live="assertive"
                    >
                        <h4 className="text-red-900 dark:text-red-200 font-semibold mb-2">⚠️ Error</h4>
                        <p className="text-red-700 dark:text-red-300">{error}</p>
                    </div>
                )}

                {isBusy && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 mb-8 border border-blue-100/40 dark:border-slate-800" aria-live="polite">
                        <div className="mb-4 text-center">
                            <div className="text-xl font-semibold text-gray-700 dark:text-slate-200 mb-2">
                                {status === "uploading" ? "Uploading PDF..." : "Converting to PPTX..."}
                            </div>
                            <div className="text-4xl font-bold text-blue-600">
                                {Math.round(progress)}%
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-300 rounded-full"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <button
                            onClick={handleCancel}
                            className="mt-6 w-full py-3 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200 font-semibold hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                )}

                {file && !isBusy && status !== "success" && (
                    <button
                        onClick={handleConvert}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xl font-bold py-6 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
                    >
                        📽️ Convert to PPTX
                    </button>
                )}

                {status === "success" && downloadUrl && (
                    <div className="text-center py-8 bg-green-50 dark:bg-emerald-950/40 rounded-2xl border-2 border-green-200 dark:border-emerald-900 mb-8" role="status" aria-live="polite">
                        <div className="w-20 h-20 bg-green-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-green-600 dark:text-emerald-200" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-green-900 dark:text-emerald-100 mb-2">Conversion Complete!</h3>
                        <p className="text-green-700 dark:text-emerald-200 mb-6">Your PPTX is ready to download.</p>
                        <div className="max-w-md mx-auto mb-6 text-left">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">File name</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={downloadBaseName}
                                    onChange={(event) => setDownloadBaseName(event.target.value)}
                                    className="flex-1 px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-lg focus:border-blue-500 focus:outline-none bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200"
                                    placeholder="Enter file name"
                                />
                                {downloadExtension && (
                                    <span className="px-3 py-2 bg-gray-100 dark:bg-slate-800 rounded-lg text-sm text-gray-600 dark:text-slate-300">
                                        {downloadExtension}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href={downloadUrl}
                                download={buildDownloadName(downloadBaseName, downloadExtension, downloadName)}
                                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 !text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                            >
                                Download PPTX
                            </a>
                            <button
                                onClick={reset}
                                className="px-8 py-4 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
                            >
                                Convert Another File
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                    {[
                        { icon: "🧩", title: "Layout Preserved", description: "Slides retain structure and visual hierarchy." },
                        { icon: "🖼️", title: "Images Embedded", description: "Charts and images stay intact in the PPTX." },
                        { icon: "🔒", title: "Secure", description: "Files are processed securely and deleted after conversion." },
                    ].map((feature, index) => (
                        <div
                            key={index}
                            className="text-center p-6 bg-white dark:bg-slate-900 rounded-xl border border-blue-100/40 dark:border-slate-800 shadow-sm"
                        >
                            <div className="text-4xl mb-3">{feature.icon}</div>
                            <h4 className="font-semibold text-gray-900 dark:text-slate-100 mb-2">{feature.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-slate-400">{feature.description}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-12 bg-white dark:bg-slate-900 rounded-2xl p-8 border-2 border-gray-200 dark:border-slate-800">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4">
                        PDF to PPTX Converter Online
                    </h2>
                    <div className="prose max-w-none text-gray-700 dark:text-slate-300 space-y-4">
                        <p>
                            Convert PDF documents into editable PowerPoint slides while preserving text, layout, and images.
                            Ideal for presentations, reports, and training decks that need fast updates.
                        </p>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mt-6 mb-3">
                            How to use PDF to PPTX:
                        </h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Upload your PDF file</li>
                            <li>Convert to PowerPoint in one click</li>
                            <li>Edit and download your slides instantly</li>
                        </ul>
                        <p className="mt-4">
                            Need more tools? Try{" "}
                            <Link href="/merge-pdf" className="text-blue-600 hover:underline">Merge PDF</Link>,{" "}
                            <Link href="/compress-pdf" className="text-blue-600 hover:underline">Compress PDF</Link>, or{" "}
                            <Link href="/pdf-to-word" className="text-blue-600 hover:underline">PDF to Word</Link>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
