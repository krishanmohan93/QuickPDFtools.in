"use client";

import Link from "next/link";
import { useState } from "react";
import { SITE_NAME } from "@/lib/constants";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 flex items-center justify-center">
                            <img
                                src="/icon.png"
                                alt={`${SITE_NAME} Logo`}
                                className="w-full h-full object-contain"
                                style={{ maxHeight: '48px' }}
                            />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                            {SITE_NAME}
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                            Home
                        </Link>
                        <Link href="/about-us" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                            About
                        </Link>
                        <Link href="/blog" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                            Blog
                        </Link>
                        <Link href="/faq" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                            FAQ
                        </Link>
                        <Link href="/contact-us" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                            Contact
                        </Link>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? (
                            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white">
                    <div className="px-4 pt-2 pb-4 space-y-1">
                        <Link
                            href="/"
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 bg-transparent transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            href="/about-us"
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            About
                        </Link>
                        <Link
                            href="/blog"
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Blog
                        </Link>
                        <Link
                            href="/faq"
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            FAQ
                        </Link>
                        <Link
                            href="/contact-us"
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Contact
                        </Link>
                        <Link
                            href="/privacy"
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            href="/terms"
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Terms & Conditions
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
