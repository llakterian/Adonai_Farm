/**
 * Progressive Enhancement Utilities
 * Provides features for slower connections and mobile optimization
 */

class ProgressiveEnhancement {
  constructor() {
    this.connectionType = this.getConnectionType();
    this.isSlowConnection = this.checkSlowConnection();
    this.prefersReducedMotion = this.checkReducedMotion();
    this.isTouchDevice = this.checkTouchDevice();
    this.isOffline = !navigator.onLine;
    
    this.setupConnectionListeners();
    this.setupVisibilityListeners();
  }

  /**
   * Get connection type information
   */
  getConnectionType() {
    if ('connection' in navigator) {
      return {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData
      };
    }
    return null;
  }

  /**
   * Check if user has a slow connection
   */
  checkSlowConnection() {
    if (!this.connectionType) return false;
    
    // Consider slow if:
    // - Effective type is 'slow-2g' or '2g'
    // - Save data is enabled
    // - Downlink is less than 1.5 Mbps
    // - RTT is greater than 300ms
    return (
      ['slow-2g', '2g'].includes(this.connectionType.effectiveType) ||
      this.connectionType.saveData ||
      this.connectionType.downlink < 1.5 ||
      this.connectionType.rtt > 300
    );
  }

  /**
   * Check if user prefers reduced motion
   */
  checkReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Check if device supports touch
   */
  checkTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  /**
   * Setup connection change listeners
   */
  setupConnectionListeners() {
    // Online/offline listeners
    window.addEventListener('online', () => {
      this.isOffline = false;
      this.notifyConnectionChange('online');
    });

    window.addEventListener('offline', () => {
      this.isOffline = true;
      this.notifyConnectionChange('offline');
    });

    // Connection type change listener
    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', () => {
        this.connectionType = this.getConnectionType();
        this.isSlowConnection = this.checkSlowConnection();
        this.notifyConnectionChange('connection-change');
      });
    }
  }

  /**
   * Setup page visibility listeners for performance optimization
   */
  setupVisibilityListeners() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page is hidden - pause non-essential operations
        this.pauseNonEssentialOperations();
      } else {
        // Page is visible - resume operations
        this.resumeOperations();
      }
    });
  }

  /**
   * Notify components of connection changes
   */
  notifyConnectionChange(type) {
    const event = new CustomEvent('connectionchange', {
      detail: {
        type,
        isOffline: this.isOffline,
        isSlowConnection: this.isSlowConnection,
        connectionType: this.connectionType
      }
    });
    window.dispatchEvent(event);
  }

  /**
   * Pause non-essential operations when page is hidden
   */
  pauseNonEssentialOperations() {
    // Pause image loading
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    lazyImages.forEach(img => {
      if (img.dataset.src && !img.src.includes(img.dataset.src)) {
        img.dataset.paused = 'true';
      }
    });

    // Pause animations
    if (!this.prefersReducedMotion) {
      document.body.classList.add('paused-animations');
    }
  }

  /**
   * Resume operations when page becomes visible
   */
  resumeOperations() {
    // Resume image loading
    const pausedImages = document.querySelectorAll('img[data-paused="true"]');
    pausedImages.forEach(img => {
      delete img.dataset.paused;
      if (img.dataset.src) {
        img.src = img.dataset.src;
      }
    });

    // Resume animations
    document.body.classList.remove('paused-animations');
  }

  /**
   * Get optimized image URL based on connection and device
   */
  getOptimizedImageUrl(baseUrl, options = {}) {
    const {
      width = 800,
      height = 600,
      quality = 80,
      format = 'webp'
    } = options;

    // For slow connections, reduce quality and size
    if (this.isSlowConnection || this.connectionType?.saveData) {
      return this.getLowQualityImageUrl(baseUrl, {
        width: Math.min(width, 400),
        height: Math.min(height, 300),
        quality: 60,
        format: 'jpeg'
      });
    }

    // For fast connections, use high quality
    return this.getHighQualityImageUrl(baseUrl, {
      width,
      height,
      quality,
      format
    });
  }

  /**
   * Get low quality image URL for slow connections
   */
  getLowQualityImageUrl(baseUrl, options) {
    // In a real implementation, this would call an image optimization service
    // For now, return the base URL with query parameters
    const params = new URLSearchParams({
      w: options.width,
      h: options.height,
      q: options.quality,
      f: options.format
    });
    
    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Get high quality image URL for fast connections
   */
  getHighQualityImageUrl(baseUrl, options) {
    const params = new URLSearchParams({
      w: options.width,
      h: options.height,
      q: options.quality,
      f: options.format
    });
    
    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Preload critical images
   */
  preloadCriticalImages(imageUrls) {
    if (this.isSlowConnection || this.isOffline) {
      // Skip preloading on slow connections
      return;
    }

    imageUrls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
    });
  }

  /**
   * Lazy load images with intersection observer
   */
  setupLazyLoading(selector = 'img[data-src]', options = {}) {
    const defaultOptions = {
      threshold: 0.1,
      rootMargin: '50px'
    };

    const observerOptions = { ...defaultOptions, ...options };

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.dataset.src;
          
          if (src) {
            // Get optimized URL based on connection
            const optimizedSrc = this.getOptimizedImageUrl(src, {
              width: img.dataset.width || 800,
              height: img.dataset.height || 600
            });
            
            img.src = optimizedSrc;
            img.classList.remove('lazy');
            img.classList.add('loaded');
            
            imageObserver.unobserve(img);
          }
        }
      });
    }, observerOptions);

    // Observe all lazy images
    const lazyImages = document.querySelectorAll(selector);
    lazyImages.forEach(img => imageObserver.observe(img));

    return imageObserver;
  }

  /**
   * Show connection status indicator
   */
  showConnectionStatus() {
    const existingIndicator = document.querySelector('.connection-indicator');
    if (existingIndicator) {
      existingIndicator.remove();
    }

    if (this.isOffline) {
      this.showOfflineIndicator();
    } else if (this.isSlowConnection) {
      this.showSlowConnectionIndicator();
    }
  }

  /**
   * Show offline indicator
   */
  showOfflineIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'connection-indicator offline-indicator';
    indicator.innerHTML = `
      <span>📡</span>
      <span>You're offline. Some features may not work.</span>
    `;
    document.body.appendChild(indicator);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (indicator.parentNode) {
        indicator.remove();
      }
    }, 5000);
  }

  /**
   * Show slow connection indicator
   */
  showSlowConnectionIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'connection-indicator slow-connection-indicator';
    indicator.innerHTML = `
      <span>🐌</span>
      <span>Slow connection detected. Images may load slowly.</span>
    `;
    document.body.appendChild(indicator);

    // Auto-hide after 3 seconds
    setTimeout(() => {
      if (indicator.parentNode) {
        indicator.remove();
      }
    }, 3000);
  }

  /**
   * Enable data saver mode
   */
  enableDataSaverMode() {
    document.body.classList.add('data-saver-mode');
    
    // Disable autoplay videos
    const videos = document.querySelectorAll('video[autoplay]');
    videos.forEach(video => {
      video.removeAttribute('autoplay');
      video.pause();
    });

    // Reduce image quality
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (img.dataset.src) {
        const lowQualityUrl = this.getLowQualityImageUrl(img.dataset.src, {
          width: 400,
          height: 300,
          quality: 50
        });
        img.dataset.src = lowQualityUrl;
      }
    });
  }

  /**
   * Disable data saver mode
   */
  disableDataSaverMode() {
    document.body.classList.remove('data-saver-mode');
  }

  /**
   * Get device capabilities
   */
  getDeviceCapabilities() {
    return {
      isTouchDevice: this.isTouchDevice,
      prefersReducedMotion: this.prefersReducedMotion,
      isSlowConnection: this.isSlowConnection,
      isOffline: this.isOffline,
      connectionType: this.connectionType,
      screenSize: {
        width: window.screen.width,
        height: window.screen.height
      },
      viewportSize: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      devicePixelRatio: window.devicePixelRatio || 1
    };
  }

  /**
   * Optimize for mobile performance
   */
  optimizeForMobile() {
    if (window.innerWidth <= 768) {
      // Add mobile-specific optimizations
      document.body.classList.add('mobile-optimized');
      
      // Reduce animation duration on mobile
      if (!this.prefersReducedMotion) {
        document.documentElement.style.setProperty('--animation-duration', '0.2s');
      }
      
      // Enable touch-friendly interactions
      document.body.classList.add('touch-enabled');
      
      // Optimize scroll performance
      document.body.style.webkitOverflowScrolling = 'touch';
    }
  }

  /**
   * Initialize progressive enhancement
   */
  init() {
    this.showConnectionStatus();
    this.optimizeForMobile();
    
    // Setup lazy loading for all images
    this.setupLazyLoading();
    
    // Enable data saver mode for slow connections
    if (this.isSlowConnection || this.connectionType?.saveData) {
      this.enableDataSaverMode();
    }
    
    // Log device capabilities for debugging
    console.log('Device capabilities:', this.getDeviceCapabilities());
  }
}

// Create global instance
const progressiveEnhancement = new ProgressiveEnhancement();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    progressiveEnhancement.init();
  });
} else {
  progressiveEnhancement.init();
}

export default progressiveEnhancement;