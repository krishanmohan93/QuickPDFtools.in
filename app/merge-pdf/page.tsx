import { Metadata } from "next";
import MergePDFPage from "@/components/MergePDFPage";
import { generateMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = generateMetadata({
    title: "Merge PDF Online | QuickPDFTools",
    description: "Merge multiple PDF files into a single document online for free with QuickPDFTools. Fast, secure, and no signup required.",
    url: "/merge-pdf",
    image: "/og-image.png",
});

export default function MergePDF() {
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
                name: "Merge PDF",
                item: `${SITE_URL}/merge-pdf`,
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            <MergePDFPage />
        </>
    );
}
