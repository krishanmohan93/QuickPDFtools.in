import { Metadata } from "next";
import ToolPage from "@/components/ToolPage";
import { generateToolMetadata } from "@/lib/metadata";
import { ALLOWED_FILE_TYPES, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = generateToolMetadata("pdf-to-word");

export default function PDFtoWordPage() {
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
                name: "PDF to Word",
                item: `${SITE_URL}/pdf-to-word`,
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
        </>
    );
}
