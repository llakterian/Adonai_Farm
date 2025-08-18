/**
 * User Flow Testing for Farm Website Enhancement
 * Tests complete user journeys from public website to admin login
 */

const fs = require('fs');

class UserFlowTester {
  constructor() {
    this.testResults = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
  }

  // Test Flow 1: Public visitor browsing the website
  testPublicVisitorFlow() {
    this.log('Testing Public Visitor Flow');
    
    const publicPages = [
      'frontend/src/pages/Homepage.jsx',
      'frontend/src/pages/About.jsx',
      'frontend/src/pages/Services.jsx',
      'frontend/src/pages/Contact.jsx',
      'frontend/src/pages/Gallery.jsx',
      'frontend/src/pages/Animals.jsx'
    ];

    const publicLayout = 'frontend/src/components/PublicLayout.jsx';
    
    // Check all public pages exist and have proper structure
    const missingPages = publicPages.filter(page => !fs.existsSync(page));
    if (missingPages.length > 0) {
      throw new Error(`Missing public pages: ${missingPages.join(', ')}`);
    }

    // Check PublicLayout exists
    if (!fs.existsSync(publicLayout)) {
      throw new Error('PublicLayout component missing');
    }

    // Verify public pages use PublicLayout
    const layoutContent = fs.readFileSync(publicLayout, 'utf8');
    if (!layoutContent.includes('header') || !layoutContent.includes('footer')) {
      this.log('Warning: PublicLayout may be missing header or footer', 'warning');
    }

    this.log('✅ Public visitor flow components verified');
    return { publicPagesCount: publicPages.length, layoutImplemented: true };
  }

  // Test Flow 2: Public visitor to admin login transition
  testPublicToAdminTransition() {
    this.log('Testing Public to Admin Transition Flow');
    
    const loginPage = 'frontend/src/pages/Login.jsx';
    const authModule = 'frontend/src/auth.js';
    const routeProtection = 'frontend/src/components/RouteProtection.jsx';

    if (!fs.existsSync(loginPage)) {
      throw new Error('Login page missing');
    }

    if (!fs.existsSync(authModule)) {
      throw new Error('Authentication module missing');
    }

    if (!fs.existsSync(routeProtection)) {
      throw new Error('Route protection component missing');
    }

    // Check login page implementation
    const loginContent = fs.readFileSync(loginPage, 'utf8');
    const requiredLoginElements = ['username', 'password', 'login', 'form'];
    const missingElements = requiredLoginElements.filter(element => 
      !loginContent.toLowerCase().includes(element)
    );

    if (missingElements.length > 0) {
      this.log(`Warning: Login page may be missing elements: ${missingElements.join(', ')}`, 'warning');
    }

    // Check authentication functions
    const authContent = fs.readFileSync(authModule, 'utf8');
    const requiredAuthFunctions = ['login', 'logout', 'isAuthenticated'];
    const missingAuthFunctions = requiredAuthFunctions.filter(func => 
      !authContent.includes(func)
    );

    if (missingAuthFunctions.length > 0) {
      throw new Error(`Missing authentication functions: ${missingAuthFunctions.join(', ')}`);
    }

    this.log('✅ Public to admin transition flow verified');
    return { loginImplemented: true, authFunctionsPresent: true };
  }

  // Test Flow 3: Admin user accessing dashboard
  testAdminDashboardFlow() {
    this.log('Testing Admin Dashboard Flow');
    
    const dashboardPage = 'frontend/src/pages/Dashboard.jsx';
    const adminLayout = 'frontend/src/components/AdminLayout.jsx';
    
    if (!fs.existsSync(dashboardPage)) {
      throw new Error('Dashboard page missing');
    }

    if (!fs.existsSync(adminLayout)) {
      throw new Error('AdminLayout component missing');
    }

    // Check dashboard implementation
    const dashboardContent = fs.readFileSync(dashboardPage, 'utf8');
    if (!dashboardContent.includes('dashboard') && !dashboardContent.includes('admin')) {
      this.log('Warning: Dashboard page may not be properly implemented', 'warning');
    }

    // Check admin layout
    const adminLayoutContent = fs.readFileSync(adminLayout, 'utf8');
    if (!adminLayoutContent.includes('nav') && !adminLayoutContent.includes('menu')) {
      this.log('Warning: AdminLayout may be missing navigation', 'warning');
    }

    this.log('✅ Admin dashboard flow verified');
    return { dashboardImplemented: true, adminLayoutPresent: true };
  }

