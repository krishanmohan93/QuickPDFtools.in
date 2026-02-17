import { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "./constants";

// Target keywords mapping for each tool
const TOOL_KEYWORDS = {
    "merge-pdf": "merge pdf, combine pdf files, pdf merger, join pdf online, free pdf merger",
    "split-pdf": "split pdf, extract pdf pages, pdf splitter, divide pdf, free pdf splitter",
    "compress-pdf": "compress pdf, reduce pdf size, pdf compressor, optimize pdf, free pdf compressor",
    "pdf-to-word": "pdf to word, convert pdf to docx, pdf converter, free pdf to word",
    "word-to-pdf": "word to pdf, convert docx to pdf, word converter, free word to pdf",
    "pdf-to-jpg": "pdf to jpg, convert pdf to image, pdf to jpeg, free pdf to jpg",
    "jpg-to-pdf": "jpg to pdf, convert image to pdf, jpeg to pdf, free jpg to pdf",
    "pdf-to-png": "pdf to png, convert pdf to image, pdf to transparent, free pdf to png",
    "png-to-pdf": "png to pdf, convert image to pdf, transparent to pdf, free png to pdf",
    "pdf-to-excel": "pdf to excel, convert pdf to xlsx, pdf to spreadsheet, free pdf to excel",
    "excel-to-pdf": "excel to pdf, convert xlsx to pdf, spreadsheet to pdf, free excel to pdf",
    "pdf-to-ppt": "pdf to pptx, pdf to powerpoint, convert pdf to pptx, pdf to presentation, free pdf to pptx",
    "protect-pdf": "protect pdf, password pdf, secure pdf, encrypt pdf, free pdf protector",
    "unlock-pdf": "unlock pdf, remove pdf password, decrypt pdf, free pdf unlocker",
    "rotate-pdf": "rotate pdf, rotate pdf pages, pdf rotator, free pdf rotate",
    "reorder-pdf": "reorder pdf, rearrange pdf pages, pdf page order, free pdf reorder",
    "edit-pdf": "edit pdf, edit pdf online, pdf editor same font, free pdf editor"
};

// Tool descriptions mapping
const TOOL_DESCRIPTIONS = {
    "merge-pdf": "Merge multiple PDF files into one document online. Combine PDFs in the order you choose with a fast, secure PDF merger.",
    "split-pdf": "Split PDF files into separate pages or documents online. Extract specific pages or ranges with a simple PDF splitter.",
    "compress-pdf": "Compress PDF files to reduce size while keeping quality. Optimize your PDFs for sharing and storage online.",
    "pdf-to-word": "Convert PDF files to editable Word documents online for free. Transform PDFs to DOCX format with our PDF to Word converter.",
    "word-to-pdf": "Convert Word documents to PDF format online for free. Transform DOCX files to PDF with our Word to PDF converter.",
    "pdf-to-jpg": "Convert PDF pages to JPG images online for free. Extract images from PDF files with our PDF to JPG converter.",
    "jpg-to-pdf": "Convert JPG images to PDF documents online for free. Create PDFs from JPEG files with our JPG to PDF converter.",
    "pdf-to-png": "Convert PDF pages to PNG images online for free. Extract transparent images from PDF files with our PDF to PNG converter.",
    "png-to-pdf": "Convert PNG images to PDF documents online for free. Create PDFs from transparent images with our PNG to PDF converter.",
    "pdf-to-excel": "Convert PDF tables to Excel spreadsheets online for free. Extract data from PDFs to XLSX format with our PDF to Excel converter.",
    "excel-to-pdf": "Convert Excel spreadsheets to PDF format online for free. Transform XLSX files to PDF with our Excel to PDF converter.",
    "pdf-to-ppt": "Convert PDF files to PowerPoint (PPTX) presentations online for free. Transform PDFs to PPTX format with our PDF to PPTX converter.",
    "protect-pdf": "Add password protection to your PDF files online for free. Secure your PDFs with encryption using our PDF protector tool.",
    "unlock-pdf": "Remove password protection from PDF files online for free. Unlock encrypted PDFs with our PDF unlocker tool.",
    "rotate-pdf": "Rotate PDF pages in any direction online for free. Change PDF page orientation with our PDF rotator tool.",
    "reorder-pdf": "Reorder PDF pages and change page sequence online for free. Rearrange PDF pages with our PDF reorder tool.",
    "edit-pdf": "Edit PDF text while preserving fonts and layout online for free. Modify PDF content with our advanced PDF editor."
};

// Tool titles mapping
const TOOL_TITLES = {
    "merge-pdf": "Merge PDF Online Free - Combine Files Securely",
    "split-pdf": "Split PDF Online Free - Extract Pages Easily",
    "compress-pdf": "Compress PDF Online Free - Reduce File Size",
    "pdf-to-word": "Convert PDF to Word Online - Free PDF to DOCX Converter",
    "word-to-pdf": "Convert Word to PDF Online - Free DOCX to PDF Converter",
    "pdf-to-jpg": "Convert PDF to JPG Online - Free PDF to Image Converter",
    "jpg-to-pdf": "Convert JPG to PDF Online - Free Image to PDF Converter",
    "pdf-to-png": "Convert PDF to PNG Online - Free PDF to Image Converter",
    "png-to-pdf": "Convert PNG to PDF Online - Free Image to PDF Converter",
    "pdf-to-excel": "Convert PDF to Excel Online - Free PDF to XLSX Converter",
    "excel-to-pdf": "Convert Excel to PDF Online - Free XLSX to PDF Converter",
    "pdf-to-ppt": "Convert PDF to PowerPoint Online - Free PDF to PPTX Converter",
    "protect-pdf": "Protect PDF with Password Online - Free PDF Security Tool",
    "unlock-pdf": "Unlock PDF Password Online - Free PDF Decryptor Tool",
    "rotate-pdf": "Rotate PDF Pages Online - Free PDF Rotator Tool",
    "reorder-pdf": "Reorder PDF Pages Online - Free PDF Page Organizer",
    "edit-pdf": "Edit PDF Online - Free PDF Text Editor with Same Font"
};

export function generateToolMetadata(toolId: string): Metadata {
    const baseTitle =
        TOOL_TITLES[toolId as keyof typeof TOOL_TITLES] || "Professional PDF Tools";
    const title = baseTitle.endsWith(`| ${SITE_NAME}`) ? baseTitle : `${baseTitle} | ${SITE_NAME}`;
    const description =
        TOOL_DESCRIPTIONS[toolId as keyof typeof TOOL_DESCRIPTIONS] ||
        "Use professional PDF tools online to convert, merge, split, and compress files with ease.";
    const keywords = TOOL_KEYWORDS[toolId as keyof typeof TOOL_KEYWORDS] || "pdf tools, convert pdf, free pdf tools online";

    return {
        title,
        description,
        keywords,
        openGraph: {
            title,
            description,
            url: `${SITE_URL}/${toolId}`,
            siteName: SITE_NAME,
            type: "website",
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
            title,
            description,
            images: [`${SITE_URL}/logo.png`],
        },
        alternates: {
            canonical: `${SITE_URL}/${toolId}`,
        },
    };
}

export function generateHomeMetadata(): Metadata {
    const title = `Free PDF Tools Online - Edit, Convert & Merge | ${SITE_NAME}`;
    return {
        title,
        description: "QuickPDFTools provides PDF tools online to merge, split, compress, and convert files fast. Secure, free, and easy to use.",
        keywords: "edit pdf online, pdf editor same font, free pdf tools online, compress pdf, merge pdf, pdf converter, split pdf",
        openGraph: {
            title,
            description: "All-in-one PDF tools to edit, convert, merge, split, and compress files online.",
            url: SITE_URL,
            siteName: SITE_NAME,
            type: "website",
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
            title,
            description: "All-in-one PDF tools to edit, convert, merge, split, and compress files online.",
            images: [`${SITE_URL}/logo.png`],
        },
        alternates: {
            canonical: SITE_URL,
        },
    };
}

