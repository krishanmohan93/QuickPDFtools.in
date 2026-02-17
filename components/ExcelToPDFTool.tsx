"use client";

import { useState } from "react";
import DragDropUpload from "./DragDropUpload";

export default function ExcelToPDFTool() {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    const validateAndSetFile = (selectedFile: File) => {
        // Validate file type
        const validExtensions = ['.xls', '.xlsx'];
        const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();

        if (!validExtensions.includes(fileExtension)) {
            setError('Please upload an Excel file (.xls or .xlsx)');
            return;
        }

        // Validate file size (max 25MB)
        const maxSize = 25 * 1024 * 1024;
        if (selectedFile.size > maxSize) {
            setError('File size must be less than 25MB');
            return;
        }

        setFile(selectedFile);
        setError(null);
        setDownloadUrl(null);
    };

    const handleFileSelect = (selectedFiles: File[]) => {
        const selectedFile = selectedFiles[0];
        if (!selectedFile) return;
        validateAndSetFile(selectedFile);
    };

    const convertToPDF = async () => {
        if (!file) return;

        setIsProcessing(true);
        setError(null);
        setProgress(0);
        let progressInterval: ReturnType<typeof setInterval> | null = null;

        try {
            const formData = new FormData();
            formData.append('file0', file);

            progressInterval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) return 90;
                    return prev + Math.random() * 15;
                });
            }, 300);

            const response = await fetch('/api/excel-to-pdf', {
                method: 'POST',
                body: formData,
            });

            if (progressInterval) {
                clearInterval(progressInterval);
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Conversion failed');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setDownloadUrl(url);
            setProgress(100);

            const link = document.createElement("a");
            link.href = url;
            link.download = file.name.replace(/\.[^/.]+$/, '') + '.pdf';
            link.click();

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to convert file');
            setProgress(0);
        } finally {
            if (progressInterval) {
                clearInterval(progressInterval);
            }
            setIsProcessing(false);
        }
    };

    const resetTool = () => {
        setFile(null);
        setDownloadUrl(null);
        setError(null);
        if (downloadUrl) {
            URL.revokeObjectURL(downloadUrl);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                        📄 Excel to PDF Converter
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Convert Excel spreadsheets to PDF while preserving tables, formatting, and data structure.
                    </p>
                </div>

                {/* Upload Area */}
                {!file && (
                    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                        <DragDropUpload
                            onFileSelect={handleFileSelect}
                            accept=".xls,.xlsx"
                            multiple={false}
                            maxSize={25}
                            icon="📊"
                            title="Click to select an Excel file"
                            subtitle="or drag and drop here"
                            borderColor="border-blue-300"
                            hoverColor="border-blue-500 bg-blue-50"
                        />
                    </div>
                )}

                {!file && (
                    <div className="mt-8 bg-blue-50 rounded-2xl p-8 border-2 border-blue-200">
                        <h3 className="text-xl font-bold text-blue-900 mb-4">
                            📖 How to use:
                        </h3>
                        <ol className="space-y-2 text-blue-800">
                            <li>1. Upload an Excel file (.xls or .xlsx)</li>
                            <li>2. Click "Convert to PDF"</li>
                            <li>3. Download your converted PDF</li>
                        </ol>
                    </div>
                )}

                {/* File Info */}
                {file && (
                    <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="text-4xl">📄</div>
                                <div>
                                    <div className="font-semibold text-gray-800">{file.name}</div>
                                    <div className="text-sm text-gray-500">
                                        {formatFileSize(file.size)} • Max 25MB
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={resetTool}
                                disabled={isProcessing}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-8">
                        <h4 className="text-red-900 font-semibold mb-2">⚠️ Error</h4>
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Progress */}
                {isProcessing && (
                    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                        <div className="mb-4 text-center">
                            <div className="text-xl font-semibold text-gray-700 mb-2">
                                Converting to PDF...
                            </div>
                            <div className="text-4xl font-bold text-blue-600">
                                {Math.round(progress)}%
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-300 rounded-full"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Convert Button */}
                {file && !isProcessing && !downloadUrl && (
                    <button
                        onClick={convertToPDF}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xl font-bold py-6 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
                    >
                        📄 Convert to PDF
                    </button>
                )}

                {/* Success State */}
                {downloadUrl && !isProcessing && (
                    <div className="text-center py-8 bg-green-50 rounded-2xl border-2 border-green-200 mb-8">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-green-900 mb-2">Conversion Complete!</h3>
                        <p className="text-green-700 mb-6">Your PDF is ready to download.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href={downloadUrl}
                                download={file?.name.replace(/\.[^/.]+$/, '') + '.pdf'}
                                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 !text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                            >
                                Download PDF
                            </a>
                            <button
                                onClick={resetTool}
                                className="px-8 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                            >
                                Convert Another File
                            </button>
                        </div>
                    </div>
                )}

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                    {[
                        { icon: "📋", title: "Preserves Formatting", description: "Tables, borders, and alignment stay intact" },
                        { icon: "🔒", title: "Secure", description: "Files are deleted after conversion" },
                        { icon: "⚡", title: "Fast", description: "Convert spreadsheets in seconds" },
                    ].map((feature, index) => (
                        <div key={index} className="text-center p-6 bg-white rounded-xl border border-blue-100 shadow-sm">
                            <div className="text-4xl mb-3">{feature.icon}</div>
                            <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
                            <p className="text-sm text-gray-600">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
