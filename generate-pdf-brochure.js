const fs = require('fs');
const path = require('path');

// Create a simple PDF generation script
const generatePDFBrochure = async () => {
    try {
        // Check if puppeteer is available
        let puppeteer;
        try {
            puppeteer = require('puppeteer');
        } catch (error) {
            console.log('Puppeteer not available, installing...');
            const { execSync } = require('child_process');
            execSync('npm install puppeteer', { stdio: 'inherit' });
            puppeteer = require('puppeteer');
        }

        console.log('🚀 Starting PDF generation...');

        // Launch browser
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // Set page size to A4
        await page.setViewport({ width: 1200, height: 1600 });

        // Load the brochure HTML file
        const brochurePath = path.join(__dirname, 'netlify-build', 'adonai-farm-brochure.html');
        const brochureUrl = `file://${brochurePath}`;

        console.log('📄 Loading brochure HTML...');
        await page.goto(brochureUrl, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        // Wait for images to load
        await page.waitForTimeout(3000);

        console.log('🖨️ Generating PDF...');

        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0.5in',
                right: '0.5in',
                bottom: '0.5in',
                left: '0.5in'
            },
            displayHeaderFooter: false,
            preferCSSPageSize: true
        });

        // Save PDF
        const outputPath = path.join(__dirname, 'Adonai-Farm-Brochure.pdf');
        fs.writeFileSync(outputPath, pdfBuffer);

        console.log('✅ PDF generated successfully!');
        console.log(`📁 Saved to: ${outputPath}`);

        // Also save to netlify-build directory
        const netlifyOutputPath = path.join(__dirname, 'netlify-build', 'Adonai-Farm-Brochure.pdf');
        fs.writeFileSync(netlifyOutputPath, pdfBuffer);
        console.log(`📁 Also saved to: ${netlifyOutputPath}`);

        await browser.close();

        // Get file size
        const stats = fs.statSync(outputPath);
        const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

        console.log(`📊 PDF size: ${fileSizeInMB} MB`);
        console.log('🎉 Brochure PDF is ready for distribution!');

        return outputPath;

    } catch (error) {
        console.error('❌ Error generating PDF:', error);
        throw error;
    }
};

// Run the function
if (require.main === module) {
    generatePDFBrochure()
        .then((pdfPath) => {
            console.log('\n🌾 ADONAI FARM BROCHURE PDF READY! 🌾');
            console.log('Your professional farm brochure is ready for:');
            console.log('• Physical printing and distribution');
            console.log('• Email marketing campaigns');
            console.log('• Digital sharing on social media');
            console.log('• Professional presentations');
            console.log(`\n📄 PDF Location: ${pdfPath}`);
        })
        .catch((error) => {
            console.error('Failed to generate PDF:', error);
            process.exit(1);
        });
}

module.exports = generatePDFBrochure;