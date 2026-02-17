import { Metadata } from "next";
import EditPDFTool from "@/components/EditPDFTool";
import { generateToolMetadata } from "@/lib/metadata";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = generateToolMetadata("edit-pdf");

export default function EditPDFPage() {
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
                name: "Edit PDF",
                item: `${SITE_URL}/edit-pdf`,
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            <EditPDFTool />

            {/* SEO Content Section */}
            <section className="bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="bg-white rounded-2xl p-8 border-2 border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Edit PDF Text Online with Font Fidelity
                        </h2>
                        <div className="prose max-w-none text-gray-700 space-y-4">
                            <p>
                                The Edit PDF tool lets you change text directly inside your PDF while preserving the
                                original font, size, spacing, and layout. This is ideal for certificates, business
                                documents, and professional forms where even small visual changes can be noticeable.
                            </p>

                            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                                How to Edit a PDF
                            </h3>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Upload your PDF file</li>
                                <li>Click on the text you want to edit</li>
                                <li>Type your updated text and download the edited PDF</li>
                            </ul>

                            <p className="mt-4">
                                Our editing engine replaces text in place, so your document stays clean and
                                print‑ready. If you also need to{" "}
                                <a href="/merge-pdf" className="text-blue-600 hover:underline">merge PDF files</a>,
                                <a href="/compress-pdf" className="text-blue-600 hover:underline"> compress PDF files</a>,
                                or <a href="/unlock-pdf" className="text-blue-600 hover:underline">unlock PDFs</a>,
                                explore the rest of our tools.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
