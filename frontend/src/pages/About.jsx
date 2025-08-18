import React from 'react';
import SEOHead from '../components/SEOHead.jsx';

export default function About() {
  return (
    <>
      <SEOHead 
        pageType="about"
        title="About Adonai Farm - Our Story & Mission"
        description="Learn about Adonai Farm's journey from humble beginnings to becoming a leading livestock farm in Kericho, Kenya. Discover our mission, values, and commitment to sustainable farming with modern technology."
        keywords={[
          "Adonai Farm history",
          "sustainable farming Kenya",
          "livestock farm Kericho County",
          "modern farming technology Kenya",
          "agricultural innovation East Africa",
          "farm mission values",
          "Chepsir Kericho farm",
          "animal welfare farming"
        ]}
        image="/images/farm-2.jpg"
        url="/about"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "About", url: "/about" }
        ]}
      />
      <div className="about-page">
        {/* Hero Section */}
        <section className="about-hero">
          <div className="about-hero-content">
            <h1>About Adonai Farm</h1>
            <p className="hero-subtitle">
              Dedicated to sustainable livestock farming with modern technology and traditional care
            </p>
          </div>
        </section>

        {/* Farm History Section */}
        <section className="about-section">
          <div className="container">
            <div className="section-content">
              <h2>Our Story</h2>
              <div className="story-content">
                <div className="story-text">
                  <p>
                    Adonai Farm was established with a vision to revolutionize livestock management 
                    through the integration of modern technology and time-tested farming practices. 
                    Located in the fertile highlands of Chepsir, Kericho, Kenya, our farm has grown 
                    from humble beginnings to become a model of sustainable and efficient livestock farming.
                  </p>
                  <p>
                    Our journey began with a simple belief: that technology can enhance, not replace, 
                    the personal care and attention that livestock deserve. Today, we manage our animals 
                    with precision tracking, health monitoring, and breeding optimization while maintaining 
                    the highest standards of animal welfare.
                  </p>
                </div>
                <div className="story-image">
                  <img 
                    src="/images/farm-2.jpg" 
                    alt="Adonai Farm landscape" 
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div className="image-placeholder" style={{display: 'none'}}>
                    🌾 Farm Landscape
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="about-section mission-section">
          <div className="container">
            <div className="mission-vision-grid">
              <div className="mission-card">
                <div className="card-icon">🎯</div>
                <h3>Our Mission</h3>
                <p>
                  To provide high-quality livestock and agricultural products while pioneering 
                  sustainable farming practices that benefit our community, environment, and 
                  the future of agriculture in Kenya.
                </p>
              </div>
              <div className="vision-card">
                <div className="card-icon">🌟</div>
                <h3>Our Vision</h3>
                <p>
                  To be the leading example of technology-enhanced sustainable farming in East Africa, 
                  demonstrating that modern innovation and traditional farming wisdom can work 
                  together for exceptional results.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="about-section values-section">
          <div className="container">
            <h2>Our Core Values</h2>
            <div className="values-grid">
              <div className="value-item">
                <div className="value-icon">🤝</div>
                <h4>Integrity</h4>
                <p>We operate with transparency and honesty in all our farming practices and business dealings.</p>
              </div>
              <div className="value-item">
                <div className="value-icon">🌱</div>
                <h4>Sustainability</h4>
                <p>We are committed to farming practices that protect and enhance our environment for future generations.</p>
              </div>
              <div className="value-item">
                <div className="value-icon">💡</div>
                <h4>Innovation</h4>
                <p>We embrace technology and modern methods to improve efficiency while maintaining quality.</p>
              </div>
              <div className="value-item">
                <div className="value-icon">❤️</div>
                <h4>Animal Welfare</h4>
                <p>The health and well-being of our livestock is our top priority in everything we do.</p>
              </div>
              <div className="value-item">
                <div className="value-icon">🏆</div>
                <h4>Excellence</h4>
                <p>We strive for the highest standards in all aspects of our farming operations.</p>
              </div>
              <div className="value-item">
                <div className="value-icon">🤲</div>
                <h4>Community</h4>
                <p>We believe in supporting our local community and sharing knowledge with fellow farmers.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="about-section team-section">
          <div className="container">
            <h2>Meet Our Team</h2>
            <p className="section-intro">
              Our dedicated team combines years of farming experience with modern agricultural expertise 
              to ensure the best care for our livestock and the highest quality products for our customers.
            </p>
            <div className="team-grid">
              <div className="team-member">
                <div className="member-avatar">👨‍🌾</div>
                <h4>Farm Management Team</h4>
                <p className="member-role">Operations & Livestock Care</p>
                <p>
                  Our experienced farm managers oversee daily operations, ensuring optimal animal health, 
                  nutrition, and breeding programs with decades of combined expertise.
                </p>
              </div>
              <div className="team-member">
                <div className="member-avatar">👩‍💻</div>
                <h4>Technology Team</h4>
                <p className="member-role">Systems & Data Management</p>
                <p>
                  Our tech specialists maintain our advanced farm management systems, ensuring accurate 
                  tracking, reporting, and optimization of all farm operations.
                </p>
              </div>
              <div className="team-member">
                <div className="member-avatar">👨‍⚕️</div>
                <h4>Veterinary Partners</h4>
                <p className="member-role">Animal Health & Wellness</p>
                <p>
                  We work closely with qualified veterinarians to maintain the highest standards of 
                  animal health, preventive care, and breeding programs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Location & Facilities Section */}
        <section className="about-section location-section">
          <div className="container">
            <h2>Our Location & Facilities</h2>
            <div className="location-content">
              <div className="location-info">
                <h3>📍 Chepsir, Kericho, Kenya</h3>
                <p>
                  Strategically located in the fertile highlands of Kericho County, our farm benefits 
                  from ideal climate conditions, rich soils, and abundant water resources that create 
                  the perfect environment for livestock farming.
                </p>
                <div className="facility-features">
                  <h4>Our Facilities Include:</h4>
                  <ul>
                    <li>🏠 Modern livestock housing with climate control</li>
                    <li>🌾 Extensive grazing pastures and feed production areas</li>
                    <li>💧 Advanced water management and irrigation systems</li>
                    <li>🏥 On-site veterinary facilities and quarantine areas</li>
                    <li>📊 Digital monitoring and management systems</li>
                    <li>🚜 Modern farm equipment and machinery</li>
                  </ul>
                </div>
              </div>
              <div className="location-image">
                <img 
                  src="/images/farm-3.jpg" 
                  alt="Farm facilities" 
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div className="image-placeholder" style={{display: 'none'}}>
                  🏗️ Farm Facilities
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA Section */}
        <section className="about-section cta-section">
          <div className="container">
            <div className="cta-content">
              <h2>Ready to Learn More?</h2>
              <p>
                We'd love to share more about our farming practices, arrange a farm visit, 
                or discuss how we can serve your livestock and agricultural needs.
              </p>
              <div className="cta-buttons">
                <a href="/contact" className="btn btn-primary">Contact Us</a>
                <a href="/services" className="btn btn-outline">Our Services</a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}