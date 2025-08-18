import React, { useState, useEffect, useRef, useCallback } from 'react';
import ImageService from '../services/ImageService';
import { mockGalleryImages } from '../mockData.js';
import { ImageFallbackHandler, ContentFallbackHandler, NetworkFallbackHandler } from '../utils/fallbackHandlers.js';
import { GalleryErrorBoundary } from './ErrorBoundary.jsx';

/**
 * PublicGallery - Image gallery component for public website
 * Features: Grid layout, lightbox, lazy loading, responsive design
 */
const PublicGallery = ({ category = 'all', showCategories = true, maxImages = null }) => {
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(!NetworkFallbackHandler.isOnline);
  const [isSlowConnection, setIsSlowConnection] = useState(NetworkFallbackHandler.isSlowConnection());
  
  const observerRef = useRef();
  const imageRefs = useRef({});

  // Monitor network connection changes
  useEffect(() => {
    const handleConnectionChange = (event) => {
      setIsOffline(!event.detail.isOnline);
      setIsSlowConnection(NetworkFallbackHandler.isSlowConnection());
    };

    window.addEventListener('connectionchange', handleConnectionChange);
    return () => window.removeEventListener('connectionchange', handleConnectionChange);
  }, []);

  // Load images on component mount
  useEffect(() => {
    const loadImages = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Check if offline
        if (isOffline) {
          const offlineFallback = NetworkFallbackHandler.getOfflineFallback('images');
          setError({
            type: 'offline',
            message: offlineFallback.message,
            suggestion: offlineFallback.suggestion,
            icon: offlineFallback.icon
          });
          setLoading(false);
          return;
        }

        const allImages = ImageService.getPublicImages();
        
        if (!allImages || allImages.length === 0) {
          const contentFallback = ContentFallbackHandler.getFallbackContent('gallery');
          setError({
            type: 'no_content',
            message: contentFallback.message,
            alternatives: contentFallback.alternatives
          });
          setLoading(false);
          return;
        }

        setImages(allImages);
        
        // Apply initial filtering
        const filtered = selectedCategory === 'all' 
          ? allImages 
          : allImages.filter(img => img.category === selectedCategory);
        
        // Limit images for slow connections
        let finalImages = filtered;
        if (isSlowConnection && maxImages === null) {
          const slowConnectionFallback = NetworkFallbackHandler.getSlowConnectionFallback('gallery');
          finalImages = filtered.slice(0, slowConnectionFallback.maxImages);
        } else if (maxImages) {
          finalImages = filtered.slice(0, maxImages);
        }
        
        setFilteredImages(finalImages);
        
      } catch (error) {
        console.error('Error loading images:', error);
        const apiFallback = ContentFallbackHandler.getAPIFallbackMessage('images', error);
        setError({
          type: 'api_error',
          title: apiFallback.title,
          message: apiFallback.message,
          action: apiFallback.action,
          icon: apiFallback.icon
        });
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, [selectedCategory, maxImages, isOffline, isSlowConnection]);

  // Lazy loading intersection observer
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.dataset.src;
            if (src && !loadedImages.has(src)) {
              img.src = src;
              img.classList.remove('lazy');
              setLoadedImages(prev => new Set([...prev, src]));
              observerRef.current.unobserve(img);
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadedImages]);

  // Set up lazy loading for new images
  useEffect(() => {
    Object.values(imageRefs.current).forEach(img => {
      if (img && observerRef.current) {
        observerRef.current.observe(img);
      }
    });
  }, [filteredImages]);

  // Handle category change
  const handleCategoryChange = (newCategory) => {
    setSelectedCategory(newCategory);
    const filtered = newCategory === 'all' 
      ? images 
      : images.filter(img => img.category === newCategory);
    
    const finalImages = maxImages ? filtered.slice(0, maxImages) : filtered;
    setFilteredImages(finalImages);
  };

  // Open lightbox
  const openLightbox = (image, index) => {
    setLightboxImage(image);
    setLightboxIndex(index);
    document.body.style.overflow = 'hidden';
  };

  // Close lightbox
  const closeLightbox = () => {
    setLightboxImage(null);
    setLightboxIndex(0);
    document.body.style.overflow = 'unset';
  };

  // Navigate lightbox
  const navigateLightbox = (direction) => {
    const newIndex = direction === 'next' 
      ? (lightboxIndex + 1) % filteredImages.length
      : (lightboxIndex - 1 + filteredImages.length) % filteredImages.length;
    
    setLightboxIndex(newIndex);
    setLightboxImage(filteredImages[newIndex]);
  };

  // Handle keyboard navigation and touch gestures
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!lightboxImage) return;
      
      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          navigateLightbox('prev');
          break;
        case 'ArrowRight':
          navigateLightbox('next');
          break;
      }
    };

    // Touch gesture handling for lightbox
    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e) => {
      if (!lightboxImage) return;
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e) => {
      if (!lightboxImage) return;
      touchEndX = e.changedTouches[0].screenX;
      handleSwipeGesture();
    };

    const handleSwipeGesture = () => {
      const swipeThreshold = 50;
      const swipeDistance = touchStartX - touchEndX;

      if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance > 0) {
          // Swipe left - next image
          navigateLightbox('next');
        } else {
          // Swipe right - previous image
          navigateLightbox('prev');
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [lightboxImage, lightboxIndex, filteredImages]);

  // Handle image load error with enhanced fallback
  const handleImageError = (e, originalFilename) => {
    ImageFallbackHandler.handleImageError(e.target, originalFilename, (imgElement, filename) => {
      console.warn(`All fallbacks failed for image: ${filename}`);
    });
  };

  // Retry loading gallery
  const retryLoadGallery = () => {
    setError(null);
    setLoading(true);
    // Clear fallback cache
    ImageFallbackHandler.clearFallbackCache();
    // Trigger reload by updating a dependency
    setSelectedCategory(prev => prev);
  };

  if (loading) {
    return (
      <div className="gallery-loading">
        <div className="loading-spinner"></div>
        <p>Loading gallery...</p>
        {isSlowConnection && (
          <p className="slow-connection-notice">
            🐌 Optimizing for your connection speed...
          </p>
        )}
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="gallery-error">
        <div className="gallery-error-content">
          <div className="error-icon">{error.icon || '📷'}</div>
          <h3>{error.title || 'Gallery Unavailable'}</h3>
          <p>{error.message}</p>
          
          {error.suggestion && (
            <p className="error-suggestion">{error.suggestion}</p>
          )}
          
          {error.alternatives && (
            <div className="error-alternatives">
              <h4>What you can do:</h4>
              <ul>
                {error.alternatives.map((alt, index) => (
                  <li key={index}>{alt}</li>
                ))}
              </ul>
            </div>
          )}
          
          {error.action && (
            <p className="error-action">{error.action}</p>
          )}
          
          <div className="error-actions">
            <button onClick={retryLoadGallery} className="btn btn-primary">
              Try Again
            </button>
            {error.type === 'offline' && (
              <p className="offline-notice">
                You're currently offline. Gallery will load when connection is restored.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="public-gallery">
      {/* Category Filter */}
      {showCategories && (
        <div className="gallery-categories">
          <button 
            className={selectedCategory === 'all' ? 'active' : ''}
            onClick={() => handleCategoryChange('all')}
          >
            All Images ({images.length})
          </button>
          <button 
            className={selectedCategory === 'animals' ? 'active' : ''}
            onClick={() => handleCategoryChange('animals')}
          >
            Animals ({images.filter(img => img.category === 'animals').length})
          </button>
          <button 
            className={selectedCategory === 'farm' ? 'active' : ''}
            onClick={() => handleCategoryChange('farm')}
          >
            Farm Operations ({images.filter(img => img.category === 'farm').length})
          </button>
        </div>
      )}

      {/* Image Grid */}
      <div className="gallery-grid">
        {filteredImages.map((image, index) => (
          <div key={image.filename} className="gallery-item">
            <img
              ref={el => imageRefs.current[image.filename] = el}
              className="gallery-image lazy"
              data-src={image.url}
              src={ImageService.getPlaceholderUrl()}
              alt={image.alt}
              loading="lazy"
              onClick={() => openLightbox(image, index)}
              onError={(e) => handleImageError(e, image.filename)}
            />
            <div className="gallery-overlay">
              <div className="gallery-caption">{image.caption}</div>
              <button 
                className="gallery-expand"
                onClick={() => openLightbox(image, index)}
                aria-label="View full size"
              >
                🔍
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredImages.length === 0 && (
        <div className="gallery-empty">
          <p>No images available in this category.</p>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox}>×</button>
            
            <button 
              className="lightbox-nav lightbox-prev" 
              onClick={() => navigateLightbox('prev')}
              disabled={filteredImages.length <= 1}
            >
              ‹
            </button>
            
            <img
              src={lightboxImage.url}
              alt={lightboxImage.alt}
              className="lightbox-image"
              onError={(e) => handleImageError(e, lightboxImage.filename)}
            />
            
            <button 
              className="lightbox-nav lightbox-next" 
              onClick={() => navigateLightbox('next')}
              disabled={filteredImages.length <= 1}
            >
              ›
            </button>
            
            <div className="lightbox-info">
              <h3>{lightboxImage.caption}</h3>
              <p>{lightboxIndex + 1} of {filteredImages.length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Wrap with error boundary
const PublicGalleryWithErrorBoundary = (props) => (
  <GalleryErrorBoundary>
    <PublicGallery {...props} />
  </GalleryErrorBoundary>
);

export default PublicGalleryWithErrorBoundary;