import { Metadata } from "next";
import EditPDFTool from "@/components/EditPDFTool";

export const metadata: Metadata = {
  title: "Edit PDF Online - Modify PDF Text While Preserving Fonts | PDFMasterTools",
  description: "Edit text in PDF files directly online. Preserve original fonts, sizes, colors, and layouts. Professional PDF editor with inline text editing.",
  keywords: "edit pdf, modify pdf, pdf editor, change pdf text, edit pdf online, pdf text editor",
};

export default function EditPDFPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Edit PDF Online
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Edit text directly in your PDF while preserving the original font, size, color, and layout. 
              Professional-grade PDF editing in your browser.
            </p>
          </div>

          {/* Tool Component */}
          <EditPDFTool />

          {/* Features Section */}
          <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-indigo-600 text-2xl mb-3">🎨</div>
              <h3 className="font-semibold text-gray-900 mb-2">Font Preservation</h3>
              <p className="text-gray-600 text-sm">
                Maintains original fonts, sizes, colors, and styles. Automatically embeds fonts when needed.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-indigo-600 text-2xl mb-3">✏️</div>
              <h3 className="font-semibold text-gray-900 mb-2">Inline Editing</h3>
              <p className="text-gray-600 text-sm">
                Click directly on text to edit. Live preview with pixel-perfect positioning.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-indigo-600 text-2xl mb-3">🔍</div>
              <h3 className="font-semibold text-gray-900 mb-2">OCR Support</h3>
              <p className="text-gray-600 text-sm">
                Automatically detects text in scanned PDFs using advanced OCR technology.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-indigo-600 text-2xl mb-3">📐</div>
              <h3 className="font-semibold text-gray-900 mb-2">Layout Integrity</h3>
              <p className="text-gray-600 text-sm">
                Preserves exact positioning, alignment, and spacing. No layout distortion.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-indigo-600 text-2xl mb-3">🔄</div>
              <h3 className="font-semibold text-gray-900 mb-2">Undo/Redo</h3>
              <p className="text-gray-600 text-sm">
                Full history tracking with unlimited undo and redo capabilities.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-indigo-600 text-2xl mb-3">📄</div>
              <h3 className="font-semibold text-gray-900 mb-2">Multi-Page Support</h3>
              <p className="text-gray-600 text-sm">
                Edit multiple pages seamlessly with smooth scrolling and navigation.
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="mt-16 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              How It Works
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-600 font-bold">
                  1
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Upload PDF</h3>
                <p className="text-sm text-gray-600">
                  Select or drag and drop your PDF file
                </p>
              </div>

              <div className="text-center">
                <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-600 font-bold">
                  2
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Click Text</h3>
                <p className="text-sm text-gray-600">
                  Click on any text to start editing
                </p>
              </div>

              <div className="text-center">
                <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-600 font-bold">
                  3
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Make Changes</h3>
                <p className="text-sm text-gray-600">
                  Edit text while preserving original style
                </p>
              </div>

              <div className="text-center">
                <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-600 font-bold">
                  4
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Download</h3>
                <p className="text-sm text-gray-600">
                  Export your edited PDF instantly
                </p>
              </div>
            </div>
          </div>

          {/* SEO Content */}
          <div className="mt-16 prose prose-gray max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Professional PDF Text Editing Tool
            </h2>
            <p className="text-gray-600 mb-4">
              Our advanced PDF editor allows you to modify text directly in your PDF documents while maintaining 
              the exact formatting, fonts, and layout of the original file. Unlike basic PDF editors that flatten 
              or rasterize content, our tool preserves the PDF structure and embedded fonts.
            </p>
            <p className="text-gray-600 mb-4">
              The editor uses advanced PDF parsing technology to detect text objects, extract font information, 
              and enable precise inline editing. Each text element retains its original font family, size, weight, 
              color, and positioning. When you edit text, the changes are applied directly to the PDF content stream, 
              ensuring compatibility with all PDF readers including Adobe Acrobat.
            </p>
            <p className="text-gray-600">
              Perfect for correcting typos, updating information, or making quick edits to PDF documents without 
              needing expensive desktop software. Works entirely in your browser with no uploads to external servers.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
