export interface UseCase {
  icon: string;
  title: string;
  description: string;
}

export interface Step {
  title: string;
  description: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Benefit {
  icon: string;
  title: string;
  description: string;
}

export interface ToolSEOData {
  toolId: string;
  whatTitle: string;
  whatBody: string;
  whenTitle: string;
  useCases: UseCase[];
  stepsTitle: string;
  steps: Step[];
  faqTitle: string;
  faqs: FAQ[];
  whyTitle: string;
  benefits: Benefit[];
}

const SEO_CONTENT: Record<string, ToolSEOData> = {
  "merge-pdf": {
    toolId: "merge-pdf",
    whatTitle: "What is PDF Merging?",
    whatBody:
      "PDF merging is the process of combining two or more separate PDF files into one single, unified document. Instead of sending ten individual files, you send one clean PDF — saving time for you and the recipient. It keeps your pages in exactly the order you choose, preserves all text, images, and formatting, and produces a file that opens perfectly on any device. Whether you're assembling a multi-chapter report, collecting scanned receipts for an accountant, or bundling handouts before a presentation, merging PDFs is the fastest way to bring scattered documents together. QuickPDFTools handles the heavy lifting in your browser — no software to install, no account needed, and your files never leave your device until the moment you download the result.",
    whenTitle: "When Should You Merge PDFs?",
    useCases: [
      {
        icon: "🎓",
        title: "Students combining assignment pages",
        description:
          "Combine cover pages, answer sheets, and appendices into one file before submitting through a university portal.",
      },
      {
        icon: "🏢",
        title: "Office workers merging reports",
        description:
          "Join weekly department updates, data exports, and presentation slides into a single executive summary PDF.",
      },
      {
        icon: "🛒",
        title: "Shop owners combining invoices",
        description:
          "Bundle monthly customer invoices or supplier bills into one file for easy bookkeeping and audit trails.",
      },
      {
        icon: "📚",
        title: "Teachers preparing handouts",
        description:
          "Merge lecture notes, reference sheets, and exercise pages into a single printable handout for students.",
      },
    ],
    stepsTitle: "How to Merge PDF Files — Step by Step",
    steps: [
      {
        title: "Upload your PDF files",
        description:
          "Click the upload area or drag and drop multiple PDF files. You can add up to 20 files at once, each up to 100 MB.",
      },
      {
        title: "Arrange the order",
        description:
          "Drag the file cards to reorder them exactly the way you want them to appear in the merged document.",
      },
      {
        title: "Click 'Process Files'",
        description:
          "Hit the button and QuickPDFTools instantly merges everything in your browser — no data is sent to a server.",
      },
      {
        title: "Download your merged PDF",
        description:
          "Your combined PDF is ready to save. Name it whatever you like, then click Download.",
      },
    ],
    faqTitle: "Frequently Asked Questions",
    faqs: [
      {
        question: "Is it free to merge PDFs?",
        answer:
          "Yes — completely free. No signup, no credit card, and no hidden limits. Merge as many files as you need.",
      },
      {
        question: "Is it safe to merge my PDFs here?",
        answer:
          "Absolutely. Merging happens entirely inside your browser using client-side JavaScript. Your files are never uploaded to any server.",
      },
      {
        question: "Is there a file size limit?",
        answer:
          "Each individual PDF can be up to 100 MB. If your files are larger, try compressing them first with our Compress PDF tool.",
      },
      {
        question: "How many files can I merge at once?",
        answer:
          "You can merge up to 20 PDF files in a single operation. Simply add them all at once and reorder as needed.",
      },
      {
        question: "Does it work on mobile?",
        answer:
          "Yes. QuickPDFTools works on all modern browsers including Chrome, Safari, Firefox, and Edge — on desktop, tablet, and mobile.",
      },
    ],
    whyTitle: "Why Use QuickPDFTools to Merge PDFs?",
    benefits: [
      {
        icon: "🔒",
        title: "100% Private & Secure",
        description:
          "Everything is processed locally in your browser. Your files are never uploaded to our servers.",
      },
      {
        icon: "⚡",
        title: "Instant Results",
        description:
          "No waiting queues or server processing. PDF merging completes in seconds right on your device.",
      },
      {
        icon: "🆓",
        title: "Always Free",
        description:
          "No account, no subscription, no watermarks — just a free, clean tool that works every time.",
      },
    ],
  },

  "compress-pdf": {
    toolId: "compress-pdf",
    whatTitle: "What is PDF Compression?",
    whatBody:
      "PDF compression reduces the file size of a PDF document by removing redundant data, optimising embedded images, and stripping unnecessary metadata — all without visibly degrading the content for everyday use. A large PDF can slow down email attachments, block portal uploads with file-size limits, and eat up storage on phones or laptops. Compression solves all three problems at once. QuickPDFTools offers four compression levels — Low, Medium, High, and Ultra — so you can balance file size against image quality depending on your needs. The process runs entirely in your browser, meaning your files are never sent to a server, and results are available for download instantly.",
    whenTitle: "When Should You Compress a PDF?",
    useCases: [
      {
        icon: "📧",
        title: "Emailing large attachments",
        description:
          "Many email providers cap attachments at 25 MB. Compress your PDF to ensure it gets through without bouncing.",
      },
      {
        icon: "🎓",
        title: "Student portal uploads",
        description:
          "University submission systems often have strict size limits — compress your thesis or report before uploading.",
      },
      {
        icon: "💼",
        title: "Client presentations",
        description:
          "Share polished proposals and pitch decks via Google Drive or Dropbox links without blowing past storage quotas.",
      },
      {
        icon: "📱",
        title: "Mobile-friendly sharing",
        description:
          "Send PDFs over WhatsApp or Telegram, which cap file sizes. Compression makes sharing fast and hassle-free.",
      },
    ],
    stepsTitle: "How to Compress a PDF — Step by Step",
    steps: [
      {
        title: "Upload your PDF",
        description:
          "Click 'Select a PDF file' or drag-and-drop your document. Files up to 50 MB are supported.",
      },
      {
        title: "Choose a compression level",
        description:
          "Pick Low for lossless compression, Medium for a balanced result, High for a smaller file, or Ultra for maximum savings.",
      },
      {
        title: "Click 'Compress PDF'",
        description:
          "The tool processes your file in seconds and shows you the original size, compressed size, and percentage saved.",
      },
      {
        title: "Download the optimised PDF",
        description:
          "Give the file a name and click Download. Your original file is untouched — you get a brand-new, smaller copy.",
      },
    ],
    faqTitle: "Frequently Asked Questions",
    faqs: [
      {
        question: "Is compressing PDFs free?",
        answer:
          "Yes — 100% free with no account or payment required. Use it as often as you like.",
      },
      {
        question: "Will compression reduce image quality?",
        answer:
          "Low and Medium levels are lossless and keep visual quality identical. High and Ultra levels may slightly reduce image sharpness in exchange for smaller file sizes.",
      },
      {
        question: "Is there a file size limit?",
        answer:
          "You can compress PDFs up to 50 MB. For larger files, try splitting them first, then compress each part.",
      },
      {
        question: "How many files can I compress at once?",
        answer:
          "Currently one file at a time. Compress each file separately for best results.",
      },
      {
        question: "Does it work on mobile?",
        answer:
          "Yes. The tool works on all modern browsers on desktop, tablet, and phone.",
      },
    ],
    whyTitle: "Why Use QuickPDFTools to Compress PDFs?",
    benefits: [
      {
        icon: "🔒",
        title: "Files Stay Private",
        description:
          "Compression happens in your browser. No files are ever uploaded to our servers.",
      },
      {
        icon: "📊",
        title: "See Exactly How Much You Save",
        description:
          "After compression, we show you the original size, new size, and the exact percentage reduction.",
      },
      {
        icon: "🎛️",
        title: "Four Compression Levels",
        description:
          "From lossless Low to maximum Ultra — choose the level that matches your quality vs. size needs.",
      },
    ],
  },

  "split-pdf": {
    toolId: "split-pdf",
    whatTitle: "What is PDF Splitting?",
    whatBody:
      "PDF splitting lets you extract a specific range of pages — or break an entire document into individual pages — from a single PDF file. It is the opposite of merging: instead of combining files, you divide one large document into smaller, more manageable pieces. Common scenarios include pulling a single contract clause from a 200-page legal binder, extracting only the relevant chapters from an e-book, or separating a batch-scanned document into individual forms. QuickPDFTools processes the splitting directly in your browser using pdf-lib, so your sensitive document content is never sent to any server. The tool is fast, free, and requires no account.",
    whenTitle: "When Should You Split a PDF?",
    useCases: [
      {
        icon: "⚖️",
        title: "Lawyers extracting specific clauses",
        description:
          "Pull only the pages you need from a lengthy contract to share with a client without exposing the full document.",
      },
      {
        icon: "🎓",
        title: "Students extracting chapters",
        description:
          "Grab only the relevant chapter from a large e-book or study guide PDF for focused revision.",
      },
      {
        icon: "🏥",
        title: "Medical staff separating records",
        description:
          "Separate individual patient forms or test results from a bulk-scanned batch into their own files.",
      },
      {
        icon: "🖨️",
        title: "Printing selected pages",
        description:
          "Extract only the pages you want to print, saving ink and paper without editing the original file.",
      },
    ],
    stepsTitle: "How to Split a PDF — Step by Step",
    steps: [
      {
        title: "Upload your PDF",
        description:
          "Click or drag-and-drop the PDF you want to split. Files up to 100 MB are supported.",
      },
      {
        title: "Enter the page range",
        description:
          "Specify which pages to extract — for example, pages 3–7 — or choose to split every page into its own file.",
      },
      {
        title: "Click 'Process Files'",
        description:
          "The tool instantly extracts your chosen pages in the browser without any server upload.",
      },
      {
        title: "Download the result",
        description:
          "Name your new PDF and click Download. The original file is never modified.",
      },
    ],
    faqTitle: "Frequently Asked Questions",
    faqs: [
      {
        question: "Is splitting PDFs free?",
        answer:
          "Yes — completely free with no account, no watermarks, and no usage limits.",
      },
      {
        question: "Is my document kept private?",
        answer:
          "Yes. The entire split operation runs inside your browser. Your PDF is never sent to any server.",
      },
      {
        question: "Is there a file size limit?",
        answer: "You can split PDFs up to 100 MB in size.",
      },
      {
        question: "Can I split a PDF into individual pages?",
        answer:
          "Yes. Choose 'split all pages' and every page becomes its own separate PDF file.",
      },
      {
        question: "Does it work on mobile?",
        answer:
          "Yes — works on all modern browsers on mobile and desktop devices.",
      },
    ],
    whyTitle: "Why Use QuickPDFTools to Split PDFs?",
    benefits: [
      {
        icon: "🔒",
        title: "Private by Design",
        description:
          "All processing happens in your browser — your files never leave your device.",
      },
      {
        icon: "✂️",
        title: "Flexible Page Selection",
        description:
          "Extract any page range or split every page into its own standalone PDF.",
      },
      {
        icon: "🆓",
        title: "Free With No Limits",
        description:
          "No account, no subscription, and no watermarks — ever.",
      },
    ],
  },

  "pdf-to-word": {
    toolId: "pdf-to-word",
    whatTitle: "What is PDF to Word Conversion?",
    whatBody:
      "PDF to Word conversion transforms a fixed-layout PDF file into an editable Microsoft Word (.docx) document. PDFs are designed for consistent display across all devices, which makes them great for sharing but difficult to edit. Converting to Word gives you fully editable text, headings, lists, and tables so you can revise content, correct errors, update figures, or reformat the document without retyping everything from scratch. QuickPDFTools uses server-side extraction to preserve the document's structure as faithfully as possible, handling both text-based and image-based PDFs. The result is a clean .docx file ready to open in Microsoft Word, Google Docs, or LibreOffice.",
    whenTitle: "When Should You Convert PDF to Word?",
    useCases: [
      {
        icon: "✏️",
        title: "Editing a received PDF contract",
        description:
          "A client sends a PDF contract. Convert it to Word, make your changes, and send back a redlined version.",
      },
      {
        icon: "🎓",
        title: "Updating old study materials",
        description:
          "Convert lecture notes or past papers to Word so you can annotate, reorganise, and add your own comments.",
      },
      {
        icon: "📋",
        title: "Repurposing report content",
        description:
          "Extract tables, paragraphs, and charts from a PDF report to reuse in a new Word document without copy-paste errors.",
      },
      {
        icon: "🌐",
        title: "Translating documents",
        description:
          "Convert to Word first, then paste the text into a translation tool — far easier than working with fixed PDF text.",
      },
    ],
    stepsTitle: "How to Convert PDF to Word — Step by Step",
    steps: [
      {
        title: "Upload your PDF",
        description:
          "Select or drag-and-drop your PDF. The tool works with both text-based and scanned PDFs.",
      },
      {
        title: "Click 'Process Files'",
        description:
          "Our server extracts the content and rebuilds it as a structured .docx file.",
      },
      {
        title: "Download the Word file",
        description:
          "Your .docx file is ready within seconds. Name it and click Download.",
      },
      {
        title: "Open and edit in Word or Docs",
        description:
          "Open in Microsoft Word, Google Docs, or LibreOffice and start editing immediately.",
      },
    ],
    faqTitle: "Frequently Asked Questions",
    faqs: [
      {
        question: "Is PDF to Word conversion free?",
        answer:
          "Yes — completely free, no account needed, and no watermarks on your output.",
      },
      {
        question: "Is my PDF kept private?",
        answer:
          "Files are processed on our secure servers and automatically deleted within 1 hour of conversion.",
      },
      {
        question: "Is there a file size limit?",
        answer: "You can convert PDFs up to 100 MB.",
      },
      {
        question: "Will formatting be preserved?",
        answer:
          "Text, headings, lists, and most tables are preserved. Complex layouts with heavy design elements may need minor tidying in Word.",
      },
      {
        question: "Does it work on mobile?",
        answer:
          "Yes — works on all modern browsers on desktop, tablet, and mobile.",
      },
    ],
    whyTitle: "Why Use QuickPDFTools to Convert PDF to Word?",
    benefits: [
      {
        icon: "🔄",
        title: "Editable Output",
        description:
          "Get a clean .docx file with real, selectable text — not a scanned image inside Word.",
      },
      {
        icon: "⚡",
        title: "Fast Conversion",
        description:
          "Most PDFs are converted in under 10 seconds regardless of page count.",
      },
      {
        icon: "🆓",
        title: "No Account Needed",
        description:
          "Free conversions with no signup, no watermarks, and no usage cap.",
      },
    ],
  },

  "word-to-pdf": {
    toolId: "word-to-pdf",
    whatTitle: "What is Word to PDF Conversion?",
    whatBody:
      "Word to PDF conversion turns a .doc or .docx file into a universally readable PDF document. While Word files display correctly only when the reader has the right version of Microsoft Word and the same fonts installed, a PDF looks identical on every device, operating system, and screen size. Converting to PDF locks your layout, protects your text from accidental edits, and produces a professional document ready for sharing, archiving, or printing. QuickPDFTools converts your Word file server-side and returns a high-fidelity PDF that preserves fonts, images, tables, numbering, and formatting — all without you needing to own or open Microsoft Word.",
    whenTitle: "When Should You Convert Word to PDF?",
    useCases: [
      {
        icon: "📄",
        title: "Submitting job applications",
        description:
          "Convert your CV and cover letter to PDF so formatting stays perfect no matter which Word version HR uses.",
      },
      {
        icon: "🎓",
        title: "University assignment submission",
        description:
          "Most portals require PDF format. Convert your Word essay with one click before the deadline.",
      },
      {
        icon: "🏢",
        title: "Sharing proposals and invoices",
        description:
          "Send business documents as PDFs to ensure clients see exactly what you designed — no layout shifts.",
      },
      {
        icon: "🖨️",
        title: "Preparing print-ready files",
        description:
          "PDF is the industry-standard format for print. Convert Word to PDF before sending to a print shop.",
      },
    ],
    stepsTitle: "How to Convert Word to PDF — Step by Step",
    steps: [
      {
        title: "Upload your Word file",
        description:
          "Select or drag-and-drop your .doc or .docx file. Files up to 100 MB are supported.",
      },
      {
        title: "Click 'Process Files'",
        description:
          "Our server converts the document preserving all fonts, images, and layout details.",
      },
      {
        title: "Download the PDF",
        description:
          "Your PDF is ready in seconds. Click Download and save it to your device.",
      },
      {
        title: "Share or print",
        description:
          "Your PDF will look identical on every device — share via email, upload to a portal, or send to a printer.",
      },
    ],
    faqTitle: "Frequently Asked Questions",
    faqs: [
      {
        question: "Is Word to PDF conversion free?",
        answer:
          "Yes — free, no account required, no watermarks, unlimited conversions.",
      },
      {
        question: "Are my Word files kept private?",
        answer:
          "Files are processed securely on our servers and automatically deleted within 1 hour.",
      },
      {
        question: "What file types are supported?",
        answer: "We support both .doc and .docx Microsoft Word formats.",
      },
      {
        question: "Will my fonts and images be preserved?",
        answer:
          "Yes. Fonts, images, tables, headers, footers, and most formatting are preserved in the output PDF.",
      },
      {
        question: "Does it work on mobile?",
        answer:
          "Yes — works perfectly on all modern browsers on any device.",
      },
    ],
    whyTitle: "Why Use QuickPDFTools to Convert Word to PDF?",
    benefits: [
      {
        icon: "🎨",
        title: "Perfect Formatting",
        description:
          "Fonts, images, tables, and layout are faithfully preserved in the PDF output.",
      },
      {
        icon: "⚡",
        title: "Conversion in Seconds",
        description:
          "Even multi-page Word documents convert to PDF in under 15 seconds.",
      },
      {
        icon: "🌍",
        title: "Works Without Microsoft Word",
        description:
          "Convert your files from any device — Windows, Mac, Linux, iOS, or Android.",
      },
    ],
  },

  "pdf-to-jpg": {
    toolId: "pdf-to-jpg",
    whatTitle: "What is PDF to JPG Conversion?",
    whatBody:
      "PDF to JPG conversion renders each page of a PDF document as a high-quality JPEG image. The result is a set of images you can insert into presentations, share on social media, embed in websites, or use in any platform that accepts images but not PDFs. This is especially useful when you need to show a PDF preview without requiring the viewer to have a PDF reader, or when you want to extract charts, diagrams, or photos from a PDF for use in other projects. QuickPDFTools converts each page of your PDF into a separate, full-resolution JPG image — completely free, with no account required.",
    whenTitle: "When Should You Convert PDF to JPG?",
    useCases: [
      {
        icon: "🖼️",
        title: "Sharing a document preview",
        description:
          "Turn the first page of your PDF into a thumbnail image to preview in email newsletters or website listings.",
      },
      {
        icon: "📊",
        title: "Extracting charts for presentations",
        description:
          "Pull a single chart or infographic page from a PDF report and insert it directly into PowerPoint or Keynote.",
      },
      {
        icon: "📱",
        title: "Posting on social media",
        description:
          "Social platforms don't support PDF uploads — convert your document pages to JPG and post them directly.",
      },
      {
        icon: "🌐",
        title: "Embedding in websites",
        description:
          "Display PDF content inline on a webpage without a PDF reader plugin by converting pages to images.",
      },
    ],
    stepsTitle: "How to Convert PDF to JPG — Step by Step",
    steps: [
      {
        title: "Upload your PDF",
        description:
          "Select or drag-and-drop your PDF file. Files up to 100 MB are supported.",
      },
      {
        title: "Click 'Process Files'",
        description:
          "Each page is rendered as a high-resolution JPG image on our server.",
      },
      {
        title: "Download your images",
        description:
          "Download individual page images or get all pages in a single ZIP file.",
      },
      {
        title: "Use your images anywhere",
        description:
          "Insert them into presentations, websites, social posts, or other documents.",
      },
    ],
    faqTitle: "Frequently Asked Questions",
    faqs: [
      {
        question: "Is PDF to JPG conversion free?",
        answer:
          "Yes — completely free with no account, no watermarks, and no limits.",
      },
      {
        question: "Are my files kept private?",
        answer:
          "Files are processed securely and automatically deleted from our servers within 1 hour.",
      },
      {
        question: "Is there a file size limit?",
        answer: "You can convert PDFs up to 100 MB.",
      },
      {
        question: "What resolution are the output images?",
        answer:
          "Output images are rendered at high resolution (150 DPI by default) — suitable for screen and most print uses.",
      },
      {
        question: "Does it work on mobile?",
        answer:
          "Yes — works on all modern browsers on any device.",
      },
    ],
    whyTitle: "Why Use QuickPDFTools to Convert PDF to JPG?",
    benefits: [
      {
        icon: "🖼️",
        title: "High-Quality Images",
        description:
          "Pages are rendered at high resolution so text and graphics stay sharp and crisp.",
      },
      {
        icon: "📦",
        title: "All Pages at Once",
        description:
          "Convert every page in one go and download them all as a ZIP — no batch-processing needed.",
      },
      {
        icon: "🆓",
        title: "Free & No Signup",
        description:
          "No account, no credit card, no watermarks — just clean, free conversions.",
      },
    ],
  },

  "jpg-to-pdf": {
    toolId: "jpg-to-pdf",
    whatTitle: "What is JPG to PDF Conversion?",
    whatBody:
      "JPG to PDF conversion combines one or more JPEG images into a single PDF document. Instead of sending a folder full of loose photos, you deliver one professional PDF that opens instantly on any device. The tool preserves the full resolution of your images and lets you choose their order before conversion, so the final PDF reads exactly how you intend. Common uses include digitising handwritten notes captured with a phone camera, submitting scanned forms, creating photo books, and sending batches of product photos to clients. QuickPDFTools processes everything in your browser — images are never uploaded to a server.",
    whenTitle: "When Should You Convert JPG to PDF?",
    useCases: [
      {
        icon: "📝",
        title: "Digitising handwritten notes",
        description:
          "Photograph whiteboard notes or hand-drawn diagrams and convert them to a shareable PDF in seconds.",
      },
      {
        icon: "📋",
        title: "Submitting scanned forms",
        description:
          "Many portals require PDF uploads. Convert your scanned JPG forms to PDF before submission.",
      },
      {
        icon: "🛍️",
        title: "Sending product photos to clients",
        description:
          "Bundle multiple product images into one PDF catalogue instead of zipping a folder of loose JPGs.",
      },
      {
        icon: "🎓",
        title: "Students submitting handwritten work",
        description:
          "Photograph your handwritten answers and combine them into a single PDF for online assignment submission.",
      },
    ],
    stepsTitle: "How to Convert JPG to PDF — Step by Step",
    steps: [
      {
        title: "Upload your JPG images",
        description:
          "Select one or more JPG files. You can add up to 20 images at once.",
      },
      {
        title: "Arrange the order",
        description:
          "Drag image cards to set the exact page order you want in the final PDF.",
      },
      {
        title: "Click 'Process Files'",
        description:
          "The tool combines your images into a PDF instantly — entirely in your browser.",
      },
      {
        title: "Download the PDF",
        description:
          "Name it and click Download. Your original images are unchanged.",
      },
    ],
    faqTitle: "Frequently Asked Questions",
    faqs: [
      {
        question: "Is JPG to PDF conversion free?",
        answer:
          "Yes — free, no account needed, no watermarks on the output.",
      },
      {
        question: "Is it safe? Are my images uploaded?",
        answer:
          "No upload needed — conversion happens entirely inside your browser for maximum privacy.",
      },
      {
        question: "How many images can I convert at once?",
        answer: "Up to 20 JPG images per conversion.",
      },
      {
        question: "Will image quality be reduced?",
        answer:
          "No. Images are embedded at their original resolution — no quality loss.",
      },
      {
        question: "Does it work on mobile?",
        answer:
          "Yes — works on all modern mobile and desktop browsers.",
      },
    ],
    whyTitle: "Why Use QuickPDFTools to Convert JPG to PDF?",
    benefits: [
      {
        icon: "🔒",
        title: "Private — No Upload",
        description:
          "Images are converted entirely in your browser and never sent to any server.",
      },
      {
        icon: "🗂️",
        title: "Combine Multiple Images",
        description:
          "Turn up to 20 photos into a single, neatly ordered PDF in one click.",
      },
      {
        icon: "🆓",
        title: "Free & Instant",
        description:
          "No account, no watermarks, and no waiting — results in seconds.",
      },
    ],
  },

  "protect-pdf": {
    toolId: "protect-pdf",
    whatTitle: "What is PDF Password Protection?",
    whatBody:
      "PDF password protection encrypts a PDF file with a password so that only authorised recipients can open and read it. When you protect a PDF, anyone who tries to open it will be prompted to enter the correct password — without it, the document cannot be viewed. This is essential for sensitive documents such as financial statements, medical records, legal contracts, and personal ID scans. QuickPDFTools uses industry-standard AES-256 encryption to protect your PDF. The entire process happens on our secure server, and the file is automatically deleted within 1 hour, ensuring your private documents are never stored longer than necessary.",
    whenTitle: "When Should You Password-Protect a PDF?",
    useCases: [
      {
        icon: "💰",
        title: "Sending financial statements",
        description:
          "Protect bank statements, salary slips, or tax returns before emailing them to an accountant or employer.",
      },
      {
        icon: "🏥",
        title: "Sharing medical records",
        description:
          "Encrypt prescription notes, test results, or insurance documents before sending to healthcare providers.",
      },
      {
        icon: "⚖️",
        title: "Distributing legal contracts",
        description:
          "Add a password to NDAs, agreements, or court documents to control who can access their contents.",
      },
      {
        icon: "🆔",
        title: "Sending ID documents",
        description:
          "Protect scanned copies of passports, driving licences, or Aadhaar cards before sharing online.",
      },
    ],
    stepsTitle: "How to Password-Protect a PDF — Step by Step",
    steps: [
      {
        title: "Upload your PDF",
        description:
          "Select or drag-and-drop the PDF you want to protect. Files up to 100 MB are supported.",
      },
      {
        title: "Enter a strong password",
        description:
          "Choose a password that the intended recipient will know. Use a mix of letters, numbers, and symbols.",
      },
      {
        title: "Click 'Process Files'",
        description:
          "The tool encrypts your PDF with AES-256 encryption in seconds.",
      },
      {
        title: "Download the protected PDF",
        description:
          "Share the protected PDF and communicate the password securely through a separate channel.",
      },
    ],
    faqTitle: "Frequently Asked Questions",
    faqs: [
      {
        question: "Is protecting PDFs free?",
        answer:
          "Yes — completely free with no account and no watermarks on protected files.",
      },
      {
        question: "What encryption standard is used?",
        answer:
          "We use AES-256 encryption — the same standard used by banks and government agencies.",
      },
      {
        question: "Is there a file size limit?",
        answer: "You can protect PDFs up to 100 MB in size.",
      },
      {
        question: "How long are my files stored on the server?",
        answer:
          "Files are automatically deleted from our servers within 1 hour of processing.",
      },
      {
        question: "Does it work on mobile?",
        answer:
          "Yes — works on all modern browsers on mobile, tablet, and desktop.",
      },
    ],
    whyTitle: "Why Use QuickPDFTools to Protect PDFs?",
    benefits: [
      {
        icon: "🔐",
        title: "AES-256 Encryption",
        description:
          "Bank-grade encryption keeps your document accessible only to those who know the password.",
      },
      {
        icon: "🗑️",
        title: "Auto-Delete After 1 Hour",
        description:
          "Files are permanently deleted from our servers within 60 minutes of processing.",
      },
      {
        icon: "🆓",
        title: "Free & No Account Needed",
        description:
          "Protect as many PDFs as you need — always free, always without a signup.",
      },
    ],
  },
};

export default SEO_CONTENT;
