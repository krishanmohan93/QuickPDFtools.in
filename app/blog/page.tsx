import type { Metadata } from 'next';
import BlogPageClient from '@/components/BlogPageClient';
import { generateMetadata } from '@/lib/seo';

export const metadata: Metadata = generateMetadata({
    title: 'Blog',
    description: 'Practical PDF tutorials, document security tips, conversion guides, and productivity advice from QuickPDFTools.',
    url: '/blog',
    image: '/og-image.png',
});

export default function BlogPage() {
    return <BlogPageClient />;
}

