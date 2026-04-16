import { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
    title: `Contact Us - Support & Feedback | ${SITE_NAME}`,
    description: "Contact QuickPDFTools for general queries, bug reports, partnerships, and support. We usually respond within 24-48 hours.",
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
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 py-12 md:py-20">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-12 mb-10">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Contact Us</p>
                    <h1 className="mt-3 text-3xl md:text-5xl font-bold text-slate-950">Contact QuickPDFTools</h1>
                    <p className="mt-4 text-lg text-slate-600 max-w-3xl">
                        Have a question, found a bug, or want to discuss a partnership? Send us a message and our team will get back to you.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <ContactForm />
                    </div>

                    <aside className="space-y-6">
                        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-xl font-bold text-slate-950 mb-4">Contact Information</h2>
                            <ul className="space-y-4 text-sm text-slate-600">
                                <li>
                                    <p className="font-semibold text-slate-900">Email</p>
                                    <a
                                        href="mailto:krishanmohankumar9311@gmail.com"
                                        className="text-blue-700 hover:underline break-all"
                                    >
                                        krishanmohankumar9311@gmail.com
                                    </a>
                                </li>
                                <li>
                                    <p className="font-semibold text-slate-900">Location</p>
                                    <p>Pune, Maharashtra, India</p>
                                </li>
                                <li>
                                    <p className="font-semibold text-slate-900">Response Time</p>
                                    <p>We typically respond within 24-48 hours</p>
                                </li>
                            </ul>
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-xl font-bold text-slate-950 mb-3">FAQ Quick Links</h2>
                            <p className="text-sm text-slate-600 mb-4">
                                Looking for instant answers? Visit our FAQ page for common questions about file processing, privacy, and supported tools.
                            </p>
                            <a
                                href="/faq"
                                className="inline-flex items-center rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold !text-white hover:bg-blue-800 transition-colors shadow-sm"
                                style={{ color: "#ffffff", opacity: 1 }}
                            >
                                Go to FAQ
                            </a>
                        </section>
                    </aside>
                </div>
            </div>
        </div>
    );
}
