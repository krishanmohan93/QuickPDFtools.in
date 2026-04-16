import { SITE_NAME, SITE_URL } from "@/lib/constants";

const DEFAULT_IMAGE = `${SITE_URL}/logo.png`;

/**
 * Build a standard Next.js metadata object for a page.
 *
 * @param {object} params
 * @param {string} params.title
 * @param {string} params.description
 * @param {string} params.url
 * @param {string} [params.image]
 * @returns {import('next').Metadata}
 */
export function generateMetadata({ title, description, url, image }) {
  const resolvedImage = image || DEFAULT_IMAGE;

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: {
      canonical: url,
    },
    robots: "index, follow",
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      images: [
        {
          url: resolvedImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [resolvedImage],
    },
  };
}
