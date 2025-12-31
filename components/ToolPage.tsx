"use client";

import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import ProgressBar from "@/components/ProgressBar";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "@/lib/constants";

interface ToolPageProps {
    toolId: string;
    toolName: string;
    toolDescription: string;
    acceptedFileTypes: Record<string, string[]>;
    apiEndpoint: string;
    outputFileName: string;
    instructions?: string[];
}

export default function ToolPage({
    toolId,
    toolName,
    toolDescription,
    acceptedFileTypes,
    apiEndpoint,
    outputFileName,
    instructions,
}: ToolPageProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
    const [message, setMessage] = useState("");
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    const handleFilesSelected = (selectedFiles: File[]) => {
        setFiles(selectedFiles);
        setDownloadUrl(null);
        setMessage("");
    };

    const handleProcess = async () => {
        if (files.length === 0) {
            setMessage("Please select a file first");
            return;
        }

        setProcessing(true);
        setProgress(0);
        setStatus("processing");
        setMessage("Uploading and processing your file...");

        try {
            const formData = new FormData();
            files.forEach((file, index) => {
                formData.append(`file${index}`, file);
            });

            // Simulate progress
            const progressInterval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            const response = await fetch(apiEndpoint, {
                method: "POST",
                body: formData,
            });

            clearInterval(progressInterval);

            if (!response.ok) {
                throw new Error("Processing failed");
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            setProgress(100);
            setStatus("success");
            setMessage("Processing complete! Your file is ready to download.");
            setDownloadUrl(url);
        } catch (error) {
            setStatus("error");
            setMessage("An error occurred while processing your file. Please try again.");
            console.error(error);
        } finally {
            setProcessing(false);
        }
    };

    const handleDownload = () => {
        if (downloadUrl) {
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = outputFileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleReset = () => {
        setFiles([]);
        setProcessing(false);
        setProgress(0);
        setStatus("processing");
        setMessage("");
        setDownloadUrl(null);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{toolName}</h1>
                <p className="text-xl text-gray-600">{toolDescription}</p>
            </div>

            {instructions && instructions.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                    <h3 className="font-semibold text-blue-900 mb-3">How to use:</h3>
                    <ol className="list-decimal list-inside space-y-2 text-blue-800">
                        {instructions.map((instruction, index) => (
                            <li key={index}>{instruction}</li>
                        ))}
                    </ol>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                {!processing && !downloadUrl && (
                    <>
                        <FileUpload
                            accept={acceptedFileTypes}
                            maxSize={MAX_FILE_SIZE}
                            multiple={toolId === "merge-pdf" || toolId === "jpg-to-pdf" || toolId === "png-to-pdf"}
                            onFilesSelected={handleFilesSelected}
                        />
                        {files.length > 0 && (
                            <div className="mt-6">
                                <h3 className="font-semibold text-gray-900 mb-3">Selected Files:</h3>
                                <div className="space-y-2">
                                    {files.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <span className="text-sm font-medium text-gray-700">{file.name}</span>
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={handleProcess}
                                    className="mt-6 w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    Process File{files.length > 1 ? "s" : ""}
                                </button>
                            </div>
                        )}
                    </>
                )}

                {processing && (
                    <div className="py-8">
                        <ProgressBar progress={progress} status={status} message={message} />
                    </div>
                )}

                {downloadUrl && !processing && (
                    <div className="text-center py-8">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={handleDownload}
                                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                Download File
                            </button>
                            <button
                                onClick={handleReset}
                                className="px-8 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300"
                            >
                                Process Another File
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { icon: "🔒", title: "Secure", description: "Files are encrypted and deleted after processing" },
                    { icon: "⚡", title: "Fast", description: "Process files in seconds with our optimized engine" },
                    { icon: "🆓", title: "Free", description: "No registration or payment required" },
                ].map((feature, index) => (
                    <div key={index} className="text-center p-6 bg-gray-50 rounded-xl">
                        <div className="text-4xl mb-3">{feature.icon}</div>
                        <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
