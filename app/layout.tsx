import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import { SITE_NAME, SITE_KEYWORDS, SITE_URL } from "@/lib/constants";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `Professional PDF Tools Online for Free | ${SITE_NAME}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: "Professional PDF tools to merge, convert, split, compress, and edit files online.",
  keywords: SITE_KEYWORDS,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    title: `Professional PDF Tools Online | ${SITE_NAME}`,
    description: "Professional PDF tools to merge, convert, split, compress, and edit files online.",
    siteName: SITE_NAME,
    images: [
      {
        url: `${SITE_URL}/logo.png`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} Logo`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Professional PDF Tools Online | ${SITE_NAME}`,
    description: "Professional PDF tools to merge, convert, split, compress, and edit files online.",
    images: [`${SITE_URL}/logo.png`],
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}#organization`,
        "name": SITE_NAME,
        "url": SITE_URL,
        "logo": {
          "@type": "ImageObject",
          "url": `${SITE_URL}/logo.png`
        },
        "sameAs": [
          // Add social media URLs here if available
        ]
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}#website`,
        "url": SITE_URL,
        "name": SITE_NAME,
        "description": "Professional PDF tools to merge, convert, split, compress, and edit files online.",
        "publisher": {
          "@id": `${SITE_URL}#organization`
        },
        "inLanguage": "en-US"
      }
    ]
  };

  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schemaData),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Cookie Consent Management (GDPR/CCPA/DPDP Compliant)
              (function() {
                function enableTracking() {
                  // Initialize Google AdSense (add your publisher ID)
                  window.adsbygoogle = window.adsbygoogle || [];

                  // Initialize Google Analytics (add your GA4 ID)
                  // window.dataLayer = window.dataLayer || [];
                  // function gtag(){dataLayer.push(arguments);}
                  // gtag('js', new Date());
                  // gtag('config', 'G-XXXXXXXXXX');

                  console.log('✅ Tracking enabled - User consented to cookies');

                  // Dispatch event for other scripts
                  window.dispatchEvent(new CustomEvent('cookieConsentAccepted'));
                }

                // Check consent on page load
                window.addEventListener('load', function() {
                  const consent = localStorage.getItem('cookieConsent');
                  if (consent === 'accepted') {
                    enableTracking();
                  }
                });

                // Listen for consent changes
                window.addEventListener('cookieConsentAccepted', enableTracking);
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-white">
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
