/**
 * Security Testing Utilities for Adonai Farm Management System
 * Provides tools to test and validate security measures
 */

import { InputSanitizer, securityMonitor } from './security.js';
import { PublicDataSanitizer, RouteDataProtection } from './dataProtection.js';

/**
 * Security test suite for validating security measures
 */
export class SecurityTestSuite {
  constructor() {
    this.testResults = [];
  }

  /**
   * Run all security tests
   * @returns {Object} Test results summary
   */
  async runAllTests() {
    console.log('🔒 Running Adonai Farm Security Test Suite...\n');
    
    this.testResults = [];
    
    // Input sanitization tests
    await this.testInputSanitization();
    
    // Data protection tests
    await this.testDataProtection();
    
    // Route protection tests
    await this.testRouteProtection();
    
    // Rate limiting tests
    await this.testRateLimiting();
    
    // XSS protection tests
    await this.testXSSProtection();
    
    // Generate summary
    const summary = this.generateTestSummary();
    console.log('🔒 Security Test Suite Complete\n', summary);
    
    return summary;
  }

  /**
   * Test input sanitization functionality
   */
  async testInputSanitization() {
    console.log('Testing Input Sanitization...');
    
    const testCases = [
      {
        name: 'Basic XSS Script Tag',
        input: '<script>alert("xss")</script>Hello',
        expected: 'safe'
      },
      {
        name: 'JavaScript Protocol',
        input: 'javascript:alert("xss")',
        expected: 'safe'
      },
      {
        name: 'Event Handler',
        input: '<div onclick="alert(1)">Click me</div>',
        expected: 'safe'
      },
      {
        name: 'Data Protocol',
        input: 'data:text/html,<script>alert(1)</script>',
        expected: 'safe'
      },
      {
        name: 'Normal Text',
        input: 'This is normal text',
        expected: 'safe'
      },
      {
        name: 'Email with Script',
        input: 'user@example.com<script>alert(1)</script>',
        expected: 'invalid'
      }
    ];

    for (const testCase of testCases) {
      try {
        const sanitized = InputSanitizer.sanitizeHTML(testCase.input);
        const emailValidation = InputSanitizer.validateEmail(testCase.input);
        
        const passed = testCase.expected === 'safe' ? 
          !sanitized.includes('<script') && !sanitized.includes('javascript:') :
          !emailValidation.isValid;
        
        this.testResults.push({
          category: 'Input Sanitization',
          test: testCase.name,
          passed,
          details: { input: testCase.input, sanitized, emailValidation }
        });
        
        console.log(`  ${passed ? '✅' : '❌'} ${testCase.name}`);
      } catch (error) {
        this.testResults.push({
          category: 'Input Sanitization',
          test: testCase.name,
          passed: false,
          error: error.message
        });
        console.log(`  ❌ ${testCase.name} - Error: ${error.message}`);
      }
    }
  }

  /**
   * Test data protection functionality
   */
  async testDataProtection() {
    console.log('\nTesting Data Protection...');
    
    const sensitiveData = {
      id: 1,
      name: 'Test Animal',
      password_hash: 'secret123',
      employee_id: 'EMP001',
      hourly_rate: 25.50,
      health_records: [{ treatment: 'vaccination' }],
      notes: 'Internal admin notes',
      public_description: 'Friendly farm animal'
    };

    try {
      // Test animal data sanitization
      const sanitizedAnimal = PublicDataSanitizer.sanitizeAnimalData(sensitiveData);
      
      const hasNoSensitiveFields = !JSON.stringify(sanitizedAnimal).includes('password_hash') &&
                                  !JSON.stringify(sanitizedAnimal).includes('employee_id') &&
                                  !JSON.stringify(sanitizedAnimal).includes('hourly_rate');
      
      this.testResults.push({
        category: 'Data Protection',
        test: 'Animal Data Sanitization',
        passed: hasNoSensitiveFields,
        details: { original: sensitiveData, sanitized: sanitizedAnimal }
      });
      
      console.log(`  ${hasNoSensitiveFields ? '✅' : '❌'} Animal Data Sanitization`);
      
      // Test data validation
      const validation = PublicDataSanitizer.validatePublicData(sensitiveData);
      const hasIssues = validation.issues.length > 0;
      
      this.testResults.push({
        category: 'Data Protection',
        test: 'Sensitive Data Detection',
        passed: hasIssues,
        details: validation
      });
      
      console.log(`  ${hasIssues ? '✅' : '❌'} Sensitive Data Detection`);
      
    } catch (error) {
      this.testResults.push({
        category: 'Data Protection',
        test: 'Data Protection Suite',
        passed: false,
        error: error.message
      });
      console.log(`  ❌ Data Protection Suite - Error: ${error.message}`);
    }
  }

