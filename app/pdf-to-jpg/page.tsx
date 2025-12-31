import { Metadata } from "next";
import ToolPage from "@/components/ToolPage";
import { generateToolMetadata } from "@/lib/metadata";
import { ALLOWED_FILE_TYPES } from "@/lib/constants";

export const metadata: Metadata = generateToolMetadata("pdf-to-jpg");

export default function PDFtoJPGPage() {
    return (
        <ToolPage
            toolId="pdf-to-jpg"
            toolName="PDF to JPG"
            toolDescription="Convert PDF pages to JPG images"
            acceptedFileTypes={{ pdf: ALLOWED_FILE_TYPES.pdf }}
            apiEndpoint="/api/pdf-to-jpg"
            outputFileName="page-1.jpg"
            instructions={[
                "Upload your PDF file",
                "First page will be converted to JPG",
                "Click 'Process File' to convert",
                "Download your JPG image",
            ]}
        />
    );
}
