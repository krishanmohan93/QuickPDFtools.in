"use client";

import { useState } from "react";
import DragDropUpload from "./DragDropUpload";

export default function ProtectPDFTool() {
    const [file, setFile] = useState<File | null>(null);
    const [userPassword, setUserPassword] = useState("");
    const [ownerPassword, setOwnerPassword] = useState("");
    const [permissions, setPermissions] = useState({
        print: true,
        copy: true,
        modify: false,
        annotate: false,
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleFileSelect = (selectedFiles: File[]) => {
        const selectedFile = selectedFiles[0];
        if (!selectedFile) return;
        setFile(selectedFile);
    };

    const protectPDF = async () => {
        if (!file) return;

        if (!userPassword && !ownerPassword) {
            alert("Please provide at least one password");
            return;
        }

        setIsProcessing(true);
        setProgress(0);

        try {
            setProgress(20);

            // Create form data
            const formData = new FormData();
            formData.append('file0', file);
            formData.append('userPassword', userPassword);
            formData.append('ownerPassword', ownerPassword);

            const permissionStr = Object.entries(permissions)
                .filter(([_, value]) => value)
                .map(([key, _]) => key)
                .join(',');
            formData.append('permissions', permissionStr);

            setProgress(40);

            // Call API
            const response = await fetch('/api/protect-pdf', {
                method: 'POST',
                body: formData,
            });

            setProgress(60);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Protection failed');
            }

            // Download protected PDF
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `protected_${file.name}`;
            link.click();
            URL.revokeObjectURL(url);

            setProgress(100);

            // Reset form
            setTimeout(() => {
                setFile(null);
                setUserPassword("");
                setOwnerPassword("");
                setProgress(0);
                alert("PDF protected successfully!");
            }, 1000);

        } catch (error) {
            console.error("Error protecting PDF:", error);
            alert(`Failed to protect PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setProgress(0);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-4">
                        🔒 Protect PDF
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Add password protection to your PDF documents
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
                            borderColor="border-red-300"
                            hoverColor="border-red-500 bg-red-50"
                        />
                    </div>
                )}

                {/* File Info & Protection Options */}
                {file && (
                    <>
                        {/* File Info */}
                        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="text-4xl">📄</div>
                                    <div>
                                        <div className="font-semibold text-gray-800">{file.name}</div>
                                        <div className="text-sm text-gray-500">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setFile(null);
                                        setUserPassword("");
                                        setOwnerPassword("");
                                    }}
                                    disabled={isProcessing}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>

                        {/* Password Settings */}
                        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Password Settings</h2>

                            <div className="space-y-6">
                                {/* User Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        User Password (Required to open the PDF)
                                    </label>
                                    <input
                                        type="password"
                                        value={userPassword}
                                        onChange={(e) => setUserPassword(e.target.value)}
                                        placeholder="Enter password"
                                        disabled={isProcessing}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none bg-white text-gray-900"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Users will need this password to view the PDF
                                    </p>
                                </div>

                                {/* Owner Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Owner Password (Optional - for editing permissions)
                                    </label>
                                    <input
                                        type="password"
                                        value={ownerPassword}
                                        onChange={(e) => setOwnerPassword(e.target.value)}
                                        placeholder="Enter owner password"
                                        disabled={isProcessing}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none bg-white text-gray-900"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Owner password allows changing permissions
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Permissions */}
                        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Permissions</h2>

                            <div className="grid grid-cols-2 gap-4">
                                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-red-300 cursor-pointer transition-all">
                                    <input
                                        type="checkbox"
                                        checked={permissions.print}
                                        onChange={(e) => setPermissions({ ...permissions, print: e.target.checked })}
                                        disabled={isProcessing}
                                        className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                                    />
                                    <div>
                                        <div className="font-semibold text-gray-800">Allow Printing</div>
                                        <div className="text-xs text-gray-500">Users can print the document</div>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-red-300 cursor-pointer transition-all">
                                    <input
                                        type="checkbox"
                                        checked={permissions.copy}
                                        onChange={(e) => setPermissions({ ...permissions, copy: e.target.checked })}
                                        disabled={isProcessing}
                                        className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                                    />
                                    <div>
                                        <div className="font-semibold text-gray-800">Allow Copying</div>
                                        <div className="text-xs text-gray-500">Users can copy text/content</div>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-red-300 cursor-pointer transition-all">
                                    <input
                                        type="checkbox"
                                        checked={permissions.modify}
                                        onChange={(e) => setPermissions({ ...permissions, modify: e.target.checked })}
                                        disabled={isProcessing}
                                        className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                                    />
                                    <div>
                                        <div className="font-semibold text-gray-800">Allow Modification</div>
                                        <div className="text-xs text-gray-500">Users can edit the document</div>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-red-300 cursor-pointer transition-all">
                                    <input
                                        type="checkbox"
                                        checked={permissions.annotate}
                                        onChange={(e) => setPermissions({ ...permissions, annotate: e.target.checked })}
                                        disabled={isProcessing}
                                        className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                                    />
                                    <div>
                                        <div className="font-semibold text-gray-800">Allow Annotations</div>
                                        <div className="text-xs text-gray-500">Users can add comments/notes</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Progress */}
                        {isProcessing && (
                            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                                <div className="mb-4 text-center">
                                    <div className="text-xl font-semibold text-gray-700 mb-2">
                                        Protecting PDF...
                                    </div>
                                    <div className="text-4xl font-bold text-red-600">
                                        {progress}%
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-red-500 to-pink-500 h-full transition-all duration-300 rounded-full"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Protect Button */}
                        {!isProcessing && (
                            <button
                                onClick={protectPDF}
                                className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white text-xl font-bold py-6 rounded-2xl hover:from-red-700 hover:to-pink-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
                            >
                                🔒 Protect PDF
                            </button>
                        )}
                    </>
                )}

                {/* Info Box */}
                <div className="mt-12 bg-red-50 rounded-2xl p-8 border-2 border-red-200">
                    <h3 className="text-xl font-bold text-red-900 mb-4">
                        🔐 Security Information:
                    </h3>
                    <ul className="space-y-2 text-red-800">
                        <li>• <strong>User Password:</strong> Required to open and view the PDF</li>
                        <li>• <strong>Owner Password:</strong> Required to change permissions and security settings</li>
                        <li>• <strong>Permissions:</strong> Control what users can do with the PDF</li>
                        <li>• All processing is done securely - your files are never stored</li>
                        <li>• Keep your passwords safe - they cannot be recovered if lost</li>
                    </ul>
                </div>

                {/* Instructions */}
                <div className="mt-8 bg-pink-50 rounded-2xl p-8 border-2 border-pink-200">
                    <h3 className="text-xl font-bold text-pink-900 mb-4">
                        📖 How to use:
                    </h3>
                    <ol className="space-y-2 text-pink-800">
                        <li>1. Upload a PDF file</li>
                        <li>2. Set a user password (required to open the PDF)</li>
                        <li>3. Optionally set an owner password for editing permissions</li>
                        <li>4. Choose which permissions to allow</li>
                        <li>5. Click "Protect PDF" to download the protected file</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
