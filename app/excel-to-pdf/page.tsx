import { Metadata } from "next";
import ExcelToPDFTool from "@/components/ExcelToPDFTool";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
    title: `Excel to PDF Converter Online Free | ${SITE_NAME}`,
    description: "Convert Excel spreadsheets (.xls, .xlsx) to PDF online for free. Preserves tables, formatting, and data. No signup required.",
    keywords: [
        "excel to pdf",
        "xlsx to pdf",
        "xls to pdf converter",
        "spreadsheet to pdf",
        "convert excel to pdf online",
        "excel to pdf free",
        "xlsx to pdf converter",
        "excel file to pdf"
    ],
    openGraph: {
        title: "Excel to PDF Converter - Free Online Tool",
        description: "Convert Excel spreadsheets to PDF instantly. Preserves tables and formatting.",
        url: `${SITE_URL}/excel-to-pdf`,
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Excel to PDF Converter",
        description: "Convert .xls and .xlsx files to PDF online for free.",
    },
    alternates: {
        canonical: `${SITE_URL}/excel-to-pdf`
    }
};

export default function ExcelToPDFPage() {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Excel to PDF Converter",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Web Browser",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Free online tool to convert Excel spreadsheets (.xls, .xlsx) to PDF format. Preserves tables, formatting, and data.",
        "featureList": [
            "Convert Excel to PDF",
            "Support for .xls and .xlsx files",
            "Preserve table formatting",
            "Maintain cell alignment",
            "No registration required"
        ],
        "provider": {
            "@type": "Organization",
            "name": SITE_NAME,
            "url": SITE_URL
        }
    };

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
                name: "Excel to PDF",
                item: `${SITE_URL}/excel-to-pdf`,
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />

            <div className="min-h-screen bg-gray-50">
                {/* Hero Section */}
                <section className="bg-white border-b border-gray-200">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Free • No Registration • Secure
                            </div>

                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                                Excel to PDF Converter
                            </h1>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                                Convert Excel spreadsheets to PDF while preserving tables, formatting, and data structure.
                            </p>
                        </div>

                        {/* Tool Component */}
                        <ExcelToPDFTool />

                        {/* Features */}
                        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">Preserves Formatting</h3>
                                <p className="text-sm text-gray-600">Tables, borders, and cell alignment</p>
                            </div>

                            <div className="text-center">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">100% Secure</h3>
                                <p className="text-sm text-gray-600">Files deleted after conversion</p>
                            </div>

                            <div className="text-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">Fast Conversion</h3>
                                <p className="text-sm text-gray-600">Process files in seconds</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Content Section */}
                <section className="py-16 bg-white">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <article className="prose prose-lg max-w-none">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Why Convert Excel to PDF?
                            </h2>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                Converting Excel spreadsheets to PDF makes your data easier to share and ensures it looks the same on any device. Whether you're sending financial reports, data tables, or project timelines, PDF format prevents accidental edits and maintains your formatting.
                            </p>

                            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-12">
                                Common Use Cases
                            </h2>
                            <ul className="space-y-4 text-gray-600 mb-8">
                                <li>
                                    <strong>Business Reports:</strong> Share financial statements, sales data, or inventory reports with stakeholders who don't need to edit the data.
                                </li>
                                <li>
                                    <strong>Academic Submissions:</strong> Submit data analysis, research findings, or project reports in a format that can't be accidentally modified.
                                </li>
                                <li>
                                    <strong>Client Presentations:</strong> Send pricing tables, project timelines, or budget breakdowns in a professional, read-only format.
                                </li>
                                <li>
                                    <strong>Record Keeping:</strong> Archive important spreadsheets in PDF format for long-term storage and easy retrieval.
                                </li>
                            </ul>

                            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-12">
                                Frequently Asked Questions
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Does this work with multiple sheets?</h3>
                                    <p className="text-gray-600">
                                        Yes, each sheet in your Excel file will be converted to a separate page in the PDF, maintaining the structure of your workbook.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Will formulas be preserved?</h3>
                                    <p className="text-gray-600">
                                        The PDF will show the calculated values from your formulas, but the formulas themselves won't be editable since PDF is a read-only format.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">What happens to my files after conversion?</h3>
                                    <p className="text-gray-600">
                                        Your files are processed securely and automatically deleted from our servers immediately after conversion. We don't store or access your data.
                                    </p>
                                </div>
                            </div>
                        </article>
                    </div>
                </section>
            </div>
        </>
    );
}
