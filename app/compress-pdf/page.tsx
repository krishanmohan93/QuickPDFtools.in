import CompressPDFTool from "@/components/CompressPDFTool";
import ToolSEOContent from "@/components/ToolSEOContent";
import { generateMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = generateMetadata({
    title: "Compress PDF Online | QuickPDFTools",
    description: "Compress PDF files online while keeping the best possible quality. Free, fast, and secure PDF compression from QuickPDFTools.",
    url: "/compress-pdf",
    image: "/og-image.png",
});

export default function CompressPDFPage() {
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
                name: "Compress PDF",
                item: `${SITE_URL}/compress-pdf`,
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            <CompressPDFTool />
            <ToolSEOContent toolId="compress-pdf" />
        </>
    );
}
