
import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { BLOG_POSTS } from '@/lib/blog-data';
import { SITE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
    title: `Blog - ${SITE_NAME}`,
    description: 'Read the latest tips, tutorials, and updates about PDF tools, document management, and productivity.',
};

export default function BlogPage() {
    return (
        <div className="bg-gray-50 min-h-screen py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                        Our Blog
                    </h1>
                    <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
                        Tips, tricks, and guides to help you master your documents and boost productivity.
                    </p>
                </div>

                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
                    {BLOG_POSTS.map((post) => (
                        <article key={post.slug} className="flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
                            <div className="relative h-48 w-full bg-gray-200">
                                {/* Using a simple placeholder div if image fails, or use standard img for simplicity here since we don't have real local images yet */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl opacity-80">
                                    {post.category}
                                </div>
                            </div>
                            <div className="flex-1 p-6 flex flex-col justify-between">
                                <div>
                                    <div className="text-sm font-medium text-blue-600 mb-2">
                                        {post.category}
                                    </div>
                                    <Link href={`/blog/${post.slug}`} className="block mt-2">
                                        <h2 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                                            {post.title}
                                        </h2>
                                    </Link>
                                    <p className="mt-3 text-gray-600 line-clamp-3">
                                        {post.excerpt}
                                    </p>
                                </div>
                                <div className="mt-6 flex items-center">
                                    <div className="flex-shrink-0">
                                        <span className="sr-only">{post.author}</span>
                                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                            {post.author.charAt(0)}
                                        </div>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900">
                                            {post.author}
                                        </p>
                                        <div className="flex space-x-1 text-sm text-gray-500">
                                            <time dateTime={post.date}>{new Date(post.date).toLocaleDateString()}</time>
                                            <span aria-hidden="true">&middot;</span>
                                            <span>{post.readTime}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    );
}
