"use client";

import React from "react";

interface ProgressBarProps {
    progress: number;
    status?: "processing" | "success" | "error";
    message?: string;
}

export default function ProgressBar({ progress, status = "processing", message }: ProgressBarProps) {
    const getStatusColor = () => {
        switch (status) {
            case "success":
                return "bg-green-500";
            case "error":
                return "bg-red-500";
            default:
                return "bg-blue-600";
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case "success":
                return (
                    <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                        />
                    </svg>
                );
            case "error":
                return (
                    <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                        />
                    </svg>
                );
            default:
                return (
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                );
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    {getStatusIcon()}
                    <span className="text-sm font-medium text-gray-700">
                        {message || `Processing... ${progress}%`}
                    </span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className={`h-full ${getStatusColor()} transition-all duration-300 ease-out rounded-full`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}
