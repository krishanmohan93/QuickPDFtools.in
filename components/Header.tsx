"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { SITE_NAME, PDF_TOOLS } from "@/lib/constants";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isToolsOpen, setIsToolsOpen] = useState(false);
    const toolsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (toolsTimeoutRef.current) {
                clearTimeout(toolsTimeoutRef.current);
            }
        };
    }, []);

    const handleToolsMouseEnter = () => {
        if (toolsTimeoutRef.current) {
            clearTimeout(toolsTimeoutRef.current);
        }
        toolsTimeoutRef.current = setTimeout(() => {
            setIsToolsOpen(true);
        }, 200); // 200ms delay before showing
    };

    const handleToolsMouseLeave = () => {
        if (toolsTimeoutRef.current) {
            clearTimeout(toolsTimeoutRef.current);
        }
        toolsTimeoutRef.current = setTimeout(() => {
            setIsToolsOpen(false);
        }, 300); // 300ms delay before hiding
    };

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-14 h-14 flex items-center justify-center">
                            <img
                                src="/icon.png"
                                alt={`${SITE_NAME} Logo`}
                                className="w-full h-full object-contain"
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

                        {/* Tools Dropdown */}
                        <div className="relative group">
                            <button
                                className="text-gray-700 hover:text-blue-600 font-medium transition-colors flex items-center gap-1"
                                onMouseEnter={handleToolsMouseEnter}
                                onMouseLeave={handleToolsMouseLeave}
                            >
                                Tools
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {isToolsOpen && (
                                <div
                                    className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
                                    onMouseEnter={handleToolsMouseEnter}
                                    onMouseLeave={handleToolsMouseLeave}
                                >
                                    <div className="max-h-96 overflow-y-auto">
                                        {PDF_TOOLS.map((tool) => (
                                            <Link
                                                key={tool.id}
                                                href={tool.path}
                                                className="block px-4 py-2 hover:bg-blue-50 transition-colors"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div
                                                        className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                                                        style={{ backgroundColor: tool.color }}
                                                    />
                                                    <div>
                                                        <div className="font-medium text-gray-900 text-sm">
                                                            {tool.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-0.5">
                                                            {tool.description}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <Link href="/about-us" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                            About Us
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

                        {/* Mobile Tools Section */}
                        <div className="py-2">
                            <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                PDF Tools
                            </div>
                            <div className="space-y-1 max-h-64 overflow-y-auto">
                                {PDF_TOOLS.map((tool) => (
                                    <Link
                                        key={tool.id}
                                        href={tool.path}
                                        className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: tool.color }}
                                            />
                                            <span>{tool.name}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <Link
                            href="/about-us"
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            About Us
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
