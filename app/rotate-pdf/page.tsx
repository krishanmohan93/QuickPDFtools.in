import { Metadata } from "next";
import ToolPage from "@/components/ToolPage";
import { generateToolMetadata } from "@/lib/metadata";
import { ALLOWED_FILE_TYPES } from "@/lib/constants";

export const metadata: Metadata = generateToolMetadata("rotate-pdf");

export default function RotatePDFPage() {
    return (
        <ToolPage
            toolId="rotate-pdf"
            toolName="Rotate PDF"
            toolDescription="Rotate pages in your PDF document"
            acceptedFileTypes={{ pdf: ALLOWED_FILE_TYPES.pdf }}
            apiEndpoint="/api/rotate-pdf"
            outputFileName="rotated.pdf"
            instructions={[
                "Upload your PDF file",
                "Pages will be rotated 90 degrees clockwise",
                "Click 'Process File' to rotate",
                "Download your rotated PDF",
            ]}
        />
    );
}
