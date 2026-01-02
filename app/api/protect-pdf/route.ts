import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file0") as File;
        const action = formData.get("action") as string || "protect"; // "protect" or "unlock"

        if (!file) {
            return NextResponse.json(
                { error: "Please upload a PDF file" },
                { status: 400 }
            );
        }

        // Load the PDF
        const arrayBuffer = await file.arrayBuffer();

        // PDF encryption/decryption requires additional libraries
        // This implementation provides informative errors
        if (action === "unlock") {
            return NextResponse.json(
                {
                    error: "PDF unlocking requires additional PDF processing libraries",
                    suggestion: "Consider using server-side PDF libraries like PDFBox or PyPDF2 for password removal",
                    note: "This version only handles non-encrypted PDFs"
                },
                { status: 501 }
            );
        } else {
            // PDF encryption is not fully supported in this version of pdf-lib
            // Return informative error
            return NextResponse.json(
                {
                    error: "PDF password protection requires additional PDF processing libraries",
                    suggestion: "Consider using server-side PDF libraries like PDFBox, PyPDF2, or commercial APIs for full encryption support",
                    alternative: "You can unlock password-protected PDFs using the unlock action"
                },
                { status: 501 }
            );
        }

    } catch (error) {
        console.error("Error processing PDF protection:", error);
        return NextResponse.json(
            { error: `Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}` },
            { status: 500 }
        );
    }
}

/**
 * Parse permission string into pdf-lib permission flags
 */
function parsePermissions(permissionStr: string) {
    const permissions: any = {};

    if (!permissionStr) {
        return permissions;
    }

    const permissionList = permissionStr.split(',').map(p => p.trim().toLowerCase());

    // Default permissions (when not specified, some are allowed)
    permissions.printing = permissionList.includes('print') ? 'highResolution' : 'lowResolution';
    permissions.modifying = permissionList.includes('modify');
    permissions.copying = permissionList.includes('copy');
    permissions.annotating = permissionList.includes('annotate');
    permissions.fillingForms = permissionList.includes('fill');
    permissions.contentAccessibility = permissionList.includes('accessibility');
    permissions.documentAssembly = permissionList.includes('assemble');

    return permissions;
}

/**
 * Get filename without extension
 */
function getFileNameWithoutExtension(filename: string): string {
    return filename.replace(/\.[^/.]+$/, "");
}

