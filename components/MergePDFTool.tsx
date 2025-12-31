"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";

export default function MergePDFTool() {
    const [files, setFiles] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        setFiles([...files, ...selectedFiles]);
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const moveUp = (index: number) => {
        if (index === 0) return;
        const newFiles = [...files];
        [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
        setFiles(newFiles);
    };

    const moveDown = (index: number) => {
        if (index === files.length - 1) return;
        const newFiles = [...files];
        [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
        setFiles(newFiles);
    };

    const mergePDFs = async () => {
        if (files.length < 2) {
            alert("Please select at least 2 PDF files to merge");
            return;
        }

        setIsProcessing(true);
        setProgress(0);

        try {
            // Create a new PDF document
            const mergedPdf = await PDFDocument.create();

            // Process each file
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await PDFDocument.load(arrayBuffer);

                // Copy all pages from this PDF
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => {
                    mergedPdf.addPage(page);
                });

                // Update progress
                setProgress(Math.round(((i + 1) / files.length) * 100));
            }

            // Save the merged PDF
            const pdfBytes = await mergedPdf.save();
            const blob = new Blob([pdfBytes], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);

            // Download
            const link = document.createElement("a");
            link.href = url;
            link.download = `merged_${Date.now()}.pdf`;
            link.click();

            // Cleanup
            URL.revokeObjectURL(url);
            setFiles([]);
            setProgress(0);
        } catch (error) {
            console.error("Error merging PDFs:", error);
            alert("Failed to merge PDFs. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
                        📄 Merge PDFs
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Combine multiple PDF files into one document
                    </p>
                </div>

                {/* Upload Area */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    <label className="block">
                        <div className="border-4 border-dashed border-purple-300 rounded-xl p-12 text-center hover:border-purple-500 hover:bg-purple-50 transition-all cursor-pointer">
                            <input
                                type="file"
                                accept=".pdf"
                                multiple
                                onChange={handleFileSelect}
                                className="hidden"
                                disabled={isProcessing}
                            />
                            <div className="text-6xl mb-4">📁</div>
                            <div className="text-xl font-semibold text-gray-700 mb-2">
                                Click to select PDF files
                            </div>
                            <div className="text-gray-500">
                                or drag and drop files here
                            </div>
                        </div>
                    </label>
                </div>

                {/* File List */}
                {files.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">
                            Selected Files ({files.length})
                        </h2>
                        <div className="space-y-3">
                            {files.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200"
                                >
                                    <div className="text-3xl">📄</div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-800">
                                            {file.name}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => moveUp(index)}
                                            disabled={index === 0 || isProcessing}
                                            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            ↑
                                        </button>
                                        <button
                                            onClick={() => moveDown(index)}
                                            disabled={index === files.length - 1 || isProcessing}
                                            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            ↓
                                        </button>
                                        <button
                                            onClick={() => removeFile(index)}
                                            disabled={isProcessing}
                                            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Progress Bar */}
                {isProcessing && (
                    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                        <div className="mb-4 text-center">
                            <div className="text-xl font-semibold text-gray-700 mb-2">
                                Merging PDFs...
                            </div>
                            <div className="text-4xl font-bold text-purple-600">
                                {progress}%
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-purple-500 to-blue-500 h-full transition-all duration-300 rounded-full"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Merge Button */}
                {files.length >= 2 && !isProcessing && (
                    <button
                        onClick={mergePDFs}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xl font-bold py-6 rounded-2xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
                    >
                        🔗 Merge {files.length} PDFs
                    </button>
                )}

                {/* Instructions */}
                <div className="mt-12 bg-blue-50 rounded-2xl p-8 border-2 border-blue-200">
                    <h3 className="text-xl font-bold text-blue-900 mb-4">
                        📖 How to use:
                    </h3>
                    <ol className="space-y-2 text-blue-800">
                        <li>1. Click to select or drag PDF files</li>
                        <li>2. Use ↑ ↓ buttons to reorder files</li>
                        <li>3. Click "Merge PDFs" to combine them</li>
                        <li>4. Your merged PDF will download automatically</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
