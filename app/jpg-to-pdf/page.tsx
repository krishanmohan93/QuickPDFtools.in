import { Metadata } from "next";
import ToolPage from "@/components/ToolPage";
import { generateToolMetadata } from "@/lib/metadata";
import { ALLOWED_FILE_TYPES } from "@/lib/constants";

export const metadata: Metadata = generateToolMetadata("jpg-to-pdf");

export default function JPGtoPDFPage() {
    return (
        <ToolPage
            toolId="jpg-to-pdf"
            toolName="JPG to PDF"
            toolDescription="Convert JPG images to PDF documents"
            acceptedFileTypes={{ image: ALLOWED_FILE_TYPES.image }}
            apiEndpoint="/api/jpg-to-pdf"
            outputFileName="converted.pdf"
            instructions={[
                "Upload one or more JPG images",
                "Images will be combined into a single PDF",
                "Click 'Process Files' to convert",
                "Download your PDF document",
            ]}
        />
    );
}
