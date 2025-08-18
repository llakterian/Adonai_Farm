import React from 'react';
import SEOHead from '../components/SEOHead.jsx';

export default function Services() {
  return (
    <>
      <SEOHead 
        pageType="services"
        title="Farm Services - Livestock Breeding, Tours & Agricultural Consulting"
        description="Comprehensive livestock services at Adonai Farm: professional breeding, educational farm tours (KSh 500), premium meat & dairy products, and agricultural consulting in Kericho, Kenya."
        keywords={[
          "livestock breeding Kenya",
          "farm tours Kericho",
          "agricultural consulting Kenya", 
          "premium beef Kericho",
          "dairy products Kenya",
          "farm visits Kericho County",
          "veterinary services livestock",
          "digital farm management",
          "livestock nutrition consulting",
          "farm education tours"
        ]}
        image="/images/farm-3.jpg"
        url="/services"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Services", url: "/services" }
        ]}
      />
      <div className="services-page">
        {/* Hero Section */}
        <section className="services-hero">
          <div className="services-hero-content">
            <h1>Our Services</h1>
            <p className="hero-subtitle">
              Comprehensive livestock and agricultural services backed by modern technology and expertise
            </p>
          </div>
        </section>

        {/* Main Services Section */}
        <section className="services-section">
          <div className="container">
            <div className="section-header">
              <h2>Our Premium Services</h2>
              <p className="section-subtitle">
                Discover how Adonai Farm can serve your agricultural needs with our comprehensive range of professional services
              </p>
            </div>
            
            <div className="services-grid">
              
              {/* 1. Farm Visits & Tours - Most accessible entry point */}
              <div className="service-card featured-service">
                <div className="service-number">01</div>
                <div className="service-header">
                  <div className="service-icon">🌾</div>
                  <div className="service-title">
                    <h3>Farm Visits & Educational Tours</h3>
                    <span className="service-badge">Most Popular</span>
                  </div>
                </div>
                <p className="service-description">
                  Experience modern farming firsthand! Join our guided tours to see cutting-edge 
                  livestock management, meet our animals, and learn sustainable farming practices.
                </p>
                <div className="service-highlights">
                  <div className="highlight-item">
                    <span className="highlight-icon">👨‍🌾</span>
                    <span>Expert-guided walkthrough</span>
                  </div>
                  <div className="highlight-item">
                    <span className="highlight-icon">📱</span>
                    <span>Technology demonstrations</span>
                  </div>
                  <div className="highlight-item">
                    <span className="highlight-icon">🐄</span>
                    <span>Meet our friendly animals</span>
                  </div>
                  <div className="highlight-item">
                    <span className="highlight-icon">🎓</span>
                    <span>Educational sessions</span>
                  </div>
                </div>
                <div className="service-pricing">
                  <div className="pricing-header">
                    <h4>Tour Packages</h4>
                  </div>
                  <div className="price-options">
                    <div className="price-option recommended">
                      <div className="price-header">
                        <span className="price-type">Family Experience</span>
                        <span className="price-badge">Best Value</span>
                      </div>
                      <span className="price">KSh 500 <small>per person</small></span>
                      <span className="price-description">Perfect for families & individuals</span>
                    </div>
                    <div className="price-option">
                      <span className="price-type">School Groups (10+)</span>
                      <span className="price">KSh 300 <small>per student</small></span>
                      <span className="price-description">Educational group discounts</span>
                    </div>
                    <div className="price-option">
                      <span className="price-type">Professional Tours</span>
                      <span className="price">Custom Pricing</span>
                      <span className="price-description">For agricultural professionals</span>
                    </div>
                  </div>
                  <div className="availability-info">
                    <span className="availability-icon">🕒</span>
                    <span>Available Monday-Saturday, 9 AM - 4 PM</span>
                  </div>
                </div>
              </div>

              {/* 2. Premium Products - Direct customer benefit */}
              <div className="service-card">
                <div className="service-number">02</div>
                <div className="service-header">
                  <div className="service-icon">🥩</div>
                  <div className="service-title">
                    <h3>Premium Farm Products</h3>
                    <span className="service-badge quality-badge">Farm Fresh</span>
                  </div>
                </div>
                <p className="service-description">
                  Enjoy the finest quality meat, dairy, and livestock products from our carefully 
                  managed, healthy animals. Every product comes with full traceability and quality assurance.
                </p>
                <div className="service-highlights">
                  <div className="highlight-item">
                    <span className="highlight-icon">🏆</span>
                    <span>Premium quality guarantee</span>
                  </div>
                  <div className="highlight-item">
                    <span className="highlight-icon">🌱</span>
                    <span>Naturally raised animals</span>
                  </div>
                  <div className="highlight-item">
                    <span className="highlight-icon">📋</span>
                    <span>Full traceability records</span>
                  </div>
                  <div className="highlight-item">
                    <span className="highlight-icon">🚚</span>
                    <span>Fresh delivery available</span>
                  </div>
                </div>
                <div className="product-categories">
                  <div className="category-item">
                    <span className="category-icon">🥩</span>
                    <div className="category-info">
                      <h5>Fresh Meat</h5>
                      <p>Premium beef, mutton & processed products</p>
                    </div>
                  </div>
                  <div className="category-item">
                    <span className="category-icon">🥛</span>
                    <div className="category-info">
                      <h5>Dairy Products</h5>
                      <p>Fresh milk, cheese & organic dairy</p>
                    </div>
                  </div>
                  <div className="category-item">
                    <span className="category-icon">🐄</span>
                    <div className="category-info">
                      <h5>Live Animals</h5>
                      <p>Breeding stock & healthy livestock</p>
                    </div>
                  </div>
                </div>
                <div className="service-pricing">
                  <div className="pricing-note">
                    <span className="pricing-icon">💰</span>
                    <span>Competitive seasonal pricing • Pre-orders recommended</span>
                  </div>
                  <div className="availability-info">
                    <span className="availability-icon">📅</span>
                    <span>Fresh products available weekly</span>
                  </div>
                </div>
              </div>

              {/* 3. Professional Breeding - High-value service */}
              <div className="service-card">
                <div className="service-number">03</div>
                <div className="service-header">
                  <div className="service-icon">🧬</div>
                  <div className="service-title">
                    <h3>Professional Livestock Breeding</h3>
                    <span className="service-badge expert-badge">Expert Service</span>
                  </div>
                </div>
                <p className="service-description">
                  Enhance your livestock quality with our professional breeding services. We use 
                  genetic optimization and advanced health tracking to improve productivity and animal welfare.
                </p>
                <div className="service-highlights">
                  <div className="highlight-item">
                    <span className="highlight-icon">🔬</span>
                    <span>Genetic analysis & optimization</span>
                  </div>
                  <div className="highlight-item">
                    <span className="highlight-icon">💉</span>
                    <span>Professional AI services</span>
                  </div>
                  <div className="highlight-item">
                    <span className="highlight-icon">🤱</span>
                    <span>Pregnancy monitoring & care</span>
                  </div>
                  <div className="highlight-item">
                    <span className="highlight-icon">📊</span>
                    <span>Complete breeding records</span>
                  </div>
                </div>
                <div className="breeding-process">
                  <h5>Our Breeding Process</h5>
                  <div className="process-steps">
                    <div className="process-step">
                      <span className="step-number">1</span>
                      <span className="step-text">Genetic Assessment</span>
                    </div>
                    <div className="process-step">
                      <span className="step-number">2</span>
                      <span className="step-text">Breeding Plan</span>
                    </div>
                    <div className="process-step">
                      <span className="step-number">3</span>
                      <span className="step-text">Implementation</span>
                    </div>
                    <div className="process-step">
                      <span className="step-number">4</span>
                      <span className="step-text">Monitoring & Care</span>
                    </div>
                  </div>
                </div>
                <div className="service-pricing">
                  <div className="pricing-note">
                    <span className="pricing-icon">🎯</span>
                    <span>Customized programs tailored to your goals</span>
                  </div>
                  <div className="consultation-cta">
                    <span>Contact us for a personalized breeding consultation</span>
                  </div>
                </div>
              </div>

              {/* 4. Agricultural Consulting - Professional service */}
              <div className="service-card">
                <div className="service-number">04</div>
                <div className="service-header">
                  <div className="service-icon">📈</div>
                  <div className="service-title">
                    <h3>Agricultural Consulting & Training</h3>
                    <span className="service-badge consulting-badge">Transform Your Farm</span>
                  </div>
                </div>
                <p className="service-description">
                  Transform your farming operations with our expert consulting services. We help 
                  implement modern livestock management systems and provide comprehensive training.
                </p>
                <div className="service-highlights">
                  <div className="highlight-item">
                    <span className="highlight-icon">🎯</span>
                    <span>Farm optimization strategies</span>
                  </div>
                  <div className="highlight-item">
                    <span className="highlight-icon">💻</span>
                    <span>Technology integration</span>
                  </div>
                  <div className="highlight-item">
                    <span className="highlight-icon">👥</span>
                    <span>Staff training programs</span>
                  </div>
                  <div className="highlight-item">
                    <span className="highlight-icon">📞</span>
                    <span>Ongoing support</span>
                  </div>
                </div>
                <div className="consulting-packages">
                  <div className="package-item">
                    <div className="package-header">
                      <h5>Discovery Consultation</h5>
                      <span className="package-price">KSh 5,000</span>
                    </div>
                    <p>Comprehensive farm assessment & recommendations</p>
                  </div>
                  <div className="package-item featured-package">
                    <div className="package-header">
                      <h5>System Implementation</h5>
                      <span className="package-price">Custom Quote</span>
                    </div>
                    <p>Complete system setup & integration</p>
                  </div>
                  <div className="package-item">
                    <div className="package-header">
                      <h5>Ongoing Support</h5>
                      <span className="package-price">Monthly Plans</span>
                    </div>
                    <p>Continuous guidance & optimization</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Specialized Services Section */}
        <section className="services-section specialized-section">
          <div className="container">
            <h2>Specialized Services</h2>
            <div className="specialized-services">
              
              <div className="specialized-service">
                <div className="service-header">
                  <div className="service-icon">🏥</div>
                  <h3>Veterinary Support Services</h3>
                </div>
                <p>
                  Working with qualified veterinarians, we provide health monitoring, 
                  preventive care, and emergency veterinary support for livestock.
                </p>
                <div className="service-details">
                  <span className="detail-item">🩺 Health checkups</span>
                  <span className="detail-item">💉 Vaccination programs</span>
                  <span className="detail-item">🚨 Emergency care</span>
                </div>
              </div>

              <div className="specialized-service">
                <div className="service-header">
                  <div className="service-icon">📱</div>
                  <h3>Digital Farm Management</h3>
                </div>
                <p>
                  Custom digital solutions for livestock tracking, breeding management, 
                  and farm operations optimization using our proven systems.
                </p>
                <div className="service-details">
                  <span className="detail-item">📊 Data analytics</span>
                  <span className="detail-item">📋 Record keeping</span>
                  <span className="detail-item">📈 Performance tracking</span>
                </div>
              </div>

              <div className="specialized-service">
                <div className="service-header">
                  <div className="service-icon">🌾</div>
                  <h3>Feed & Nutrition Consulting</h3>
                </div>
                <p>
                  Expert advice on livestock nutrition, feed optimization, and pasture 
                  management to maximize animal health and productivity.
                </p>
                <div className="service-details">
                  <span className="detail-item">🥬 Nutrition planning</span>
                  <span className="detail-item">🌱 Pasture management</span>
                  <span className="detail-item">⚖️ Feed optimization</span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Service Areas & Availability */}
        <section className="services-section availability-section">
          <div className="container">
            <div className="availability-content">
              <div className="service-areas">
                <h3>Service Areas</h3>
                <p>We primarily serve the Kericho County region and surrounding areas:</p>
                <ul className="areas-list">
                  <li>📍 Kericho County (Primary)</li>
                  <li>📍 Bomet County</li>
                  <li>📍 Nakuru County (Selected areas)</li>
                  <li>📍 Kisumu County (Selected areas)</li>
                </ul>
                <p className="service-note">
                  For services outside our primary area, additional travel charges may apply. 
                  Contact us to discuss your specific location.
                </p>
              </div>
              
              <div className="operating-hours">
                <h3>Operating Hours</h3>
                <div className="hours-grid">
                  <div className="hours-item">
                    <span className="day">Monday - Friday</span>
                    <span className="time">7:00 AM - 6:00 PM</span>
                  </div>
                  <div className="hours-item">
                    <span className="day">Saturday</span>
                    <span className="time">8:00 AM - 4:00 PM</span>
                  </div>
                  <div className="hours-item">
                    <span className="day">Sunday</span>
                    <span className="time">Emergency services only</span>
                  </div>
                </div>
                <p className="emergency-note">
                  🚨 Emergency veterinary support available 24/7 for existing clients
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact & Booking Section */}
        <section className="services-section booking-section">
          <div className="container">
            <div className="booking-content">
              <h2>Ready to Get Started?</h2>
              <p>
                Contact us today to discuss your needs, schedule a farm visit, or learn more 
                about how our services can benefit your agricultural operations.
              </p>
              
              <div className="contact-methods">
                <div className="contact-method">
                  <div className="contact-icon">📞</div>
                  <h4>Call Us</h4>
                  <p>+254 722 759 217</p>
                  <span className="contact-note">Available during business hours</span>
                </div>
                
                <div className="contact-method">
                  <div className="contact-icon">📧</div>
                  <h4>Email Us</h4>
                  <p>info@adonaifarm.co.ke</p>
                  <span className="contact-note">We respond within 24 hours</span>
                </div>
                
                <div className="contact-method">
                  <div className="contact-icon">📍</div>
                  <h4>Visit Us</h4>
                  <p>Chepsir, Kericho, Kenya</p>
                  <span className="contact-note">By appointment only</span>
                </div>
              </div>

              <div className="booking-cta">
                <a href="/contact" className="btn btn-primary btn-large">
                  Contact Us Today
                </a>
                <p className="cta-note">
                  Ready to discuss your agricultural needs? We're here to help!
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}