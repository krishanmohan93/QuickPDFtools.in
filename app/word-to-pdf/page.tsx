import { Metadata } from "next";
import ToolPage from "@/components/ToolPage";
import { generateToolMetadata } from "@/lib/metadata";
import { ALLOWED_FILE_TYPES } from "@/lib/constants";

export const metadata: Metadata = generateToolMetadata("word-to-pdf");

export default function WordToPDFPage() {
    return (
        <ToolPage
            toolId="word-to-pdf"
            toolName="Word to PDF"
            toolDescription="Convert Word documents (.doc, .docx) to PDF format instantly"
            acceptedFileTypes={{
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
                "application/msword": [".doc"]
            }}
            apiEndpoint="/api/word-to-pdf"
            outputFileName="converted.pdf"
            instructions={[
                "Upload your Word document (.doc or .docx)",
                "Click 'Process File' to convert",
                "Download your PDF file",
                "Share or print your PDF document",
            ]}
        />
    );
}
