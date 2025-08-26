import React, { useState } from 'react';
import SEOHead from '../components/SEOHead.jsx';
import '../styles/contact.css';

export default function Contact() {
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

  const inquiryTypes = [
    { value: 'visit', label: '🌾 Farm Visit/Tour', icon: '🚜' },
    { value: 'purchase', label: '🥛 Product Purchase', icon: '🛒' },
    { value: 'breeding', label: '🐄 Breeding Services', icon: '💝' },
    { value: 'consulting', label: '📚 Agricultural Consulting', icon: '🎓' },
    { value: 'general', label: '💬 General Questions', icon: '❓' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setSubmitStatus('success');
      setIsSubmitting(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        inquiryType: 'general',
        subject: '',
        message: ''
      });
    }, 2000);
  };

  return (
    <>
      <SEOHead
        pageType="contact"
        title="Contact Adonai Farm - Visit, Inquire & Connect"
        description="Contact Adonai Farm in Chepsir, Kericho for farm visits, product inquiries, and breeding services. Call +254 722 759 217 or email info@adonaifarm.co.ke."
        keywords={[
          "contact Adonai Farm",
          "farm visits Kericho",
          "Chepsir Kericho farm contact",
          "livestock farm Kenya contact",
          "farm tours booking Kericho"
        ]}
        image="/images/adonai1.jpg"
        url="/contact"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Contact", url: "/contact" }
        ]}
      />

      <div className="contact-page">
        {/* Hero Section with Farm Background */}
        <section className="contact-hero">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <div className="container">
              <div className="hero-text">
                <h1 className="hero-title">
                  <span className="title-icon">🌾</span>
                  Get In Touch With Adonai Farm
                </h1>
                <p className="hero-subtitle">
                  Ready to visit our farm, purchase our products, or learn about our services?
                  We're here to help you connect with sustainable agriculture in Kericho.
                </p>
                <div className="hero-stats">
                  <div className="stat-item">
                    <span className="stat-icon">📞</span>
                    <span className="stat-text">Quick Response</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">🕒</span>
                    <span className="stat-text">Open 6 Days/Week</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">🌍</span>
                    <span className="stat-text">Kericho, Kenya</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Contact Content */}
        <section className="contact-main">
          <div className="container">
            <div className="contact-grid"
              style={{
                width: '100%',
                maxWidth: '100%',
                overflowX: 'hidden'
              }}>

              {/* Contact Information Cards */}
              <div className="contact-info-section">
                <div className="section-header">
                  <h2>🏡 Visit Our Farm</h2>
                  <p>Experience modern farming firsthand at our beautiful location in Kericho County</p>
                </div>

                {/* Contact Methods */}
                <div className="contact-methods">
                  <div className="contact-card primary-card">
                    <div className="card-icon">📞</div>
                    <div className="card-content">
                      <h3>Call Us Direct</h3>
                      <p className="contact-value">+254 722 759 217</p>
                      <p className="contact-note">Available Mon-Sat, 8AM-5PM</p>
                      <div className="card-action">
                        <a href="tel:+254722759217" className="btn btn-outline btn-sm">
                          📞 Call Now
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="contact-card">
                    <div className="card-icon">📧</div>
                    <div className="card-content">
                      <h3>Email Inquiries</h3>
                      <p className="contact-value">info@adonaifarm.co.ke</p>
                      <p className="contact-note">We respond within 24 hours</p>
                      <div className="card-action">
                        <a href="mailto:info@adonaifarm.co.ke" className="btn btn-outline btn-sm">
                          ✉️ Send Email
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="contact-card">
                    <div className="card-icon">📍</div>
                    <div className="card-content">
                      <h3>Farm Location</h3>
                      <p className="contact-value">Chepsir, Kericho</p>
                      <p className="contact-note">Kericho County, Kenya</p>
                      <div className="card-action">
                        <a href="#" className="btn btn-outline btn-sm">
                          🗺️ Get Directions
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Farm Hours */}
                <div className="farm-hours-card">
                  <h3>🕒 Farm Visit Hours</h3>
                  <div className="hours-grid">
                    <div className="hours-item">
                      <span className="day">Monday - Friday</span>
                      <span className="time">8:00 AM - 5:00 PM</span>
                    </div>
                    <div className="hours-item">
                      <span className="day">Saturday</span>
                      <span className="time">8:00 AM - 4:00 PM</span>
                    </div>
                    <div className="hours-item special">
                      <span className="day">Sunday</span>
                      <span className="time">By Appointment Only</span>
                    </div>
                  </div>
                  <div className="hours-note">
                    <span className="note-icon">💡</span>
                    <span>We recommend calling ahead to schedule your visit for the best experience!</span>
                  </div>
                </div>

                {/* What We Offer */}
                <div className="services-preview">
                  <h3>🌟 What We Offer</h3>
                  <div className="services-grid">
                    <div className="service-item">
                      <span className="service-icon">🚜</span>
                      <div className="service-info">
                        <h4>Farm Tours</h4>
                        <p>Guided educational visits</p>
                      </div>
                    </div>
                    <div className="service-item">
                      <span className="service-icon">🥛</span>
                      <div className="service-info">
                        <h4>Fresh Products</h4>
                        <p>Dairy, eggs, and meat</p>
                      </div>
                    </div>
                    <div className="service-item">
                      <span className="service-icon">🐄</span>
                      <div className="service-info">
                        <h4>Breeding Services</h4>
                        <p>Quality livestock genetics</p>
                      </div>
                    </div>
                    <div className="service-item">
                      <span className="service-icon">📚</span>
                      <div className="service-info">
                        <h4>Consulting</h4>
                        <p>Agricultural expertise</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="contact-form-section">
                <div className="form-header">
                  <h2>💬 Send Us a Message</h2>
                  <p>Have questions or want to schedule a visit? Fill out the form below and we'll get back to you promptly.</p>
                </div>

                {submitStatus === 'success' && (
                  <div className="alert alert-success">
                    <div className="alert-icon">✅</div>
                    <div className="alert-content">
                      <strong>Message Sent Successfully!</strong>
                      <p>Thank you for contacting us. We'll respond within 24 hours.</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="contact-form">
                  {/* Personal Information */}
                  <div className="form-section">
                    <h4 className="form-section-title">👤 Your Information</h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="name">Full Name *</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="email">Email Address *</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="your.email@example.com"
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+254 XXX XXX XXX"
                      />
                    </div>
                  </div>

                  {/* Inquiry Type */}
                  <div className="form-section">
                    <h4 className="form-section-title">🎯 What Can We Help You With?</h4>
                    <div className="inquiry-types">
                      {inquiryTypes.map(type => (
                        <label key={type.value} className="inquiry-option">
                          <input
                            type="radio"
                            name="inquiryType"
                            value={type.value}
                            checked={formData.inquiryType === type.value}
                            onChange={handleInputChange}
                          />
                          <div className="option-content">
                            <span className="option-icon">{type.icon}</span>
                            <span className="option-label">{type.label}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="form-section">
                    <h4 className="form-section-title">💭 Your Message</h4>
                    <div className="form-group">
                      <label htmlFor="subject">Subject</label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="Brief subject of your inquiry"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="message">Message *</label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Tell us more about your inquiry, preferred visit dates, or any specific questions you have..."
                        rows="6"
                        required
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="form-submit">
                    <button
                      type="submit"
                      className="btn btn-primary btn-large"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner"></span>
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <span className="btn-icon">📤</span>
                          Send Message
                        </>
                      )}
                    </button>
                    <p className="submit-note">
                      By submitting this form, you agree to be contacted by Adonai Farm regarding your inquiry.
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Contact Banner */}
        <section className="quick-contact-banner">
          <div className="container">
            <div className="banner-content"
              style={{
                width: '100%',
                maxWidth: '100%',
                overflowX: 'hidden'
              }}>
              <div className="banner-text">
                <h3>🚀 Need Immediate Assistance?</h3>
                <p>For urgent inquiries or same-day visits, give us a call directly!</p>
              </div>
              <div className="banner-actions">
                <a href="tel:+254722759217" className="btn btn-primary">
                  📞 Call +254 722 759 217
                </a>
                <a href="mailto:info@adonaifarm.co.ke" className="btn btn-outline">
                  ✉️ Quick Email
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}