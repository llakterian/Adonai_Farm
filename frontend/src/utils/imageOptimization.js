/**
 * Image Optimization Utilities
 * Handles image compression, resizing, and optimization for better performance
 */

/**
 * Compress and resize image file
 * @param {File} file - Original image file
 * @param {Object} options - Compression options
 * @returns {Promise<Blob>} Compressed image blob
 */
export function compressImage(file, options = {}) {
  const {
    maxWidth = 1200,
    maxHeight = 800,
    quality = 0.8,
    format = 'image/jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress image
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(resolve, format, quality);
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Generate responsive image srcset for different screen sizes
 * @param {string} baseUrl - Base image URL
 * @param {string} filename - Image filename
 * @returns {Object} Responsive image data
 */
export function generateResponsiveImages(baseUrl, filename) {
  const name = filename.replace(/\.[^/.]+$/, ''); // Remove extension
  const ext = filename.split('.').pop();
  
  return {
    // Original size
    original: `${baseUrl}/${filename}`,
    // Different sizes for responsive design
    large: `${baseUrl}/${name}_large.${ext}`, // 1200px
    medium: `${baseUrl}/${name}_medium.${ext}`, // 800px
    small: `${baseUrl}/${name}_small.${ext}`, // 400px
    thumbnail: `${baseUrl}/${name}_thumb.${ext}`, // 200px
    
    // Generate srcset string
    srcset: [
      `${baseUrl}/${name}_small.${ext} 400w`,
      `${baseUrl}/${name}_medium.${ext} 800w`,
      `${baseUrl}/${name}_large.${ext} 1200w`,
      `${baseUrl}/${filename} 1600w`
    ].join(', '),
    
    // Default sizes attribute
    sizes: '(max-width: 480px) 400px, (max-width: 768px) 800px, (max-width: 1200px) 1200px, 1600px'
  };
}

/**
 * Lazy loading intersection observer
 */
export class LazyImageLoader {
  constructor(options = {}) {
    this.options = {
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    };
    
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      this.options
    );
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        this.loadImage(img);
        this.observer.unobserve(img);
      }
    });
  }

  loadImage(img) {
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;
    
    if (src) {
      img.src = src;
    }
    
    if (srcset) {
      img.srcset = srcset;
    }
    
    img.classList.add('loaded');
    img.removeAttribute('data-src');
    img.removeAttribute('data-srcset');
  }

  observe(img) {
    this.observer.observe(img);
  }

  disconnect() {
    this.observer.disconnect();
  }
}

/**
 * Create optimized image element with lazy loading
 * @param {Object} imageData - Image data object
 * @param {Object} options - Image options
 * @returns {HTMLImageElement} Optimized image element
 */
export function createOptimizedImage(imageData, options = {}) {
  const {
    className = '',
    alt = '',
    lazy = true,
    responsive = true
  } = options;

  const img = document.createElement('img');
  img.className = `optimized-image ${className}`;
  img.alt = alt;
  
  if (lazy) {
    // Set up lazy loading
    img.dataset.src = imageData.url;
    if (responsive && imageData.srcset) {
      img.dataset.srcset = imageData.srcset;
      img.sizes = imageData.sizes;
    }
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHZpZXdCb3g9IjAgMCAxMCAxMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PC9zdmc+';
  } else {
    // Load immediately
    img.src = imageData.url;
    if (responsive && imageData.srcset) {
      img.srcset = imageData.srcset;
      img.sizes = imageData.sizes;
    }
  }
  
  return img;
}

/**
 * Enhanced image loading error handler with multiple fallbacks
 * @param {HTMLImageElement} img - Image element
 * @param {string|Array<string>} fallbackUrls - Fallback image URL(s)
 */
export function handleImageError(img, fallbackUrls) {
  const fallbacks = Array.isArray(fallbackUrls) ? fallbackUrls : [fallbackUrls];
  let currentFallbackIndex = 0;
  
  img.onerror = () => {
    if (currentFallbackIndex < fallbacks.length) {
      const nextFallback = fallbacks[currentFallbackIndex];
      if (img.src !== nextFallback) {
        img.src = nextFallback;
        currentFallbackIndex++;
      }
    } else {
      // All fallbacks failed, use placeholder
      img.src = getPlaceholderImage();
      img.classList.add('image-failed');
    }
  };
}

/**
 * Get placeholder image as data URL
 * @returns {string} Placeholder image data URL
 */
function getPlaceholderImage() {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1IiBzdHJva2U9IiNkZGQiIHN0cm9rZS13aWR0aD0iMiIvPjx0ZXh0IHg9IjUwJSIgeT0iNDAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5BZG9uYWkgRmFybTwvdGV4dD48dGV4dCB4PSI1MCUiIHk9IjYwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjYmJiIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgTm90IEF2YWlsYWJsZTwvdGV4dD48L3N2Zz4=';
}

