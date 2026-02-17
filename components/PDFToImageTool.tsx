"use client";

import { useState } from "react";
import DragDropUpload from "./DragDropUpload";
import * as pdfjsLib from 'pdfjs-dist';

// Set worker path
if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

type OutputFormat = "jpg" | "png";

interface PDFToImageToolProps {
    format: OutputFormat;
}

export default function PDFToImageTool({ format }: PDFToImageToolProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [quality, setQuality] = useState(0.95);
    const [scale, setScale] = useState(2); // DPI multiplier

    const formatName = format.toUpperCase();
    const formatMime = format === "jpg" ? "image/jpeg" : "image/png";
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
            : {
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
            };

    const handleFileSelect = async (selectedFiles: File[]) => {
        const selectedFile = selectedFiles[0];
        if (!selectedFile) return;

        setFile(selectedFile);

        // Load PDF to get page count
        try {
            const arrayBuffer = await selectedFile.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            setTotalPages(pdf.numPages);
        } catch (error) {
            console.error("Error loading PDF:", error);
            alert("Failed to load PDF. Please try again.");
        }
    };

    const convertToImages = async () => {
        if (!file) return;

        setIsProcessing(true);
        setProgress(0);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            const numPages = pdf.numPages;

            for (let pageNum = 1; pageNum <= numPages; pageNum++) {
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
                        quality
                    );
                });

                // Download image
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `page-${pageNum}.${format}`;
                link.click();
                URL.revokeObjectURL(url);

                // Update progress
                setProgress(Math.round((pageNum / numPages) * 100));

                // Small delay between downloads
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            alert(`Successfully converted ${numPages} page(s) to ${formatName}!`);
            setProgress(0);
        } catch (error) {
            console.error(`Error converting PDF to ${formatName}:`, error);
            alert(`Failed to convert PDF to ${formatName}. Please try again.`);
            setProgress(0);
        } finally {
            setIsProcessing(false);
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

                {/* Upload Area */}
                {!file && (
                    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                        <DragDropUpload
                            onFileSelect={handleFileSelect}
                            accept=".pdf"
                            multiple={false}
                            maxSize={50}
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
                            <li>2. Adjust quality and resolution settings</li>
                            <li>3. Click "Convert to {formatName}"</li>
                            <li>4. Each page will download as a separate {formatName} file</li>
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
                                    }}
                                    disabled={isProcessing}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>

                        {/* Conversion Options */}
                        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Conversion Options</h2>

                            <div className="space-y-6">
                                {/* Quality Slider (for JPG) */}
                                {format === "jpg" && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Image Quality: {Math.round(quality * 100)}%
                                        </label>
                                        <input
                                            type="range"
                                            min="0.5"
                                            max="1"
                                            step="0.05"
                                            value={quality}
                                            onChange={(e) => setQuality(parseFloat(e.target.value))}
                                            disabled={isProcessing}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>Smaller file</span>
                                            <span>Better quality</span>
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
                                        max="4"
                                        step="0.5"
                                        value={scale}
                                        onChange={(e) => setScale(parseFloat(e.target.value))}
                                        disabled={isProcessing}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>72 DPI</span>
                                        <span>144 DPI</span>
                                        <span>216 DPI</span>
                                        <span>288 DPI</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Progress */}
                        {isProcessing && (
                            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                                    <div className="mb-4 text-center">
                                        <div className="text-xl font-semibold text-gray-700 mb-2">
                                            Converting to {formatName}...
                                        </div>
                                        <div className={`text-4xl font-bold ${theme.progressText}`}>
                                            {progress}%
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                                        <div
                                            className={`bg-gradient-to-r ${theme.progressGradient} h-full transition-all duration-300 rounded-full`}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                        )}

                        {/* Convert Button */}
                        {!isProcessing && (
                            <button
                                onClick={convertToImages}
                                className={`w-full bg-gradient-to-r ${theme.buttonGradient} text-white text-xl font-bold py-6 rounded-2xl ${theme.buttonHover} transition-all shadow-xl hover:shadow-2xl transform hover:scale-105`}
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
