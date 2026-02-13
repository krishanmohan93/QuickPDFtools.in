import { Metadata } from "next";
import ToolPage from "@/components/ToolPage";
import { generateToolMetadata } from "@/lib/metadata";
import { ALLOWED_FILE_TYPES, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = generateToolMetadata("word-to-pdf");

export default function WordToPDFPage() {
    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: SITE_URL,
            },
            {
                "@type": "ListItem",
                position: 2,
                name: "Word to PDF",
                item: `${SITE_URL}/word-to-pdf`,
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
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
        </>
    );
}
