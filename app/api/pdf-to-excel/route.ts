import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { PDFDocument } from "pdf-lib";

// Import pdf-parse using require for CommonJS compatibility
const pdfParse = require("pdf-parse");

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        // Try to get file with different possible keys
        let file = formData.get("file0") as File;
        if (!file) {
            file = formData.get("file") as File;
        }

        const extractionMode = formData.get("extractionMode") as string || "tables"; // tables, text

        if (!file) {
            return NextResponse.json(
                { error: "Please upload a PDF file" },
                { status: 400 }
            );
        }

        // Load PDF for validation
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const totalPages = pdfDoc.getPageCount();

        // Extract text from PDF with better error handling
        const pdfBuffer = Buffer.from(arrayBuffer);
        let pdfData;
        let textContent = "";

        try {
            pdfData = await pdfParse(pdfBuffer, {
                max: 0,
                normalizeWhitespace: true,
            });
            textContent = pdfData.text || "";
        } catch (parseError) {
            console.warn("PDF parsing warning:", parseError);
            textContent = `PDF Content (${totalPages} pages)\n\nText extraction failed. This PDF may contain scanned images or complex layouts.`;
            pdfData = {
                text: textContent,
                numpages: totalPages,
            };
        }

        // Create workbook
        const workbook = XLSX.utils.book_new();

        if (extractionMode === "tables") {
            // Try to extract tabular data
            const tables = extractTablesFromText(textContent);

            if (tables.length > 0) {
                // Create separate sheets for each table
                tables.forEach((table, index) => {
                    const worksheet = XLSX.utils.aoa_to_sheet(table);
                    XLSX.utils.book_append_sheet(workbook, worksheet, `Table_${index + 1}`);
                });
            } else {
                // Fallback to text extraction
                const textData = convertTextToRows(textContent);
                const worksheet = XLSX.utils.aoa_to_sheet(textData);
                XLSX.utils.book_append_sheet(workbook, worksheet, "Extracted_Text");
            }
        } else {
            // Simple text extraction
            const textData = convertTextToRows(textContent);
            const worksheet = XLSX.utils.aoa_to_sheet(textData);
            XLSX.utils.book_append_sheet(workbook, worksheet, "PDF_Content");
        }

        // Add metadata sheet
        const metadata = [
            ["Property", "Value"],
            ["Original File", file.name],
            ["Total Pages", totalPages],
            ["Text Pages", pdfData.numpages],
            ["Extraction Mode", extractionMode],
            ["Conversion Date", new Date().toISOString()],
        ];
        const metadataSheet = XLSX.utils.aoa_to_sheet(metadata);
        XLSX.utils.book_append_sheet(workbook, metadataSheet, "Metadata");

        // Generate Excel file
        const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

        // Validate the output
        if (excelBuffer.length < 1000) {
            throw new Error("Generated Excel file is too small or invalid");
        }

        // Return the Excel file
        const response = new NextResponse(new Uint8Array(excelBuffer), {
            status: 200,
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename=${getFileNameWithoutExtension(file.name)}.xlsx`,
                "X-Original-Pages": totalPages.toString(),
                "X-Text-Pages": pdfData.numpages.toString(),
                "X-Extraction-Mode": extractionMode,
            },
        });

        return response;

    } catch (error) {
        console.error("Error converting PDF to Excel:", error);
        return NextResponse.json(
            { error: `Failed to convert PDF to Excel: ${error instanceof Error ? error.message : 'Unknown error'}` },
            { status: 500 }
        );
    }
}

/**
 * Extract tables from text content
 */
function extractTablesFromText(text: string): string[][][] {
    const tables: string[][][] = [];
    const lines = text.split('\n').filter(line => line.trim());

    // Simple table detection (looking for aligned columns)
    let currentTable: string[][] = [];
    let inTable = false;

    for (const line of lines) {
        const trimmed = line.trim();

        // Simple heuristic: if line contains multiple spaces or tabs, might be tabular
        if (trimmed.includes('\t') || (trimmed.split(/\s{2,}/).length > 2)) {
            if (!inTable) {
                inTable = true;
                currentTable = [];
            }

            // Split by tabs or multiple spaces
            const cells = trimmed.split(/\t|\s{2,}/).map(cell => cell.trim()).filter(cell => cell);
            if (cells.length > 1) {
                currentTable.push(cells);
            }
        } else if (inTable && trimmed) {
            // End of table
            if (currentTable.length > 1) {
                tables.push(currentTable);
            }
            currentTable = [];
            inTable = false;
        }
    }

    // Add final table if exists
    if (currentTable.length > 1) {
        tables.push(currentTable);
    }

    return tables;
}

/**
 * Convert text content to Excel rows
 */
function convertTextToRows(text: string): string[][] {
    const rows: string[][] = [];
    const paragraphs = text.split('\n\n').filter(p => p.trim());

    for (const paragraph of paragraphs) {
        const lines = paragraph.split('\n').filter(line => line.trim());

        for (const line of lines) {
            // Try to split into columns if it looks like CSV or tabular data
            if (line.includes(',') && !line.includes(' ')) {
                // Looks like CSV
                rows.push(line.split(',').map(cell => cell.trim()));
            } else if (line.includes('\t')) {
                // Tab-separated
                rows.push(line.split('\t').map(cell => cell.trim()));
            } else {
                // Single cell
                rows.push([line.trim()]);
            }
        }

        // Add empty row between paragraphs
        rows.push([]);
    }

    return rows;
}

/**
 * Get filename without extension
 */
function getFileNameWithoutExtension(filename: string): string {
    return filename.replace(/\.[^/.]+$/, "");
}
