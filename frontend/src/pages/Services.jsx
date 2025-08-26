import React, { useState } from 'react';
import SEOHead from '../components/SEOHead.jsx';
import '../styles/services.css';

export default function Services() {
  const [selectedService, setSelectedService] = useState(null);

  const services = [
    {
      id: 'farm-management',
      title: 'Digital Farm Management System',
      icon: '💻',
      category: 'Technology',
      price: 'Custom Pricing',
      description: 'Complete digital solution for modern farm management with real-time monitoring and analytics.',
      features: [
        'Livestock tracking and health monitoring',
        'Worker time tracking and payroll management',
        'Inventory and feed management',
        'Financial reporting and analytics',
        'Mobile-responsive dashboard',
        'Photo gallery and documentation',
        'Multi-user access with role-based permissions'
      ],
      benefits: [
        'Increase farm productivity by 30%',
        'Reduce operational costs',
        'Improve animal health monitoring',
        'Streamline workforce management',
        'Generate detailed reports for decision making'
      ]
    },
    {
      id: 'livestock-breeding',
      title: 'Professional Livestock Breeding',
      icon: '🐄',
      category: 'Breeding',
      price: 'Contact us for pricing',
      description: 'Expert breeding services for dairy cattle, beef cattle, goats, and sheep with proven genetics.',
      features: [
        'Artificial insemination services',
        'Genetic selection and breeding programs',
        'Pregnancy monitoring and care',
        'Breeding record management',
        'Nutritional guidance for breeding stock',
        'Health monitoring during breeding cycles'
      ],
      benefits: [
        'Improved livestock genetics',
        'Higher milk and meat production',
        'Reduced breeding costs',
        'Better disease resistance',
        'Increased farm profitability'
      ]
    },
    {
      id: 'farm-tours',
      title: 'Educational Farm Tours',
      icon: '🚜',
      category: 'Education',
      price: 'Contact us for pricing',
      description: 'Interactive educational tours showcasing modern farming practices and sustainable agriculture.',
      features: [
        'Guided tours of all farm facilities',
        'Meet and interact with farm animals',
        'Learn about sustainable farming practices',
        'Hands-on farming activities',
        'Educational materials and resources',
        'Group discounts available'
      ],
      benefits: [
        'Educational experience for all ages',
        'Understanding of modern farming',
        'Connection with nature and animals',
        'Support for local agriculture',
        'Perfect for schools and families'
      ]
    },
    {
      id: 'consulting',
      title: 'Agricultural Consulting',
      icon: '📊',
      category: 'Consulting',
      price: 'Contact us for pricing',
      description: 'Professional consulting services for farm setup, optimization, and digital transformation.',
      features: [
        'Farm setup and planning consultation',
        'Digital transformation guidance',
        'Livestock management optimization',
        'Financial planning and budgeting',
        'Technology implementation support',
        'Ongoing support and training'
      ],
      benefits: [
        'Expert guidance from experienced farmers',
        'Customized solutions for your farm',
        'Reduced startup risks',
        'Faster return on investment',
        'Access to latest farming technologies'
      ]
    },
    {
      id: 'products',
      title: 'Premium Farm Products',
      icon: '🥛',
      category: 'Products',
      price: 'Market Rates',
      description: 'Fresh, high-quality dairy products, meat, and other farm produce directly from our farm.',
      features: [
        'Fresh daily milk and dairy products',
        'Premium grass-fed beef',
        'Free-range poultry and eggs',
        'Organic vegetables and herbs',
        'Custom processing services',
        'Direct farm-to-table delivery'
      ],
      benefits: [
        'Guaranteed freshness and quality',
        'Support for local farming',
        'Traceable source and production',
        'Competitive pricing',
        'Sustainable farming practices'
      ]
    },
    {
      id: 'training',
      title: 'Farmer Training Programs',
      icon: '🎓',
      category: 'Education',
      price: 'Contact us for pricing',
      description: 'Comprehensive training programs for modern farming techniques and digital farm management.',
      features: [
        'Digital farm management training',
        'Livestock care and breeding workshops',
        'Financial management for farmers',
        'Sustainable farming practices',
        'Technology adoption guidance',
        'Certification programs available'
      ],
      benefits: [
        'Improved farming skills and knowledge',
        'Higher farm productivity',
        'Better financial management',
        'Access to modern farming techniques',
        'Networking with other farmers'
      ]
    }
  ];

  const categories = ['All', 'Technology', 'Breeding', 'Education', 'Consulting', 'Products'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredServices = selectedCategory === 'All'
    ? services
    : services.filter(service => service.category === selectedCategory);

  const openServiceModal = (service) => {
    setSelectedService(service);
  };

  const closeServiceModal = () => {
    setSelectedService(null);
  };

  return (
    <>
      <SEOHead
        pageType="services"
        title="Farm Services - Digital Management, Breeding & Agricultural Consulting"
        description="Comprehensive agricultural services at Adonai Farm: digital farm management systems, professional livestock breeding, educational tours, consulting, and premium farm products in Kericho, Kenya."
        keywords={[
          "digital farm management Kenya",
          "livestock breeding services",
          "farm tours Kericho",
          "agricultural consulting Kenya",
          "farm management software",
          "livestock tracking system",
          "dairy farming services",
          "farm education programs",
          "sustainable agriculture Kenya",
          "modern farming techniques"
        ]}
        image="/images/adonai1.jpg"
        url="/services"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Services", url: "/services" }
        ]}
      />

      <div className="services-page">
        {/* Hero Section */}
        <section className="services-hero">
          <div className="hero-background"></div>
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <div className="container">
              <div className="hero-text">
                <span className="hero-badge">🌾 Professional Services</span>
                <h1 className="hero-title">
                  Comprehensive <span className="highlight">Agricultural Services</span>
                </h1>
                <p className="hero-subtitle">
                  From cutting-edge digital farm management to traditional breeding expertise,
                  we provide complete solutions for modern agriculture in Kenya.
                </p>
                <div className="hero-stats">
                  <div className="stat">
                    <span className="stat-number">6+</span>
                    <span className="stat-label">Service Categories</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">100+</span>
                    <span className="stat-label">Satisfied Clients</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">5+</span>
                    <span className="stat-label">Years Experience</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Service Categories Filter */}
        <section className="services-filter">
          <div className="container">
            <h2 className="filter-title">🔍 Explore Our Services</h2>
            <div className="filter-buttons">
              {categories.map(category => (
                <button
                  key={category}
                  className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  <span className="filter-name">{category}</span>
                  <span className="filter-count">
                    ({category === 'All' ? services.length : services.filter(s => s.category === category).length})
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="services-grid-section">
          <div className="container">
            <div className="services-grid">
              {filteredServices.map(service => (
                <div key={service.id} className="service-card" onClick={() => openServiceModal(service)}>
                  <div className="service-header">
                    <div className="service-icon">{service.icon}</div>
                    <div className="service-category">{service.category}</div>
                  </div>

                  <div className="service-content">
                    <h3 className="service-title">{service.title}</h3>
                    <p className="service-description">{service.description}</p>

                    <div className="service-price">
                      <span className="price-label">Starting from</span>
                      {service.price === 'Contact us for pricing' ? (
                        <a href="tel:+254722759217" className="price-value contact-link">
                          {service.price}
                        </a>
                      ) : (
                        <span className="price-value">{service.price}</span>
                      )}
                    </div>

                    <div className="service-features">
                      <h4>Key Features:</h4>
                      <ul>
                        {service.features.slice(0, 3).map((feature, index) => (
                          <li key={index}>✓ {feature}</li>
                        ))}
                        {service.features.length > 3 && (
                          <li className="more-features">+ {service.features.length - 3} more features</li>
                        )}
                      </ul>
                    </div>

                    <div className="service-cta">
                      <span>Click to learn more →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="why-choose-us">
          <div className="container">
            <div className="section-header">
              <h2>🌟 Why Choose Adonai Farm Services?</h2>
              <p>We combine traditional farming wisdom with modern technology to deliver exceptional results</p>
            </div>

            <div className="benefits-grid">
              <div className="benefit-card">
                <div className="benefit-icon">🏆</div>
                <h3>Proven Expertise</h3>
                <p>Years of experience in livestock management and sustainable farming practices in Kenya's highlands.</p>
              </div>

              <div className="benefit-card">
                <div className="benefit-icon">💻</div>
                <h3>Technology-Driven</h3>
                <p>Cutting-edge digital solutions that streamline farm operations and improve productivity.</p>
              </div>

              <div className="benefit-card">
                <div className="benefit-icon">🌱</div>
                <h3>Sustainable Practices</h3>
                <p>Environmentally responsible farming methods that ensure long-term sustainability and profitability.</p>
              </div>

              <div className="benefit-card">
                <div className="benefit-icon">🤝</div>
                <h3>Personalized Support</h3>
                <p>Tailored solutions and ongoing support to meet your specific farming needs and goals.</p>
              </div>

              <div className="benefit-card">
                <div className="benefit-icon">📈</div>
                <h3>Measurable Results</h3>
                <p>Data-driven approach with clear metrics and reporting to track your farm's progress and success.</p>
              </div>

              <div className="benefit-card">
                <div className="benefit-icon">🌍</div>
                <h3>Local Knowledge</h3>
                <p>Deep understanding of Kericho's climate, soil conditions, and local farming challenges.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="services-cta">
          <div className="container">
            <div className="cta-content">
              <div className="cta-text">
                <h2>🚀 Ready to Transform Your Farm?</h2>
                <p>
                  Get started with our professional services today. Whether you need digital farm management,
                  breeding expertise, or agricultural consulting, we're here to help you succeed.
                </p>
                <div className="cta-features">
                  <div className="cta-feature">
                    <span className="feature-icon">📞</span>
                    <span>Free consultation</span>
                  </div>
                  <div className="cta-feature">
                    <span className="feature-icon">⚡</span>
                    <span>Quick implementation</span>
                  </div>
                  <div className="cta-feature">
                    <span className="feature-icon">🎯</span>
                    <span>Customized solutions</span>
                  </div>
                  <div className="cta-feature">
                    <span className="feature-icon">📊</span>
                    <span>Proven results</span>
                  </div>
                </div>
              </div>
              <div className="cta-actions">
                <a href="/contact" className="btn btn-primary btn-large">
                  📞 Get Free Consultation
                </a>
                <a href="/animals" className="btn btn-outline btn-large">
                  🐄 See Our Animals
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Service Detail Modal */}
        {selectedService && (
          <div className="service-modal-overlay" onClick={closeServiceModal}>
            <div className="service-modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={closeServiceModal}>✕</button>

              <div className="modal-content">
                <div className="modal-header">
                  <div className="modal-icon">{selectedService.icon}</div>
                  <div className="modal-title-section">
                    <h2>{selectedService.title}</h2>
                    <p className="modal-category">{selectedService.category}</p>
                    <div className="modal-price">
                      {selectedService.price === 'Contact us for pricing' ? (
                        <a href="tel:+254722759217" className="contact-link">
                          {selectedService.price}
                        </a>
                      ) : (
                        selectedService.price
                      )}
                    </div>
                  </div>
                </div>

                <div className="modal-description">
                  <h3>About This Service</h3>
                  <p>{selectedService.description}</p>
                </div>

                <div className="modal-details">
                  <div className="detail-section">
                    <h4>🎯 Features & Capabilities</h4>
                    <ul className="features-list">
                      {selectedService.features.map((feature, index) => (
                        <li key={index}>✓ {feature}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="detail-section">
                    <h4>💡 Benefits & Outcomes</h4>
                    <ul className="benefits-list">
                      {selectedService.benefits.map((benefit, index) => (
                        <li key={index}>🌟 {benefit}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="modal-actions">
                  <a href="/contact" className="btn btn-primary">
                    📞 Get Quote
                  </a>
                  <button className="btn btn-outline" onClick={closeServiceModal}>
                    ← Back to Services
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}