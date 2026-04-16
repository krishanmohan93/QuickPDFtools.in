
import { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { generateMetadata } from "@/lib/seo";

export const metadata: Metadata = generateMetadata({
    title: `About Us | ${SITE_NAME}`,
    description: "Learn about the team, mission, and product focus behind QuickPDFTools.",
    url: "/about-us",
    image: "/og-image.png",
});

export default function AboutUsPage() {
    const teamMembers = [
        {
            name: "Rahul Sharma",
            role: "Founder & Lead Developer",
            bio: "Rahul leads product engineering and platform reliability. He focuses on building fast, practical tools that solve real document workflow problems.",
            initials: "RS",
        },
        {
            name: "Priya Patel",
            role: "Content & SEO Specialist",
            bio: "Priya creates helpful, user-first guides and educational content. She ensures every page is clear, trustworthy, and easy to discover.",
            initials: "PP",
        },
    ];

    const stats = [
        { value: "50,000+", label: "Files Processed" },
        { value: "18", label: "PDF Tools Available" },
        { value: "100%", label: "Free, No Registration" },
        { value: "1 Hour", label: "Auto File Deletion" },
    ];

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
                name: "About Us",
                item: `${SITE_URL}/about-us`,
            },
        ],
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 py-12 md:py-20">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-12">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">About Us</p>
                    <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-5xl">About QuickPDFTools</h1>
                    <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
                        QuickPDFTools is built to make document work simple, secure, and accessible for everyone. We help students,
                        professionals, and teams complete everyday PDF tasks quickly without installing heavy software.
                    </p>
                </section>

                <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
                    <h2 className="text-2xl font-bold text-slate-950 md:text-3xl">Our Story</h2>
                    <p className="mt-4 text-lg leading-8 text-slate-700">
                        QuickPDFTools started with a simple frustration: many people needed to merge, split, compress, or convert PDFs,
                        but the available options were either expensive desktop software or confusing tools filled with unnecessary steps.
                        We built QuickPDFTools to remove that barrier and give people a clean, trustworthy way to handle documents online.
                        Our goal has always been to save time, reduce stress, and make professional PDF workflows accessible to everyone.
                    </p>
                </section>

                <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
                    <div className="mb-8 flex items-center gap-3">
                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-200">
                            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
                                <path d="M12 3l8 4v6c0 5-3.5 7.8-8 9-4.5-1.2-8-4-8-9V7l8-4z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M9.5 12.5l1.8 1.8 3.2-3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                        <h2 className="text-2xl font-bold text-slate-950 md:text-3xl">Our Mission</h2>
                    </div>
                    <p className="text-lg leading-8 text-slate-700">
                        Our mission is to provide fast, reliable PDF tools that anyone can use with confidence. We prioritize clarity,
                        privacy, and practical outcomes over complexity. Every feature is designed to solve real document problems in a few clicks,
                        whether you are preparing an assignment, sharing a report, or organizing business files. We aim to remain a free,
                        user-first platform that people can trust every day.
                    </p>
                </section>

                <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
                    <h2 className="text-2xl font-bold text-slate-950 md:text-3xl">Meet the Team</h2>
                    <div className="mt-7 grid gap-6 md:grid-cols-2">
                        {teamMembers.map((member) => (
                            <article key={member.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-700 to-indigo-700 text-lg font-bold text-white shadow-sm">
                                        {member.initials}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-lg font-bold text-slate-950">{member.name}</h3>
                                        <p className="text-sm font-medium text-blue-700">{member.role}</p>
                                        <p className="mt-3 text-sm leading-7 text-slate-600">{member.bio}</p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
                    <h2 className="text-2xl font-bold text-slate-950 md:text-3xl">By the Numbers</h2>
                    <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {stats.map((stat) => (
                            <div key={stat.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
                                <p className="text-2xl font-bold text-slate-950">{stat.value}</p>
                                <p className="mt-2 text-sm font-medium text-slate-600">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mt-10">
                    <div className="rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white shadow-lg md:p-10">
                        <h2 className="text-2xl font-bold md:text-3xl">Need Help With Your Documents?</h2>
                        <p className="mt-3 max-w-2xl text-blue-100 leading-7">
                            Have questions, suggestions, or a partnership idea? We would love to hear from you.
                            Our team actively reviews feedback to improve QuickPDFTools for everyone.
                        </p>
                        <div className="mt-6">
                            <Link
                                href="/contact-us"
                                className="inline-flex items-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50"
                            >
                                Contact Us
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
