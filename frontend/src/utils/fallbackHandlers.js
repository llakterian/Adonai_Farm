/**
 * Fallback Handlers - Utilities for graceful degradation when content fails to load
 * Provides fallback content, error recovery, and user-friendly error messages
 */

import ImageService from '../services/ImageService.js';

/**
 * Image Fallback Handler
 * Manages cascading fallbacks for failed image loads
 */
export class ImageFallbackHandler {
  static fallbackAttempts = new Map();
  static maxFallbackAttempts = 3;

  /**
   * Handle image load error with cascading fallbacks
   * @param {HTMLImageElement} imgElement - The image element that failed
   * @param {string} originalFilename - Original filename for fallback lookup
   * @param {Function} onAllFallbacksFailed - Callback when all fallbacks fail
   */
  static handleImageError(imgElement, originalFilename, onAllFallbacksFailed = null) {
    const attemptKey = imgElement.src;
    const currentAttempts = this.fallbackAttempts.get(attemptKey) || 0;

    if (currentAttempts >= this.maxFallbackAttempts) {
      // All fallbacks exhausted, show placeholder
      this.showImagePlaceholder(imgElement, originalFilename);
      if (onAllFallbacksFailed) {
        onAllFallbacksFailed(imgElement, originalFilename);
      }
      return;
    }

    // Try next fallback
    const fallbackUrls = ImageService.getFallbackUrls(originalFilename);
    const nextFallbackUrl = fallbackUrls[currentAttempts];

    if (nextFallbackUrl && nextFallbackUrl !== imgElement.src) {
      this.fallbackAttempts.set(attemptKey, currentAttempts + 1);
      imgElement.src = nextFallbackUrl;
      imgElement.alt = `${imgElement.alt} (fallback image)`;
    } else {
      // No more fallbacks available
      this.showImagePlaceholder(imgElement, originalFilename);
      if (onAllFallbacksFailed) {
        onAllFallbacksFailed(imgElement, originalFilename);
      }
    }
  }

  /**
   * Show placeholder when all image fallbacks fail
   * @param {HTMLImageElement} imgElement - The image element
   * @param {string} originalFilename - Original filename for context
   */
  static showImagePlaceholder(imgElement, originalFilename) {
    // Create a more informative placeholder
    const category = ImageService.categorizeImage(originalFilename);
    const placeholderData = this.getPlaceholderData(category);
    
    imgElement.src = placeholderData.url;
    imgElement.alt = placeholderData.alt;
    imgElement.title = placeholderData.title;
    imgElement.classList.add('image-fallback-placeholder');
    
    // Add data attributes for styling
    imgElement.dataset.fallbackCategory = category;
    imgElement.dataset.originalFilename = originalFilename;
  }

  /**
   * Get placeholder data based on image category
   * @param {string} category - Image category (animals, farm, facilities)
   * @returns {Object} Placeholder data
   */
  static getPlaceholderData(category) {
    const placeholders = {
      animals: {
        url: this.generateSVGPlaceholder('🐄', 'Animals', '#4CAF50'),
        alt: 'Adonai Farm livestock - image not available',
        title: 'Our farm animals - image temporarily unavailable'
      },
      farm: {
        url: this.generateSVGPlaceholder('🚜', 'Farm Operations', '#8BC34A'),
        alt: 'Adonai Farm operations - image not available',
        title: 'Farm operations and facilities - image temporarily unavailable'
      },
      facilities: {
        url: this.generateSVGPlaceholder('🏗️', 'Facilities', '#607D8B'),
        alt: 'Adonai Farm facilities - image not available',
        title: 'Farm facilities and infrastructure - image temporarily unavailable'
      }
    };

    return placeholders[category] || {
      url: this.generateSVGPlaceholder('🌾', 'Adonai Farm', '#2E7D32'),
      alt: 'Adonai Farm - image not available',
      title: 'Farm content - image temporarily unavailable'
    };
  }

