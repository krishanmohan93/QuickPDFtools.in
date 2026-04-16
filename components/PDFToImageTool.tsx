"use client";

import { useState } from "react";
import DragDropUpload from "./DragDropUpload";
import * as pdfjsLib from 'pdfjs-dist';
import { sanitizeFileNamePart, splitFileName } from "@/lib/fileName";

// Set worker path
if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

type OutputFormat = "jpg" | "png" | "webp";

interface PDFToImageToolProps {
    format?: OutputFormat;
}

export default function PDFToImageTool({ format = "jpg" }: PDFToImageToolProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [quality, setQuality] = useState(85);
    const [scale, setScale] = useState(2);
    const [outputBaseName, setOutputBaseName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [useServerProcessing, setUseServerProcessing] = useState(false);
    const [pageSelection, setPageSelection] = useState<"all" | "first" | "custom">("all");
    const [customPages, setCustomPages] = useState("");
    const [processingMethod, setProcessingMethod] = useState<"client" | "server">("client");

    const formatName = format.toUpperCase();
    const formatMime = format === "jpg" ? "image/jpeg" : format === "png" ? "image/png" : "image/webp";
    
    const theme =
        format === "jpg"
            ? {
                pageBg: "from-blue-50 via-white to-blue-100",
                titleGradient: "from-blue-600 to-blue-800",
                progressText: "text-blue-600",
                progressGradient: "from-blue-500 to-blue-700",
                buttonGradient: "from-blue-600 to-blue-800",
                buttonHover: "hover:from-blue-700 hover:to-blue-900",
                infoBg: "bg-blue-50",
                infoBorder: "border-blue-200",
                infoHeading: "text-blue-900",
                infoText: "text-blue-800",
                uploadBorder: "border-blue-300",
                uploadHover: "border-blue-500 bg-blue-50",
            }
            : format === "png"
            ? {
                pageBg: "from-indigo-50 via-white to-indigo-100",
                titleGradient: "from-indigo-600 to-indigo-800",
                progressText: "text-indigo-600",
                progressGradient: "from-indigo-500 to-indigo-700",
                buttonGradient: "from-indigo-600 to-indigo-800",
                buttonHover: "hover:from-indigo-700 hover:to-indigo-900",
                infoBg: "bg-indigo-50",
                infoBorder: "border-indigo-200",
                infoHeading: "text-indigo-900",
                infoText: "text-indigo-800",
                uploadBorder: "border-indigo-300",
                uploadHover: "border-indigo-500 bg-indigo-50",
            }
            : {
                pageBg: "from-emerald-50 via-white to-emerald-100",
                titleGradient: "from-emerald-600 to-emerald-800",
                progressText: "text-emerald-600",
                progressGradient: "from-emerald-500 to-emerald-700",
                buttonGradient: "from-emerald-600 to-emerald-800",
                buttonHover: "hover:from-emerald-700 hover:to-emerald-900",
                infoBg: "bg-emerald-50",
                infoBorder: "border-emerald-200",
                infoHeading: "text-emerald-900",
                infoText: "text-emerald-800",
                uploadBorder: "border-emerald-300",
                uploadHover: "border-emerald-500 bg-emerald-50",
            };

    const handleFileSelect = async (selectedFiles: File[]) => {
        const selectedFile = selectedFiles[0];
        if (!selectedFile) return;

        setError(null);
        setFile(selectedFile);
        const parts = splitFileName(selectedFile.name);
        setOutputBaseName(parts.base || "page");
        setUseServerProcessing(false);
        setProcessingMethod("client");

        // Load PDF to get page count
        try {
            const arrayBuffer = await selectedFile.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer, disableWorker: true });
            const pdf = await loadingTask.promise;
            setTotalPages(pdf.numPages);
        } catch (error) {
            console.error("Error loading PDF:", error);
            setError(`Failed to load PDF in browser (${error instanceof Error ? error.message : "Unknown error"}). Will use server-side processing.`);
            setUseServerProcessing(true);
            
            // Try to get page count from server
            try {
                const formData = new FormData();
                formData.append("file", selectedFile);
                const response = await fetch("/api/pdf-to-jpg");
                if (response.ok) {
                    const data = await response.json();
                    setTotalPages(data.numPages || 0);
                }
            } catch (e) {
                console.error("Could not get page count:", e);
            }
        }
    };

    const convertToImages = async () => {
        if (!file) return;

        setError(null);
        setIsProcessing(true);
        setProgress(0);

        try {
            // Determine which method to use
            const method = useServerProcessing || !pdfjsLib ? "server" : processingMethod;
            
            if (method === "server") {
                // Use server-side processing
                await convertWithServer();
            } else {
                // Use client-side processing
                await convertWithClient();
            }
        } catch (error) {
            console.error(`Error converting PDF:`, error);
            const errorMsg = error instanceof Error ? error.message : String(error);
            setError(`Conversion failed: ${errorMsg}. Try switching to server-side processing.`);
            
            // Auto-switch to server processing
            setUseServerProcessing(true);
            setProcessingMethod("server");
        } finally {
            setIsProcessing(false);
        }
    };

    const convertWithClient = async () => {
        if (!file) return;

        try {
            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer, disableWorker: true });
            const pdf = await loadingTask.promise;
            const numPages = pdf.numPages;

            // Determine pages to convert
            let pagesToConvert: number[] = [];
            if (pageSelection === "all") {
                pagesToConvert = Array.from({ length: numPages }, (_, i) => i + 1);
            } else if (pageSelection === "first") {
                pagesToConvert = [1];
            } else if (customPages) {
                const pages = customPages.split(",").map(p => parseInt(p.trim())).filter(p => !isNaN(p) && p > 0 && p <= numPages);
                pagesToConvert = [...new Set(pages)].sort((a, b) => a - b);
            }

            if (pagesToConvert.length === 0) {
                throw new Error("No valid pages selected");
            }

            for (let i = 0; i < pagesToConvert.length; i++) {
                const pageNum = pagesToConvert[i];
                const page = await pdf.getPage(pageNum);
                const viewport = page.getViewport({ scale });

                // Create canvas
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                if (!context) throw new Error('Could not get canvas context');

                canvas.width = viewport.width;
                canvas.height = viewport.height;

                // Render PDF page to canvas
                await page.render({
                    canvasContext: context,
                    viewport: viewport,
                }).promise;

                // Convert canvas to blob
                const blob = await new Promise<Blob>((resolve, reject) => {
                    canvas.toBlob(
                        (blob) => {
                            if (blob) resolve(blob);
                            else reject(new Error('Failed to create blob'));
                        },
                        formatMime,
                        format === "jpg" ? quality / 100 : undefined
                    );
                });

                // Download image
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                const safeBase = sanitizeFileNamePart(outputBaseName || "page");
                link.download = `${safeBase}-page-${pageNum}.${format}`;
                link.click();
                URL.revokeObjectURL(url);

                // Update progress
                setProgress(Math.round(((i + 1) / pagesToConvert.length) * 100));

                // Small delay between downloads
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            setProgress(100);
            setTimeout(() => {
                alert(`Successfully converted ${pagesToConvert.length} page(s) to ${formatName}!`);
                setProgress(0);
            }, 500);
        } catch (error) {
            throw error;
        }
    };

    const convertWithServer = async () => {
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("format", format);
            formData.append("quality", quality.toString());
            formData.append("scale", scale.toString());

            // Add page selection
            if (pageSelection === "all") {
                formData.append("pages", "all");
            } else if (pageSelection === "first") {
                formData.append("pages", "first");
            } else if (customPages) {
                formData.append("pages", customPages);
            }

            setProgress(10);

            const response = await fetch("/api/pdf-to-jpg", {
                method: "POST",
                body: formData,
            });

            setProgress(50);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Server conversion failed");
            }

            setProgress(80);

            // Get file from response
            const blob = await response.blob();
            const fileName = response.headers.get('Content-Disposition')?.match(/filename="?([^"]+)"?$/)?.[1] || `converted.${format === "jpg" ? "jpg" : format}`;

            // Download file
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.click();
            URL.revokeObjectURL(url);

            setProgress(100);
            setTimeout(() => {
                const pageCount = response.headers.get('X-Converted-Pages') || "unknown";
                alert(`Successfully converted ${pageCount} page(s) to ${formatName}!`);
                setProgress(0);
            }, 500);
        } catch (error) {
            throw error;
        }
    };

    return (
        <div className={`min-h-screen bg-gradient-to-br ${theme.pageBg} p-8`}>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className={`text-5xl font-bold bg-gradient-to-r ${theme.titleGradient} bg-clip-text text-transparent mb-4`}>
                        🖼️ PDF to {formatName}
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Convert PDF pages to high-quality {formatName} images
                    </p>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-8 text-red-800">
                        <p className="font-semibold">⚠️ {error}</p>
                        {useServerProcessing && (
                            <p className="text-sm mt-2">Automatically switched to server-side processing.</p>
                        )}
                    </div>
                )}

                {/* Upload Area */}
                {!file && (
                    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                        <DragDropUpload
                            onFileSelect={handleFileSelect}
                            accept=".pdf"
                            multiple={false}
                            maxSize={100}
                            icon="📄"
                            title="Click to select a PDF file"
                            subtitle="or drag and drop here"
                            borderColor={theme.uploadBorder}
                            hoverColor={theme.uploadHover}
                        />
                    </div>
                )}

                {!file && (
                    <div className={`mt-8 ${theme.infoBg} rounded-2xl p-8 border-2 ${theme.infoBorder}`}>
                        <h3 className={`text-xl font-bold ${theme.infoHeading} mb-4`}>
                            📖 How to use:
                        </h3>
                        <ol className={`space-y-2 ${theme.infoText}`}>
                            <li>1. Upload a PDF file</li>
                            <li>2. Choose which pages to convert</li>
                            <li>3. Adjust quality and resolution settings</li>
                            <li>4. Click "Convert to {formatName}"</li>
                            <li>5. Images will download (single file or ZIP for multiple pages)</li>
                        </ol>
                    </div>
                )}

                {/* File Info & Options */}
                {file && totalPages > 0 && (
                    <>
                        {/* File Info */}
                        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="text-4xl">📄</div>
                                    <div>
                                        <div className="font-semibold text-gray-800">{file.name}</div>
                                        <div className="text-sm text-gray-500">
                                            {totalPages} pages • {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setFile(null);
                                        setTotalPages(0);
                                        setOutputBaseName("");
                                        setError(null);
                                        setUseServerProcessing(false);
                                    }}
                                    disabled={isProcessing}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>

                        {/* Processing Method Selection */}
                        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Processing Method</h2>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={processingMethod === "client" && !useServerProcessing}
                                        onChange={() => {
                                            setProcessingMethod("client");
                                            setUseServerProcessing(false);
                                        }}
                                        disabled={isProcessing || useServerProcessing}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-gray-700">Browser (faster for simple PDFs)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={processingMethod === "server" || useServerProcessing}
                                        onChange={() => {
                                            setProcessingMethod("server");
                                            setUseServerProcessing(true);
                                        }}
                                        disabled={isProcessing}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-gray-700">Server (best for scanned PDFs)</span>
                                </label>
                            </div>
                        </div>

                        {/* Conversion Options */}
                        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Conversion Options</h2>

                            <div className="space-y-6">
                                {/* Page Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Pages to convert
                                    </label>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                checked={pageSelection === "all"}
                                                onChange={() => setPageSelection("all")}
                                                disabled={isProcessing}
                                                className="w-4 h-4"
                                            />
                                            <span className="text-gray-700">All pages ({totalPages})</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                checked={pageSelection === "first"}
                                                onChange={() => setPageSelection("first")}
                                                disabled={isProcessing}
                                                className="w-4 h-4"
                                            />
                                            <span className="text-gray-700">First page only</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                checked={pageSelection === "custom"}
                                                onChange={() => setPageSelection("custom")}
                                                disabled={isProcessing}
                                                className="w-4 h-4"
                                            />
                                            <span className="text-gray-700">Custom pages</span>
                                        </label>
                                        {pageSelection === "custom" && (
                                            <input
                                                type="text"
                                                value={customPages}
                                                onChange={(e) => setCustomPages(e.target.value)}
                                                disabled={isProcessing}
                                                placeholder="e.g., 1,2,5 or 1-3,5"
                                                className="ml-6 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none w-full"
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Output Filename */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Output file name
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={outputBaseName}
                                            onChange={(e) => setOutputBaseName(e.target.value)}
                                            disabled={isProcessing}
                                            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none bg-white text-gray-900"
                                            placeholder="e.g., report"
                                        />
                                        <span className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
                                            .{format}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Pages will download as {outputBaseName || "page"}-page-1.{format}
                                    </p>
                                </div>

                                {/* Quality Slider */}
                                {(format === "jpg" || format === "webp") && (
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 shadow-sm">
                                        <div className="mb-4 flex items-start justify-between gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold uppercase tracking-wide text-slate-500 mb-1">
                                                    Image Quality
                                                </label>
                                                <p className="text-sm text-slate-600">
                                                    Higher values preserve detail, lower values reduce file size.
                                                </p>
                                            </div>
                                            <div className={`min-w-20 rounded-full px-3 py-1 text-center text-sm font-bold ${theme.progressText} bg-white border border-slate-200 shadow-sm`}>
                                                {quality}%
                                            </div>
                                        </div>
                                        <input
                                            type="range"
                                            min="1"
                                            max="100"
                                            step="1"
                                            value={quality}
                                            onChange={(e) => setQuality(parseInt(e.target.value))}
                                            disabled={isProcessing}
                                            className="quality-slider w-full"
                                            aria-label="Image quality"
                                        />
                                        <div className="mt-3 flex items-center justify-between text-xs font-medium text-slate-500">
                                            <span>Smaller files</span>
                                            <span>Best quality</span>
                                        </div>
                                    </div>
                                )}

                                {/* Scale/Resolution Slider */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Resolution: {scale}x ({scale * 72} DPI)
                                    </label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="3"
                                        step="0.5"
                                        value={scale}
                                        onChange={(e) => setScale(parseFloat(e.target.value))}
                                        disabled={isProcessing}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>72 DPI (fast)</span>
                                        <span>216 DPI (balanced)</span>
                                        <span>288 DPI (high detail)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Progress */}
                        {isProcessing && (
                            <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl ring-1 ring-black/5 p-8 mb-8 border border-slate-200">
                                <div className="mb-5 text-center">
                                    <div className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500 mb-2">
                                        Processing
                                    </div>
                                    <div className="text-xl font-semibold text-slate-800 mb-2">
                                        Converting to {formatName}...
                                    </div>
                                    <div className={`text-5xl font-black ${theme.progressText} drop-shadow-sm`}>
                                        {progress}%
                                    </div>
                                </div>
                                <div className="w-full rounded-full h-5 overflow-hidden bg-slate-200 border border-slate-300 shadow-inner">
                                    <div
                                        className={`h-full rounded-full bg-gradient-to-r ${theme.progressGradient} shadow-[0_0_18px_rgba(59,130,246,0.35)] transition-[width] duration-300 ease-out`}
                                        style={{ width: `${Math.max(progress, 4)}%` }}
                                        role="progressbar"
                                        aria-valuenow={progress}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                    />
                                </div>
                                <div className="mt-3 flex items-center justify-between text-xs font-medium text-slate-500">
                                    <span>Starting</span>
                                    <span>Rendering pages</span>
                                    <span>Done</span>
                                </div>
                            </div>
                        )}

                        {/* Convert Button */}
                        {!isProcessing && (
                            <button
                                onClick={convertToImages}
                                disabled={isProcessing || (pageSelection === "custom" && !customPages)}
                                className={`w-full bg-gradient-to-r ${theme.buttonGradient} text-white text-xl font-bold py-6 rounded-2xl ${theme.buttonHover} transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                🖼️ Convert to {formatName}
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
