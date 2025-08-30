/**
 * Enhanced Security Utilities for Adonai Farm Management System
 * Comprehensive protection against web vulnerabilities and attacks
 * Provides client-side security enhancements, validation, and threat detection
 */

// Enhanced security patterns for comprehensive threat detection
const SECURITY_PATTERNS = {
  // XSS patterns - comprehensive coverage
  XSS_PATTERNS: [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /<link/gi,
    /<meta/gi,
    /<form/gi,
    /data:text\/html/gi,
    /vbscript:/gi,
    /expression\s*\(/gi,
    /url\s*\(/gi,
    /@import/gi,
    /binding:/gi,
    /behavior:/gi,
    /<svg.*?onload/gi,
    /<img.*?onerror/gi,
    /&#x/gi, // Hex encoded characters
    /&#\d/gi, // Decimal encoded characters
    /\\u[0-9a-f]{4}/gi, // Unicode escapes
    /eval\s*\(/gi,
    /setTimeout\s*\(/gi,
    /setInterval\s*\(/gi
  ],

  // SQL injection patterns - enhanced detection
  SQL_INJECTION: [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT|TRUNCATE|GRANT|REVOKE)\b)/gi,
    /(--|\/\*|\*\/|;|'|"|`)/g,
    /(\bOR\b|\bAND\b).*?[=<>]/gi,
    /\b(CONCAT|CHAR|ASCII|SUBSTRING|LENGTH|USER|DATABASE|VERSION|SLEEP|BENCHMARK)\b/gi,
    /0x[0-9a-f]+/gi, // Hex values
    /\bunion\b.*?\bselect\b/gi,
    /\binto\b.*?\boutfile\b/gi,
    /\bload_file\b/gi,
    /\bsystem\b.*?\(/gi
  ],

  // Path traversal patterns - comprehensive
  PATH_TRAVERSAL: [
    /\.\./g,
    /\.\\/g,
    /\.\.\/\.\./g,
    /\/etc\/passwd/gi,
    /\/proc\//gi,
    /\\windows\\system32/gi,
    /\/var\/log/gi,
    /\/home\//gi,
    /\/root\//gi,
    /\/usr\/bin/gi,
    /\/bin\//gi,
    /\/sbin\//gi,
    /\/tmp\//gi,
    /\/dev\//gi,
    /\/sys\//gi,
    /c:\\windows/gi,
    /c:\\users/gi,
    /c:\\program/gi
  ],

  // Command injection patterns - enhanced
  COMMAND_INJECTION: [
    /[;&|`$(){}[\]]/g,
    /\b(eval|exec|system|shell_exec|passthru|proc_open|popen|file_get_contents|file_put_contents|fopen|fwrite|include|require)\b/gi,
    /\$\{.*?\}/g, // Template literals
    /\$\(.*?\)/g, // Command substitution
    /`.*?`/g, // Backticks
    /\|\s*\w+/g, // Pipe commands
    /&&\s*\w+/g, // Command chaining
    /\|\|\s*\w+/g, // OR command chaining
    />\s*\/\w+/g, // Output redirection
    /<\s*\/\w+/g // Input redirection
  ]
};

// Rate limiting storage
const rateLimitStore = new Map();

// Security event logging
const securityEvents = [];

/**
 * Enhanced input sanitization with comprehensive threat detection
 * @param {string} input - User input to sanitize
 * @param {Object} options - Sanitization options
 * @returns {string} Sanitized input
 */
export function sanitizeInput(input, options = {}) {
  if (typeof input !== 'string') {
    return '';
  }

  const {
    allowHTML = false,
    maxLength = 1000,
    stripScripts = true,
    preventSQLInjection = true,
    preventPathTraversal = true,
    preventCommandInjection = true,
    logThreats = true
  } = options;

  let sanitized = input.trim();
  const threats = [];

  // Length validation
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
    threats.push('Input truncated due to length');
  }

  // Remove null bytes and control characters
  const originalLength = sanitized.length;
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  if (sanitized.length !== originalLength) {
    threats.push('Control characters removed');
  }

  // XSS prevention
  if (stripScripts) {
    SECURITY_PATTERNS.XSS_PATTERNS.forEach((pattern, index) => {
      const matches = sanitized.match(pattern);
      if (matches) {
        sanitized = sanitized.replace(pattern, '');
        threats.push(`XSS pattern ${index + 1} detected and removed`);
      }
    });
  }

  // SQL injection prevention
  if (preventSQLInjection) {
    SECURITY_PATTERNS.SQL_INJECTION.forEach((pattern, index) => {
      const matches = sanitized.match(pattern);
      if (matches) {
        sanitized = sanitized.replace(pattern, '');
        threats.push(`SQL injection pattern ${index + 1} detected and removed`);
      }
    });
  }

  // Path traversal prevention
  if (preventPathTraversal) {
    SECURITY_PATTERNS.PATH_TRAVERSAL.forEach((pattern, index) => {
      const matches = sanitized.match(pattern);
      if (matches) {
        sanitized = sanitized.replace(pattern, '');
        threats.push(`Path traversal pattern ${index + 1} detected and removed`);
      }
    });
  }

  // Command injection prevention
  if (preventCommandInjection) {
    SECURITY_PATTERNS.COMMAND_INJECTION.forEach((pattern, index) => {
      const matches = sanitized.match(pattern);
      if (matches) {
        sanitized = sanitized.replace(pattern, '');
        threats.push(`Command injection pattern ${index + 1} detected and removed`);
      }
    });
  }

  // Log threats if enabled
  if (logThreats && threats.length > 0) {
    console.warn('🚨 Security threats detected and mitigated:', {
      originalInput: input.substring(0, 100) + (input.length > 100 ? '...' : ''),
      threats,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    // Report to security monitoring
    reportSecurityEvent('input_sanitization', {
      threats,
      severity: threats.length > 3 ? 'high' : threats.length > 1 ? 'medium' : 'low'
    });
  }

  // HTML sanitization
  if (!allowHTML) {
    sanitized = escapeHTML(sanitized);
  }

  return sanitized;
}

/**
 * Escape HTML characters to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
export function escapeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Rate limiting implementation
 * @param {string} key - Unique identifier for the action
 * @param {number} maxAttempts - Maximum attempts allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} True if action is allowed
 */
export function rateLimit(key, maxAttempts = 5, windowMs = 60000) {
  const now = Date.now();
  const windowStart = now - windowMs;

  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, []);
  }

  const attempts = rateLimitStore.get(key);

  // Remove old attempts outside the window
  const validAttempts = attempts.filter(timestamp => timestamp > windowStart);

  if (validAttempts.length >= maxAttempts) {
    reportSecurityEvent('rate_limit_exceeded', {
      key,
      attempts: validAttempts.length,
      maxAttempts,
      windowMs
    });
    return false;
  }

  // Add current attempt
  validAttempts.push(now);
  rateLimitStore.set(key, validAttempts);

  return true;
}

/**
 * Report security events for monitoring
 * @param {string} eventType - Type of security event
 * @param {Object} details - Event details
 */
export function reportSecurityEvent(eventType, details = {}) {
  const event = {
    type: eventType,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    sessionId: getSessionId(),
    ...details
  };

  securityEvents.push(event);

  // Check for suspicious user agents
  const suspiciousUserAgents = [/bot/i, /spider/i, /crawl/i, /curl/i, /wget/i];
  if (suspiciousUserAgents.some(ua => ua.test(navigator.userAgent))) {
    event.severity = 'medium';
    event.threat_type = 'suspicious_user_agent';
  }

  // Monitor for potential IDOR attempts in URL
  const urlParams = new URLSearchParams(window.location.search);
  for (const [key, value] of urlParams.entries()) {
    if (key.toLowerCase().includes('id') && !/^\d+$/.test(value)) {
      reportSecurityEvent('potential_idor_attempt', {
        severity: 'high',
        parameter: key,
        value: value
      });
    }
  }

  // Keep only last 100 events to prevent memory issues
  if (securityEvents.length > 100) {
    securityEvents.shift();
  }

  // Log high severity events immediately
  if (details.severity === 'high') {
    console.error('🚨 HIGH SEVERITY SECURITY EVENT:', event);
  }

  // In production, send to security monitoring service
  if (import.meta.env.PROD) {
    // This would typically send to a security monitoring service
    // For now, we'll store in localStorage for admin review
    const existingEvents = JSON.parse(localStorage.getItem('security_events') || '[]');
    existingEvents.push(event);

    // Keep only last 50 events in localStorage
    if (existingEvents.length > 50) {
      existingEvents.splice(0, existingEvents.length - 50);
    }

    localStorage.setItem('security_events', JSON.stringify(existingEvents));
  }
}

/**
 * Get or generate session ID for tracking
 * @returns {string} Session ID
 */
function getSessionId() {
  let sessionId = sessionStorage.getItem('security_session_id');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    sessionStorage.setItem('security_session_id', sessionId);
  }
  return sessionId;
}

/**
 * Content Security Policy implementation
 * @returns {string} CSP header value
 */
export function generateCSP() {
  const directives = {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'img-src': ["'self'", 'data:', 'https:', 'blob:'],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'connect-src': ["'self'", 'https:', 'wss:'],
    'media-src': ["'self'"],
    'object-src': ["'none'"],
    'child-src': ["'none'"],
    'worker-src': ["'self'"],
    'frame-ancestors': ["'none'"],
    'form-action': ["'self'"],
    'base-uri': ["'self'"],
    'manifest-src': ["'self'"]
  };

  return Object.entries(directives)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
}

/**
 * Initialize security headers and monitoring
 */
export function initializeSecurity() {
  // Set up CSP if not already set
  if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    cspMeta.content = generateCSP();
    document.head.appendChild(cspMeta);
  }

  // Monitor for suspicious activity
  monitorSuspiciousActivity();

  // Set up security event listeners
  setupSecurityEventListeners();

  console.log('🔒 Security monitoring initialized');
}

/**
 * Monitor for suspicious activity patterns
 */
function monitorSuspiciousActivity() {
  let rapidClickCount = 0;
  let lastClickTime = 0;

  // Monitor rapid clicking (potential bot activity)
  document.addEventListener('click', () => {
    const now = Date.now();
    if (now - lastClickTime < 100) { // Less than 100ms between clicks
      rapidClickCount++;
      if (rapidClickCount > 10) {
        reportSecurityEvent('suspicious_rapid_clicking', {
          severity: 'medium',
          clickCount: rapidClickCount
        });
        rapidClickCount = 0;
      }
    } else {
      rapidClickCount = 0;
    }
    lastClickTime = now;
  });

  // Monitor console access (potential developer tools usage)
  let devToolsOpen = false;
  setInterval(() => {
    const threshold = 160;
    if (window.outerHeight - window.innerHeight > threshold ||
      window.outerWidth - window.innerWidth > threshold) {
      if (!devToolsOpen) {
        devToolsOpen = true;
        reportSecurityEvent('developer_tools_detected', {
          severity: 'low',
          windowDimensions: {
            outer: { width: window.outerWidth, height: window.outerHeight },
            inner: { width: window.innerWidth, height: window.innerHeight }
          }
        });
      }
    } else {
      devToolsOpen = false;
    }
  }, 1000);
}

/**
 * Set up security-related event listeners
 */
function setupSecurityEventListeners() {
  // Monitor for paste events (potential script injection)
  document.addEventListener('paste', (event) => {
    const pastedData = event.clipboardData.getData('text');
    if (pastedData && pastedData.length > 1000) {
      reportSecurityEvent('large_paste_detected', {
        severity: 'low',
        dataLength: pastedData.length,
        containsScript: /<script/i.test(pastedData)
      });
    }
  });

  // Monitor for right-click context menu (potential inspection attempts)
  document.addEventListener('contextmenu', (event) => {
    // Don't block, just monitor
    reportSecurityEvent('context_menu_accessed', {
      severity: 'low',
      element: event.target.tagName,
      timestamp: Date.now()
    });
  });

  // Monitor for key combinations that might indicate inspection
  document.addEventListener('keydown', (event) => {
    const suspiciousKeyCombos = [
      { key: 'F12' }, // Developer tools
      { key: 'I', ctrlKey: true, shiftKey: true }, // Inspect element
      { key: 'J', ctrlKey: true, shiftKey: true }, // Console
      { key: 'U', ctrlKey: true } // View source
    ];

    const isMatch = suspiciousKeyCombos.some(combo => {
      return event.key === combo.key &&
        (!combo.ctrlKey || event.ctrlKey) &&
        (!combo.shiftKey || event.shiftKey);
    });

    if (isMatch) {
      reportSecurityEvent('suspicious_key_combination', {
        severity: 'low',
        key: event.key,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey
      });
    }
  });
}

/**
 * Get security events for admin review
 * @returns {Array} Array of security events
 */
export function getSecurityEvents() {
  const localEvents = JSON.parse(localStorage.getItem('security_events') || '[]');
  return [...securityEvents, ...localEvents].sort((a, b) =>
    new Date(b.timestamp) - new Date(a.timestamp)
  );
}

/**
 * Clear security events (admin function)
 */
export function clearSecurityEvents() {
  securityEvents.length = 0;
  localStorage.removeItem('security_events');
  console.log('🔒 Security events cleared');
}

// Input sanitization utilities
export class InputSanitizer {
  /**
   * Sanitize HTML input to prevent XSS attacks
   * @param {string} input - Raw input string
   * @returns {string} Sanitized string
   */
  static sanitizeHTML(input) {
    if (typeof input !== 'string') return '';

    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  /**
   * Sanitize and validate email addresses
   * @param {string} email - Email address to validate
   * @returns {Object} Validation result
   */
  static validateEmail(email) {
    if (!email || typeof email !== 'string') {
      return { isValid: false, error: 'Email is required' };
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Basic email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // More comprehensive email validation
    const strictEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!emailRegex.test(trimmedEmail)) {
      return { isValid: false, error: 'Invalid email format' };
    }

    if (!strictEmailRegex.test(trimmedEmail)) {
      return { isValid: false, error: 'Email contains invalid characters' };
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /script/i,
      /<[^>]*>/,
      /javascript:/i,
      /data:/i,
      /vbscript:/i
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(trimmedEmail)) {
        return { isValid: false, error: 'Email contains invalid content' };
      }
    }

    return { isValid: true, sanitized: trimmedEmail };
  }

  /**
   * Sanitize and validate phone numbers
   * @param {string} phone - Phone number to validate
   * @returns {Object} Validation result
   */
  static validatePhone(phone) {
    if (!phone) return { isValid: true, sanitized: '' }; // Phone is optional

    if (typeof phone !== 'string') {
      return { isValid: false, error: 'Invalid phone number format' };
    }

    const trimmedPhone = phone.trim();

    // Allow international format with + and common separators
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;

    if (!phoneRegex.test(trimmedPhone)) {
      return { isValid: false, error: 'Phone number must be at least 10 digits and contain only numbers, spaces, hyphens, parentheses, and optional + prefix' };
    }

    // Extract only digits to check minimum length
    const digitsOnly = trimmedPhone.replace(/[^\d]/g, '');
    if (digitsOnly.length < 10) {
      return { isValid: false, error: 'Phone number must contain at least 10 digits' };
    }

    return { isValid: true, sanitized: trimmedPhone };
  }

  /**
   * Sanitize text input and check for malicious content
   * @param {string} input - Text input to sanitize
   * @param {Object} options - Validation options
   * @returns {Object} Validation result
   */
  static sanitizeText(input, options = {}) {
    const {
      minLength = 0,
      maxLength = 1000,
      allowHTML = false,
      fieldName = 'field'
    } = options;

    if (!input || typeof input !== 'string') {
      return { isValid: minLength === 0, error: minLength > 0 ? `${fieldName} is required` : null, sanitized: '' };
    }

    let sanitized = input.trim();

    // Check length constraints
    if (sanitized.length < minLength) {
      return { isValid: false, error: `${fieldName} must be at least ${minLength} characters long` };
    }

    if (sanitized.length > maxLength) {
      return { isValid: false, error: `${fieldName} must be no more than ${maxLength} characters long` };
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /on\w+\s*=/i, // Event handlers like onclick=
      /<script[^>]*>.*?<\/script>/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(sanitized)) {
        return { isValid: false, error: `${fieldName} contains invalid content` };
      }
    }

    // Sanitize HTML if not allowed
    if (!allowHTML) {
      sanitized = this.sanitizeHTML(sanitized);
    }

    return { isValid: true, sanitized };
  }

  /**
   * Validate and sanitize contact form data
   * @param {Object} formData - Form data to validate
   * @returns {Object} Validation result
   */
  static validateContactForm(formData) {
    const errors = {};
    const sanitized = {};

    // Validate name
    const nameResult = this.sanitizeText(formData.name, {
      minLength: 2,
      maxLength: 100,
      fieldName: 'Name'
    });
    if (!nameResult.isValid) {
      errors.name = nameResult.error;
    } else {
      sanitized.name = nameResult.sanitized;
    }

    // Validate email
    const emailResult = this.validateEmail(formData.email);
    if (!emailResult.isValid) {
      errors.email = emailResult.error;
    } else {
      sanitized.email = emailResult.sanitized;
    }

    // Validate phone (optional)
    const phoneResult = this.validatePhone(formData.phone);
    if (!phoneResult.isValid) {
      errors.phone = phoneResult.error;
    } else {
      sanitized.phone = phoneResult.sanitized;
    }

    // Validate subject
    const subjectResult = this.sanitizeText(formData.subject, {
      minLength: 5,
      maxLength: 200,
      fieldName: 'Subject'
    });
    if (!subjectResult.isValid) {
      errors.subject = subjectResult.error;
    } else {
      sanitized.subject = subjectResult.sanitized;
    }

    // Validate message
    const messageResult = this.sanitizeText(formData.message, {
      minLength: 10,
      maxLength: 2000,
      fieldName: 'Message'
    });
    if (!messageResult.isValid) {
      errors.message = messageResult.error;
    } else {
      sanitized.message = messageResult.sanitized;
    }

    // Validate inquiry type
    const validInquiryTypes = ['visit', 'purchase', 'breeding', 'general'];
    if (!validInquiryTypes.includes(formData.inquiryType)) {
      sanitized.inquiryType = 'general';
    } else {
      sanitized.inquiryType = formData.inquiryType;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      sanitized
    };
  }
}

// Rate limiting utilities
export class RateLimiter {
  constructor(maxRequests = 5, windowMs = 15 * 60 * 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  /**
   * Check if request is allowed based on rate limiting
   * @param {string} identifier - Unique identifier (IP, user ID, etc.)
   * @returns {Object} Rate limit result
   */
  isAllowed(identifier) {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];

    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => now - time < this.windowMs);

    if (validRequests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...validRequests);
      const resetTime = oldestRequest + this.windowMs;
      const waitTime = Math.ceil((resetTime - now) / 1000 / 60); // Minutes

      return {
        allowed: false,
        error: `Too many requests. Please wait ${waitTime} minutes before trying again.`,
        resetTime
      };
    }

    // Add current request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);

    return {
      allowed: true,
      remaining: this.maxRequests - validRequests.length
    };
  }

  /**
   * Clear rate limit for identifier
   * @param {string} identifier - Identifier to clear
   */
  clear(identifier) {
    this.requests.delete(identifier);
  }

  /**
   * Get current status for identifier
   * @param {string} identifier - Identifier to check
   * @returns {Object} Current status
   */
  getStatus(identifier) {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    const validRequests = userRequests.filter(time => now - time < this.windowMs);

    return {
      requestCount: validRequests.length,
      remaining: Math.max(0, this.maxRequests - validRequests.length),
      resetTime: validRequests.length > 0 ? Math.min(...validRequests) + this.windowMs : null
    };
  }
}

// Security monitoring utilities
export class SecurityMonitor {
  constructor() {
    this.events = [];
    this.maxEvents = 100;
  }

  /**
   * Log security event
   * @param {string} type - Event type
   * @param {Object} details - Event details
   */
  logEvent(type, details = {}) {
    const event = {
      id: Date.now() + Math.random(),
      type,
      timestamp: new Date().toISOString(),
      details,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.events.push(event);

    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Store in localStorage for persistence
    try {
      localStorage.setItem('adonai_security_events', JSON.stringify(this.events));
    } catch (error) {
      console.warn('Failed to store security events:', error);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Security Event:', event);
    }
  }

  /**
   * Get recent security events
   * @param {number} limit - Maximum number of events to return
   * @returns {Array} Recent security events
   */
  getRecentEvents(limit = 50) {
    return this.events.slice(-limit);
  }

  /**
   * Check for suspicious activity patterns
   * @returns {Object} Suspicious activity analysis
   */
  analyzeSuspiciousActivity() {
    const recentEvents = this.getRecentEvents();
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    const recentFailures = recentEvents.filter(event =>
      event.type === 'validation_failed' &&
      (now - new Date(event.timestamp).getTime()) < oneHour
    );

    const suspiciousPatterns = {
      highFailureRate: recentFailures.length > 10,
      rapidSubmissions: recentEvents.filter(event =>
        event.type === 'form_submission' &&
        (now - new Date(event.timestamp).getTime()) < 5 * 60 * 1000 // 5 minutes
      ).length > 3,
      maliciousContent: recentEvents.some(event =>
        event.details.reason === 'malicious_content'
      )
    };

    const isSuspicious = Object.values(suspiciousPatterns).some(Boolean);

    return {
      isSuspicious,
      patterns: suspiciousPatterns,
      recentFailures: recentFailures.length,
      recommendation: isSuspicious ? 'Consider implementing additional security measures' : 'Activity appears normal'
    };
  }
}

// Content Security Policy utilities
export class CSPHelper {
  /**
   * Check if current page has proper CSP headers
   * @returns {Object} CSP analysis
   */
  static analyzeCSP() {
    const metaTags = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
    const hasCSP = metaTags.length > 0;

    let policies = [];
    if (hasCSP) {
      metaTags.forEach(tag => {
        policies.push(tag.getAttribute('content'));
      });
    }

    return {
      hasCSP,
      policies,
      recommendation: hasCSP ? 'CSP is configured' : 'Consider adding Content Security Policy headers'
    };
  }

  /**
   * Generate recommended CSP for the application
   * @returns {string} Recommended CSP policy
   */
  static getRecommendedCSP() {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'", // Allow inline scripts for React
      "style-src 'self' 'unsafe-inline'", // Allow inline styles
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self'", // Allow API connections
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');
  }
}

// Global security monitor instance
export const securityMonitor = new SecurityMonitor();

// Contact form rate limiter
export const contactRateLimiter = new RateLimiter(3, 15 * 60 * 1000); // 3 requests per 15 minutes

// Initialize security monitoring
if (typeof window !== 'undefined') {
  // Load existing events from localStorage
  try {
    const storedEvents = localStorage.getItem('adonai_security_events');
    if (storedEvents) {
      securityMonitor.events = JSON.parse(storedEvents);
    }
  } catch (error) {
    console.warn('Failed to load security events:', error);
  }

  // Log page load
  securityMonitor.logEvent('page_load', {
    url: window.location.href,
    referrer: document.referrer
  });

  // Monitor for suspicious activity
  window.addEventListener('error', (event) => {
    securityMonitor.logEvent('javascript_error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });
}

export default {
  InputSanitizer,
  RateLimiter,
  SecurityMonitor,
  CSPHelper,
  securityMonitor,
  contactRateLimiter
};