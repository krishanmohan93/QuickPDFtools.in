import ProtectPDFTool from "@/components/ProtectPDFTool";
import { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
    title: "Protect PDF - Add Password Protection | PDF Master Tools",
    description: "Secure your PDF documents with password protection. Add user and owner passwords, control permissions like printing, copying, and editing. Free online PDF protection tool.",
    keywords: ["protect pdf", "password protect pdf", "secure pdf", "encrypt pdf", "pdf security", "pdf permissions"],
};

export default function ProtectPDFPage() {
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
                name: "Protect PDF",
                item: `${SITE_URL}/protect-pdf`,
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            <ProtectPDFTool />
        </>
    );
}
