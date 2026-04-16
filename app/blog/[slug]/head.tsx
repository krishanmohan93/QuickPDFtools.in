import { BLOG_POSTS } from "@/lib/blog-data";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

interface HeadProps {
    params: Promise<{ slug: string }>;
}

export default async function Head({ params }: HeadProps) {
    const { slug } = await params;
    const post = BLOG_POSTS.find((item) => item.slug === slug);

    if (!post) {
        return null;
    }

    const updatedDate = (post as typeof post & { updatedAt?: string }).updatedAt ?? post.date;

    const articleJsonLd = {
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
                url: `${SITE_URL}/logo.png`,
            },
        },
        datePublished: post.date,
        dateModified: updatedDate,
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `${SITE_URL}/blog/${post.slug}`,
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
    );
}
