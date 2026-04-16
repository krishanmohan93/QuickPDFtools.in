
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AuthorBio from '@/components/AuthorBio';
import { BLOG_POSTS, type BlogPost } from '@/lib/blog-data';
import { SITE_NAME, SITE_URL } from '@/lib/constants';
import { formatDateUTC } from '@/lib/date';

type TocItem = {
    id: string;
    text: string;
    level: 2 | 3;
};

type BlogPostWithMeta = BlogPost & {
    updatedAt?: string;
};

const stripHtml = (value: string) =>
    value
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/\s+/g, ' ')
        .trim();

const slugify = (value: string) =>
    value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'section';

function buildContentWithToc(content: string): { html: string; toc: TocItem[] } {
    const usedIds = new Map<string, number>();
    const toc: TocItem[] = [];

    const html = content.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (match, level: string, attrs: string, inner: string) => {
        const headingText = stripHtml(inner);
        const baseId = slugify(headingText);
        const currentCount = usedIds.get(baseId) ?? 0;
        usedIds.set(baseId, currentCount + 1);
        const id = currentCount === 0 ? baseId : `${baseId}-${currentCount + 1}`;

        toc.push({
            id,
            text: headingText,
            level: Number(level) as 2 | 3,
        });

        const attrsWithId = /\bid=/.test(attrs) ? attrs : `${attrs} id="${id}" class="scroll-mt-28"`;
        return `<h${level}${attrsWithId}>${inner}</h${level}>`;
    });

    return { html, toc };
}