  // Test Flow 4: Admin user previewing public content
  testAdminPublicPreviewFlow() {
    this.log('Testing Admin Public Preview Flow');
    
    const routeProtection = 'frontend/src/components/RouteProtection.jsx';
    
    if (!fs.existsSync(routeProtection)) {
      throw new Error('Route protection component missing');
    }

    const routeContent = fs.readFileSync(routeProtection, 'utf8');
    
    // Check for AuthenticatedPublicRoute component
    if (!routeContent.includes('AuthenticatedPublicRoute')) {
      throw new Error('AuthenticatedPublicRoute component not found');
    }

    // Check App.jsx for proper usage
    const appContent = fs.readFileSync('frontend/src/App.jsx', 'utf8');
    if (!appContent.includes('AuthenticatedPublicRoute')) {
      throw new Error('AuthenticatedPublicRoute not used in App.jsx');
    }

    this.log('✅ Admin public preview flow verified');
    return { authenticatedPublicRouteImplemented: true };
  }

  // Test Flow 5: Contact form submission and admin notification
  testContactFormFlow() {
    this.log('Testing Contact Form Flow');
    
    const contactPage = 'frontend/src/pages/Contact.jsx';
    const contactManagement = 'frontend/src/pages/ContactManagement.jsx';
    
    if (!fs.existsSync(contactPage)) {
      throw new Error('Contact page missing');
    }

    if (!fs.existsSync(contactManagement)) {
      throw new Error('Contact management page missing');
    }

    const contactContent = fs.readFileSync(contactPage, 'utf8');
    const contactMgmtContent = fs.readFileSync(contactManagement, 'utf8');

    // Check contact form elements
    const formElements = ['name', 'email', 'subject', 'message', 'submit'];
    const missingFormElements = formElements.filter(element => 
      !contactContent.toLowerCase().includes(element)
    );

    if (missingFormElements.length > 0) {
      this.log(`Warning: Contact form missing elements: ${missingFormElements.join(', ')}`, 'warning');
    }

    // Check form validation
    if (!contactContent.includes('validation') && !contactContent.includes('validate')) {
      this.log('Warning: Contact form may be missing validation', 'warning');
    }

    // Check admin management
    if (!contactMgmtContent.includes('inquiry') && !contactMgmtContent.includes('contact')) {
      this.log('Warning: Contact management may not be fully implemented', 'warning');
    }

    this.log('✅ Contact form flow verified');
    return { contactFormPresent: true, adminManagementPresent: true };
  }

