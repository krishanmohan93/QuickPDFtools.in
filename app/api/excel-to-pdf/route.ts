import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import * as XLSX from "xlsx";

// Import pdfkit using require for CommonJS compatibility
const PDFKit = require("pdfkit");

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file0") as File;

        if (!file) {
            return NextResponse.json(
                { error: "Please upload an Excel file" },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-excel', // .xls
            'application/vnd.ms-excel.sheet.macroEnabled.12', // .xlsm
        ];

        if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|xlsm)$/i)) {
            return NextResponse.json(
                { error: "Please upload a valid Excel file (.xls or .xlsx)" },
                { status: 400 }
            );
        }

        // Read file content
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Parse Excel file
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetNames = workbook.SheetNames;

        if (sheetNames.length === 0) {
            throw new Error("No worksheets found in the Excel file");
        }

        // Create PDF from Excel data
        const pdfBuffer = await createPDFFromExcel(workbook, getFileNameWithoutExtension(file.name));

        // Validate the output
        if (pdfBuffer.length < 1000) {
            throw new Error("Generated PDF is too small or invalid");
        }

        // Verify PDF can be loaded back
        try {
            await PDFDocument.load(pdfBuffer);
        } catch (validationError) {
            throw new Error("Generated PDF is corrupted and cannot be validated");
        }

        // Return the PDF
        const response = new NextResponse(new Uint8Array(pdfBuffer), {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename=${getFileNameWithoutExtension(file.name)}.pdf`,
                "X-Original-Format": file.type,
                "X-Sheets-Count": sheetNames.length.toString(),
                "X-Conversion-Type": "excel-to-pdf",
            },
        });

        return response;

    } catch (error) {
        console.error("Error converting Excel to PDF:", error);
        return NextResponse.json(
            { error: `Failed to convert Excel to PDF: ${error instanceof Error ? error.message : 'Unknown error'}` },
            { status: 500 }
        );
    }
}

/**
 * Create PDF from Excel workbook using PDFKit
 */
function createPDFFromExcel(workbook: XLSX.WorkBook, title: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFKit({
                size: 'A4',
                margin: 50,
                bufferPages: true,
            });

            const buffers: Buffer[] = [];

            doc.on('data', (chunk: Buffer) => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            // Add title
            doc.fontSize(24).font('Helvetica-Bold').text(title, { align: 'center' });
            doc.moveDown(2);

            // Add metadata
            doc.fontSize(12).font('Helvetica').text(`Converted from Excel spreadsheet`, { align: 'center' });
            doc.text(`Sheets: ${workbook.SheetNames.join(', ')}`, { align: 'center' });
            doc.text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
            doc.moveDown(2);

            // Process each worksheet
            for (let sheetIndex = 0; sheetIndex < workbook.SheetNames.length; sheetIndex++) {
                const sheetName = workbook.SheetNames[sheetIndex];
                const worksheet = workbook.Sheets[sheetName];

                // Add sheet title
                if (sheetIndex > 0) {
                    doc.addPage();
                }

                doc.fontSize(18).font('Helvetica-Bold').text(`Sheet: ${sheetName}`, { underline: true });
                doc.moveDown(1);

                // Convert sheet to JSON
                const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                    header: 1,
                    defval: '',
                    blankrows: false
                }) as any[][];

                if (jsonData.length === 0) {
                    doc.fontSize(12).font('Helvetica').text('(Empty sheet)');
                    continue;
                }

                // Calculate column widths
                const maxCols = Math.max(...jsonData.map(row => row.length));
                const colWidth = Math.max(80, (doc.page.width - 100) / maxCols);

                // Create table header
                doc.fontSize(10).font('Helvetica-Bold');
                const headerRow = jsonData[0] || [];
                for (let col = 0; col < maxCols; col++) {
                    const cellText = (headerRow[col] || `Column ${col + 1}`).toString();
                    const x = 50 + (col * colWidth);
                    doc.text(cellText.substring(0, 15), x, doc.y, { width: colWidth - 5 });
                }
                doc.moveDown(0.8);

                // Draw header separator line
                doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
                doc.moveDown(0.5);

                // Add data rows
                doc.fontSize(9).font('Helvetica');
                for (let row = 1; row < jsonData.length; row++) {
                    const dataRow = jsonData[row];

                    // Check if we need a new page
                    if (doc.y > doc.page.height - 100) {
                        doc.addPage();
                        doc.fontSize(10).font('Helvetica-Bold').text(`Sheet: ${sheetName} (continued)`, { underline: true });
                        doc.moveDown(1);
                        doc.fontSize(9).font('Helvetica');
                    }

                    for (let col = 0; col < maxCols; col++) {
                        const cellText = (dataRow[col] || '').toString();
                        const x = 50 + (col * colWidth);
                        doc.text(cellText.substring(0, 20), x, doc.y, { width: colWidth - 5 });
                    }
                    doc.moveDown(0.7);
                }

                doc.moveDown(2);
            }

            // Add footer with page numbers
            const totalPages = doc.bufferedPageRange().count;
            for (let i = 0; i < totalPages; i++) {
                doc.switchToPage(i);
                doc.fontSize(8).text(
                    `Page ${i + 1} of ${totalPages}`,
                    50,
                    doc.page.height - 50,
                    { align: 'center' }
                );
            }

            doc.end();

        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Get filename without extension
 */
function getFileNameWithoutExtension(filename: string): string {
    return filename.replace(/\.[^/.]+$/, "");
}
