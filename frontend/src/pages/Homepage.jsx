import React, { useState, useEffect } from 'react';
import ImageService from '../services/ImageService.js';
import { HeroImage, CardImage } from '../components/OptimizedImage.jsx';
import { farmInfo, featuredAnimals, farmServices, farmStats } from '../mockData.js';
import SEOHead from '../components/SEOHead.jsx';

export default function Homepage() {
  const [heroImages, setHeroImages] = useState([]);
  const [currentHeroImage, setCurrentHeroImage] = useState(0);
  const [featuredImages, setFeaturedImages] = useState([]);

  useEffect(() => {
    const loadImages = async () => {
      try {
        console.log('🖼️ Loading real production images from backend/uploads...');
        
        // Force initialize the gallery with real production images
        ImageService.initializeGallery();
        
        // Load real production images from backend/uploads
        let farmImages = [];
        let animalImages = [];
        
        try {
          // Get real production images
          farmImages = await ImageService.getPublicImagesAsync('farm');
          animalImages = await ImageService.getPublicImagesAsync('animals');
        } catch (asyncError) {
          console.warn('Async loading failed, trying sync method:', asyncError);
          // Fallback to sync method
          farmImages = ImageService.getPublicImages('farm');
          animalImages = ImageService.getPublicImages('animals');
        }
        
        console.log('📸 Real farm images loaded:', farmImages.length, farmImages);
        console.log('🐄 Real animal images loaded:', animalImages.length, animalImages);
        
        // Set hero images from real production images (farm-1.jpg, farm-2.jpg, farm-3.jpg)
        if (farmImages.length > 0) {
          // Use the first 3 farm images for hero carousel
          const heroImagesWithUrls = farmImages.slice(0, 3).map(img => ({
            ...img,
            url: ImageService.getImageUrl(img.filename),
            alt: img.caption || ImageService.generateAltText(img.filename)
          }));
          setHeroImages(heroImagesWithUrls);
          console.log('🎯 Hero images set from real production:', heroImagesWithUrls);
        } else {
          // Fallback to single image if no farm images available
          console.warn('⚠️ No real farm images found, using single fallback');
          setHeroImages([{ 
            filename: 'farm-1.jpg', 
            url: ImageService.getImageUrl('farm-1.jpg'),
            alt: 'Adonai Farm - Beautiful landscape view',
            category: 'farm'
          }]);
        }
        
        // Set featured images from real production images (adonai*.jpg)
        if (animalImages.length > 0) {
          const featuredImagesWithUrls = animalImages.slice(0, 6).map(img => ({
            ...img,
            url: ImageService.getImageUrl(img.filename),
            alt: img.caption || ImageService.generateAltText(img.filename)
          }));
          setFeaturedImages(featuredImagesWithUrls);
          console.log('🎯 Featured images set from real production:', featuredImagesWithUrls);
        } else {
          console.warn('⚠️ No real animal images found');
          setFeaturedImages([]);
        }
        
      } catch (error) {
        console.error('❌ Error loading real production images:', error);
        // Set fallback to real production images
        setHeroImages([{ 
          filename: 'farm-1.jpg', 
          url: ImageService.getImageUrl('farm-1.jpg'),
          alt: 'Adonai Farm Operations',
          category: 'farm'
        }]);
        setFeaturedImages([]);
      }
    };

    loadImages();
  }, []);

  // Auto-rotate hero images
  useEffect(() => {
    if (heroImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentHeroImage((prev) => (prev + 1) % heroImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [heroImages.length]);

  const handleImageError = (e) => {
    try {
      e.target.src = ImageService.getFallbackUrl(e.target.src);
    } catch (error) {
      console.error('Error handling image error:', error);
      e.target.src = '/images/hero-farm.jpg';
    }
  };

  return (
    <div className="homepage">
      <SEOHead 
        pageType="homepage"
        title="Modern Livestock Farm in Kericho, Kenya"
        description="Adonai Farm - Leading livestock farm in Kericho, Kenya specializing in sustainable farming, quality breeding, farm tours, and premium agricultural products. Visit our 50-acre farm with 200+ animals today!"
        keywords={[
          "livestock farm Kericho",
          "farm tours Kenya", 
          "sustainable farming Kericho",
          "premium beef Kenya",
          "dairy products Kericho",
          "agricultural consulting Kenya",
          "farm visits Kericho County",
          "quality livestock breeding"
        ]}
        image="/images/hero-farm.jpg"
        url="/"
        breadcrumbs={[
          { name: "Home", url: "/" }
        ]}
        pageData={{
          services: farmServices,
          animals: featuredAnimals,
          stats: farmStats
        }}
      />
      {/* Hero Section with Optimized Farm Images */}
      <section className="hero-section">
        <div className="hero-background">
          {heroImages.length > 0 && (
            <HeroImage 
              filename={heroImages[currentHeroImage]?.filename || 'hero-farm.jpg'}
              alt={heroImages[currentHeroImage]?.alt || 'Adonai Farm'}
            />
          )}
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <div className="container">
            <h1>Welcome to {farmInfo.name}</h1>
            <p className="hero-tagline">{farmInfo.tagline}</p>
            <p className="hero-description">{farmInfo.mission}</p>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">{farmStats.totalAnimals}+</span>
                <span className="stat-label">Animals</span>
              </div>
              <div className="stat">
                <span className="stat-number">{farmStats.totalAcres}</span>
                <span className="stat-label">Acres</span>
              </div>
              <div className="stat">
                <span className="stat-number">{farmStats.yearsInOperation}+</span>
                <span className="stat-label">Years</span>
              </div>
            </div>
            <div className="hero-actions">
              <a href="/animals" className="btn btn-primary">Meet Our Animals</a>
              <a href="/contact" className="btn btn-outline">Visit Our Farm</a>
            </div>
          </div>
        </div>
        {heroImages.length > 1 && (
          <div className="hero-indicators">
            {heroImages.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentHeroImage ? 'active' : ''}`}
                onClick={() => setCurrentHeroImage(index)}
                aria-label={`View image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Farm Introduction */}
      <section className="farm-intro">
        <div className="container">
          <div className="intro-content">
            <div className="intro-text">
              <h2>About Our Farm</h2>
              <p className="intro-description">
                At {farmInfo.name}, we combine traditional farming wisdom with modern technology 
                to raise healthy livestock and produce quality products. Our commitment to 
                sustainable practices ensures the well-being of our animals and the environment.
              </p>
              <p className="intro-details">
                Established in {farmInfo.established}, we've been proudly serving our community 
                with premium dairy products, farm-fresh eggs, quality wool, and grass-fed beef. 
                Our {farmStats.totalAcres}-acre farm is home to {farmStats.totalAnimals}+ animals 
                across {farmStats.animalTypes} different species.
              </p>
              <div className="intro-highlights">
                <div className="highlight">
                  <span className="highlight-icon">🌱</span>
                  <span>Sustainable Practices</span>
                </div>
                <div className="highlight">
                  <span className="highlight-icon">❤️</span>
                  <span>Animal Welfare First</span>
                </div>
                <div className="highlight">
                  <span className="highlight-icon">🏆</span>
                  <span>Award-Winning Quality</span>
                </div>
              </div>
            </div>
            <div className="intro-image">
              {featuredImages.length > 0 && (
                <CardImage 
                  filename={featuredImages[0]?.filename || 'farm-2.jpg'}
                  alt="Adonai Farm operations"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Animals Showcase */}
      <section className="featured-animals">
        <div className="container">
          <div className="section-header">
            <h2>Meet Our Animals</h2>
            <p>Get to know some of our beloved farm family members</p>
          </div>
          <div className="animals-grid">
            {featuredAnimals.slice(0, 6).map((animal, index) => (
              <div key={animal.id} className="animal-card">
                <div className="animal-card-image">
                  <CardImage 
                    filename={animal.image}
                    alt={`${animal.name} - ${animal.type}`}
                    size="medium"
                  />
                  <div className="animal-card-overlay">
                    <span className="animal-badge">{animal.age}</span>
                  </div>
                </div>
                <div className="animal-card-content">
                  <div className="animal-header">
                    <div>
                      <h3 className="animal-name">{animal.name}</h3>
                      <span className="animal-type">{animal.type}</span>
                    </div>
                  </div>
                  <p className="animal-description">{animal.description}</p>
                  <div className="animal-fun-fact">
                    <span className="fun-fact-icon">💡</span>
                    <span className="fun-fact-text">{animal.funFact}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="animals-cta">
            <a href="/animals" className="btn btn-secondary">View All Our Animals</a>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="services-preview">
        <div className="container">
          <div className="section-header">
            <h2>Our Products & Services</h2>
            <p>From farm to table - discover what we offer</p>
          </div>
          <div className="services-grid">
            {farmServices.slice(0, 6).map((service) => (
              <div key={service.id} className="service-card">
                <div className="service-image">
                  <CardImage 
                    filename={service.image}
                    alt={service.name}
                    size="medium"
                  />
                  <div className="service-status">
                    <span className={`status ${service.available === true ? 'available' : service.available === 'seasonal' ? 'seasonal' : 'unavailable'}`}>
                      {service.available === true ? 'Available' : service.available === 'seasonal' ? 'Seasonal' : 'Contact Us'}
                    </span>
                  </div>
                </div>
                <div className="service-info">
                  <h3>{service.name}</h3>
                  <p className="service-description">{service.description}</p>
                  <div className="service-pricing">
                    <span className="price">{service.pricing}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="services-cta">
            <a href="/services" className="btn btn-secondary">View All Services</a>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Experience Adonai Farm?</h2>
            <p>Whether you're interested in our products, want to schedule a farm tour, or have questions about our services, we'd love to hear from you.</p>
            <div className="cta-actions">
              <a href="/contact" className="btn btn-primary">Contact Us Today</a>
              <a href="/gallery" className="btn btn-outline">View Photo Gallery</a>
            </div>
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <span>{farmInfo.contact.phone}</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">✉️</span>
                <span>{farmInfo.contact.email}</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">🕒</span>
                <span>Tours: {farmInfo.operatingHours.tours}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}