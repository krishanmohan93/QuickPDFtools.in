import { Metadata } from "next";
import ToolPage from "@/components/ToolPage";
import { generateToolMetadata } from "@/lib/metadata";
import { ALLOWED_FILE_TYPES } from "@/lib/constants";

export const metadata: Metadata = generateToolMetadata("pdf-to-word");

export default function PDFtoWordPage() {
    return (
        <ToolPage
            toolId="pdf-to-word"
            toolName="PDF to Word"
            toolDescription="Convert PDF documents to editable Word files"
            acceptedFileTypes={{ pdf: ALLOWED_FILE_TYPES.pdf }}
            apiEndpoint="/api/pdf-to-word"
            outputFileName="converted.docx"
            instructions={[
                "Upload your PDF file",
                "Click 'Process File' to convert",
                "Download your editable Word document",
                "Edit in Microsoft Word or Google Docs",
            ]}
        />
    );
}