  /**
   * Generate SVG placeholder with icon and text
   * @param {string} icon - Emoji icon
   * @param {string} text - Placeholder text
   * @param {string} color - Background color
   * @returns {string} Data URL for SVG placeholder
   */
  static generateSVGPlaceholder(icon, text, color) {
    const svg = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${color}" opacity="0.1"/>
        <rect x="1" y="1" width="398" height="298" fill="none" stroke="${color}" stroke-width="2" stroke-dasharray="5,5"/>
        <text x="200" y="120" font-family="Arial, sans-serif" font-size="48" text-anchor="middle" fill="${color}">${icon}</text>
        <text x="200" y="160" font-family="Arial, sans-serif" font-size="18" text-anchor="middle" fill="${color}" font-weight="bold">${text}</text>
        <text x="200" y="180" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="${color}" opacity="0.7">Image temporarily unavailable</text>
        <text x="200" y="220" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="${color}" opacity="0.5">Adonai Farm - Chepsir, Kericho</text>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  /**
   * Preload critical images with fallback handling
   * @param {Array<string>} filenames - Array of image filenames to preload
   * @returns {Promise<Array>} Promise resolving to preload results
   */
  static async preloadImagesWithFallbacks(filenames) {
    const preloadPromises = filenames.map(filename => 
      this.preloadSingleImage(filename)
    );

    return Promise.allSettled(preloadPromises);
  }

  /**
   * Preload a single image with fallback attempts
   * @param {string} filename - Image filename
   * @returns {Promise} Promise resolving when image loads or all fallbacks fail
   */
  static preloadSingleImage(filename) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const fallbackUrls = [
        ImageService.getImageUrl(filename),
        ...ImageService.getFallbackUrls(filename)
      ];

      let attemptIndex = 0;

      const tryNextUrl = () => {
        if (attemptIndex >= fallbackUrls.length) {
          reject(new Error(`Failed to load image: ${filename}`));
          return;
        }

        img.onload = () => resolve({ filename, url: fallbackUrls[attemptIndex], success: true });
        img.onerror = () => {
          attemptIndex++;
          tryNextUrl();
        };

        img.src = fallbackUrls[attemptIndex];
      };

      tryNextUrl();
    });
  }

  /**
   * Clear fallback attempt cache
   */
  static clearFallbackCache() {
    this.fallbackAttempts.clear();
  }
}

/**
 * Content Fallback Handler
 * Manages fallbacks for missing or failed content loads
 */
export class ContentFallbackHandler {
  /**
   * Get fallback content for missing farm information
   * @param {string} contentType - Type of content (animals, services, about, etc.)
   * @returns {Object} Fallback content
   */
  static getFallbackContent(contentType) {
    const fallbackContent = {
      animals: {
        title: 'Our Livestock',
        description: 'Adonai Farm specializes in sustainable livestock management with modern farming techniques.',
        items: [
          {
            name: 'Dairy & Beef Cattle',
            description: 'High-quality cattle for milk and meat production',
            icon: '🐄'
          },
          {
            name: 'Goats',
            description: 'Hardy goats for milk, meat, and breeding',
            icon: '🐐'
          },
          {
            name: 'Sheep',
            description: 'Wool and meat sheep varieties',
            icon: '🐑'
          },
          {
            name: 'Poultry',
            description: 'Chickens for eggs and meat production',
            icon: '🐔'
          }
        ]
      },
      services: {
        title: 'Our Services',
        description: 'Comprehensive farming services and products from Adonai Farm.',
        items: [
          {
            name: 'Livestock Breeding',
            description: 'Professional breeding services for cattle, goats, and sheep',
            icon: '🧬'
          },
          {
            name: 'Farm Visits & Tours',
            description: 'Educational tours of our sustainable farming operations',
            icon: '🚜'
          },
          {
            name: 'Fresh Products',
            description: 'Quality milk, meat, and dairy products',
            icon: '🥛'
          },
          {
            name: 'Agricultural Consulting',
            description: 'Expert advice on livestock management and farming',
            icon: '📋'
          }
        ]
      },
      about: {
        title: 'About Adonai Farm',
        description: 'Located in the beautiful hills of Chepsir, Kericho County, Adonai Farm represents modern sustainable agriculture at its finest.',
        content: [
          'We are committed to sustainable livestock farming practices that respect both the environment and animal welfare.',
          'Our farm utilizes modern technology and traditional wisdom to achieve optimal results in livestock management.',
          'Located in Kericho County, we benefit from the region\'s favorable climate and rich agricultural heritage.',
          'We welcome visitors to learn about our operations and see sustainable farming in action.'
        ],
        contact: {
          location: 'Chepsir, Kericho, Kenya',
          phone: '+254 722 759 217',
          email: 'info@adonaifarm.co.ke',
          hours: 'Monday - Saturday: 8:00 AM - 5:00 PM'
        }
      },
      gallery: {
        title: 'Farm Gallery',
        description: 'Explore our farm through photos of our animals, operations, and facilities.',
        message: 'Our photo gallery is temporarily unavailable, but we\'d love to show you around in person!',
        alternatives: [
          'Schedule a farm visit to see our operations firsthand',
          'Contact us for specific photos or information',
          'Follow us on social media for regular updates'
        ]
      }
    };

    return fallbackContent[contentType] || {
      title: 'Content Temporarily Unavailable',
      description: 'We\'re working to restore this content. Please try again later or contact us directly.',
      contact: {
        phone: '+254 722 759 217',
        email: 'info@adonaifarm.co.ke'
      }
    };
  }

