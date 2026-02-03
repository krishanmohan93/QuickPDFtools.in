import ToolsGrid from "@/components/ToolsGrid";
import HomeSEOContent from "@/components/HomeSEOContent";
import { SITE_NAME } from "@/lib/constants";
import { generateHomeMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = generateHomeMetadata();

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Section - Full Screen */}
      <section className="bg-white min-h-screen flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Free • No Registration • Secure
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Free Online PDF Tools You Can Trust
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed">
              Work with PDF files directly in your browser. No signup required, no watermarks,
              and your files are deleted automatically after processing.
            </p>

            <div className="flex flex-wrap justify-center gap-8 text-base text-gray-600 mb-12">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                No signup needed
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                No watermarks
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Files auto-deleted
              </span>
            </div>

            {/* Scroll indicator */}
            <div className="animate-bounce mt-8">
              <svg className="w-6 h-6 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Tools - Below the fold */}
      <section id="tools" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Popular PDF Tools</h2>
          <ToolsGrid />
        </div>
      </section>

      {/* Real Use Cases Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-10">
            How People Use {SITE_NAME}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-3xl mb-3">📄</div>
              <h3 className="font-semibold text-gray-900 mb-2">Students</h3>
              <p className="text-gray-600 text-sm">
                Converting assignments to PDF before submitting to professors and online portals
              </p>
            </div>

            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-3xl mb-3">🧾</div>
              <h3 className="font-semibold text-gray-900 mb-2">Shop Owners</h3>
              <p className="text-gray-600 text-sm">
                Merging multiple bills and invoices into a single PDF for record-keeping
              </p>
            </div>

            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-3xl mb-3">💼</div>
              <h3 className="font-semibold text-gray-900 mb-2">Office Workers</h3>
              <p className="text-gray-600 text-sm">
                Compressing large PDF files to share via email without hitting size limits
              </p>
            </div>

            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-3xl mb-3">🏫</div>
              <h3 className="font-semibold text-gray-900 mb-2">Teachers</h3>
              <p className="text-gray-600 text-sm">
                Preparing study materials and handouts by converting Word documents to PDF
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Transparency Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
            Why Choose {SITE_NAME}?
          </h2>

          <div className="space-y-4">
            <div className="flex gap-3 items-start">
              <div className="text-blue-600 text-xl flex-shrink-0 mt-1">🔒</div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Your Privacy Matters</h3>
                <p className="text-gray-600">
                  Files are automatically deleted after processing. We do not store or share your documents with anyone.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="text-blue-600 text-xl flex-shrink-0 mt-1">⚡</div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">No Registration Required</h3>
                <p className="text-gray-600">
                  Start working immediately. No need to create an account or remember passwords.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="text-blue-600 text-xl flex-shrink-0 mt-1">🧠</div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Built for Real Users</h3>
                <p className="text-gray-600">
                  Designed for students, professionals, and small businesses who need simple PDF solutions.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="text-blue-600 text-xl flex-shrink-0 mt-1">🌍</div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Works Everywhere</h3>
                <p className="text-gray-600">
                  Use from any device with a web browser - desktop, tablet, or mobile phone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Simple & Clear */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
            How It Works
          </h2>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Upload Your File</h3>
                <p className="text-gray-600">
                  Click to select or drag and drop your PDF file from your computer or phone.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">We Process It</h3>
                <p className="text-gray-600">
                  Your file is processed securely in your browser or on our servers, depending on the tool.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Download Result</h3>
                <p className="text-gray-600">
                  Download your converted or edited file. Files are automatically deleted within an hour.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Content Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            About {SITE_NAME}
          </h2>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              {SITE_NAME} is a free online platform that helps you work with PDF files without installing any software.
              We built this tool because we understand that not everyone wants to download programs or pay for subscriptions
              just to merge a few files or convert a document.
            </p>

            <p>
              Our tools are used by students preparing assignments, office workers managing documents, shop owners organizing
              invoices, and teachers creating study materials. We keep things simple because PDF tasks should not be complicated.
            </p>

            <p>
              We care about your privacy. Files uploaded to our servers are processed and then automatically deleted.
              We do not collect personal information, and you can use all our tools without creating an account.
            </p>
          </div>
        </div>
      </section>

      {/* SEO Content Component Included Here */}
      <HomeSEOContent />
    </div>
  );
}
