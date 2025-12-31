import { Metadata } from "next";
import ToolPage from "@/components/ToolPage";
import { generateToolMetadata } from "@/lib/metadata";
import { ALLOWED_FILE_TYPES } from "@/lib/constants";

export const metadata: Metadata = generateToolMetadata("pdf-to-png");

export default function PDFtoPNGPage() {
    return (
        <ToolPage
            toolId="pdf-to-png"
            toolName="PDF to PNG"
            toolDescription="Convert PDF pages to PNG images"
            acceptedFileTypes={{ pdf: ALLOWED_FILE_TYPES.pdf }}
            apiEndpoint="/api/pdf-to-png"
            outputFileName="page-1.png"
            instructions={[
                "Upload your PDF file",
                "First page will be converted to PNG",
                "Click 'Process File' to convert",
                "Download your PNG image",
            ]}
        />
    );
}