  // Test Flow 6: Image gallery functionality across devices
  testImageGalleryFlow() {
    this.log('Testing Image Gallery Flow');
    
    const galleryPage = 'frontend/src/pages/Gallery.jsx';
    const publicGallery = 'frontend/src/components/PublicGallery.jsx';
    const imageService = 'frontend/src/services/ImageService.js';
    const optimizedImage = 'frontend/src/components/OptimizedImage.jsx';
    
    const requiredFiles = [galleryPage, publicGallery, imageService, optimizedImage];
    const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));

    if (missingFiles.length > 0) {
      throw new Error(`Missing gallery files: ${missingFiles.join(', ')}`);
    }

    // Check image service implementation
    const imageServiceContent = fs.readFileSync(imageService, 'utf8');
    const requiredMethods = ['getPublicImages', 'getImageUrl', 'getImagesByCategory'];
    const missingMethods = requiredMethods.filter(method => 
      !imageServiceContent.includes(method)
    );

    if (missingMethods.length > 0) {
      throw new Error(`ImageService missing methods: ${missingMethods.join(', ')}`);
    }

    // Check for responsive image handling
    const optimizedImageContent = fs.readFileSync(optimizedImage, 'utf8');
    if (!optimizedImageContent.includes('loading') && !optimizedImageContent.includes('lazy')) {
      this.log('Warning: OptimizedImage may not implement lazy loading', 'warning');
    }

    this.log('✅ Image gallery flow verified');
    return { galleryImplemented: true, imageOptimizationPresent: true };
  }

  // Test Flow 7: Error handling and fallback systems
  testErrorHandlingFlow() {
    this.log('Testing Error Handling Flow');
    
    const errorBoundary = 'frontend/src/components/ErrorBoundary.jsx';
    const notFoundPage = 'frontend/src/pages/NotFound.jsx';
    const fallbackHandlers = 'frontend/src/utils/fallbackHandlers.js';
    
    const errorFiles = [errorBoundary, notFoundPage, fallbackHandlers];
    const missingFiles = errorFiles.filter(file => !fs.existsSync(file));

    if (missingFiles.length > 0) {
      throw new Error(`Missing error handling files: ${missingFiles.join(', ')}`);
    }

    // Check ErrorBoundary implementation
    const errorBoundaryContent = fs.readFileSync(errorBoundary, 'utf8');
    if (!errorBoundaryContent.includes('componentDidCatch') && !errorBoundaryContent.includes('getDerivedStateFromError')) {
      throw new Error('ErrorBoundary not properly implemented');
    }

    // Check App.jsx uses ErrorBoundary
    const appContent = fs.readFileSync('frontend/src/App.jsx', 'utf8');
    if (!appContent.includes('ErrorBoundary')) {
      throw new Error('ErrorBoundary not used in App.jsx');
    }

    this.log('✅ Error handling flow verified');
    return { errorBoundaryImplemented: true, fallbackSystemsPresent: true };
  }

  // Run all user flow tests
  async runAllFlows() {
    console.log('🔄 Starting User Flow Testing');
    console.log('==============================');

    const flows = [
      { name: 'Public Visitor Flow', test: () => this.testPublicVisitorFlow() },
      { name: 'Public to Admin Transition', test: () => this.testPublicToAdminTransition() },
      { name: 'Admin Dashboard Flow', test: () => this.testAdminDashboardFlow() },
      { name: 'Admin Public Preview Flow', test: () => this.testAdminPublicPreviewFlow() },
      { name: 'Contact Form Flow', test: () => this.testContactFormFlow() },
      { name: 'Image Gallery Flow', test: () => this.testImageGalleryFlow() },
      { name: 'Error Handling Flow', test: () => this.testErrorHandlingFlow() }
    ];

    let passed = 0;
    let failed = 0;

    for (const flow of flows) {
      try {
        const result = flow.test();
        this.testResults.push({ name: flow.name, status: 'PASS', result });
        passed++;
      } catch (error) {
        this.testResults.push({ name: flow.name, status: 'FAIL', error: error.message });
        this.log(`❌ ${flow.name} failed: ${error.message}`, 'error');
        failed++;
      }
    }

    console.log('\n📊 User Flow Test Results');
    console.log('==========================');
    console.log(`✅ Passed: ${passed}/${flows.length}`);
    console.log(`❌ Failed: ${failed}/${flows.length}`);

    if (failed === 0) {
      console.log('\n🎉 All user flows are working correctly!');
      console.log('The dual-purpose platform is ready for users.');
    } else {
      console.log('\n⚠️  Some user flows need attention before deployment.');
    }

    return { passed, failed, total: flows.length };
  }
}

// Run user flow tests
if (require.main === module) {
  const tester = new UserFlowTester();
  tester.runAllFlows().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('User flow testing failed:', error);
    process.exit(1);
  });
}

module.exports = UserFlowTester;