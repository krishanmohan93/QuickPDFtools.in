"use client";

import { useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export default function PythonJupyterToPDFTool() {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        // Validate file type
        const validExtensions = ['.py', '.ipynb'];
        const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();

        if (!validExtensions.includes(fileExtension)) {
            setError('Please upload a Python (.py) or Jupyter Notebook (.ipynb) file');
            return;
        }

        // Validate file size (max 50MB)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (selectedFile.size > maxSize) {
            setError('File size must be less than 50MB');
            return;
        }

        setFile(selectedFile);
        setError(null);
        setDownloadUrl(null);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            const fakeEvent = {
                target: { files: [droppedFile] }
            } as any;
            handleFileSelect(fakeEvent);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const convertToPDF = async () => {
        if (!file) return;

        setIsProcessing(true);
        setProgress(0);
        setError(null);

        try {
            setProgress(10);

            const fileContent = await file.text();
            setProgress(20);

            const sanitizeText = (text: string): string => {
                return text
                    .replace(/→/g, '->')
                    .replace(/←/g, '<-')
                    .replace(/↑/g, '^')
                    .replace(/↓/g, 'v')
                    .replace(/'/g, "'")
                    .replace(/'/g, "'")
                    .replace(/"/g, '"')
                    .replace(/"/g, '"')
                    .replace(/—/g, '--')
                    .replace(/–/g, '-')
                    .replace(/…/g, '...')
                    .replace(/[^\x20-\x7E\t\n\r]/g, '');
            };

            const pdfDoc = await PDFDocument.create();
            const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const courier = await pdfDoc.embedFont(StandardFonts.Courier);
            const courierBold = await pdfDoc.embedFont(StandardFonts.CourierBold);

            const margin = 70;
            const pageWidth = 595;
            const pageHeight = 842;
            const contentWidth = pageWidth - 2 * margin;
            const lineHeight = 20;
            let sectionCounter = 0;

            let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
            let yPosition = pageHeight - margin;

            setProgress(30);

            const checkNewPage = (spaceNeeded: number) => {
                if (yPosition - spaceNeeded < margin + 30) {
                    currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
                    yPosition = pageHeight - margin;
                    return true;
                }
                return false;
            };

            const drawText = (text: string, options: {
                size?: number;
                font?: any;
                color?: any;
                indent?: number;
                bold?: boolean;
                maxWidth?: number;
            } = {}) => {
                const { size = 12, font = helvetica, color = rgb(0, 0, 0), indent = 0, bold = false, maxWidth = contentWidth - indent } = options;
                const actualFont = bold ? helveticaBold : font;

                // Word wrap for long text
                const words = text.split(' ');
                let currentLine = '';
                const lines: string[] = [];

                words.forEach(word => {
                    const testLine = currentLine + (currentLine ? ' ' : '') + word;
                    // Sanitize before measuring to avoid encoding errors
                    const sanitizedTest = sanitizeText(testLine);
                    const textWidth = actualFont.widthOfTextAtSize(sanitizedTest, size);

                    if (textWidth > maxWidth && currentLine) {
                        lines.push(currentLine);
                        currentLine = word;
                    } else {
                        currentLine = testLine;
                    }
                });
                if (currentLine) lines.push(currentLine);

                lines.forEach((line, idx) => {
                    checkNewPage(size + 8);
                    currentPage.drawText(sanitizeText(line), {
                        x: margin + indent,
                        y: yPosition,
                        size: size,
                        font: actualFont,
                        color: color,
                    });
                    yPosition -= size + 8;
                });
            };

            const drawHeading = (text: string, level: number = 1, numbered: boolean = false) => {
                const sizes = [22, 18, 15, 13];
                const size = sizes[level - 1] || 13;
                const topSpace = level === 1 ? 30 : 22;

                checkNewPage(size + topSpace + 15);
                yPosition -= topSpace;

                let displayText = text;
                if (numbered && level === 2) {
                    sectionCounter++;
                    displayText = `Step ${sectionCounter}: ${text}`;
                }

                currentPage.drawText(sanitizeText(displayText), {
                    x: margin,
                    y: yPosition,
                    size: size,
                    font: helveticaBold,
                    color: rgb(0, 0, 0),
                });
                yPosition -= size + 15;
            };

            const drawCodeBlock = (code: string, showLineNumbers: boolean = false) => {
                const lines = code.split('\n');
                const lineSpacing = 16;
                const codeBoxPadding = 20;
                const codeBoxHeight = (lines.length * lineSpacing) + (codeBoxPadding * 2);

                checkNewPage(codeBoxHeight + 20);

                // Draw clean code background
                currentPage.drawRectangle({
                    x: margin - 10,
                    y: yPosition - codeBoxHeight + 10,
                    width: contentWidth + 20,
                    height: codeBoxHeight,
                    color: rgb(0.96, 0.96, 0.97), // Light gray background
                });

                yPosition -= codeBoxPadding;

                lines.forEach((line, index) => {
                    if (yPosition < margin + 20) {
                        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
                        yPosition = pageHeight - margin;
                    }

                    const trimmedLine = line.trim();

                    // Tokenize the line for better syntax highlighting
                    const tokens: Array<{ text: string, color: any, font: any }> = [];
                    let remaining = line;
                    let indentSpaces = line.length - trimmedLine.length;

                    // Add indent spaces
                    if (indentSpaces > 0) {
                        tokens.push({ text: ' '.repeat(indentSpaces), color: rgb(0, 0, 0), font: courier });
                    }

                    // Comments - everything after # is green
                    if (trimmedLine.startsWith('#')) {
                        tokens.push({
                            text: trimmedLine,
                            color: rgb(0.35, 0.65, 0.35), // Green comments
                            font: courier
                        });
                    } else {
                        // Split by strings first to preserve them
                        const stringRegex = /(['"])(?:(?=(\\?))\2.)*?\1/g;
                        const strings: Array<{ text: string, index: number }> = [];
                        let match;

                        while ((match = stringRegex.exec(trimmedLine)) !== null) {
                            strings.push({ text: match[0], index: match.index });
                        }

                        // Keywords to highlight
                        const keywords = ['def', 'class', 'if', 'else', 'elif', 'for', 'while', 'return',
                            'import', 'from', 'as', 'with', 'try', 'except', 'finally',
                            'in', 'not', 'and', 'or', 'is', 'None', 'True', 'False',
                            'break', 'continue', 'pass', 'lambda', 'yield'];

                        const builtins = ['print', 'len', 'range', 'str', 'int', 'float', 'list',
                            'dict', 'set', 'tuple', 'open', 'enumerate', 'zip'];

                        // Process line with syntax highlighting
                        let currentPos = 0;
                        let processedLine = '';

                        // Simple tokenization
                        const words = trimmedLine.split(/(\s+|[(),\[\]{}=+\-*/<>!.])/);

                        for (const word of words) {
                            if (!word) continue;

                            // Check if this position is inside a string
                            const isInString = strings.some(s =>
                                currentPos >= s.index && currentPos < s.index + s.text.length
                            );

                            if (isInString) {
                                // Find the full string
                                const str = strings.find(s => currentPos >= s.index && currentPos < s.index + s.text.length);
                                if (str && currentPos === str.index) {
                                    tokens.push({
                                        text: str.text,
                                        color: rgb(0.8, 0.4, 0.1), // Orange strings
                                        font: courier
                                    });
                                    currentPos += str.text.length;
                                }
                                continue;
                            }

                            // Numbers
                            if (/^\d+\.?\d*$/.test(word)) {
                                tokens.push({
                                    text: word,
                                    color: rgb(0.1, 0.5, 0.8), // Blue numbers
                                    font: courier
                                });
                            }
                            // Keywords
                            else if (keywords.includes(word)) {
                                tokens.push({
                                    text: word,
                                    color: rgb(0.7, 0.1, 0.5), // Purple keywords
                                    font: courierBold
                                });
                            }
                            // Built-in functions
                            else if (builtins.includes(word)) {
                                tokens.push({
                                    text: word,
                                    color: rgb(0.2, 0.4, 0.8), // Blue built-ins
                                    font: courier
                                });
                            }
                            // Functions (word followed by '(')
                            else if (words[words.indexOf(word) + 1] === '(') {
                                tokens.push({
                                    text: word,
                                    color: rgb(0.1, 0.5, 0.6), // Teal functions
                                    font: courier
                                });
                            }
                            // Operators and punctuation
                            else if (/^[(),\[\]{}=+\-*/<>!.:]+$/.test(word)) {
                                tokens.push({
                                    text: word,
                                    color: rgb(0.3, 0.3, 0.3), // Gray operators
                                    font: courier
                                });
                            }
                            // Default text
                            else {
                                tokens.push({
                                    text: word,
                                    color: rgb(0.1, 0.1, 0.2), // Dark gray text
                                    font: courier
                                });
                            }

                            currentPos += word.length;
                        }
                    }

                    // Line number
                    if (showLineNumbers) {
                        currentPage.drawText(`${(index + 1).toString().padStart(3, ' ')} `, {
                            x: margin,
                            y: yPosition,
                            size: 10,
                            font: courier,
                            color: rgb(0.5, 0.5, 0.5),
                        });
                    }

                    // Draw all tokens
                    let xOffset = margin + (showLineNumbers ? 40 : 12);
                    for (const token of tokens) {
                        const displayText = sanitizeText(token.text);
                        if (displayText) {
                            currentPage.drawText(displayText, {
                                x: xOffset,
                                y: yPosition,
                                size: 10,
                                font: token.font,
                                color: token.color,
                            });
                            xOffset += courier.widthOfTextAtSize(displayText, 10);
                        }
                    }

                    yPosition -= lineSpacing;
                });

                yPosition -= 12;
            };

            const drawBullet = (text: string, level: number = 0) => {
                const indent = level * 20;
                const bullet = level === 0 ? '•' : (level === 1 ? '◦' : '▪');

                checkNewPage(18);

                currentPage.drawText(bullet, {
                    x: margin + indent,
                    y: yPosition,
                    size: 12,
                    font: helvetica,
                    color: rgb(0, 0, 0),
                });

                const maxWidth = contentWidth - indent - 18;
                const words = text.split(' ');
                let currentLine = '';
                let lines: string[] = [];

                words.forEach(word => {
                    const testLine = currentLine + (currentLine ? ' ' : '') + word;
                    const textWidth = helvetica.widthOfTextAtSize(sanitizeText(testLine), 12);

                    if (textWidth > maxWidth && currentLine) {
                        lines.push(currentLine);
                        currentLine = word;
                    } else {
                        currentLine = testLine;
                    }
                });
                if (currentLine) lines.push(currentLine);

                lines.forEach((line, idx) => {
                    currentPage.drawText(sanitizeText(line), {
                        x: margin + indent + 18,
                        y: yPosition,
                        size: 12,
                        font: helvetica,
                        color: rgb(0, 0, 0),
                    });

                    if (idx < lines.length - 1) {
                        yPosition -= 15;
                        checkNewPage(15);
                    }
                });

                yPosition -= 18;
            };

            const drawSeparator = () => {
                checkNewPage(20);
                yPosition -= 5;
                currentPage.drawLine({
                    start: { x: margin, y: yPosition },
                    end: { x: pageWidth - margin, y: yPosition },
                    thickness: 0.5,
                    color: rgb(0.85, 0.85, 0.87),
                });
                yPosition -= 15;
            };

            // HEADER - Professional design
            currentPage.drawRectangle({
                x: 0,
                y: pageHeight - 70,
                width: pageWidth,
                height: 70,
                color: rgb(0.98, 0.98, 0.99),
            });

            // Title
            const titleText = file.name.length > 60 ? file.name.substring(0, 57) + '...' : file.name;
            currentPage.drawText(sanitizeText(titleText), {
                x: margin,
                y: pageHeight - 38,
                size: 20,
                font: helveticaBold,
                color: rgb(0, 0, 0),
            });

            // Subtitle with date
            const dateStr = new Date().toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
            currentPage.drawText(`Generated on ${dateStr}`, {
                x: margin,
                y: pageHeight - 55,
                size: 10,
                font: helvetica,
                color: rgb(0.4, 0.4, 0.45),
            });

            yPosition = pageHeight - 95;

            setProgress(40);

            const isJupyter = file.name.endsWith('.ipynb');

            if (isJupyter) {
                const notebook = JSON.parse(fileContent);
                const cells = notebook.cells || [];
                let cellNumber = 1;

                setProgress(50);

                for (let i = 0; i < cells.length; i++) {
                    const cell = cells[i];
                    const cellType = cell.cell_type;
                    const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source;

                    if (!source || source.trim().length === 0) continue;

                    if (cellType === 'markdown') {
                        const lines = source.split('\n');

                        for (const line of lines) {
                            const trimmed = line.trim();

                            if (!trimmed) {
                                yPosition -= 8;
                                continue;
                            }

                            // Headings
                            if (trimmed.startsWith('####')) {
                                drawHeading(trimmed.replace(/^####\s*/, ''), 4, false);
                            } else if (trimmed.startsWith('###')) {
                                drawHeading(trimmed.replace(/^###\s*/, ''), 3, false);
                            } else if (trimmed.startsWith('##')) {
                                drawHeading(trimmed.replace(/^##\s*/, ''), 2, true); // Enable numbering for ## headings
                            } else if (trimmed.startsWith('#')) {
                                drawHeading(trimmed.replace(/^#\s*/, ''), 1, false);
                            }
                            // Bullets
                            else if (trimmed.match(/^[•\-\*]\s+/)) {
                                const indent = line.search(/\S/);
                                const level = Math.floor(indent / 3);
                                const text = trimmed.replace(/^[•\-\*]\s+/, '');
                                drawBullet(text, level);
                            }
                            // Bold text
                            else if (trimmed.match(/^\*\*.+\*\*$/)) {
                                const text = trimmed.replace(/\*\*/g, '');
                                drawText(text, { bold: true, size: 11 });
                            }
                            // Regular paragraph
                            else {
                                drawText(trimmed, { size: 10 });
                            }
                        }
                    } else if (cellType === 'code') {
                        // Code cell label - cleaner design
                        checkNewPage(20);

                        currentPage.drawText(`In [${cellNumber}]:`, {
                            x: margin - 5,
                            y: yPosition,
                            size: 10,
                            font: helveticaBold,
                            color: rgb(0.25, 0.45, 0.65),
                        });

                        yPosition -= 18;

                        drawCodeBlock(source, false);

                        // Outputs
                        if (cell.outputs && cell.outputs.length > 0) {
                            checkNewPage(18);

                            currentPage.drawText(`Out [${cellNumber}]:`, {
                                x: margin - 5,
                                y: yPosition,
                                size: 10,
                                font: helveticaBold,
                                color: rgb(0.65, 0.25, 0.25),
                            });

                            yPosition -= 15;

                            for (const output of cell.outputs.slice(0, 2)) {
                                if (output.text) {
                                    const outputText = Array.isArray(output.text) ? output.text.join('') : output.text;
                                    const outputLines = outputText.split('\n').slice(0, 8);

                                    outputLines.forEach(line => {
                                        checkNewPage(13);
                                        const displayLine = sanitizeText(line.length > 90 ? line.substring(0, 87) + '...' : line);
                                        currentPage.drawText(displayLine, {
                                            x: margin,
                                            y: yPosition,
                                            size: 9,
                                            font: courier,
                                            color: rgb(0.2, 0.2, 0.3),
                                        });
                                        yPosition -= 13;
                                    });
                                } else if (output.data && output.data['image/png']) {
                                    drawText('[Image Output]', { size: 9, color: rgb(0.4, 0.4, 0.5) });
                                } else if (output.name === 'stdout') {
                                    drawText('[Standard Output]', { size: 9, color: rgb(0.4, 0.4, 0.5) });
                                }
                            }
                        }

                        cellNumber++;
                        drawSeparator();
                    }

                    setProgress(50 + (i / cells.length) * 45);
                }
            } else {
                // Python file
                setProgress(50);
                drawHeading('Python Script', 1);
                drawCodeBlock(fileContent, true);
            }

            setProgress(95);

            const pdfBytes = await pdfDoc.save();
            setProgress(100);

            const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setDownloadUrl(url);

        } catch (err) {
            console.error('Conversion error:', err);
            setError('Failed to convert file. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (!downloadUrl) return;
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = file ? file.name.replace(/\.(py|ipynb)$/, '.pdf') : 'converted.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleReset = () => {
        setFile(null);
        setDownloadUrl(null);
        setProgress(0);
        setError(null);
        setIsProcessing(false);
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-purple-100">
                {!file && !downloadUrl && (
                    <div
                        className="border-4 border-dashed border-purple-300 rounded-xl p-12 text-center hover:border-purple-500 transition-all cursor-pointer bg-purple-50/30"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onClick={() => document.getElementById('file-input')?.click()}
                    >
                        <div className="mb-6">
                            <svg
                                className="mx-auto h-16 w-16 text-purple-400"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 48 48"
                                aria-hidden="true"
                            >
                                <path
                                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                        <div className="text-xl font-semibold text-gray-700 mb-2">
                            Drop your file here or click to browse
                        </div>
                        <p className="text-gray-500 mb-4">
                            Supports: .py (Python) and .ipynb (Jupyter Notebook)
                        </p>
                        <p className="text-sm text-gray-400">
                            Maximum file size: 50MB
                        </p>
                        <input
                            id="file-input"
                            type="file"
                            accept=".py,.ipynb"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-3">
                            <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="text-red-700 font-medium">{error}</span>
                        </div>
                    </div>
                )}

                {file && !downloadUrl && (
                    <>
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 mb-6 border-2 border-purple-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">{file.name}</div>
                                        <div className="text-sm text-gray-500">{formatFileSize(file.size)}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleReset}
                                    className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                                    title="Remove file"
                                >
                                    <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>

                            {isProcessing && (
                                <div className="mt-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">Converting to PDF...</span>
                                        <span className="text-sm font-bold text-purple-600">{progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full transition-all duration-300 rounded-full"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {!isProcessing && (
                            <button
                                onClick={convertToPDF}
                                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xl font-bold py-6 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                🚀 Convert to PDF
                            </button>
                        )}
                    </>
                )}

                {downloadUrl && (
                    <div className="text-center py-8">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Conversion Complete!</h3>
                        <p className="text-gray-600 mb-6">Your PDF is ready to download</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={handleDownload}
                                className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                📥 Download PDF
                            </button>
                            <button
                                onClick={handleReset}
                                className="px-8 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300"
                            >
                                Convert Another File
                            </button>
                        </div>
                    </div>
                )}

                {/* Info Box */}
                <div className="mt-8 bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                    <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        How It Works
                    </h3>
                    <ul className="space-y-2 text-blue-800 text-sm">
                        <li>✓ Upload your Python (.py) or Jupyter Notebook (.ipynb) file</li>
                        <li>✓ Our tool processes and formats your code with syntax highlighting</li>
                        <li>✓ For Jupyter notebooks, all outputs and visualizations are preserved</li>
                        <li>✓ Download your professionally formatted PDF</li>
                        <li>✓ Files are automatically deleted after processing for your privacy</li>
                    </ul>
                </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-gray-100">
                    <div className="text-4xl mb-3">🔒</div>
                    <h4 className="font-semibold text-gray-900 mb-2">Secure</h4>
                    <p className="text-sm text-gray-600">
                        Files encrypted and auto-deleted after conversion
                    </p>
                </div>
                <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-gray-100">
                    <div className="text-4xl mb-3">⚡</div>
                    <h4 className="font-semibold text-gray-900 mb-2">Fast</h4>
                    <p className="text-sm text-gray-600">
                        Convert files in seconds with optimized processing
                    </p>
                </div>
                <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-gray-100">
                    <div className="text-4xl mb-3">🆓</div>
                    <h4 className="font-semibold text-gray-900 mb-2">Free</h4>
                    <p className="text-sm text-gray-600">
                        No registration or payment required
                    </p>
                </div>
            </div>
        </div>
    );
}
