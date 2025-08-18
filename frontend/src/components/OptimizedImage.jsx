import React, { useState, useEffect, useRef } from 'react';
import ImageService from '../services/ImageService.js';

/**
 * OptimizedImage - Responsive image component with lazy loading, progressive enhancement, and fallbacks
 * Provides different image sizes and formats based on device capabilities and connection speed
 */

// Hook for progressive enhancement features
const useProgressiveEnhancement = () => {
  const [connectionInfo, setConnectionInfo] = useState({
    isSlowConnection: false,
    isOffline: false,
    saveData: false
  });

  useEffect(() => {
    // Check connection type
    if ('connection' in navigator) {
      const connection = navigator.connection;
      setConnectionInfo({
        isSlowConnection: ['slow-2g', '2g'].includes(connection.effectiveType) || 
                         connection.downlink < 1.5 || 
                         connection.rtt > 300,
        isOffline: !navigator.onLine,
        saveData: connection.saveData || false
      });

      // Listen for connection changes
      const handleConnectionChange = () => {
        setConnectionInfo({
          isSlowConnection: ['slow-2g', '2g'].includes(connection.effectiveType) || 
                           connection.downlink < 1.5 || 
                           connection.rtt > 300,
          isOffline: !navigator.onLine,
          saveData: connection.saveData || false
        });
      };

      connection.addEventListener('change', handleConnectionChange);
      return () => connection.removeEventListener('change', handleConnectionChange);
    }

    // Fallback for browsers without connection API
    const handleOnline = () => setConnectionInfo(prev => ({ ...prev, isOffline: false }));
    const handleOffline = () => setConnectionInfo(prev => ({ ...prev, isOffline: true }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return connectionInfo;
};

// Base OptimizedImage component with progressive enhancement
const BaseOptimizedImage = ({ 
  filename, 
  alt, 
  className = '', 
  loading = 'lazy',
  sizes = '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw',
  priority = false,
  onClick,
  onLoad,
  onError,
  placeholder = true,
  aspectRatio = null
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);
  const containerRef = useRef(null);
  const { isSlowConnection, isOffline, saveData } = useProgressiveEnhancement();

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (loading === 'eager' || priority) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: isSlowConnection ? '50px' : '100px' // Smaller margin for slow connections
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [loading, priority, isSlowConnection]);

  const handleLoad = () => {
    setImageLoaded(true);
    onLoad && onLoad();
  };

  const handleError = (e) => {
    // Simple fallback handling
    const fallbackUrl = ImageService.getFallbackUrl(filename);
    if (e.target.src !== fallbackUrl) {
      e.target.src = fallbackUrl;
    } else {
      setImageError(true);
      onError && onError(e);
    }
  };

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  const handleKeyPress = (e) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  // Get optimized image URL based on connection and device
  const getOptimizedImageUrl = () => {
    if (isOffline) {
      return ImageService.getPlaceholderUrl();
    }

    // For now, just return the basic image URL
    // TODO: Implement quality and format parameters in ImageService
    return ImageService.getImageUrl(filename);
  };

  // Generate srcSet for responsive images
  const generateSrcSet = () => {
    if (isSlowConnection || saveData || isOffline) {
      return ''; // Skip srcSet for slow connections
    }

    const baseUrl = ImageService.getImageUrl(filename);
    const sizes = [400, 800, 1200, 1600];
    
    return sizes.map(size => 
      `${baseUrl}?w=${size}&q=${isSlowConnection ? 60 : 85} ${size}w`
    ).join(', ');
  };

  const imageUrl = getOptimizedImageUrl();
  const fallbackUrl = ImageService.getFallbackUrl(filename);
  const srcSet = generateSrcSet();

  // Container styles with aspect ratio
  const containerStyle = aspectRatio ? {
    aspectRatio: aspectRatio,
    position: 'relative',
    overflow: 'hidden'
  } : {};

  return (
    <div 
      ref={containerRef}
      className={`optimized-image-container ${className} ${imageLoaded ? 'loaded' : ''} ${imageError ? 'error' : ''}`}
      style={containerStyle}
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `View ${alt}` : undefined}
    >
      {/* Placeholder */}
      {placeholder && !imageLoaded && !imageError && (
        <div className="image-placeholder">
          {isInView ? (
            <div className="loading-spinner" aria-label="Loading image"></div>
          ) : (
            <div className="lazy-placeholder" aria-label="Image will load when visible">
              📷
            </div>
          )}
        </div>
      )}

      {/* Main Image */}
      {isInView && (
        <img
          ref={imgRef}
          src={imageError ? fallbackUrl : imageUrl}
          srcSet={!imageError && srcSet ? srcSet : undefined}
          sizes={!imageError && srcSet ? sizes : undefined}
          alt={alt}
          className={`optimized-image ${imageLoaded ? 'loaded' : 'loading'}`}
          onLoad={handleLoad}
          onError={handleError}
          loading={loading}
          decoding="async"
          style={aspectRatio ? {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          } : undefined}
        />
      )}

      {/* Error State */}
      {imageError && (
        <div className="image-error" role="img" aria-label={`Failed to load ${alt}`}>
          <span className="error-icon">❌</span>
          <span className="error-text">Image unavailable</span>
        </div>
      )}

      {/* Click Overlay */}
      {onClick && imageLoaded && (
        <div className="image-overlay">
          <div className="overlay-icon">🔍</div>
        </div>
      )}

      {/* Connection Status Indicator */}
      {(isSlowConnection || isOffline) && (
        <div className="connection-badge">
          {isOffline ? '📡' : '🐌'}
        </div>
      )}
    </div>
  );
};

// Hero Image Component for large banner images
export const HeroImage = ({ filename, alt, className = '' }) => {
  return (
    <BaseOptimizedImage
      filename={filename}
      alt={alt}
      className={`hero-image ${className}`}
      loading="eager"
      priority={true}
      sizes="100vw"
      aspectRatio="16/9"
      placeholder={true}
    />
  );
};

// Card Image Component for medium-sized images in cards
export const CardImage = ({ filename, alt, size = 'medium', className = '', onClick }) => {
  const sizeClasses = {
    small: 'card-image-small',
    medium: 'card-image-medium',
    large: 'card-image-large'
  };

  const aspectRatios = {
    small: '4/3',
    medium: '16/10',
    large: '16/9'
  };

  return (
    <BaseOptimizedImage
      filename={filename}
      alt={alt}
      className={`card-image ${sizeClasses[size]} ${className}`}
      loading="lazy"
      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
      aspectRatio={aspectRatios[size]}
      onClick={onClick}
      placeholder={true}
    />
  );
};

// Thumbnail Image Component for small images
export const ThumbnailImage = ({ filename, alt, className = '', onClick }) => {
  return (
    <BaseOptimizedImage
      filename={filename}
      alt={alt}
      className={`thumbnail-image ${className}`}
      loading="lazy"
      sizes="150px"
      aspectRatio="1/1"
      onClick={onClick}
      placeholder={true}
    />
  );
};

// Gallery Image Component with progressive loading
export const GalleryImage = ({ filename, alt, onClick, className = '' }) => {
  return (
    <BaseOptimizedImage
      filename={filename}
      alt={alt}
      className={`gallery-image ${className}`}
      loading="lazy"
      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
      aspectRatio="4/3"
      onClick={onClick}
      placeholder={true}
    />
  );
};

// Avatar Image Component for profile pictures
export const AvatarImage = ({ filename, alt, size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'avatar-small',
    medium: 'avatar-medium',
    large: 'avatar-large'
  };

  return (
    <BaseOptimizedImage
      filename={filename}
      alt={alt}
      className={`avatar-image ${sizeClasses[size]} ${className}`}
      loading="lazy"
      sizes="100px"
      aspectRatio="1/1"
      placeholder={true}
    />
  );
};

// Background Image Component for sections with background images
export const BackgroundImage = ({ filename, alt, children, className = '' }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { isSlowConnection, saveData } = useProgressiveEnhancement();

  useEffect(() => {
    if (isSlowConnection || saveData) {
      // Skip background images on slow connections
      return;
    }

    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.src = ImageService.getImageUrl(filename);
  }, [filename, isSlowConnection, saveData]);

  const backgroundStyle = imageLoaded && !isSlowConnection && !saveData ? {
    backgroundImage: `url(${ImageService.getImageUrl(filename)})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  } : {
    backgroundColor: 'var(--primary-green)' // Fallback color
  };

  return (
    <div 
      className={`background-image-container ${className} ${imageLoaded ? 'loaded' : ''}`}
      style={backgroundStyle}
      role="img"
      aria-label={alt}
    >
      {children}
      {!imageLoaded && (isSlowConnection || saveData) && (
        <div className="background-fallback">
          <span className="fallback-icon">🌾</span>
        </div>
      )}
    </div>
  );
};

// Default OptimizedImage component
const OptimizedImage = ({ 
  filename, 
  alt, 
  type = 'card', 
  size = 'medium', 
  onClick, 
  className = '',
  ...props 
}) => {
  switch (type) {
    case 'hero':
      return <HeroImage filename={filename} alt={alt} className={className} {...props} />;
    case 'thumbnail':
      return <ThumbnailImage filename={filename} alt={alt} onClick={onClick} className={className} {...props} />;
    case 'gallery':
      return <GalleryImage filename={filename} alt={alt} onClick={onClick} className={className} {...props} />;
    case 'avatar':
      return <AvatarImage filename={filename} alt={alt} size={size} className={className} {...props} />;
    case 'background':
      return <BackgroundImage filename={filename} alt={alt} className={className} {...props} />;
    case 'card':
    default:
      return <CardImage filename={filename} alt={alt} size={size} onClick={onClick} className={className} {...props} />;
  }
};

export default OptimizedImage;