import React, { useState } from 'react';
import SEOHead from '../components/SEOHead.jsx';
import { InputSanitizer, contactRateLimiter, securityMonitor, sanitizeInput, rateLimit, reportSecurityEvent } from '../utils/security.js';
import { ContactFormErrorBoundary } from '../components/ErrorBoundary.jsx';
import { ContentFallbackHandler, NetworkFallbackHandler } from '../utils/fallbackHandlers.js';

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: 'general',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errors, setErrors] = useState({});
  const [isOffline, setIsOffline] = useState(!NetworkFallbackHandler.isOnline);
  const [submitProgress, setSubmitProgress] = useState(0);

  // Monitor network connection
  React.useEffect(() => {
    const handleConnectionChange = (event) => {
      setIsOffline(!event.detail.isOnline);
      
      // Clear offline errors when connection is restored
      if (event.detail.isOnline && errors.general && errors.general.includes('offline')) {
        setErrors(prev => ({ ...prev, general: '' }));
      }
    };

    window.addEventListener('connectionchange', handleConnectionChange);
    return () => window.removeEventListener('connectionchange', handleConnectionChange);
  }, [errors.general]);

  const inquiryTypes = [
    { value: 'visit', label: 'Farm Visit/Tour' },
    { value: 'purchase', label: 'Product Purchase' },
    { value: 'breeding', label: 'Breeding Services' },
    { value: 'general', label: 'General Questions' }
  ];

  const validateForm = () => {
    // Use enhanced security validation
    const validation = InputSanitizer.validateContactForm(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      
      // Log validation failures for security monitoring
      securityMonitor.logEvent('validation_failed', {
        form: 'contact',
        errors: Object.keys(validation.errors),
        reason: 'client_validation'
      });
      
      return false;
    }
    
    setErrors({});
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if offline
    if (isOffline) {
      const offlineFallback = NetworkFallbackHandler.getOfflineFallback('contact');
      setErrors({ 
        general: `${offlineFallback.message}. ${offlineFallback.suggestion}` 
      });
      return;
    }
    
    if (!validateForm() || isSubmitting) {
      return;
    }
    
    // Check rate limiting
    const clientId = `contact_${formData.email.trim().toLowerCase()}`;
    const rateLimitCheck = contactRateLimiter.isAllowed(clientId);
    
    if (!rateLimitCheck.allowed) {
      setErrors({ general: rateLimitCheck.error });
      securityMonitor.logEvent('rate_limit_exceeded', {
        form: 'contact',
        email: formData.email.trim().toLowerCase(),
        reason: 'client_rate_limit'
      });
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    setSubmitProgress(0);
    
    try {
      // Simulate progress for better UX
      setSubmitProgress(25);
      
      // Use enhanced validation and get sanitized data
      const validation = InputSanitizer.validateContactForm(formData);
      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }
      
      setSubmitProgress(50);
      
      // Log form submission attempt
      securityMonitor.logEvent('form_submission', {
        form: 'contact',
        inquiryType: validation.sanitized.inquiryType,
        hasPhone: !!validation.sanitized.phone
      });
      
      // Get the backend URL from environment or use default
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
      
      setSubmitProgress(75);
      
      const response = await fetch(`${backendUrl}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validation.sanitized)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Log server-side errors
        securityMonitor.logEvent('form_submission_failed', {
          form: 'contact',
          status: response.status,
          error: data.error,
          reason: 'server_error'
        });
        
        throw new Error(data.error || 'Failed to submit inquiry');
      }
      
      setSubmitProgress(100);
      
      // Log successful submission
      securityMonitor.logEvent('form_submission_success', {
        form: 'contact',
        inquiryId: data.id
      });
      
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        inquiryType: 'general',
        subject: '',
        message: ''
      });
      
      // Clear any existing errors
      setErrors({});
      
    } catch (error) {
      console.error('Error submitting contact form:', error);
      
      // Log client-side errors
      securityMonitor.logEvent('form_submission_error', {
        form: 'contact',
        error: error.message,
        reason: 'client_error'
      });
      
      setSubmitStatus('error');
      
      // Enhanced error handling with fallback messages
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        const apiFallback = ContentFallbackHandler.getAPIFallbackMessage('contact', error);
        setErrors({ 
          general: `${apiFallback.message} ${apiFallback.action}` 
        });
      } else if (error.message.includes('rate limit') || error.message.includes('too many')) {
        setErrors({ general: 'Too many requests. Please wait before submitting again.' });
      } else if (error.message.includes('invalid') || error.message.includes('malicious')) {
        setErrors({ general: 'Please check your input and try again.' });
      } else {
        const apiFallback = ContentFallbackHandler.getAPIFallbackMessage('contact', error);
        setErrors({ 
          general: `${apiFallback.message} ${apiFallback.action}` 
        });
      }
      
    } finally {
      setIsSubmitting(false);
      setSubmitProgress(0);
    }
  };

  return (
    <>
      <SEOHead 
        pageType="contact"
        title="Contact Adonai Farm - Visit, Inquire & Connect"
        description="Contact Adonai Farm in Chepsir, Kericho for farm visits, product inquiries, and breeding services. Call +254 722 759 217 or email info@adonaifarm.co.ke. Open Mon-Sat 8AM-5PM."
        keywords={[
          "contact Adonai Farm",
          "farm visits Kericho",
          "Chepsir Kericho farm contact",
          "livestock farm Kenya contact",
          "farm tours booking Kericho",
          "agricultural consulting Kenya",
          "Adonai Farm phone number",
          "farm visit hours Kericho County"
        ]}
        image="/images/farm-4.jpg"
        url="/contact"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Contact", url: "/contact" }
        ]}
      />
      <div className="contact-page">
        <div className="contact-hero">
          <div className="container">
            <h1>Contact Adonai Farm</h1>
            <p>Get in touch with us for farm visits, product inquiries, or any questions about our operations.</p>
          </div>
        </div>

        <div className="contact-content">
          <div className="container">
            <div className="contact-grid">
              {/* Contact Information */}
              <div className="contact-info">
                <h2>Get In Touch</h2>
                <p>We'd love to hear from you! Whether you're interested in visiting our farm, purchasing our products, or learning more about our breeding services, don't hesitate to reach out.</p>
                
                <div className="contact-details">
                  <div className="contact-item">
                    <div className="contact-icon">📍</div>
                    <div>
                      <h3>Location</h3>
                      <p>Chepsir, Kericho, Kenya</p>
                    </div>
                  </div>
                  
                  <div className="contact-item">
                    <div className="contact-icon">📞</div>
                    <div>
                      <h3>Phone</h3>
                      <p>+254 722 759 217</p>
                    </div>
                  </div>
                  
                  <div className="contact-item">
                    <div className="contact-icon">📧</div>
                    <div>
                      <h3>Email</h3>
                      <p>info@adonaifarm.co.ke</p>
                    </div>
                  </div>
                  
                  <div className="contact-item">
                    <div className="contact-icon">🕒</div>
                    <div>
                      <h3>Farm Visit Hours</h3>
                      <p>Monday - Saturday: 8:00 AM - 5:00 PM</p>
                      <p>Sunday: By appointment only</p>
                    </div>
                  </div>
                </div>

                <div className="contact-services">
                  <h3>What We Offer</h3>
                  <ul>
                    <li>🐄 Livestock breeding services</li>
                    <li>🚜 Farm tours and educational visits</li>
                    <li>🥛 Fresh dairy and meat products</li>
                    <li>📚 Agricultural consulting</li>
                  </ul>
                </div>
              </div>

              {/* Contact Form */}
              <div className="contact-form-section">
                <h2>Send Us a Message</h2>
                
                {submitStatus === 'success' && (
                  <div className="alert alert-success">
                    <strong>Thank you!</strong> Your message has been sent successfully. We'll get back to you within 24 hours.
                  </div>
                )}
                
                {submitStatus === 'error' && (
                  <div className="alert alert-error">
                    <strong>Error:</strong> There was a problem sending your message. Please try again or contact us directly.
                  </div>
                )}
                
                {errors.general && (
                  <div className="alert alert-warning">
                    <strong>Notice:</strong> {errors.general}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Full Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={errors.name ? 'error' : ''}
                        placeholder="Enter your full name"
                      />
                      {errors.name && <span className="error-message">{errors.name}</span>}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="email">Email Address *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={errors.email ? 'error' : ''}
                        placeholder="Enter your email address"
                      />
                      {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="phone">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={errors.phone ? 'error' : ''}
                        placeholder="Enter your phone number"
                      />
                      {errors.phone && <span className="error-message">{errors.phone}</span>}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="inquiryType">Inquiry Type</label>
                      <select
                        id="inquiryType"
                        name="inquiryType"
                        value={formData.inquiryType}
                        onChange={handleInputChange}
                      >
                        {inquiryTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject">Subject *</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className={errors.subject ? 'error' : ''}
                      placeholder="What is your inquiry about?"
                    />
                    {errors.subject && <span className="error-message">{errors.subject}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">Message *</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      className={errors.message ? 'error' : ''}
                      placeholder="Please provide details about your inquiry..."
                      rows="5"
                    ></textarea>
                    {errors.message && <span className="error-message">{errors.message}</span>}
                  </div>

                  <div className="form-submit-section">
                    {/* Progress bar for form submission */}
                    {isSubmitting && (
                      <div className="submit-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${submitProgress}%` }}
                          ></div>
                        </div>
                        <p className="progress-text">
                          {submitProgress < 50 && 'Validating your message...'}
                          {submitProgress >= 50 && submitProgress < 75 && 'Preparing to send...'}
                          {submitProgress >= 75 && submitProgress < 100 && 'Sending your message...'}
                          {submitProgress === 100 && 'Message sent successfully!'}
                        </p>
                      </div>
                    )}

                    <button 
                      type="submit" 
                      className={`btn btn-primary btn-large ${isSubmitting ? 'loading' : ''}`}
                      disabled={isSubmitting || isOffline}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="loading-spinner"></span>
                          Sending...
                        </>
                      ) : isOffline ? (
                        <>
                          📡 Offline - Cannot Send
                        </>
                      ) : (
                        'Send Message'
                      )}
                    </button>

                    {isOffline && (
                      <p className="offline-notice">
                        You're currently offline. Please check your internet connection to send your message.
                      </p>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Wrap the contact form with error boundary
export default function Contact() {
  return (
    <ContactFormErrorBoundary>
      <ContactForm />
    </ContactFormErrorBoundary>
  );
}