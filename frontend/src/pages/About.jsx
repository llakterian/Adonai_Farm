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
          "agricultural innovation East Africa"
        ]}
        image="/images/adonai1.jpg"
        url="/about"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "About", url: "/about" }
        ]}
      />

      <div className="about-page">
        {/* Hero Section with Parallax Effect */}
        <section className="about-hero">
          <div className="hero-background"></div>
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <div className="container">
              <div className="hero-text">
                <span className="hero-badge">🌾 Est. 1990s</span>
                <h1 className="hero-title">
                  The Story of <span className="highlight">Adonai Farm</span>
                </h1>
                <p className="hero-subtitle">
                  Where tradition meets innovation in the heart of Kericho's fertile highlands.
                  We're pioneering the future of sustainable livestock farming in Kenya.
                </p>
                <div className="hero-stats">
                  <div className="stat">
                    <span className="stat-number">100+</span>
                    <span className="stat-label">Animals</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">30+</span>
                    <span className="stat-label">Years Experience</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">24/7</span>
                    <span className="stat-label">Care & Monitoring</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Journey Timeline */}
        <section className="journey-section">
          <div className="container">
            <div className="section-header">
              <h2>🚀 Our Journey</h2>
              <p>From vision to reality - the milestones that shaped Adonai Farm</p>
            </div>

            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-marker">🌱</div>
                <div className="timeline-content">
                  <h3>1990s - The Beginning</h3>
                  <p>Started with a vision to revolutionize livestock farming in Kericho County using traditional farming wisdom and gradually incorporating modern techniques.</p>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-marker">🏗️</div>
                <div className="timeline-content">
                  <h3>2000s - Infrastructure Development</h3>
                  <p>Built modern livestock facilities with improved housing, advanced water systems, and better animal care infrastructure.</p>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-marker">🐄</div>
                <div className="timeline-content">
                  <h3>2010s - Livestock Expansion</h3>
                  <p>Expanded our herd with premium dairy cattle, goats, and sheep. Implemented comprehensive health monitoring and breeding programs.</p>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-marker">💻</div>
                <div className="timeline-content">
                  <h3>2020s - Digital Innovation</h3>
                  <p>Launched our comprehensive farm management system, enabling precise tracking, health monitoring, and production optimization.</p>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-marker">🌟</div>
                <div className="timeline-content">
                  <h3>2024 - Community Impact</h3>
                  <p>Opened our doors for educational tours, consulting services, and became a model farm for sustainable practices in East Africa.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision Cards */}
        <section className="mission-vision-section">
          <div className="container">
            <div className="mission-vision-grid">
              <div className="mission-card">
                <div className="card-header">
                  <div className="card-icon">🎯</div>
                  <h3>Our Mission</h3>
                </div>
                <p>
                  To revolutionize livestock farming in Kenya by combining cutting-edge technology
                  with sustainable practices, ensuring the highest standards of animal welfare while
                  maximizing productivity and environmental stewardship.
                </p>
                <div className="card-features">
                  <span className="feature">🌱 Sustainable Practices</span>
                  <span className="feature">💻 Modern Technology</span>
                  <span className="feature">❤️ Animal Welfare</span>
                </div>
              </div>

              <div className="vision-card">
                <div className="card-header">
                  <div className="card-icon">🌟</div>
                  <h3>Our Vision</h3>
                </div>
                <p>
                  To be East Africa's leading example of technology-enhanced sustainable farming,
                  inspiring a new generation of farmers and contributing to food security while
                  preserving our environment for future generations.
                </p>
                <div className="card-features">
                  <span className="feature">🏆 Industry Leadership</span>
                  <span className="feature">🌍 Environmental Care</span>
                  <span className="feature">📚 Knowledge Sharing</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What Makes Us Special */}
        <section className="special-section">
          <div className="container">
            <div className="section-header">
              <h2>🌟 What Makes Us Special</h2>
              <p>Discover the unique approach that sets Adonai Farm apart</p>
            </div>

            <div className="special-grid">
              <div className="special-item">
                <div className="special-icon">📱</div>
                <h4>Digital Farm Management</h4>
                <p>Our custom-built system tracks every aspect of farm operations, from individual animal health to production metrics and financial analysis.</p>
                <div className="special-highlight">Real-time monitoring & analytics</div>
              </div>

              <div className="special-item">
                <div className="special-icon">🌿</div>
                <h4>Sustainable Practices</h4>
                <p>We implement eco-friendly farming methods that protect the environment while maintaining high productivity and animal welfare standards.</p>
                <div className="special-highlight">Carbon-neutral operations</div>
              </div>

              <div className="special-item">
                <div className="special-icon">🎓</div>
                <h4>Educational Hub</h4>
                <p>We share our knowledge through farm tours, workshops, and consulting services, helping other farmers adopt modern practices.</p>
                <div className="special-highlight">Knowledge transfer programs</div>
              </div>

              <div className="special-item">
                <div className="special-icon">🏥</div>
                <h4>Premium Animal Care</h4>
                <p>Our livestock receive world-class veterinary care with preventive health programs, nutrition optimization, and stress-free environments.</p>
                <div className="special-highlight">24/7 health monitoring</div>
              </div>

              <div className="special-item">
                <div className="special-icon">🌾</div>
                <h4>Quality Genetics</h4>
                <p>We maintain superior breeding programs with carefully selected genetics to ensure healthy, productive livestock with excellent traits.</p>
                <div className="special-highlight">Premium bloodlines</div>
              </div>

              <div className="special-item">
                <div className="special-icon">🤝</div>
                <h4>Community Partnership</h4>
                <p>We actively support local farmers, provide employment opportunities, and contribute to the economic development of Kericho County.</p>
                <div className="special-highlight">Local community support</div>
              </div>
            </div>
          </div>
        </section>

        {/* Farm Facilities Showcase */}
        <section className="facilities-section">
          <div className="container">
            <div className="section-header">
              <h2>🏗️ World-Class Facilities</h2>
              <p>Tour our modern infrastructure designed for optimal animal welfare and productivity</p>
            </div>

            <div className="facilities-grid">
              <div className="facility-card">
                <div className="facility-image">
                  <img
                    src="/images/adonai2.jpg"
                    alt="Modern livestock housing"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="image-placeholder" style={{ display: 'none' }}>
                    🏠 Modern Housing
                  </div>
                </div>
                <div className="facility-content">
                  <h4>🏠 Climate-Controlled Housing</h4>
                  <p>State-of-the-art livestock housing with automated climate control, ensuring optimal comfort year-round.</p>
                  <ul>
                    <li>Temperature & humidity control</li>
                    <li>Advanced ventilation systems</li>
                    <li>Comfortable bedding areas</li>
                  </ul>
                </div>
              </div>

              <div className="facility-card">
                <div className="facility-image">
                  <img
                    src="/images/adonai5.jpg"
                    alt="Grazing pastures"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="image-placeholder" style={{ display: 'none' }}>
                    🌾 Grazing Areas
                  </div>
                </div>
                <div className="facility-content">
                  <h4>🌾 Premium Grazing Areas</h4>
                  <p>Extensive pastures with rotational grazing systems and nutrient-rich grass varieties for optimal nutrition.</p>
                  <ul>
                    <li>Rotational grazing systems</li>
                    <li>Nutrient-rich pastures</li>
                    <li>Natural water sources</li>
                  </ul>
                </div>
              </div>

              <div className="facility-card">
                <div className="facility-image">
                  <img
                    src="/images/adonai7.jpg"
                    alt="Veterinary facilities"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="image-placeholder" style={{ display: 'none' }}>
                    🏥 Vet Facilities
                  </div>
                </div>
                <div className="facility-content">
                  <h4>🏥 Veterinary Center</h4>
                  <p>Fully equipped on-site veterinary facilities with quarantine areas and emergency care capabilities.</p>
                  <ul>
                    <li>Modern medical equipment</li>
                    <li>Quarantine facilities</li>
                    <li>Emergency care units</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="team-section">
          <div className="container">
            <div className="section-header">
              <h2>👥 Meet Our Expert Team</h2>
              <p>The passionate professionals behind Adonai Farm's success</p>
            </div>

            <div className="team-grid">
              <div className="team-member">
                <div className="member-avatar">👨‍🌾</div>
                <div className="member-info">
                  <h4>Farm Operations Team</h4>
                  <p className="member-role">Daily Operations & Animal Care</p>
                  <p>Our experienced farm managers ensure optimal daily operations, from feeding schedules to health monitoring, with over 15 years of combined expertise in livestock management.</p>
                  <div className="member-skills">
                    <span className="skill">Animal Husbandry</span>
                    <span className="skill">Nutrition Management</span>
                    <span className="skill">Breeding Programs</span>
                  </div>
                </div>
              </div>

              <div className="team-member">
                <div className="member-avatar">👩‍💻</div>
                <div className="member-info">
                  <h4>Technology & Systems Team</h4>
                  <p className="member-role">Digital Innovation & Data Management</p>
                  <p>Our tech specialists maintain and develop our advanced farm management systems, ensuring seamless integration of technology with traditional farming practices.</p>
                  <div className="member-skills">
                    <span className="skill">Farm Management Systems</span>
                    <span className="skill">Data Analytics</span>
                    <span className="skill">IoT Integration</span>
                  </div>
                </div>
              </div>

              <div className="team-member">
                <div className="member-avatar">👨‍⚕️</div>
                <div className="member-info">
                  <h4>Veterinary Partners</h4>
                  <p className="member-role">Animal Health & Wellness</p>
                  <p>We collaborate with certified veterinarians who provide comprehensive health services, from routine check-ups to emergency care and breeding consultations.</p>
                  <div className="member-skills">
                    <span className="skill">Preventive Care</span>
                    <span className="skill">Emergency Medicine</span>
                    <span className="skill">Reproductive Health</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Location & Contact CTA */}
        <section className="location-cta-section">
          <div className="container">
            <div className="location-cta-content">
              <div className="location-info">
                <h2>📍 Visit Us in Kericho</h2>
                <p>
                  Located in the beautiful highlands of Chepsir, Kericho County, our farm benefits
                  from ideal climate conditions and rich soils perfect for livestock farming.
                </p>
                <div className="location-features">
                  <div className="location-feature">
                    <span className="feature-icon">🌡️</span>
                    <span>Ideal Climate (18-25°C year-round)</span>
                  </div>
                  <div className="location-feature">
                    <span className="feature-icon">💧</span>
                    <span>Abundant Water Resources</span>
                  </div>
                  <div className="location-feature">
                    <span className="feature-icon">🌱</span>
                    <span>Fertile Highland Soils</span>
                  </div>
                  <div className="location-feature">
                    <span className="feature-icon">🛣️</span>
                    <span>Easy Access from Major Roads</span>
                  </div>
                </div>
              </div>

              <div className="cta-actions">
                <h3>Ready to Experience Adonai Farm?</h3>
                <p>Schedule a visit, learn about our services, or explore partnership opportunities.</p>
                <div className="cta-buttons">
                  <a href="/contact" className="btn btn-primary btn-large">
                    📞 Contact Us
                  </a>
                  <a href="/services" className="btn btn-outline btn-large">
                    🌾 Our Services
                  </a>
                </div>
                <div className="contact-quick">
                  <span>📞 +254 722 759 217</span>
                  <span>📧 info@adonaifarm.co.ke</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}