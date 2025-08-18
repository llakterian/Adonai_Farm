import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';
import SEOHead from '../components/SEOHead';
import ImageService from '../services/ImageService';

/**
 * NotFound - 404 error page with helpful navigation and farm information
 * Provides user-friendly error handling for invalid routes
 */
export default function NotFound() {
  const location = useLocation();
  const [suggestedPages, setSuggestedPages] = useState([]);
  const [farmImage, setFarmImage] = useState(null);

  // Get a random farm image for the 404 page
  useEffect(() => {
    const images = ImageService.getPublicImages('farm');
    if (images.length > 0) {
      const randomImage = images[Math.floor(Math.random() * images.length)];
      setFarmImage(randomImage);
    }
  }, []);

  // Generate suggested pages based on the attempted URL
  useEffect(() => {
    const path = location.pathname.toLowerCase();
    const suggestions = [];

    // Common page suggestions
    const commonPages = [
      { path: '/', label: 'Homepage', description: 'Learn about Adonai Farm' },
      { path: '/about', label: 'About Us', description: 'Our farm story and mission' },
      { path: '/animals', label: 'Our Animals', description: 'Meet our livestock' },
      { path: '/gallery', label: 'Photo Gallery', description: 'See our farm in action' },
      { path: '/services', label: 'Services', description: 'What we offer' },
      { path: '/contact', label: 'Contact Us', description: 'Get in touch with us' }
    ];

    // Smart suggestions based on attempted path
    if (path.includes('animal') || path.includes('livestock') || path.includes('cattle') || path.includes('goat')) {
      suggestions.push(commonPages.find(p => p.path === '/animals'));
    }
    
    if (path.includes('photo') || path.includes('image') || path.includes('picture') || path.includes('gallery')) {
      suggestions.push(commonPages.find(p => p.path === '/gallery'));
    }
    
    if (path.includes('about') || path.includes('story') || path.includes('history')) {
      suggestions.push(commonPages.find(p => p.path === '/about'));
    }
    
    if (path.includes('contact') || path.includes('phone') || path.includes('email') || path.includes('reach')) {
      suggestions.push(commonPages.find(p => p.path === '/contact'));
    }
    
    if (path.includes('service') || path.includes('offer') || path.includes('product') || path.includes('breeding')) {
      suggestions.push(commonPages.find(p => p.path === '/services'));
    }

    // If no specific suggestions, add homepage and popular pages
    if (suggestions.length === 0) {
      suggestions.push(
        commonPages.find(p => p.path === '/'),
        commonPages.find(p => p.path === '/animals'),
        commonPages.find(p => p.path === '/gallery')
      );
    } else {
      // Add homepage if not already included
      if (!suggestions.find(s => s.path === '/')) {
        suggestions.unshift(commonPages.find(p => p.path === '/'));
      }
    }

    // Remove duplicates and limit to 4 suggestions
    const uniqueSuggestions = suggestions
      .filter((item, index, self) => item && self.findIndex(s => s.path === item.path) === index)
      .slice(0, 4);

    setSuggestedPages(uniqueSuggestions);
  }, [location.pathname]);

  // Log 404 for analytics (in production)
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      // Log 404 error for analytics
      try {
        fetch('/api/analytics/404', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: location.pathname,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          })
        }).catch(err => console.warn('Failed to log 404:', err));
      } catch (err) {
        console.warn('Failed to log 404:', err);
      }
    }
  }, [location.pathname]);

  return (
    <PublicLayout>
      <SEOHead 
        title="Page Not Found - Adonai Farm"
        description="The page you're looking for doesn't exist. Explore our farm website to learn about our livestock, services, and operations in Chepsir, Kericho."
        noIndex={true}
      />
      
      <div className="not-found-page">
        <div className="not-found-hero">
          <div className="container">
            {farmImage && (
              <div className="not-found-image">
                <img 
                  src={farmImage.url} 
                  alt={farmImage.alt}
                  onError={(e) => {
                    e.target.src = ImageService.getFallbackUrl(farmImage.filename);
                  }}
                />
              </div>
            )}
            
            <div className="not-found-content">
              <h1>Oops! Page Not Found</h1>
              <div className="error-code">404</div>
              <p className="error-message">
                Looks like this page wandered off like a curious goat! 
                The page you're looking for doesn't exist or may have been moved.
              </p>
              
              <div className="attempted-url">
                <strong>You tried to visit:</strong> <code>{location.pathname}</code>
              </div>
            </div>
          </div>
        </div>

        <div className="not-found-suggestions">
          <div className="container">
            <h2>Where would you like to go?</h2>
            <p>Here are some popular pages that might interest you:</p>
            
            <div className="suggestions-grid">
              {suggestedPages.map((page, index) => (
                <Link 
                  key={page.path} 
                  to={page.path} 
                  className="suggestion-card"
                >
                  <div className="suggestion-icon">
                    {page.path === '/' && '🏠'}
                    {page.path === '/about' && '📖'}
                    {page.path === '/animals' && '🐄'}
                    {page.path === '/gallery' && '📷'}
                    {page.path === '/services' && '🌾'}
                    {page.path === '/contact' && '📞'}
                  </div>
                  <h3>{page.label}</h3>
                  <p>{page.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="not-found-help">
          <div className="container">
            <div className="help-section">
              <h3>Still can't find what you're looking for?</h3>
              <div className="help-options">
                <div className="help-option">
                  <div className="help-icon">🔍</div>
                  <div className="help-content">
                    <h4>Search Our Site</h4>
                    <p>Try browsing our main sections or use the navigation menu above.</p>
                  </div>
                </div>
                
                <div className="help-option">
                  <div className="help-icon">📞</div>
                  <div className="help-content">
                    <h4>Contact Us Directly</h4>
                    <p>
                      Call us at <a href="tel:+254722759217">+254 722 759 217</a> or 
                      email <a href="mailto:info@adonaifarm.co.ke">info@adonaifarm.co.ke</a>
                    </p>
                  </div>
                </div>
                
                <div className="help-option">
                  <div className="help-icon">📍</div>
                  <div className="help-content">
                    <h4>Visit Our Farm</h4>
                    <p>
                      We're located in Chepsir, Kericho, Kenya. 
                      <Link to="/contact"> Get directions</Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="farm-info-section">
              <h3>About Adonai Farm</h3>
              <p>
                While you're here, learn about our sustainable livestock farming 
                operations in Kericho County. We specialize in cattle, goats, sheep, 
                and poultry farming with modern management techniques.
              </p>
              
              <div className="quick-facts">
                <div className="fact">
                  <strong>🐄 Livestock:</strong> Cattle, Goats, Sheep, Poultry
                </div>
                <div className="fact">
                  <strong>📍 Location:</strong> Chepsir, Kericho, Kenya
                </div>
                <div className="fact">
                  <strong>🕒 Visit Hours:</strong> Mon-Sat 8AM-5PM
                </div>
                <div className="fact">
                  <strong>📞 Phone:</strong> +254 722 759 217
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="not-found-actions">
          <div className="container">
            <div className="action-buttons">
              <Link to="/" className="btn btn-primary btn-large">
                🏠 Go to Homepage
              </Link>
              <button 
                onClick={() => window.history.back()} 
                className="btn btn-outline btn-large"
              >
                ← Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}