  /**
   * Get fallback message for API failures
   * @param {string} apiType - Type of API that failed
   * @param {Error} error - The error that occurred
   * @returns {Object} Fallback message data
   */
  static getAPIFallbackMessage(apiType, error = null) {
    const messages = {
      images: {
        title: 'Gallery Temporarily Unavailable',
        message: 'We\'re having trouble loading our photo gallery right now.',
        action: 'Please try refreshing the page or visit us in person to see our farm!',
        icon: '📷'
      },
      contact: {
        title: 'Contact Form Unavailable',
        message: 'Our contact form is temporarily down, but you can still reach us directly.',
        action: 'Call us at +254 722 759 217 or email info@adonaifarm.co.ke',
        icon: '📞'
      },
      animals: {
        title: 'Animal Information Loading',
        message: 'We\'re having trouble loading our animal information.',
        action: 'Please try again later or contact us for specific information about our livestock.',
        icon: '🐄'
      },
      general: {
        title: 'Service Temporarily Unavailable',
        message: 'We\'re experiencing technical difficulties.',
        action: 'Please try again later or contact us directly for assistance.',
        icon: '⚠️'
      }
    };

    const fallback = messages[apiType] || messages.general;
    
    return {
      ...fallback,
      timestamp: new Date().toISOString(),
      errorDetails: error ? {
        message: error.message,
        type: error.name
      } : null
    };
  }

  /**
   * Create fallback component for missing content sections
   * @param {string} contentType - Type of content
   * @param {Object} options - Additional options
   * @returns {Object} React component props for fallback
   */
  static createFallbackComponent(contentType, options = {}) {
    const content = this.getFallbackContent(contentType);
    const { showContactInfo = true, showRetryButton = true } = options;

    return {
      content,
      showContactInfo,
      showRetryButton,
      className: `content-fallback content-fallback-${contentType}`,
      'data-fallback-type': contentType
    };
  }
}

/**
 * Network Fallback Handler
 * Manages offline and slow connection scenarios
 */
export class NetworkFallbackHandler {
  static isOnline = navigator.onLine;
  static connectionType = 'unknown';

  static {
    // Initialize connection monitoring
    this.initializeConnectionMonitoring();
  }

  /**
   * Initialize connection monitoring
   */
  static initializeConnectionMonitoring() {
    // Monitor online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyConnectionChange('online');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyConnectionChange('offline');
    });

    // Monitor connection type if available
    if ('connection' in navigator) {
      const connection = navigator.connection;
      this.connectionType = connection.effectiveType || 'unknown';

      connection.addEventListener('change', () => {
        this.connectionType = connection.effectiveType || 'unknown';
        this.notifyConnectionChange('change', {
          type: this.connectionType,
          downlink: connection.downlink,
          rtt: connection.rtt
        });
      });
    }
  }

  /**
   * Notify components of connection changes
   * @param {string} eventType - Type of connection event
   * @param {Object} details - Additional event details
   */
  static notifyConnectionChange(eventType, details = {}) {
    const event = new CustomEvent('connectionchange', {
      detail: {
        type: eventType,
        isOnline: this.isOnline,
        connectionType: this.connectionType,
        ...details
      }
    });

    window.dispatchEvent(event);
  }

  /**
   * Get offline fallback content
   * @param {string} contentType - Type of content needed offline
   * @returns {Object} Offline fallback content
   */
  static getOfflineFallback(contentType) {
    const offlineContent = {
      images: {
        message: 'Images are not available offline',
        suggestion: 'Connect to the internet to view our farm photos',
        icon: '📡'
      },
      contact: {
        message: 'Contact form requires internet connection',
        suggestion: 'Save our contact details: +254 722 759 217 or info@adonaifarm.co.ke',
        icon: '📞'
      },
      general: {
        message: 'This content requires an internet connection',
        suggestion: 'Please check your connection and try again',
        icon: '🌐'
      }
    };

    return offlineContent[contentType] || offlineContent.general;
  }

  /**
   * Check if connection is slow
   * @returns {boolean} True if connection is considered slow
   */
  static isSlowConnection() {
    if (!('connection' in navigator)) {
      return false;
    }

    const connection = navigator.connection;
    return (
      ['slow-2g', '2g'].includes(connection.effectiveType) ||
      connection.downlink < 1.5 ||
      connection.rtt > 300
    );
  }

  /**
   * Get appropriate content for slow connections
   * @param {string} contentType - Type of content
   * @returns {Object} Optimized content for slow connections
   */
  static getSlowConnectionFallback(contentType) {
    const slowConnectionContent = {
      images: {
        message: 'Loading optimized images for your connection',
        suggestion: 'Images are being loaded in lower quality to improve speed',
        showPlaceholders: true
      },
      gallery: {
        message: 'Gallery optimized for slow connections',
        suggestion: 'Showing fewer images to improve loading speed',
        maxImages: 6
      }
    };

    return slowConnectionContent[contentType] || {
      message: 'Content optimized for your connection speed',
      suggestion: 'Some features may be simplified to improve performance'
    };
  }
}

// Export all handlers
export default {
  ImageFallbackHandler,
  ContentFallbackHandler,
  NetworkFallbackHandler
};