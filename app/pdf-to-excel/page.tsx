'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { FileUp, Download, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface ConversionResult {
  success: boolean;
  fileName?: string;
  rowsExtracted?: number;
  tablesFound?: number;
  processingTime?: number;
  error?: string;
}

export default function PDFToExcelPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

  const validateFile = (file: File): string | null => {
    if (file.type !== 'application/pdf') {
      return 'Please upload a PDF file';
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than 20MB (your file: ${(file.size / 1024 / 1024).toFixed(2)}MB)`;
    }
    return null;
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      setFile(null);
      return;
    }
    setError(null);
    setFile(selectedFile);
    setResult(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleConvert = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 20;
        });
      }, 300);

      const response = await fetch('/api/pdf-to-excel', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Conversion failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `QuickPDFTools-${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Get conversion details from response headers
      const tablesFound = response.headers.get('x-tables-found');
      const rowsExtracted = response.headers.get('x-rows-extracted');
      const processingTime = response.headers.get('x-processing-time');

      setResult({
        success: true,
        fileName: link.download,
        tablesFound: tablesFound ? parseInt(tablesFound) : undefined,
        rowsExtracted: rowsExtracted ? parseInt(rowsExtracted) : undefined,
        processingTime: processingTime ? parseFloat(processingTime) : undefined,
      });

      setTimeout(() => {
        setFile(null);
        setProgress(0);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during conversion');
      setProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              PDF to Excel Converter
            </h1>
            <p className="text-lg text-gray-600">
              Convert PDF tables to editable Excel files instantly. Extract data from any PDF and download as .xlsx
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Upload Area */}
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`p-12 border-2 border-dashed transition-all duration-300 cursor-pointer ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-300 bg-white hover:border-indigo-400'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileInputChange}
                className="hidden"
              />

              <div className="flex flex-col items-center">
                <div className="mb-4">
                  <FileUp
                    size={48}
                    className={`transition-colors ${
                      isDragging ? 'text-indigo-600' : 'text-gray-400'
                    }`}
                  />
                </div>

                {!file ? (
                  <>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Drag your PDF here
                    </h3>
                    <p className="text-gray-600 mb-4">
                      or{' '}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-indigo-600 font-semibold hover:text-indigo-700 underline"
                      >
                        click to browse
                      </button>
                    </p>
                    <p className="text-sm text-gray-500">
                      Maximum file size: 20MB
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {file.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {(file.size / 1024 / 1024).toFixed(2)}MB
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-indigo-600 font-semibold hover:text-indigo-700 underline"
                    >
                      Change file
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mx-12 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="font-semibold text-red-900">Error</h4>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {result?.success && (
              <div className="mx-12 mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="font-semibold text-green-900">
                    Conversion successful!
                  </h4>
                  <p className="text-green-700 text-sm mt-1">
                    {result.tablesFound && `${result.tablesFound} table(s) found`}
                    {result.tablesFound && result.rowsExtracted && ' • '}
                    {result.rowsExtracted && `${result.rowsExtracted} row(s) extracted`}
                    {(result.tablesFound || result.rowsExtracted) && result.processingTime && ' • '}
                    {result.processingTime && `Processed in ${result.processingTime.toFixed(2)}s`}
                  </p>
                </div>
              </div>
            )}

            {/* Progress Bar */}
            {isLoading && progress > 0 && (
              <div className="mx-12 mt-6 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700">
                    Converting...
                  </p>
                  <p className="text-sm text-gray-500">{Math.round(progress)}%</p>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Convert Button */}
            <div className="px-12 py-8 bg-gray-50 flex gap-4">
              <button
                onClick={handleConvert}
                disabled={!file || isLoading}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  !file || isLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:shadow-lg transform hover:scale-105 active:scale-95'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    Convert to Excel
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setFile(null);
                  setError(null);
                  setResult(null);
                  setProgress(0);
                }}
                disabled={!file && !result}
                className={`py-3 px-6 rounded-lg font-semibold transition-all ${
                  !file && !result
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Reset
              </button>
            </div>

            {/* Info Section */}
            <div className="px-12 py-8 bg-white border-t border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4">Features</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  Extract tables from PDF
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  Multi-page support
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  Editable Excel format
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  Instant download
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  No registration required
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  100% Secure
                </li>
              </ul>
            </div>
          </div>

          {/* SEO Description */}
          <div className="mt-12 max-w-3xl mx-auto bg-white rounded-lg p-8 shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              About PDF to Excel Conversion
            </h2>
            <p className="text-gray-600 mb-4">
              Our PDF to Excel converter tool allows you to extract data and tables from PDF documents and convert them into editable Excel spreadsheets. Perfect for data analysis, reporting, and business workflows.
            </p>
            <p className="text-gray-600">
              Simply upload your PDF file, and our advanced algorithm will automatically detect and extract all tables, preserving the structure and formatting. Download the result as an .xlsx file ready for use in Microsoft Excel, Google Sheets, or any spreadsheet application.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
