const fs = require('fs');
const path = require('path');

// Create a simple PDF-ready HTML version
const createPDFReadyBrochure = () => {
    console.log('📄 Creating PDF-ready brochure...');

    // Read the original brochure
    const brochurePath = path.join(__dirname, 'netlify-build', 'adonai-farm-brochure.html');
    let brochureContent = fs.readFileSync(brochurePath, 'utf8');

    // Modify for better PDF printing
    const pdfOptimizedCSS = `
        <style>
            @media print {
                * {
                    -webkit-print-color-adjust: exact !important;
                    color-adjust: exact !important;
                }
                
                body {
                    margin: 0;
                    padding: 0;
                    font-size: 12pt;
                    line-height: 1.4;
                }
                
                .cover {
                    height: 100vh;
                    page-break-after: always;
                }
                
                .page {
                    page-break-after: always;
                    min-height: 100vh;
                    padding: 20mm;
                }
                
                .page:last-child {
                    page-break-after: auto;
                }
                
                .service-card, .livestock-card {
                    break-inside: avoid;
                    margin-bottom: 15px;
                }
                
                .services-grid, .livestock-section {
                    display: block;
                }
                
                .service-card, .livestock-card {
                    display: block;
                    width: 100%;
                    margin-bottom: 20px;
                    page-break-inside: avoid;
                }
                
                .livestock-image {
                    max-height: 150px;
                }
                
                .farm-name {
                    font-size: 3rem;
                }
                
                .tagline {
                    font-size: 2rem;
                }
                
                .page-title {
                    font-size: 2rem;
                }
                
                .service-title, .livestock-name {
                    font-size: 1.2rem;
                }
            }
            
            @page {
                size: A4;
                margin: 15mm;
            }
        </style>
    `;

    // Insert the PDF-optimized CSS before the closing </head> tag
    brochureContent = brochureContent.replace('</head>', pdfOptimizedCSS + '</head>');

    // Save the PDF-ready version
    const pdfReadyPath = path.join(__dirname, 'netlify-build', 'adonai-farm-brochure-pdf-ready.html');
    fs.writeFileSync(pdfReadyPath, brochureContent);

    console.log('✅ PDF-ready brochure created!');
    console.log(`📁 Saved to: ${pdfReadyPath}`);

    // Create instructions file
    const instructionsPath = path.join(__dirname, 'PDF-PRINTING-INSTRUCTIONS.md');
    const instructions = `# 📄 How to Create PDF from Adonai Farm Brochure

## Method 1: Browser Print to PDF (Recommended)

1. **Open the brochure file:**
   - Navigate to: \`netlify-build/adonai-farm-brochure-pdf-ready.html\`
   - Open in Chrome, Firefox, or Edge browser

2. **Print to PDF:**
   - Press \`Ctrl+P\` (Windows/Linux) or \`Cmd+P\` (Mac)
   - Select "Save as PDF" as destination
   - Choose these settings:
     - Paper size: A4
     - Margins: Minimum
     - Options: ✅ Background graphics
     - Scale: 100%
   - Click "Save" and choose filename: \`Adonai-Farm-Brochure.pdf\`

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

\`\`\`bash
wkhtmltopdf --page-size A4 --margin-top 15mm --margin-bottom 15mm --margin-left 15mm --margin-right 15mm --enable-local-file-access netlify-build/adonai-farm-brochure-pdf-ready.html Adonai-Farm-Brochure.pdf
\`\`\`

## Expected Result

Your PDF will contain:
- ✅ **Cover Page**: Farm logo, name, and "Quality You Can Trust" tagline
- ✅ **Page 1**: Welcome & Services Overview
- ✅ **Page 2**: Dairy Excellence (cows, heifers, dairy products)
- ✅ **Page 3**: Sheep & Goats (breeding stock, meat production)
- ✅ **Page 4**: Beef Cattle & Agricultural Products
- ✅ **Page 5**: Services & Contact Information

## File Locations

- **HTML for PDF**: \`netlify-build/adonai-farm-brochure-pdf-ready.html\`
- **Original HTML**: \`netlify-build/adonai-farm-brochure.html\`
- **Save PDF as**: \`Adonai-Farm-Brochure.pdf\`

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
`;

    fs.writeFileSync(instructionsPath, instructions);

    console.log('📋 PDF creation instructions saved!');
    console.log(`📁 Instructions: ${instructionsPath}`);

    return {
        pdfReadyFile: pdfReadyPath,
        instructions: instructionsPath
    };
};

// Run the function
if (require.main === module) {
    try {
        const result = createPDFReadyBrochure();

        console.log('\n🌾 ADONAI FARM BROCHURE - PDF READY! 🌾');
        console.log('');
        console.log('✅ PDF-optimized HTML file created');
        console.log('✅ Detailed printing instructions provided');
        console.log('');
        console.log('📄 QUICK START:');
        console.log('1. Open: netlify-build/adonai-farm-brochure-pdf-ready.html');
        console.log('2. Press Ctrl+P (or Cmd+P on Mac)');
        console.log('3. Select "Save as PDF"');
        console.log('4. Enable "Background graphics"');
        console.log('5. Save as "Adonai-Farm-Brochure.pdf"');
        console.log('');
        console.log('🎯 Your professional farm brochure will be ready for printing and distribution!');

    } catch (error) {
        console.error('❌ Error creating PDF-ready brochure:', error);
        process.exit(1);
    }
}

module.exports = createPDFReadyBrochure;