import { Metadata } from "next";
import ToolPage from "@/components/ToolPage";
import { generateToolMetadata } from "@/lib/metadata";
import { ALLOWED_FILE_TYPES } from "@/lib/constants";

export const metadata: Metadata = generateToolMetadata("merge-pdf");

export default function MergePDFPage() {
    return (
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
    );
}
