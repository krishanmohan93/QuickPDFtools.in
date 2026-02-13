import { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
    title: `Contact Us | ${SITE_NAME}`,
    description: "Get in touch with the QuickPDFTools team for questions, feedback, or support.",
    alternates: {
        canonical: `${SITE_URL}/contact-us`,
    },
};

export default function ContactUsPage() {
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
                name: "Contact",
                item: `${SITE_URL}/contact-us`,
            },
        ],
    };

    return (
        <div className="bg-white min-h-screen py-12 md:py-20">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">Contact QuickPDFTools</h1>
                    <p className="text-xl text-gray-600">
                        If you have any questions, suggestions, or feedback, feel free to contact us.
                        We value user feedback and aim to improve our services continuously.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Info Sidebar */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-blue-50 p-6 rounded-xl">
                            <h3 className="font-bold text-gray-900 mb-2">📧 Email</h3>
                            <a href="mailto:krishanmohankumar9311@gmail.com" className="text-blue-600 font-medium hover:underline break-all">
                                krishanmohankumar9311@gmail.com
                            </a>
                        </div>

 
                    </div>

                    {/* Form */}
                    <div className="md:col-span-2">
                        <ContactForm />
                    </div>
                </div>
            </div>
        </div>
    );
}
