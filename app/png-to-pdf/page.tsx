import { Metadata } from "next";
import ToolPage from "@/components/ToolPage";
import { generateToolMetadata } from "@/lib/metadata";
import { ALLOWED_FILE_TYPES } from "@/lib/constants";

export const metadata: Metadata = generateToolMetadata("png-to-pdf");

export default function PNGtoPDFPage() {
    return (
        <ToolPage
            toolId="png-to-pdf"
            toolName="PNG to PDF"
            toolDescription="Convert PNG images to PDF documents"
            acceptedFileTypes={{ image: ALLOWED_FILE_TYPES.image }}
            apiEndpoint="/api/png-to-pdf"
            outputFileName="converted.pdf"
            instructions={[
                "Upload one or more PNG images",
                "Images will be combined into a single PDF",
                "Click 'Process Files' to convert",
                "Download your PDF document",
            ]}
        />
    );
}
