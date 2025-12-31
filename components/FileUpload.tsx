"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface FileUploadProps {
    accept?: Record<string, string[]>;
    maxSize?: number;
    multiple?: boolean;
    onFilesSelected: (files: File[]) => void;
    children?: React.ReactNode;
}

export default function FileUpload({
    accept,
    maxSize = 50 * 1024 * 1024,
    multiple = false,
    onFilesSelected,
    children,
}: FileUploadProps) {
    const [error, setError] = useState<string>("");

    const onDrop = useCallback(
        (acceptedFiles: File[], rejectedFiles: any[]) => {
            setError("");

            if (rejectedFiles.length > 0) {
                const rejection = rejectedFiles[0];
                if (rejection.errors[0]?.code === "file-too-large") {
                    setError(`File is too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
                } else if (rejection.errors[0]?.code === "file-invalid-type") {
                    setError("Invalid file type. Please upload the correct file format.");
                } else {
                    setError("Error uploading file. Please try again.");
                }
                return;
            }

            if (acceptedFiles.length > 0) {
                onFilesSelected(acceptedFiles);
            }
        },
        [maxSize, onFilesSelected]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        maxSize,
        multiple,
    });

    return (
        <div className="w-full">
            <div
                {...getRootProps()}
                className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
          transition-all duration-300 ease-in-out
          ${isDragActive
                        ? "border-blue-500 bg-blue-50 scale-[1.02]"
                        : "border-gray-300 bg-white hover:border-blue-400 hover:bg-gray-50"
                    }
        `}
            >
                <input {...getInputProps()} />
                {children || (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg
                                className="w-8 h-8 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                            </svg>
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-gray-700 mb-1">
                                {isDragActive ? "Drop your files here" : "Drag & drop your files here"}
                            </p>
                            <p className="text-sm text-gray-500">
                                or <span className="text-blue-600 font-medium">browse</span> to choose files
                            </p>
                        </div>
                        <p className="text-xs text-gray-400">
                            Maximum file size: {maxSize / 1024 / 1024}MB
                        </p>
                    </div>
                )}
            </div>
            {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                            />
                        </svg>
                        {error}
                    </p>
                </div>
            )}
        </div>
    );
}
