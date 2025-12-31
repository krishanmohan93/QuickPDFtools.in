import { MetadataRoute } from "next";
import { SITE_URL, PDF_TOOLS } from "@/lib/constants";
import { BLOG_POSTS } from "@/lib/blog-data";

export default function sitemap(): MetadataRoute.Sitemap {
    const currentDate = new Date();

    // Static pages
    const staticPages = [
        {
            url: SITE_URL,
            lastModified: currentDate,
            changeFrequency: "daily" as const,
            priority: 1.0,
        },
        {
            url: `${SITE_URL}/about-us`,
            lastModified: currentDate,
            changeFrequency: "monthly" as const,
            priority: 0.7,
        },
        {
            url: `${SITE_URL}/contact-us`,
            lastModified: currentDate,
            changeFrequency: "monthly" as const,
            priority: 0.7,
        },
        {
            url: `${SITE_URL}/privacy-policy`,
            lastModified: currentDate,
            changeFrequency: "monthly" as const,
            priority: 0.5,
        },
        {
            url: `${SITE_URL}/terms-and-conditions`,
            lastModified: currentDate,
            changeFrequency: "monthly" as const,
            priority: 0.5,
        },
        {
            url: `${SITE_URL}/disclaimer`,
            lastModified: currentDate,
            changeFrequency: "monthly" as const,
            priority: 0.5,
        },
        {
            url: `${SITE_URL}/cookie-policy`,
            lastModified: currentDate,
            changeFrequency: "monthly" as const,
            priority: 0.5,
        },
        {
            url: `${SITE_URL}/refund-policy`,
            lastModified: currentDate,
            changeFrequency: "monthly" as const,
            priority: 0.5,
        },
        {
            url: `${SITE_URL}/security-policy`,
            lastModified: currentDate,
            changeFrequency: "monthly" as const,
            priority: 0.5,
        },
        {
            url: `${SITE_URL}/dmca`,
            lastModified: currentDate,
            changeFrequency: "monthly" as const,
            priority: 0.5,
        },
        {
            url: `${SITE_URL}/faq`,
            lastModified: currentDate,
            changeFrequency: "monthly" as const,
            priority: 0.7,
        },
        {
            url: `${SITE_URL}/blog`,
            lastModified: currentDate,
            changeFrequency: "weekly" as const,
            priority: 0.8,
        },
    ];

    // Blog Posts
    const blogPosts = BLOG_POSTS.map((post) => ({
        url: `${SITE_URL}/blog/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: "monthly" as const,
        priority: 0.7,
    }));

    // Tool pages
    const toolPages = PDF_TOOLS.map((tool) => ({
        url: `${SITE_URL}${tool.path}`,
        lastModified: currentDate,
        changeFrequency: "weekly" as const,
        priority: 0.9,
    }));

    return [...staticPages, ...blogPosts, ...toolPages];
}