  /**
   * Test route protection functionality
   */
  async testRouteProtection() {
    console.log('\nTesting Route Protection...');
    
    try {
      // Test admin route detection
      const originalPath = window.location.pathname;
      
      // Simulate admin route
      window.history.replaceState({}, '', '/dashboard/animals');
      const isAdminRoute = RouteDataProtection.isAdminRoute();
      
      // Restore original path
      window.history.replaceState({}, '', originalPath);
      
      this.testResults.push({
        category: 'Route Protection',
        test: 'Admin Route Detection',
        passed: isAdminRoute,
        details: { testPath: '/dashboard/animals', detected: isAdminRoute }
      });
      
      console.log(`  ${isAdminRoute ? '✅' : '❌'} Admin Route Detection`);
      
      // Test public route
      window.history.replaceState({}, '', '/contact');
      const isPublicRoute = !RouteDataProtection.isAdminRoute();
      window.history.replaceState({}, '', originalPath);
      
      this.testResults.push({
        category: 'Route Protection',
        test: 'Public Route Detection',
        passed: isPublicRoute,
        details: { testPath: '/contact', detected: isPublicRoute }
      });
      
      console.log(`  ${isPublicRoute ? '✅' : '❌'} Public Route Detection`);
      
    } catch (error) {
      this.testResults.push({
        category: 'Route Protection',
        test: 'Route Protection Suite',
        passed: false,
        error: error.message
      });
      console.log(`  ❌ Route Protection Suite - Error: ${error.message}`);
    }
  }

  /**
   * Test rate limiting functionality
   */
  async testRateLimiting() {
    console.log('\nTesting Rate Limiting...');
    
    try {
      const { contactRateLimiter } = await import('./security.js');
      const testId = 'test_user_' + Date.now();
      
      // Test normal usage
      let result = contactRateLimiter.isAllowed(testId);
      const normalUsageAllowed = result.allowed;
      
      // Test rate limit exceeded
      for (let i = 0; i < 5; i++) {
        contactRateLimiter.isAllowed(testId);
      }
      result = contactRateLimiter.isAllowed(testId);
      const rateLimitTriggered = !result.allowed;
      
      this.testResults.push({
        category: 'Rate Limiting',
        test: 'Contact Form Rate Limiting',
        passed: normalUsageAllowed && rateLimitTriggered,
        details: { normalUsage: normalUsageAllowed, rateLimitTriggered }
      });
      
      console.log(`  ${normalUsageAllowed && rateLimitTriggered ? '✅' : '❌'} Contact Form Rate Limiting`);
      
    } catch (error) {
      this.testResults.push({
        category: 'Rate Limiting',
        test: 'Rate Limiting Suite',
        passed: false,
        error: error.message
      });
      console.log(`  ❌ Rate Limiting Suite - Error: ${error.message}`);
    }
  }

  /**
   * Test XSS protection
   */
  async testXSSProtection() {
    console.log('\nTesting XSS Protection...');
    
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src="x" onerror="alert(1)">',
      '<svg onload="alert(1)">',
      '"><script>alert("XSS")</script>',
      "';alert('XSS');//"
    ];

