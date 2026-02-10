"use client";

import { useState, useRef, DragEvent } from "react";

interface DragDropUploadProps {
    onFileSelect: (files: File[]) => void;
    accept?: string;
    multiple?: boolean;
    maxSize?: number; // in MB
    disabled?: boolean;
    icon?: string;
    title?: string;
    subtitle?: string;
    borderColor?: string;
    hoverColor?: string;
}

export default function DragDropUpload({
    onFileSelect,
    accept = ".pdf",
    multiple = false,
    maxSize = 50,
    disabled = false,
    icon = "📄",
    title = "Click to select files",
    subtitle = "or drag and drop files here",
    borderColor = "border-purple-300",
    hoverColor = "border-purple-500 bg-purple-50",
}: DragDropUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (disabled) return;

        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        handleFiles(files);
    };

    const handleFiles = (files: File[]) => {
        // Filter by file type
        const acceptedExtensions = accept.split(',').map(ext => ext.trim().toLowerCase());
        const validFiles = files.filter(file => {
            const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
            return acceptedExtensions.some(ext => ext === fileExtension || ext === '*');
        });

        // Filter by size
        const maxSizeBytes = maxSize * 1024 * 1024;
        const sizedFiles = validFiles.filter(file => file.size <= maxSizeBytes);

        if (sizedFiles.length < validFiles.length) {
            alert(`Some files exceed the maximum size of ${maxSize}MB and were not added.`);
        }

        if (validFiles.length < files.length) {
            alert(`Some files were not accepted. Please upload ${accept} files only.`);
        }

        if (sizedFiles.length > 0) {
            onFileSelect(multiple ? sizedFiles : [sizedFiles[0]]);
        }
    };

    const handleClick = () => {
        if (!disabled && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div
            className={`border-4 border-dashed rounded-xl p-12 text-center transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            style={{
                borderColor: isDragging ? 'var(--accent-primary)' : 'var(--upload-border)',
                backgroundColor: isDragging ? 'var(--upload-hover-bg)' : 'var(--upload-bg)',
            }}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
            onMouseEnter={(e) => {
                if (!disabled && !isDragging) {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    e.currentTarget.style.backgroundColor = 'var(--upload-hover-bg)';
                }
            }}
            onMouseLeave={(e) => {
                if (!disabled && !isDragging) {
                    e.currentTarget.style.borderColor = 'var(--upload-border)';
                    e.currentTarget.style.backgroundColor = 'var(--upload-bg)';
                }
            }}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={handleFileInputChange}
                className="hidden"
                disabled={disabled}
            />
            <div className="text-6xl mb-4">{icon}</div>
            <div className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                {title}
            </div>
            <div className="text-base" style={{ color: 'var(--text-secondary)' }}>
                {subtitle}
            </div>
            <div className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                Maximum file size: {maxSize}MB
            </div>
        </div>
    );
}
