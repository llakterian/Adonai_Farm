# 📄 How to Create PDF from Adonai Farm Brochure

## Method 1: Browser Print to PDF (Recommended)

1. **Open the brochure file:**
   - Navigate to: `netlify-build/adonai-farm-brochure-pdf-ready.html`
   - Open in Chrome, Firefox, or Edge browser

2. **Print to PDF:**
   - Press `Ctrl+P` (Windows/Linux) or `Cmd+P` (Mac)
   - Select "Save as PDF" as destination
   - Choose these settings:
     - Paper size: A4
     - Margins: Minimum
     - Options: ✅ Background graphics
     - Scale: 100%
   - Click "Save" and choose filename: `Adonai-Farm-Brochure.pdf`

## Method 2: Online HTML to PDF Converter

1. **Upload the HTML file to any of these services:**
   - https://www.ilovepdf.com/html-to-pdf
   - https://htmlpdfapi.com/
   - https://pdfshift.com/
   - https://www.sejda.com/html-to-pdf

2. **Settings to use:**
   - Page size: A4
   - Orientation: Portrait
   - Margins: Small (10-15mm)
   - Background: Include

## Method 3: Using wkhtmltopdf (Command Line)

If you have wkhtmltopdf installed:

```bash
wkhtmltopdf --page-size A4 --margin-top 15mm --margin-bottom 15mm --margin-left 15mm --margin-right 15mm --enable-local-file-access netlify-build/adonai-farm-brochure-pdf-ready.html Adonai-Farm-Brochure.pdf
```

## Expected Result

Your PDF will contain:
- ✅ **Cover Page**: Farm logo, name, and "Quality You Can Trust" tagline
- ✅ **Page 1**: Welcome & Services Overview
- ✅ **Page 2**: Dairy Excellence (cows, heifers, dairy products)
- ✅ **Page 3**: Sheep & Goats (breeding stock, meat production)
- ✅ **Page 4**: Beef Cattle & Agricultural Products
- ✅ **Page 5**: Services & Contact Information

## File Locations

- **HTML for PDF**: `netlify-build/adonai-farm-brochure-pdf-ready.html`
- **Original HTML**: `netlify-build/adonai-farm-brochure.html`
- **Save PDF as**: `Adonai-Farm-Brochure.pdf`

## Tips for Best Results

1. **Use Chrome or Edge** for best PDF output
2. **Enable background graphics** to include colors and images
3. **Use A4 paper size** for standard printing
4. **Set margins to minimum** for full-page design
5. **Check "More settings"** and enable background graphics

Your professional farm brochure will be ready for:
- 📄 Physical printing and distribution
- 📧 Email marketing campaigns  
- 📱 Digital sharing on social media
- 🏢 Professional presentations

## Quality Assurance

The PDF should be approximately:
- **Size**: 5-15 MB (depending on image compression)
- **Pages**: 5 pages total
- **Quality**: High-resolution images and text
- **Colors**: Full-color agricultural green theme
- **Fonts**: Professional, readable typography

---

*Created for Adonai Farm - Quality You Can Trust* 🌾