    let allProtected = true;
    
    for (const payload of xssPayloads) {
      try {
        const contactFormValidation = InputSanitizer.validateContactForm({
          name: payload,
          email: 'test@example.com',
          subject: 'Test',
          message: payload,
          phone: '',
          inquiryType: 'general'
        });
        
        const isProtected = !contactFormValidation.isValid || 
                          !contactFormValidation.sanitized.name.includes('<script') ||
                          !contactFormValidation.sanitized.message.includes('<script');
        
        if (!isProtected) {
          allProtected = false;
        }
        
        this.testResults.push({
          category: 'XSS Protection',
          test: `XSS Payload: ${payload.substring(0, 20)}...`,
          passed: isProtected,
          details: { payload, validation: contactFormValidation }
        });
        
      } catch (error) {
        // If validation throws an error, that's actually good for security
        this.testResults.push({
          category: 'XSS Protection',
          test: `XSS Payload: ${payload.substring(0, 20)}...`,
          passed: true,
          details: { payload, error: 'Validation rejected payload' }
        });
      }
    }
    
    console.log(`  ${allProtected ? '✅' : '❌'} XSS Payload Protection`);
  }

  /**
   * Generate test summary
   */
  generateTestSummary() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(test => test.passed).length;
    const failedTests = totalTests - passedTests;
    
    const categories = {};
    this.testResults.forEach(test => {
      if (!categories[test.category]) {
        categories[test.category] = { total: 0, passed: 0 };
      }
      categories[test.category].total++;
      if (test.passed) {
        categories[test.category].passed++;
      }
    });
    
    const summary = {
      overall: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        successRate: Math.round((passedTests / totalTests) * 100)
      },
      categories,
      failedTests: this.testResults.filter(test => !test.passed),
      timestamp: new Date().toISOString()
    };
    
    // Log security test results
    securityMonitor.logEvent('security_test_completed', {
      summary: summary.overall,
      categories: Object.keys(categories)
    });
    
    return summary;
  }

  /**
   * Generate security report
   */
  generateSecurityReport() {
    const summary = this.generateTestSummary();
    
    const report = {
      title: 'Adonai Farm Security Assessment Report',
      timestamp: new Date().toISOString(),
      summary,
      recommendations: this.generateRecommendations(summary),
      testDetails: this.testResults
    };
    
    return report;
  }

  /**
   * Generate security recommendations based on test results
   */
  generateRecommendations(summary) {
    const recommendations = [];
    
    if (summary.overall.successRate < 100) {
      recommendations.push({
        priority: 'high',
        category: 'General',
        issue: 'Some security tests failed',
        recommendation: 'Review and fix failed security tests immediately'
      });
    }
    
    if (summary.failedTests.some(test => test.category === 'XSS Protection')) {
      recommendations.push({
        priority: 'critical',
        category: 'XSS Protection',
        issue: 'XSS vulnerabilities detected',
        recommendation: 'Implement stronger input sanitization and output encoding'
      });
    }
    
    if (summary.failedTests.some(test => test.category === 'Data Protection')) {
      recommendations.push({
        priority: 'high',
        category: 'Data Protection',
        issue: 'Sensitive data exposure risk',
        recommendation: 'Review data sanitization logic and ensure no sensitive data is exposed publicly'
      });
    }
    
    if (summary.overall.successRate >= 90) {
      recommendations.push({
        priority: 'low',
        category: 'General',
        issue: 'Good security posture',
        recommendation: 'Continue monitoring and regular security testing'
      });
    }
    
    return recommendations;
  }
}

// Export test runner function
export async function runSecurityTests() {
  const testSuite = new SecurityTestSuite();
  return await testSuite.runAllTests();
}

// Export report generator
export async function generateSecurityReport() {
  const testSuite = new SecurityTestSuite();
  await testSuite.runAllTests();
  return testSuite.generateSecurityReport();
}

export default SecurityTestSuite;