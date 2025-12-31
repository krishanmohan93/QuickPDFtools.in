
import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BLOG_POSTS } from '@/lib/blog-data';
import { SITE_NAME, SITE_URL } from '@/lib/constants';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = BLOG_POSTS.find((p) => p.slug === slug);

    if (!post) {
        return {
            title: 'Post Not Found',
        };
    }

    return {
        title: `${post.title} - ${SITE_NAME} Blog`,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            type: 'article',
            publishedTime: post.date,
            authors: [post.author],
            url: `${SITE_URL}/blog/${post.slug}`,
            images: [
                {
                    url: post.image,
                    width: 1200,
                    height: 630,
                    alt: post.title,
                },
            ],
        },
    };
}

export async function generateStaticParams() {
    return BLOG_POSTS.map((post) => ({
        slug: post.slug,
    }));
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const post = BLOG_POSTS.find((p) => p.slug === slug);

    if (!post) {
        notFound();
    }

    // Article Schema (JSON-LD)
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: post.excerpt,
        image: post.image,
        author: {
            "@type": "Person",
            name: post.author,
        },
        publisher: {
            "@type": "Organization",
            name: SITE_NAME,
            logo: {
                "@type": "ImageObject",
                url: `${SITE_URL}/icon.png`,
            },
        },
        datePublished: post.date,
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `${SITE_URL}/blog/${post.slug}`,
        },
    };

    return (
        <div className="bg-gray-50 min-h-screen py-16">
            {/* JSON-LD Script */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-8 md:p-12">
                    {/* Breadcrumb */}
                    <nav className="flex items-center text-sm text-gray-500 mb-8">
                        <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                        <span className="mx-2">/</span>
                        <Link href="/blog" className="hover:text-blue-600 transition-colors">Blog</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 font-medium truncate">{post.title}</span>
                    </nav>

                    {/* Header */}
                    <header className="mb-10 text-center">
                        <div className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide inline-block mb-4">
                            {post.category}
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                            {post.title}
                        </h1>

                        <div className="flex items-center justify-center space-x-4 text-gray-600 text-sm border-t border-b border-gray-100 py-4 max-w-lg mx-auto">
                            <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-2">
                                    {post.author.charAt(0)}
                                </div>
                                <span className="font-medium">{post.author}</span>
                            </div>
                            <span>&bull;</span>
                            <time dateTime={post.date}>{new Date(post.date).toLocaleDateString()}</time>
                            <span>&bull;</span>
                            <span>{post.readTime}</span>
                        </div>
                    </header>

                    {/* Content */}
                    <div
                        className="prose prose-lg prose-blue mx-auto text-gray-700"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    {/* Footer of Article */}
                    <div className="mt-12 pt-8 border-t border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Share this article</h3>
                        <div className="flex gap-4">
                            <a
                                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`${SITE_URL}/blog/${post.slug}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                            >
                                Share on X
                            </a>
                            <a
                                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${SITE_URL}/blog/${post.slug}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                                Share on Facebook
                            </a>
                        </div>
                    </div>
                </div>
            </article>

            {/* CTA Section */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 md:p-12 text-center text-white">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to manage your PDFs?</h2>
                    <p className="text-blue-100 mb-8 text-lg">Try our professional PDF tools for free today.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/merge-pdf" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors">
                            Merge PDF
                        </Link>
                        <Link href="/compress-pdf" className="bg-blue-500 bg-opacity-30 border border-blue-400 text-white px-6 py-3 rounded-lg font-bold hover:bg-opacity-40 transition-colors">
                            Compress PDF
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
