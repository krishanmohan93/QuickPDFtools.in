"use client";

import ToolPage from "@/components/ToolPage";
import { ALLOWED_FILE_TYPES } from "@/lib/constants";

export default function MergePDFPage() {
    return (
        <>
            <ToolPage
                toolId="merge-pdf"
                toolName="Merge PDFs"
                toolDescription="Combine multiple PDF files into one document"
                acceptedFileTypes={{ pdf: ALLOWED_FILE_TYPES.pdf }}
                apiEndpoint="/api/merge-pdf"
                outputFileName="merged.pdf"
                instructions={[
                    "Upload multiple PDF files",
                    "Files will be merged in the order you select them",
                    "Click 'Process Files' to merge",
                    "Download your combined PDF document",
                ]}
            />
            
            {/* SEO Content Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-2xl p-8 border-2 border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Merge PDF Files Easily
                    </h2>
                    <div className="prose max-w-none text-gray-700 space-y-4">
                        <p>
                            Merge PDF allows you to combine multiple PDF files into a single document. This is helpful 
                            when you want to organize related documents, such as chapters, invoices, or scanned pages, 
                            into one file.
                        </p>
                        
                        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                            How to use Merge PDF:
                        </h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Upload two or more PDF files</li>
                            <li>Arrange the files in your preferred order</li>
                            <li>Click merge and download the combined PDF</li>
                        </ul>
                        
                        <p className="mt-4">
                            No registration is required, and the process is fast and secure.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