function calculateReadTime(content: string): string {
    const words = stripHtml(content)
        .split(/\s+/)
        .filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min read`;
}

function getRelatedPosts(post: BlogPostWithMeta, limit = 3): BlogPost[] {
    const categoryMatches = BLOG_POSTS.filter((item) => item.slug !== post.slug && item.category === post.category);
    const fallbackMatches = BLOG_POSTS.filter((item) => item.slug !== post.slug && item.category !== post.category);
    const combined = [...categoryMatches, ...fallbackMatches];
    const unique = new Map<string, BlogPost>();

    for (const item of combined) {
        if (!unique.has(item.slug)) {
            unique.set(item.slug, item);
        }
        if (unique.size >= limit) break;
    }

    return Array.from(unique.values()).slice(0, limit);
}

function getAvatarInitials(name: string) {
    return name
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = BLOG_POSTS.find((p) => p.slug === slug) as BlogPostWithMeta | undefined;

    if (!post) {
        return {
            title: 'Post Not Found',
        };
    }

    return {
        title: `${post.title} | ${SITE_NAME}`,
        description: post.excerpt,
        alternates: {
            canonical: `${SITE_URL}/blog/${post.slug}`,
        },
        openGraph: {
            title: post.title,
            description: post.excerpt,
            type: 'article',
            publishedTime: post.date,
            modifiedTime: post.updatedAt ?? post.date,
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
    const post = BLOG_POSTS.find((item) => item.slug === slug) as BlogPostWithMeta | undefined;

    if (!post) {
        notFound();
    }

    const publishedDate = formatDateUTC(post.date, 'long');
    const updatedDate = formatDateUTC(post.updatedAt ?? post.date, 'long');
    const readTime = calculateReadTime(post.content);
    const { html: contentWithIds, toc } = buildContentWithToc(post.content);
    const relatedPosts = getRelatedPosts(post, 3);
    const authorInitials = getAvatarInitials(post.author);

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] text-slate-900">
            <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
                <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-slate-500" aria-label="Breadcrumb">
                    <Link href="/" className="font-medium text-slate-600 transition-colors hover:text-slate-900">
                        Home
                    </Link>
                    <span className="text-slate-300">/</span>
                    <Link href="/blog" className="font-medium text-slate-600 transition-colors hover:text-slate-900">
                        Blog
                    </Link>
                    <span className="text-slate-300">/</span>
                    <Link href={`/blog?category=${encodeURIComponent(post.category.toLowerCase())}`} className="font-medium text-slate-600 transition-colors hover:text-slate-900">
                        {post.category}
                    </Link>
                </nav>

                <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
                    <article className="min-w-0">
                        <header className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                            <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-6 py-5 sm:px-8">
                                <div className="flex flex-wrap items-center gap-3">
                                    <Link
                                        href={`/blog?category=${encodeURIComponent(post.category.toLowerCase())}`}
                                        className="inline-flex items-center rounded-full bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-700"
                                    >
                                        {post.category}
                                    </Link>
                                    <span className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-700 ring-1 ring-inset ring-sky-200">
                                        {readTime}
                                    </span>
                                    <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-800 ring-1 ring-inset ring-amber-200">
                                        Last updated: {updatedDate}
                                    </span>
                                </div>
                            </div>

                            <div className="px-6 py-8 sm:px-8 sm:py-10">
                                <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                                    {post.title}
                                </h1>
                                <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
                                    {post.excerpt}
                                </p>

                                <div className="mt-8 flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 sm:px-5">
                                    <div className="flex items-center gap-3">
                                        <div className="relative h-12 w-12 overflow-hidden rounded-full border border-slate-200 bg-slate-900 shadow-sm">
                                            <Image
                                                src="/authors/media__1774285319900.jpg"
                                                alt={`${post.author} avatar`}
                                                fill
                                                sizes="48px"
                                                className="object-cover"
                                                priority={false}
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">{post.author}</p>
                                            <p className="text-sm text-slate-500">QuickPDFTools contributor</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                                        <span className="inline-flex items-center rounded-full bg-white px-3 py-1.5 ring-1 ring-inset ring-slate-200">
                                            Published: <time className="ml-1 font-medium text-slate-900" dateTime={post.date} suppressHydrationWarning>{publishedDate}</time>
                                        </span>
                                        <span className="inline-flex items-center rounded-full bg-white px-3 py-1.5 ring-1 ring-inset ring-slate-200">
                                            Updated: <span className="ml-1 font-medium text-slate-900">{updatedDate}</span>
                                        </span>
                                        <span className="inline-flex items-center rounded-full bg-white px-3 py-1.5 ring-1 ring-inset ring-slate-200">
                                            Read time: <span className="ml-1 font-medium text-slate-900">{readTime}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </header>

                        <div className="mt-8 lg:hidden">
                            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                                <div className="mb-4 flex items-center justify-between gap-4">
                                    <h2 className="text-lg font-semibold text-slate-950">Table of Contents</h2>
                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                        Quick links
                                    </span>
                                </div>
                                {toc.length > 0 ? (
                                    <nav aria-label="Table of contents">
                                        <ul className="space-y-2">
                                            {toc.map((item) => (
                                                <li key={item.id} className={item.level === 3 ? 'pl-4' : ''}>
                                                    <a
                                                        href={`#${item.id}`}
                                                        className="group flex items-start gap-3 rounded-xl px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                                                    >
                                                        <span className={`mt-2 h-1.5 w-1.5 rounded-full ${item.level === 2 ? 'bg-slate-900' : 'bg-slate-400'}`} />
                                                        <span className="leading-6">{item.text}</span>
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </nav>
                                ) : (
                                    <p className="text-sm text-slate-500">This article has no section headings to index.</p>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                            <div
                                className="prose prose-slate max-w-none
                                    prose-headings:scroll-mt-28 prose-headings:font-bold prose-headings:text-slate-950
                                    prose-h2:mt-12 prose-h2:mb-5 prose-h2:text-3xl
                                    prose-h3:mt-8 prose-h3:mb-4 prose-h3:text-2xl
                                    prose-p:mb-6 prose-p:leading-8 prose-p:text-slate-700
                                    prose-a:text-sky-700 prose-a:no-underline hover:prose-a:underline
                                    prose-strong:text-slate-950 prose-strong:font-semibold
                                    prose-ul:my-6 prose-ul:space-y-2
                                    prose-ol:my-6 prose-ol:space-y-2
                                    prose-li:text-slate-700
                                    prose-code:rounded-md prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-slate-800
                                    prose-blockquote:border-l-4 prose-blockquote:border-slate-300 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-slate-600"
                                dangerouslySetInnerHTML={{ __html: contentWithIds }}
                            />
                        </div>

                        <div className="mt-12">
                            <AuthorBio />
                        </div>

                        <section className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                            <div className="mb-6 flex items-end justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">More to read</p>
                                    <h2 className="mt-2 text-2xl font-bold text-slate-950">Related Articles</h2>
                                </div>
                                <Link href="/blog" className="text-sm font-semibold text-sky-700 transition-colors hover:text-sky-900">
                                    View all posts
                                </Link>
                            </div>

                            <div className="grid gap-6 md:grid-cols-3">
                                {relatedPosts.map((relatedPost) => (
                                    <article key={relatedPost.slug} className="group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition-all hover:-translate-y-0.5 hover:shadow-lg">
                                        <div className="border-b border-slate-200 bg-gradient-to-br from-slate-900 to-slate-700 px-5 py-4">
                                            <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] !text-white ring-1 ring-white/25">
                                                {relatedPost.category}
                                            </span>
                                        </div>
                                        <div className="p-5">
                                            <Link href={`/blog/${relatedPost.slug}`} className="block">
                                                <h3 className="text-lg font-bold leading-7 text-slate-950 transition-colors group-hover:text-sky-700">
                                                    {relatedPost.title}
                                                </h3>
                                            </Link>
                                            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                                                {relatedPost.excerpt}
                                            </p>
                                            <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
                                                <time dateTime={relatedPost.date} suppressHydrationWarning>
                                                    {formatDateUTC(relatedPost.date, 'short')}
                                                </time>
                                                <span>•</span>
                                                <span>{relatedPost.readTime}</span>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>

                        <section className="mt-12 rounded-3xl border border-slate-200 bg-slate-950 px-6 py-8 text-white shadow-sm sm:px-8">
                            <h2 className="text-2xl font-bold !text-white">About {SITE_NAME}</h2>
                            <p className="mt-4 max-w-3xl text-sm leading-7 !text-slate-200">
                                {SITE_NAME} provides free, secure PDF tools and practical document tutorials for everyday workflows.
                                We focus on simple interfaces, fast results, and useful guidance that helps readers complete tasks without friction.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-4 text-sm font-medium !text-slate-100">
                                <Link href="/privacy" className="!text-slate-100 transition-colors hover:!text-white">
                                    Privacy Policy
                                </Link>
                                <Link href="/about-us" className="!text-slate-100 transition-colors hover:!text-white">
                                    About Us
                                </Link>
                                <Link href="/contact-us" className="!text-slate-100 transition-colors hover:!text-white">
                                    Contact
                                </Link>
                                <Link href="/disclaimer" className="!text-slate-100 transition-colors hover:!text-white">
                                    Disclaimer
                                </Link>
                            </div>
                        </section>
                    </article>

                    <aside className="hidden lg:block">
                        <div className="sticky top-24 space-y-6">
                            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                                <div className="mb-4 flex items-center justify-between gap-4">
                                    <h2 className="text-lg font-semibold text-slate-950">Table of Contents</h2>
                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                        Auto
                                    </span>
                                </div>
                                {toc.length > 0 ? (
                                    <nav aria-label="Table of contents">
                                        <ul className="space-y-2">
                                            {toc.map((item) => (
                                                <li key={item.id} className={item.level === 3 ? 'pl-4' : ''}>
                                                    <a
                                                        href={`#${item.id}`}
                                                        className="group flex items-start gap-3 rounded-xl px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950"
                                                    >
                                                        <span className={`mt-2 h-1.5 w-1.5 rounded-full ${item.level === 2 ? 'bg-slate-900' : 'bg-slate-400'}`} />
                                                        <span className="leading-6">{item.text}</span>
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </nav>
                                ) : (
                                    <p className="text-sm leading-6 text-slate-500">No H2 or H3 headings were found in this article.</p>
                                )}
                            </div>

                            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Post details</p>
                                <dl className="mt-4 space-y-4 text-sm">
                                    <div>
                                        <dt className="text-slate-500">Author</dt>
                                        <dd className="mt-1 font-medium text-slate-950">{post.author}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-slate-500">Category</dt>
                                        <dd className="mt-1 font-medium text-slate-950">{post.category}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-slate-500">Published</dt>
                                        <dd className="mt-1 font-medium text-slate-950">{publishedDate}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-slate-500">Updated</dt>
                                        <dd className="mt-1 font-medium text-slate-950">{updatedDate}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-slate-500">Read time</dt>
                                        <dd className="mt-1 font-medium text-slate-950">{readTime}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
