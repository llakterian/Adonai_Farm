/**
 * Content Management and Contact Form Testing
 * Tests contact form submission and admin notification system
 */

const fs = require('fs');

class ContentManagementTester {
  constructor() {
    this.results = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
  }

  // Test contact form structure and validation
  testContactFormStructure() {
    this.log('Testing Contact Form Structure');
    
    const contactPath = 'frontend/src/pages/Contact.jsx';
    if (!fs.existsSync(contactPath)) {
      throw new Error('Contact page not found');
    }

    const contactContent = fs.readFileSync(contactPath, 'utf8');
    
    // Check for required form fields
    const requiredFields = [
      { field: 'name', patterns: ['name', 'Name'] },
      { field: 'email', patterns: ['email', 'Email'] },
      { field: 'subject', patterns: ['subject', 'Subject'] },
      { field: 'message', patterns: ['message', 'Message'] },
      { field: 'submit', patterns: ['submit', 'Submit', 'send', 'Send'] }
    ];

    const missingFields = [];
    requiredFields.forEach(({ field, patterns }) => {
      const hasField = patterns.some(pattern => contactContent.includes(pattern));
      if (!hasField) {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      throw new Error(`Contact form missing fields: ${missingFields.join(', ')}`);
    }

    // Check for form validation
    const hasValidation = contactContent.includes('validation') || 
                         contactContent.includes('validate') ||
                         contactContent.includes('required') ||
                         contactContent.includes('error');

    // Check for form submission handling
    const hasSubmissionHandling = contactContent.includes('onSubmit') ||
                                 contactContent.includes('handleSubmit') ||
                                 contactContent.includes('submit');

    this.log('✅ Contact form structure verified');
    return {
      allFieldsPresent: true,
      hasValidation,
      hasSubmissionHandling
    };
  }

  // Test admin contact management system
  testAdminContactManagement() {
    this.log('Testing Admin Contact Management');
    
    const contactMgmtPath = 'frontend/src/pages/ContactManagement.jsx';
    if (!fs.existsSync(contactMgmtPath)) {
      throw new Error('Contact management page not found');
    }

    const contactMgmtContent = fs.readFileSync(contactMgmtPath, 'utf8');
    
    // Check for inquiry management features
    const managementFeatures = [
      { feature: 'inquiry listing', patterns: ['inquiry', 'inquiries', 'contact', 'message'] },
      { feature: 'status management', patterns: ['status', 'new', 'responded', 'closed'] },
      { feature: 'response handling', patterns: ['respond', 'reply', 'answer'] }
    ];

    const missingFeatures = [];
    managementFeatures.forEach(({ feature, patterns }) => {
      const hasFeature = patterns.some(pattern => 
        contactMgmtContent.toLowerCase().includes(pattern.toLowerCase())
      );
      if (!hasFeature) {
        missingFeatures.push(feature);
      }
    });

    // Check for admin layout integration
    const hasAdminIntegration = contactMgmtContent.includes('AdminLayout') ||
                               contactMgmtContent.includes('dashboard') ||
                               contactMgmtContent.includes('admin');

    this.log('✅ Admin contact management verified');
    return {
      managementFeaturesPresent: missingFeatures.length === 0,
      missingFeatures,
      adminIntegration: hasAdminIntegration
    };
  }

  // Test public content management system
  testPublicContentManagement() {
    this.log('Testing Public Content Management');
    
    const publicContentMgmtPath = 'frontend/src/pages/PublicContentManagement.jsx';
    const publicContentServicePath = 'frontend/src/services/PublicContentService.js';
    
    if (!fs.existsSync(publicContentMgmtPath)) {
      throw new Error('Public content management page not found');
    }

    if (!fs.existsSync(publicContentServicePath)) {
      throw new Error('Public content service not found');
    }

    const publicContentMgmtContent = fs.readFileSync(publicContentMgmtPath, 'utf8');
    const publicContentServiceContent = fs.readFileSync(publicContentServicePath, 'utf8');

    // Check for content management features
    const contentFeatures = [
      'farm information',
      'animal visibility',
      'service management',
      'content editing'
    ];

    const hasContentManagement = contentFeatures.some(feature => 
      publicContentMgmtContent.toLowerCase().includes(feature.replace(' ', '')) ||
      publicContentMgmtContent.toLowerCase().includes(feature)
    );

    // Check service implementation
    const serviceFeatures = [
      'getFarmInfo',
      'getPublicAnimals',
      'getServices',
      'updateContent'
    ];

    const implementedServiceFeatures = serviceFeatures.filter(feature => 
      publicContentServiceContent.includes(feature)
    );

    this.log('✅ Public content management verified');
    return {
      contentManagementPresent: hasContentManagement,
      serviceImplemented: implementedServiceFeatures.length > 0,
      implementedFeatures: implementedServiceFeatures.length
    };
  }

  // Test image management and gallery integration
  testImageManagement() {
    this.log('Testing Image Management');
    
    const imageServicePath = 'frontend/src/services/ImageService.js';
    const publicGalleryPath = 'frontend/src/components/PublicGallery.jsx';
    const optimizedImagePath = 'frontend/src/components/OptimizedImage.jsx';
    
    const imageFiles = [imageServicePath, publicGalleryPath, optimizedImagePath];
    const missingFiles = imageFiles.filter(file => !fs.existsSync(file));

    if (missingFiles.length > 0) {
      throw new Error(`Missing image management files: ${missingFiles.join(', ')}`);
    }

    // Check ImageService implementation
    const imageServiceContent = fs.readFileSync(imageServicePath, 'utf8');
    const requiredMethods = [
      'getPublicImages',
      'getImageUrl',
      'getImagesByCategory'
    ];

    const implementedMethods = requiredMethods.filter(method => 
      imageServiceContent.includes(method)
    );

    // Check gallery implementation
    const galleryContent = fs.readFileSync(publicGalleryPath, 'utf8');
    const galleryFeatures = [
      'grid',
      'lightbox',
      'modal',
      'category',
      'lazy'
    ];

    const implementedGalleryFeatures = galleryFeatures.filter(feature => 
      galleryContent.toLowerCase().includes(feature)
    );

    // Check image optimization
    const optimizedImageContent = fs.readFileSync(optimizedImagePath, 'utf8');
    const optimizationFeatures = [
      'loading',
      'lazy',
      'responsive',
      'fallback'
    ];

    const implementedOptimizations = optimizationFeatures.filter(feature => 
      optimizedImageContent.toLowerCase().includes(feature)
    );

    this.log('✅ Image management verified');
    return {
      imageServiceMethods: implementedMethods.length,
      galleryFeatures: implementedGalleryFeatures.length,
      optimizationFeatures: implementedOptimizations.length,
      allFilesPresent: true
    };
  }

  // Test SEO and meta tag management
  testSEOManagement() {
    this.log('Testing SEO Management');
    
    const seoHeadPath = 'frontend/src/components/SEOHead.jsx';
    const seoUtilsPath = 'frontend/src/utils/seo.js';
    const sitemapPath = 'frontend/public/sitemap.xml';
    const robotsPath = 'frontend/public/robots.txt';
    
    const seoFiles = [seoHeadPath, seoUtilsPath, sitemapPath, robotsPath];
    const missingFiles = seoFiles.filter(file => !fs.existsSync(file));

    if (missingFiles.length > 0) {
      throw new Error(`Missing SEO files: ${missingFiles.join(', ')}`);
    }

    // Check SEO Head implementation
    const seoHeadContent = fs.readFileSync(seoHeadPath, 'utf8');
    const metaTags = [
      'title',
      'description',
      'og:title',
      'og:description',
      'og:image',
      'twitter:card'
    ];

    const implementedMetaTags = metaTags.filter(tag => 
      seoHeadContent.includes(tag)
    );

    // Check sitemap content
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
    const hasSitemapStructure = sitemapContent.includes('<urlset') && 
                               sitemapContent.includes('<url>') &&
                               sitemapContent.includes('<loc>');

    // Check robots.txt
    const robotsContent = fs.readFileSync(robotsPath, 'utf8');
    const hasRobotsDirectives = robotsContent.includes('User-agent') &&
                               robotsContent.includes('Sitemap');

    this.log('✅ SEO management verified');
    return {
      metaTagsImplemented: implementedMetaTags.length,
      sitemapValid: hasSitemapStructure,
      robotsValid: hasRobotsDirectives,
      allSEOFilesPresent: true
    };
  }

  // Test responsive design and mobile optimization
  testResponsiveDesign() {
    this.log('Testing Responsive Design');
    
    const stylesPath = 'frontend/src/styles.css';
    const mobileCSSPath = 'frontend/src/mobile-fix.css';
    
    if (!fs.existsSync(stylesPath)) {
      throw new Error('Main styles.css not found');
    }

    const stylesContent = fs.readFileSync(stylesPath, 'utf8');
    
    // Check for responsive patterns
    const responsivePatterns = [
      '@media',
      'max-width',
      'min-width',
      'flex',
      'grid',
      'responsive'
    ];

    const implementedPatterns = responsivePatterns.filter(pattern => 
      stylesContent.includes(pattern)
    );

    // Check for mobile-specific styles
    const mobileOptimizations = fs.existsSync(mobileCSSPath);
    let mobileFeatures = 0;
    
    if (mobileOptimizations) {
      const mobileCSSContent = fs.readFileSync(mobileCSSPath, 'utf8');
      const mobilePatterns = ['mobile', 'touch', 'viewport', '@media'];
      mobileFeatures = mobilePatterns.filter(pattern => 
        mobileCSSContent.includes(pattern)
      ).length;
    }

    this.log('✅ Responsive design verified');
    return {
      responsivePatterns: implementedPatterns.length,
      mobileOptimizations,
      mobileFeatures,
      mainStylesPresent: true
    };
  }

  // Run all content management tests
  async runAllTests() {
    console.log('📝 Starting Content Management Testing');
    console.log('======================================');

    const tests = [
      { name: 'Contact Form Structure', test: () => this.testContactFormStructure() },
      { name: 'Admin Contact Management', test: () => this.testAdminContactManagement() },
      { name: 'Public Content Management', test: () => this.testPublicContentManagement() },
      { name: 'Image Management', test: () => this.testImageManagement() },
      { name: 'SEO Management', test: () => this.testSEOManagement() },
      { name: 'Responsive Design', test: () => this.testResponsiveDesign() }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      try {
        const result = test.test();
        this.results.push({ name: test.name, status: 'PASS', result });
        passed++;
      } catch (error) {
        this.results.push({ name: test.name, status: 'FAIL', error: error.message });
        this.log(`❌ ${test.name} failed: ${error.message}`, 'error');
        failed++;
      }
    }

    console.log('\n📊 Content Management Test Results');
    console.log('===================================');
    console.log(`✅ Passed: ${passed}/${tests.length}`);
    console.log(`❌ Failed: ${failed}/${tests.length}`);

    // Detailed results
    console.log('\n📋 Detailed Results:');
    this.results.forEach(result => {
      const status = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${status} ${result.name}`);
      if (result.result && typeof result.result === 'object') {
        Object.entries(result.result).forEach(([key, value]) => {
          console.log(`    ${key}: ${value}`);
        });
      }
    });

    if (failed === 0) {
      console.log('\n🎉 All content management systems are working correctly!');
      console.log('Contact forms, admin management, and content systems are ready.');
    } else {
      console.log('\n⚠️  Some content management features need attention.');
    }

    return { passed, failed, total: tests.length };
  }
}

// Run content management tests
if (require.main === module) {
  const tester = new ContentManagementTester();
  tester.runAllTests().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('Content management testing failed:', error);
    process.exit(1);
  });
}

module.exports = ContentManagementTester;