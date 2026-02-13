"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { SITE_NAME, PDF_TOOLS } from "@/lib/constants";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isToolsOpen, setIsToolsOpen] = useState(false);
    const [hasAnimated, setHasAnimated] = useState(false);
    const toolsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const styleVars = {
        cardBg: "var(--card-bg, #ffffff)",
        borderPrimary: "var(--border-primary, #e5e7eb)",
        textSecondary: "var(--text-secondary, #374151)",
        textPrimary: "var(--text-primary, #111827)",
        textMuted: "var(--text-muted, #9ca3af)",
        hoverBg: "var(--upload-hover-bg, #f9fafb)",
    };

    // Cleanup timeout on unmount and trigger initial animation
    useEffect(() => {
        // Trigger the pulse animation once on mount
        const timer = setTimeout(() => {
            setHasAnimated(true);
        }, 3000); // Animation lasts 3 seconds

        return () => {
            clearTimeout(timer);
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
        <header className="sticky top-0 z-50 backdrop-blur-sm border-b shadow-sm bg-white transition-colors duration-300" style={{ borderColor: styleVars.borderPrimary }}>
            <div className="w-full mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
                <div className="flex items-center justify-between h-20">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-14 h-14 flex items-center justify-center">
                            <img
                                src="/logo.png"
                                alt={`${SITE_NAME} Logo`}
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <span className="text-xl font-bold text-blue-600 transition-colors duration-300">
                            {SITE_NAME}
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="/" className="font-medium transition-colors text-gray-700 hover:text-blue-600">
                            Home
                        </Link>

                        {/* Tools Dropdown */}
                        <div className="relative group">
                            <Link
                                href="/#tools"
                                className="font-medium transition-colors flex items-center gap-1"
                                style={{ color: styleVars.textSecondary }}
                                onMouseEnter={handleToolsMouseEnter}
                                onMouseLeave={handleToolsMouseLeave}
                                aria-haspopup="menu"
                                aria-expanded={isToolsOpen}
                            >
                                Tools
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </Link>

                            {/* Dropdown Menu */}
                            {isToolsOpen && (
                                <div
                                    className="absolute top-full left-0 mt-2 w-72 rounded-lg shadow-xl border py-2 z-50"
                                    style={{ backgroundColor: styleVars.cardBg, borderColor: styleVars.borderPrimary }}
                                    onMouseEnter={handleToolsMouseEnter}
                                    onMouseLeave={handleToolsMouseLeave}
                                >
                                    <div className="max-h-96 overflow-y-auto">
                                        {PDF_TOOLS.map((tool) => (
                                            <Link
                                                key={tool.id}
                                                href={tool.path}
                                                className="block px-4 py-2 transition-colors"
                                                style={{ backgroundColor: 'transparent' }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = styleVars.hoverBg}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div
                                                        className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                                                        style={{ backgroundColor: tool.color }}
                                                    />
                                                    <div>
                                                        <div className="font-medium text-sm" style={{ color: styleVars.textPrimary }}>
                                                            {tool.name}
                                                        </div>
                                                        <div className="text-xs mt-0.5" style={{ color: styleVars.textMuted }}>
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

                        <Link href="/about-us" className="font-medium transition-colors" style={{ color: styleVars.textSecondary }}>
                            About Us
                        </Link>
                        <Link href="/blog" className="font-medium transition-colors" style={{ color: styleVars.textSecondary }}>
                            Blog
                        </Link>
                        <Link href="/faq" className="font-medium transition-colors" style={{ color: styleVars.textSecondary }}>
                            FAQ
                        </Link>
                        <Link href="/contact-us" className="font-medium transition-colors" style={{ color: styleVars.textSecondary }}>
                            Contact
                        </Link>

                        {/* Merge PDF CTA Button */}
                        <Link
                            href="/merge-pdf"
                            className="cta-merge-pdf"
                            style={{
                                display: 'inline-block',
                                padding: '10px 20px',
                                backgroundColor: '#2563eb',
                                color: '#ffffff',
                                fontWeight: '600',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer',
                                animation: hasAnimated ? 'none' : 'gentle-pulse 3s ease-in-out',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#1d4ed8';
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#2563eb';
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            Merge PDF
                        </Link>

                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 rounded-lg transition-colors"
                        style={{ color: styleVars.textSecondary }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = styleVars.hoverBg}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t" style={{ borderColor: styleVars.borderPrimary, backgroundColor: styleVars.cardBg }}>
                    <div className="px-4 pt-2 pb-4 space-y-1">
                        <Link
                            href="/"
                            className="block px-3 py-2 rounded-md text-base font-medium transition-colors"
                            style={{ color: styleVars.textSecondary, backgroundColor: 'transparent' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = styleVars.hoverBg}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Home
                        </Link>

                        {/* Mobile Tools Section */}
                        <div className="py-2">
                            <div className="px-3 text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: styleVars.textMuted }}>
                                PDF Tools
                            </div>
                            <div className="space-y-1 max-h-64 overflow-y-auto">
                                {PDF_TOOLS.map((tool) => (
                                    <Link
                                        key={tool.id}
                                        href={tool.path}
                                        className="block px-3 py-2 rounded-md text-sm transition-colors"
                                        style={{ color: styleVars.textSecondary, backgroundColor: 'transparent' }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = styleVars.hoverBg}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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
                            className="block px-3 py-2 rounded-md text-base font-medium transition-colors"
                            style={{ color: styleVars.textSecondary, backgroundColor: 'transparent' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = styleVars.hoverBg}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            About Us
                        </Link>
                        <Link
                            href="/blog"
                            className="block px-3 py-2 rounded-md text-base font-medium transition-colors"
                            style={{ color: styleVars.textSecondary, backgroundColor: 'transparent' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = styleVars.hoverBg}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Blog
                        </Link>
                        <Link
                            href="/faq"
                            className="block px-3 py-2 rounded-md text-base font-medium transition-colors"
                            style={{ color: styleVars.textSecondary, backgroundColor: 'transparent' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = styleVars.hoverBg}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            FAQ
                        </Link>
                        <Link
                            href="/contact-us"
                            className="block px-3 py-2 rounded-md text-base font-medium transition-colors"
                            style={{ color: styleVars.textSecondary, backgroundColor: 'transparent' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = styleVars.hoverBg}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Contact
                        </Link>
                        {/* Mobile Merge PDF CTA Button */}
                        <Link
                            href="/merge-pdf"
                            className="block mx-3 my-3 px-4 py-3 rounded-lg text-center font-semibold transition-all"
                            style={{
                                backgroundColor: '#2563eb',
                                color: '#ffffff',
                                animation: hasAnimated ? 'none' : 'gentle-pulse 3s ease-in-out',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#1d4ed8';
                                e.currentTarget.style.transform = 'scale(1.02)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#2563eb';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Merge PDF
                        </Link>
                        <Link
                            href="/privacy"
                            className="block px-3 py-2 rounded-md text-base font-medium transition-colors"
                            style={{ color: styleVars.textSecondary, backgroundColor: 'transparent' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = styleVars.hoverBg}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            href="/terms"
                            className="block px-3 py-2 rounded-md text-base font-medium transition-colors"
                            style={{ color: styleVars.textSecondary, backgroundColor: 'transparent' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = styleVars.hoverBg}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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
