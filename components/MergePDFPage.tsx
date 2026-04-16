"use client";

import ToolPage from "@/components/ToolPage";
import ToolSEOContent from "@/components/ToolSEOContent";
import { ALLOWED_FILE_TYPES } from "@/lib/constants";

export default function MergePDFPage() {
    return (
        <>
            <ToolPage
                toolId="merge-pdf"
                toolName="Merge PDF Files Online - QuickPDFTools"
                toolDescription="Combine multiple PDF files into one document with fast, free PDF tools."
                acceptedFileTypes={{ pdf: ALLOWED_FILE_TYPES.pdf }}
                apiEndpoint="/api/merge-pdf"
                outputFileName="merged.pdf"
                instructions={[
                    "Upload multiple PDF files",
                    "Drag files to arrange your preferred order",
                    "Click 'Process Files' to merge",
                    "Download your combined PDF document",
                ]}
            />
            <ToolSEOContent toolId="merge-pdf" />
        </>
    );
}
