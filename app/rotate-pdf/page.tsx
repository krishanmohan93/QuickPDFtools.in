import { Metadata } from "next";
import ToolPage from "@/components/ToolPage";
import { generateToolMetadata } from "@/lib/metadata";
import { ALLOWED_FILE_TYPES, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = generateToolMetadata("rotate-pdf");

export default function RotatePDFPage() {
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
                name: "Rotate PDF",
                item: `${SITE_URL}/rotate-pdf`,
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
        </>
    );
}
