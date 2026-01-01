export const SITE_NAME = "QuickPDFTools";
export const AUTHOR_NAME = "QuickPDFTools Team";
export const CONTACT_EMAIL = "krishanmohankumar9311@gmail.com";
export const SITE_DESCRIPTION = "Professional PDF Tools - Convert, Merge, Split, Compress PDFs Online for Free";
export const SITE_URL = "https://quickpdftools.in";
export const SITE_KEYWORDS = "pdf tools, convert pdf, merge pdf, split pdf, compress pdf, pdf to word, word to pdf, pdf converter";

export const BRAND_COLORS = {
    primary: "#2563EB",
    secondary: "#1E3A8A",
    background: "#F9FAFB",
    text: "#111827",
    accent: "#3B82F6",
    success: "#10B981",
    error: "#EF4444",
    warning: "#F59E0B",
};

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const ALLOWED_FILE_TYPES = {
    pdf: ["application/pdf"],
    word: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"],
    excel: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel"],
    powerpoint: ["application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/vnd.ms-powerpoint"],
    image: ["image/jpeg", "image/jpg", "image/png"],
};

export const PDF_TOOLS = [

    {
        id: "merge-pdf",
        name: "Merge PDF",
        description: "Combine multiple PDF files into one document",
        icon: "merge",
        path: "/merge-pdf",
        color: "#2563EB",
    },
    {
        id: "split-pdf",
        name: "Split PDF",
        description: "Extract pages from your PDF file",
        icon: "split",
        path: "/split-pdf",
        color: "#7C3AED",
    },
    {
        id: "compress-pdf",
        name: "Compress PDF",
        description: "Reduce PDF file size without losing quality",
        icon: "compress",
        path: "/compress-pdf",
        color: "#DC2626",
    },
    {
        id: "pdf-to-word",
        name: "PDF to Word",
        description: "Convert PDF documents to editable Word files",
        icon: "convert",
        path: "/pdf-to-word",
        color: "#2563EB",
    },
    {
        id: "word-to-pdf",
        name: "Word to PDF",
        description: "Convert Word documents to PDF format",
        icon: "convert",
        path: "/word-to-pdf",
        color: "#059669",
    },
    {
        id: "pdf-to-jpg",
        name: "PDF to JPG",
        description: "Convert PDF pages to JPG images",
        icon: "image",
        path: "/pdf-to-jpg",
        color: "#EA580C",
    },
    {
        id: "jpg-to-pdf",
        name: "JPG to PDF",
        description: "Convert JPG images to PDF documents",
        icon: "image",
        path: "/jpg-to-pdf",
        color: "#0891B2",
    },
    {
        id: "pdf-to-png",
        name: "PDF to PNG",
        description: "Convert PDF pages to PNG images",
        icon: "image",
        path: "/pdf-to-png",
        color: "#7C3AED",
    },
    {
        id: "png-to-pdf",
        name: "PNG to PDF",
        description: "Convert PNG images to PDF documents",
        icon: "image",
        path: "/png-to-pdf",
        color: "#DB2777",
    },
    {
        id: "pdf-to-excel",
        name: "PDF to Excel",
        description: "Convert PDF tables to Excel spreadsheets",
        icon: "convert",
        path: "/pdf-to-excel",
        color: "#059669",
    },
    {
        id: "excel-to-pdf",
        name: "Excel to PDF",
        description: "Convert Excel spreadsheets to PDF",
        icon: "convert",
        path: "/excel-to-pdf",
        color: "#DC2626",
    },
    {
        id: "pdf-to-ppt",
        name: "PDF to PPT",
        description: "Convert PDF to PowerPoint presentation",
        icon: "convert",
        path: "/pdf-to-ppt",
        color: "#EA580C",
    },
    {
        id: "ppt-to-pdf",
        name: "PPT to PDF",
        description: "Convert PowerPoint to PDF format",
        icon: "convert",
        path: "/ppt-to-pdf",
        color: "#2563EB",
    },
    {
        id: "protect-pdf",
        name: "Protect PDF",
        description: "Add password protection to your PDF",
        icon: "lock",
        path: "/protect-pdf",
        color: "#DC2626",
    },
    {
        id: "unlock-pdf",
        name: "Unlock PDF",
        description: "Remove password from protected PDF",
        icon: "unlock",
        path: "/unlock-pdf",
        color: "#059669",
    },
    {
        id: "rotate-pdf",
        name: "Rotate PDF",
        description: "Rotate pages in your PDF document",
        icon: "rotate",
        path: "/rotate-pdf",
        color: "#7C3AED",
    },
    {
        id: "reorder-pdf",
        name: "Reorder PDF",
        description: "Change the order of pages in your PDF",
        icon: "reorder",
        path: "/reorder-pdf",
        color: "#F59E0B",
    },
    {
        id: "edit-pdf",
        name: "Edit PDF",
        description: "Edit text in PDF while preserving fonts and layout",
        icon: "edit",
        path: "/edit-pdf",
        color: "#10B981",
    },
];