/**
 * Preload critical images
 * @param {Array<string>} imageUrls - Array of image URLs to preload
 */
export function preloadImages(imageUrls) {
  imageUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
}

/**
 * Get optimal image size based on container and device
 * @param {HTMLElement} container - Container element
 * @param {number} devicePixelRatio - Device pixel ratio
 * @returns {Object} Optimal dimensions
 */
export function getOptimalImageSize(container, devicePixelRatio = window.devicePixelRatio || 1) {
  const containerRect = container.getBoundingClientRect();
  
  return {
    width: Math.ceil(containerRect.width * devicePixelRatio),
    height: Math.ceil(containerRect.height * devicePixelRatio),
    displayWidth: containerRect.width,
    displayHeight: containerRect.height
  };
}

// Default lazy loader instance
export const defaultLazyLoader = new LazyImageLoader();

// Initialize lazy loading for existing images
export function initializeLazyLoading() {
  const lazyImages = document.querySelectorAll('img[data-src]');
  lazyImages.forEach(img => defaultLazyLoader.observe(img));
}

/**
 * Image cache for better performance
 */
class ImageCache {
  constructor(maxSize = 50) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  set(url, imageData) {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(url, {
      ...imageData,
      timestamp: Date.now()
    });
  }

  get(url) {
    const data = this.cache.get(url);
    if (data) {
      // Check if cache entry is still valid (1 hour)
      if (Date.now() - data.timestamp < 3600000) {
        return data;
      } else {
        this.cache.delete(url);
      }
    }
    return null;
  }

  clear() {
    this.cache.clear();
  }
}

// Global image cache instance
export const imageCache = new ImageCache();

/**
 * Enhanced image preloader with caching and error handling
 * @param {Array<string>} imageUrls - Array of image URLs to preload
 * @param {Object} options - Preload options
 * @returns {Promise<Array>} Promise resolving to preload results
 */
export function preloadImagesWithCache(imageUrls, options = {}) {
  const { priority = 'low', timeout = 10000 } = options;
  
  return Promise.allSettled(
    imageUrls.map(url => {
      return new Promise((resolve, reject) => {
        // Check cache first
        const cached = imageCache.get(url);
        if (cached) {
          resolve({ url, cached: true, success: true });
          return;
        }

        const img = new Image();
        const timeoutId = setTimeout(() => {
          reject(new Error(`Image preload timeout: ${url}`));
        }, timeout);

        img.onload = () => {
          clearTimeout(timeoutId);
          imageCache.set(url, {
            width: img.naturalWidth,
            height: img.naturalHeight,
            loaded: true
          });
          resolve({ url, cached: false, success: true });
        };

        img.onerror = () => {
          clearTimeout(timeoutId);
          reject(new Error(`Failed to preload image: ${url}`));
        };

        // Set loading priority if supported
        if ('loading' in img) {
          img.loading = priority === 'high' ? 'eager' : 'lazy';
        }

        img.src = url;
      });
    })
  );
}

/**
 * Service Worker registration for image caching
 */
export function registerImageCacheServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Image cache service worker registered:', registration);
      })
      .catch(error => {
        console.log('Service worker registration failed:', error);
      });
  }
}

/**
 * Progressive image loading with blur-up effect
 * @param {HTMLImageElement} img - Image element
 * @param {string} lowQualityUrl - Low quality placeholder URL
 * @param {string} highQualityUrl - High quality image URL
 */
export function progressiveImageLoad(img, lowQualityUrl, highQualityUrl) {
  // Load low quality image first
  img.src = lowQualityUrl;
  img.style.filter = 'blur(5px)';
  img.style.transition = 'filter 0.3s ease';

  // Preload high quality image
  const highQualityImg = new Image();
  highQualityImg.onload = () => {
    img.src = highQualityUrl;
    img.style.filter = 'blur(0px)';
  };
  highQualityImg.src = highQualityUrl;
}

/**
 * Check if image format is supported by browser
 * @param {string} format - Image format (webp, avif, etc.)
 * @returns {Promise<boolean>} Promise resolving to support status
 */
export function checkImageFormatSupport(format) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    
    const testImages = {
      webp: 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA',
      avif: 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A='
    };
    
    img.src = testImages[format] || '';
  });
}

/**
 * Get best image format for browser
 * @param {Array<string>} formats - Available formats in order of preference
 * @returns {Promise<string>} Promise resolving to best supported format
 */
export async function getBestImageFormat(formats = ['avif', 'webp', 'jpg']) {
  for (const format of formats) {
    if (await checkImageFormatSupport(format)) {
      return format;
    }
  }
  return 'jpg'; // Fallback
}

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initializeLazyLoading();
      registerImageCacheServiceWorker();
    });
  } else {
    initializeLazyLoading();
    registerImageCacheServiceWorker();
  }
}