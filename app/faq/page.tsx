
import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Frequently Asked Questions (FAQ) - PDFMasterTools',
    description: 'Find answers to common questions about PDFMasterTools using our comprehensive FAQ. learn about file security, limits, and how to use our free PDF tools.',
};

export default function FAQPage() {
    const faqs = [
        {
            question: "Is PDFMasterTools really free?",
            answer: "Yes, PDFMasterTools is completely free to use. You do not need to register, create an account, or pay for any subscription to use our basic tools."
        },
        {
            question: "Are my files safe?",
            answer: "Absolutely. We prioritize your privacy and security. All files uploaded to our servers are processed automatically and are permanently deleted shortly after processing. We do not read, store, or share your document contents."
        },
        {
            question: "Is there a limit on file size?",
            answer: "Currently, we support files up to 50MB for most tools. This ensures fast processing times and optimal performance for all users."
        },
        {
            question: "Can I use PDFMasterTools on my phone?",
            answer: "Yes! Our website is fully responsive and works great on smartphones, tablets, and desktop computers. You can manage your documents on the go."
        },
        {
            question: "How do I merge multiple PDFs?",
            answer: "To merge files, go to the 'Merge PDF' tool, upload your PDF files, arrange them in the order you want, and click 'Merge PDF'. Your single combined file will be ready for download instantly."
        },
        {
            question: "Do you support OCR (Optical Character Recognition)?",
            answer: "We are constantly working on improving our tools. While basic text extraction works for standard PDFs, we are working on adding advanced OCR capabilities for scanned documents in the near future."
        },
        {
            question: "What happens if my internet connection disconnects during upload?",
            answer: "If the connection drops, the upload will likely fail. You will need to refresh the page and try uploading your file again once your connection is stable."
        },
        {
            question: "Can I convert protected PDFs?",
            answer: "If you know the password, you can use our 'Unlock PDF' tool to remove security. However, we cannot process files if you do not have the legal right or the password to access them."
        }
    ];

    return (
        <div className="bg-gray-50 min-h-screen py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                        Frequently Asked Questions
                    </h1>
                    <p className="mt-4 text-xl text-gray-600">
                        Have questions? We're here to help.
                    </p>
                </div>

                <div className="space-y-8">
                    {faqs.map((faq, index) => (
                        <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 transition-shadow hover:shadow-md">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                {faq.question}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                {faq.answer}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center bg-blue-50 rounded-2xl p-8 border border-blue-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Still have questions?
                    </h3>
                    <p className="text-gray-600 mb-6">
                        We're happy to answer any other questions you might have.
                    </p>
                    <Link
                        href="/contact-us"
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                        Contact Support
                    </Link>
                </div>
            </div>
        </div>
    );
}
