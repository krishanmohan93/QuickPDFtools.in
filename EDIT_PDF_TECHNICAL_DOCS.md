# Edit PDF Feature - Technical Documentation

## Overview

The Edit PDF tool allows users to modify text directly within PDF documents while preserving original fonts, sizes, colors, and layouts. This is one of the most technically challenging PDF operations, requiring deep understanding of PDF internals.

## Architecture

### Core Components

1. **EditPDFTool.tsx** - Main React component
2. **route.ts** (/api/edit-pdf) - Server-side processing API
3. **PDF.js** - Rendering and text extraction
4. **pdf-lib** - PDF modification and export
5. **Tesseract.js** - OCR for scanned PDFs

### Technology Stack

```
Frontend:
- React 19 with hooks
- PDF.js for rendering
- TypeScript for type safety
- Tailwind CSS for styling

Backend:
- Next.js API routes
- pdf-lib for PDF manipulation
- Node.js File System API

OCR:
- Tesseract.js for text recognition
- Canvas API for image processing
```

## Key Technical Challenges & Solutions

### 1. Text Detection with Coordinate Mapping

**Challenge:** PDF coordinate system has origin at bottom-left, but browser canvas has origin at top-left.

**Solution:**
```typescript
// Convert PDF coordinates to canvas coordinates
const x = transform[4];
const y = viewport.height - transform[5]; // Flip Y coordinate

// Convert back for export
const pdfY = height - (item.y / scale) - (item.fontSize / scale);
```

### 2. Font Preservation

**Challenge:** PDFs use embedded fonts that may not be available in the browser.

**Solution:**
- Extract font metadata from PDF
- Map to closest Standard PDF fonts
- Embed fonts during export
- Support font weight/style detection

```typescript
const selectFont = (fontName: string, fontWeight: string) => {
  const lowerName = fontName.toLowerCase();
  const isBold = fontWeight === 'bold' || lowerName.includes('bold');

  if (lowerName.includes('helvetica') || lowerName.includes('arial')) {
    return isBold ? helveticaBoldFont : helveticaFont;
  }
  // ... more font mapping logic
};
```

### 3. Inline Editing with Pixel-Perfect Positioning

**Challenge:** Overlay editable divs precisely on top of PDF text.

**Solution:**
- Use absolute positioning with transform data
- Implement contentEditable divs
- Match font size, color, and spacing exactly
- Handle zoom and scale transformations

```typescript
<div
  contentEditable
  style={{
    left: `${item.x}px`,
    top: `${item.y}px`,
    fontSize: `${item.fontSize}px`,
    color: item.color,
    // ... precise positioning
  }}
/>
```

### 4. PDF Content Stream Modification

**Challenge:** Modify PDF content while maintaining structure integrity.

**Solution:**
1. Load original PDF bytes
2. Draw white rectangles over original text
3. Draw new text at exact coordinates
4. Save with proper compression

```typescript
// Cover original text
page.drawRectangle({
  x: pdfX - 2,
  y: pdfY - 2,
  width: (item.width / scale) + 4,
  height: (item.fontSize / scale) + 4,
  color: rgb(1, 1, 1), // White
});

// Draw new text
page.drawText(item.text, {
  x: pdfX,
  y: pdfY,
  size: item.fontSize / scale,
  font: font,
  color: textColor,
});
```

### 5. Handling Scanned PDFs

**Challenge:** Scanned PDFs contain images, not text objects.

**Solution:**
- Detect absence of text content
- Perform OCR using Tesseract.js
- Create text overlays from OCR results
- Allow editing of recognized text

```typescript
const performOCR = async (page, viewport, pageNum) => {
  const canvas = document.createElement('canvas');
  // Render page to canvas
  const imageData = canvas.toDataURL('image/png');
  
  // Run OCR
  const result = await Tesseract.recognize(imageData, 'eng');
  
  // Convert OCR words to editable text items
  result.data.words.forEach((word) => {
    // Create text item with bounding box coordinates
  });
};
```

## Data Structures

### TextItem Interface

```typescript
interface TextItem {
  id: string;              // Unique identifier
  text: string;            // Current text content
  x: number;               // X coordinate (canvas space)
  y: number;               // Y coordinate (canvas space)
  width: number;           // Text width in pixels
  height: number;          // Text height in pixels
  fontName: string;        // PDF font name
  fontSize: number;        // Font size (scaled)
  fontWeight: string;      // normal | bold
  fontStyle: string;       // normal | italic
  color: string;           // Hex color code
  transform: number[];     // PDF transform matrix
  pageNumber: number;      // Page index
  originalText: string;    // Original text for comparison
}
```

### History State (Undo/Redo)

```typescript
interface HistoryState {
  textItems: TextItem[];   // Snapshot of all text items
  timestamp: number;       // When state was saved
}
```

## API Endpoints

### POST /api/edit-pdf

Performs server-side PDF editing with advanced font embedding.

**Request:**
```json
{
  "pdfBase64": "base64EncodedPDFString",
  "edits": [
    {
      "text": "Updated text",
      "x": 100,
      "y": 200,
      "fontSize": 12,
      "fontName": "Helvetica",
      "color": "#000000",
      "pageNumber": 1
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "pdfBase64": "editedPDFBase64String"
}
```

