'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { BLOG_POSTS } from '@/lib/blog-data';
import { SITE_NAME } from '@/lib/constants';
import { formatDateUTC } from '@/lib/date';

const categories = ['All', 'Guides', 'Tutorials', 'Reviews', 'Security', 'Comparisons'];

export default function BlogPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [postsToShow, setPostsToShow] = useState(4);

    // Sort posts by date (newest first)
    const sortedPosts = useMemo(() =>
        [...BLOG_POSTS].sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
        []
    );

    // Filter posts based on search query and category
    const filteredPosts = useMemo(() => {
        let posts = sortedPosts;

        // Filter by category
        if (selectedCategory !== 'All') {
            posts = posts.filter(post => post.category === selectedCategory);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            posts = posts.filter(post =>
                post.title.toLowerCase().includes(query) ||
                post.excerpt.toLowerCase().includes(query) ||
                post.category.toLowerCase().includes(query)
            );
        }

        return posts;
    }, [sortedPosts, searchQuery, selectedCategory]);

    // Reset postsToShow when filters change
    useEffect(() => {
        setPostsToShow(4);
    }, [searchQuery, selectedCategory]);

    // Get popular posts (first 5 from static posts)
    const popularPosts = sortedPosts.slice(0, 5);

    // Get posts to display
    const displayPosts = filteredPosts.slice(0, postsToShow);

    // Load more posts
    const loadMore = () => {
        setPostsToShow(prev => prev + 4);
    };

    return (
        <div className="bg-white min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                            {SITE_NAME} Blog
                        </h1>
                        <p className="text-xl text-gray-600 leading-relaxed">
                            Expert guides, tutorials, and insights on PDF management, document security, and productivity.
                            Learn how to work smarter with digital documents.
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="mt-8 max-w-2xl">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search PDF guides, tutorials, and tips…"
                                className="w-full px-5 py-4 pr-12 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                aria-label="Search blog posts"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <svg
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div className="mt-8 flex flex-wrap gap-3">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${category === selectedCategory
                                    ? 'bg-gray-700'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-700 hover:border-gray-700'
                                    }`}
                                style={category === selectedCategory ? { color: '#ffffff' } : {}}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                                onMouseLeave={(e) => {
                                    if (category !== selectedCategory) {
                                        e.currentTarget.style.color = '';
                                    }
                                }}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Blog Feed */}
                    <div className="lg:col-span-2">
                        <div className="space-y-8">
                            {displayPosts.length === 0 ? (
                                <div className="text-center py-12">
                                    <svg
                                        className="mx-auto h-12 w-12 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <h3 className="mt-2 text-lg font-medium text-gray-900">No posts found</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {searchQuery
                                            ? `No posts match "${searchQuery}"`
                                            : `No posts in ${selectedCategory} category`}
                                    </p>
                                    <button
                                        onClick={() => {
                                            setSearchQuery('');
                                            setSelectedCategory('All');
                                        }}
                                        className="mt-4 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
                                        style={{ color: '#ffffff' }}
                                    >
                                        Clear filters
                                    </button>
                                </div>
                            ) : (
                                displayPosts.map((post, index) => (
                                    <article
                                        key={post.slug}
                                        className={`bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 ${index === 0 ? 'lg:flex lg:flex-row' : ''
                                            }`}
                                    >
                                        {/* Featured Image */}
                                        <div className={`relative bg-gray-100 ${index === 0 ? 'lg:w-1/2' : 'w-full h-56'
                                            }`}>
                                            <div className="absolute inset-0 bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                                                <span className="font-extrabold text-2xl md:text-3xl" style={{ color: '#ffffff', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                                                    {post.category}
                                                </span>
                                            </div>
                                            {/* Category Badge */}
                                            <div className="absolute top-4 left-4">
                                                <span className="inline-block px-3 py-1 bg-gray-800 text-xs font-semibold rounded-full" style={{ color: '#ffffff' }}>
                                                    {post.category}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className={`p-6 ${index === 0 ? 'lg:w-1/2' : ''}`}>
                                            <Link href={`/blog/${post.slug}`} className="block group">
                                                <h2 className={`font-bold text-gray-900 group-hover:text-gray-600 transition-colors mb-3 leading-tight ${index === 0 ? 'text-2xl md:text-3xl' : 'text-xl'
                                                    }`}>
                                                    {post.title}
                                                </h2>
                                            </Link>

                                            <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">
                                                {post.excerpt}
                                            </p>

                                            {/* Meta Information */}
                                            <div className="flex items-center text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center font-semibold text-xs mr-2" style={{ color: '#ffffff' }}>
                                                        {post.author.charAt(0)}
                                                    </div>
                                                    <span className="font-medium text-gray-700">{post.author}</span>
                                                </div>
                                                <span className="mx-2">•</span>
                                                <time dateTime={post.date} suppressHydrationWarning>
                                                    {formatDateUTC(post.date, "short")}
                                                </time>
                                                <span className="mx-2">•</span>
                                                <span>{post.readTime}</span>
                                            </div>
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>

                        {/* Load More */}
                        {displayPosts.length < filteredPosts.length && (
                            <div className="mt-12 text-center">
                                <button
                                    onClick={loadMore}
                                    className="px-8 py-3 bg-white text-gray-700 border-2 border-gray-700 rounded-lg font-semibold hover:bg-gray-700 hover:text-white transition-colors"
                                >
                                    Load More Articles
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:col-span-1">
                        <div className="sticky top-8 space-y-8">
                            {/* Categories Widget */}
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Categories</h3>
                                <ul className="space-y-3">
                                    {categories.filter(c => c !== 'All').map((category) => {
                                        const count = BLOG_POSTS.filter(p => p.category === category).length;
                                        return (
                                            <li key={category}>
                                                <Link
                                                    href={`/blog?category=${category.toLowerCase()}`}
                                                    className="flex items-center justify-between text-gray-700 hover:text-gray-900 transition-colors"
                                                >
                                                    <span className="font-medium">{category}</span>
                                                    <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded">
                                                        {count}
                                                    </span>
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>

                            {/* Popular Articles */}
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Popular Articles</h3>
                                <ul className="space-y-4">
                                    {popularPosts.map((post, index) => (
                                        <li key={post.slug} className="flex gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-bold">
                                                {index + 1}
                                            </span>
                                            <div>
                                                <Link
                                                    href={`/blog/${post.slug}`}
                                                    className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors line-clamp-2"
                                                >
                                                    {post.title}
                                                </Link>
                                                <p className="text-xs text-gray-500 mt-1">{post.readTime}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {/* About Section */}
            <section className="bg-gray-50 border-t border-gray-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">About {SITE_NAME}</h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                        {SITE_NAME} is a free online platform dedicated to making PDF management simple, secure, and accessible to everyone.
                        Our blog provides expert guidance on document handling, security best practices, and productivity tips to help you
                        work more efficiently with digital documents.
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm">
                        <Link href="/privacy" className="text-gray-700 hover:underline font-medium">
                            Privacy Policy
                        </Link>
                        <Link href="/about-us" className="text-gray-700 hover:underline font-medium">
                            About Us
                        </Link>
                        <Link href="/contact-us" className="text-gray-700 hover:underline font-medium">
                            Contact
                        </Link>
                        <Link href="/disclaimer" className="text-gray-700 hover:underline font-medium">
                            Disclaimer
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
