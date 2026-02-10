"use client";

import { useState } from "react";
import { Metadata } from "next";

// Since this is a client component, we can't export metadata directly in the same way 
// if we want to keep it simple, but for Next.js 13+ app dir, layout/page split is best.
// For simplicity in this specific "fix it" flow, I'll omit dynamic metadata export 
// or wrap it if needed. However, since I need to use "use client", I can't export metadata.
// I will create a wrapper or just accept generic title for now, OR better:
// I will make the form a component and keep the page server-side.
// Actually, for speed, I'll just use a client component page and manage title via layout or
// acceptable compromise. But wait, I can't export metadata from use client file.
// I'll stick to a simple client page and maybe lose slight metadata customization 
// or I'll split it.
// Let's split it properly: separate form component.

import ContactForm from "@/components/ContactForm";

export default function ContactUsPage() {
    return (
        <div className="bg-white min-h-screen py-12 md:py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">Contact Quick PDF Tools</h1>
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

                        <div className="bg-gray-50 p-6 rounded-xl">
                            <h3 className="font-bold text-gray-900 mb-2">Business Hours</h3>
                            <p className="text-gray-600 text-sm">
                                Monday - Friday<br />
                                9:00 AM - 5:00 PM (EST)
                            </p>
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