## User Features

### Implemented

✅ PDF upload and rendering  
✅ Text detection with font extraction  
✅ Click-to-edit inline editing  
✅ Font preservation (family, size, color)  
✅ Multi-page support  
✅ Zoom in/out  
✅ Undo/Redo (unlimited history)  
✅ OCR for scanned PDFs  
✅ Keyboard shortcuts  
✅ Export to PDF  

### Keyboard Shortcuts

- `Ctrl/Cmd + Z` - Undo
- `Ctrl/Cmd + Y` - Redo
- `Ctrl/Cmd + Shift + Z` - Redo (alternative)
- `Escape` - Deselect current text

## Edge Cases Handled

1. **Multi-column layouts** - Each text item positioned independently
2. **Mixed fonts in line** - Individual text items with separate fonts
3. **Scanned PDFs** - OCR fallback with Tesseract
4. **Rotated text** - Transform matrix preserved
5. **Colored text** - RGB color extraction and conversion
6. **Large PDFs** - Streaming and lazy loading
7. **Font weight variations** - Bold/italic detection from font names
8. **Zoom levels** - Coordinate scaling maintained

## Performance Optimizations

1. **Lazy page rendering** - Only render current page
2. **Font caching** - Embed fonts once per export
3. **Batch processing** - Group edits by page
4. **Canvas reuse** - Single canvas element
5. **History snapshots** - Deep cloning only on commit

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (limited)

## File Size Limits

- Maximum PDF size: 50MB
- Recommended: Under 10MB for best performance
- OCR: Best with high-resolution scans (300+ DPI)

## Known Limitations

1. **Complex fonts** - Custom embedded fonts map to standard fonts
2. **Vector graphics** - Only text editing supported
3. **Form fields** - Not editable (static text only)
4. **Encryption** - Password-protected PDFs not supported
5. **Annotations** - Preserved but not editable

## Testing Checklist

### Functional Tests

- [ ] Upload PDF and render first page
- [ ] Click on text to select
- [ ] Edit text inline
- [ ] Verify font size maintained
- [ ] Verify color maintained
- [ ] Download edited PDF
- [ ] Open in Adobe Reader
- [ ] Verify layout identical
- [ ] Test multi-page navigation
- [ ] Test undo/redo
- [ ] Test zoom in/out
- [ ] Test scanned PDF with OCR
- [ ] Test keyboard shortcuts

### Edge Case Tests

- [ ] Very long text
- [ ] Special characters (é, ñ, ü)
- [ ] Multiple fonts on page
- [ ] Rotated pages
- [ ] Large file (20MB+)
- [ ] PDF with images
- [ ] PDF with tables

## Deployment

### Environment Variables

None required - fully client-side processing.

### Build Command

```bash
npm run build
```

### Production Considerations

1. Enable CDN for PDF.js worker
2. Implement file size validation
3. Add rate limiting for API routes
4. Monitor memory usage
5. Add error tracking (Sentry)

## Future Enhancements

### Planned Features

- [ ] Custom font upload
- [ ] Text formatting toolbar (bold, italic)
- [ ] Text color picker
- [ ] Font size adjuster
- [ ] Multi-text selection
- [ ] Copy/paste text blocks
- [ ] Search and replace
- [ ] Text alignment tools
- [ ] Line spacing control
- [ ] Paragraph editing

### Advanced Features

- [ ] Vector graphics editing
- [ ] Form field editing
- [ ] Annotation support
- [ ] Digital signatures
- [ ] Collaborative editing
- [ ] Version history
- [ ] Cloud storage integration

## Debugging Tips

### Common Issues

**Text not detected:**
- Check if PDF is scanned (use OCR)
- Verify PDF.js worker loaded
- Check console for errors

**Wrong positioning:**
- Verify scale factor consistency
- Check coordinate transformation
- Ensure viewport matches canvas

**Font mismatch:**
- Review font mapping logic
- Check available standard fonts
- Add custom font embedding

**Export fails:**
- Verify pdf-lib version compatibility
- Check for circular references
- Validate text item data

### Debug Mode

Enable detailed logging:
```typescript
console.log('PDF loaded:', pdfDoc);
console.log('Text items detected:', textItems);
console.log('Font cache:', fontCache);
```

## Contributing

When modifying this feature:

1. Maintain coordinate system consistency
2. Test with various PDF types
3. Verify Adobe Reader compatibility
4. Update this documentation
5. Add unit tests for new functions

## References

- [PDF.js Documentation](https://mozilla.github.io/pdf.js/)
- [pdf-lib Documentation](https://pdf-lib.js.org/)
- [PDF Reference 1.7](https://www.adobe.com/content/dam/acom/en/devnet/pdf/pdfs/PDF32000_2008.pdf)
- [Tesseract.js](https://tesseract.projectnaptha.com/)

---

**Last Updated:** December 2025  
**Version:** 1.0.0  
**Maintainer:** PDFMasterTools Team
