import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import { SITE_NAME, SITE_DESCRIPTION, SITE_KEYWORDS, SITE_URL } from "@/lib/constants";
import { generateHomeMetadata } from "@/lib/metadata";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - Professional PDF Tools Online for Free`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
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
    title: `${SITE_NAME} - Professional PDF Tools Online`,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - Professional PDF Tools Online`,
    description: SITE_DESCRIPTION,
  },
  verification: {
    google: "your-google-verification-code",
  },
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
        "@type": "WebApplication",
        "@id": `${SITE_URL}#webapp`,
        "name": SITE_NAME,
        "url": SITE_URL,
        "description": "Professional PDF tools online for free. Edit PDFs with same font, convert PDF to Word/Excel/PPT, merge, split, compress PDFs.",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web Browser",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "featureList": [
          "PDF Merging",
          "PDF Splitting",
          "PDF Compression",
          "PDF to Word Conversion",
          "Word to PDF Conversion",
          "PDF to Excel Conversion",
          "Excel to PDF Conversion",
          "PDF to PowerPoint Conversion",
          "PowerPoint to PDF Conversion",
          "PDF Protection",
          "PDF Rotation",
          "PDF Reordering",
          "PDF Editing"
        ],
        "screenshot": `${SITE_URL}/screenshot.jpg`
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}#softwareapp`,
        "name": SITE_NAME,
        "url": SITE_URL,
        "description": "Free online PDF tools for editing, converting, merging, splitting, and compressing PDF files.",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Any",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "author": {
          "@type": "Organization",
          "name": SITE_NAME
        }
      },
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
      }
    ]
  };

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
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
      <body className="font-sans antialiased bg-gray-50 text-gray-900" suppressHydrationWarning>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
