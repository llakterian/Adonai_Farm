import { mockGalleryImages } from '../mockData.js';
import { generateResponsiveImages, handleImageError, defaultLazyLoader } from '../utils/imageOptimization.js';
import apiService from './ApiService.js';

/**
 * ImageService - Handles farm image management and categorization with optimization
 * Manages images from backend/uploads/Adonai folder with rich metadata and responsive sizing
 * Optimized for both backend API and static Netlify deployments
 */
class ImageService {
  static BASE_URL = '/uploads'; // Serves from backend/uploads (real production images)
  static API_BASE_URL = '/api/public/images'; // API endpoint for image metadata
  static FALLBACK_BASE_URL = '/images'; // Fallback to public images directory
  
  // Image categorization based on filename patterns
  static IMAGE_CATEGORIES = {
    ANIMALS: 'animals',
    FARM: 'farm',
    FACILITIES: 'facilities'
  };

  // Cache for API responses
  static _imageCache = null;
  static _cacheTimestamp = null;
  static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Deployment detection
  static _isStaticDeployment = null;

  /**
   * Detect if we're in a static deployment environment (like Netlify)
   * @returns {boolean} True if static deployment detected
   */
  static isStaticDeployment() {
    if (this._isStaticDeployment !== null) {
      return this._isStaticDeployment;
    }

    // Check for static deployment indicators
    const isNetlify = window.location.hostname.includes('netlify') || 
                     window.location.hostname.includes('.app') ||
                     document.querySelector('meta[name="generator"][content*="Netlify"]');
    
    const isVercel = window.location.hostname.includes('vercel') ||
                    window.location.hostname.includes('.app');
    
    const isGitHubPages = window.location.hostname.includes('github.io');
    
    const isFileProtocol = window.location.protocol === 'file:';
    
    // Check if backend API is not available (indicates static deployment)
    const noBackendAPI = localStorage.getItem('use-local-storage') === 'true' ||
                        !window.location.hostname.includes('localhost');

    this._isStaticDeployment = isNetlify || isVercel || isGitHubPages || isFileProtocol || noBackendAPI;
    
    if (import.meta.env.DEV) {
      console.log('🔍 Deployment detection:', {
        isNetlify,
        isVercel,
        isGitHubPages,
        isFileProtocol,
        noBackendAPI,
        isStaticDeployment: this._isStaticDeployment,
        hostname: window.location.hostname,
        protocol: window.location.protocol
      });
    }

    return this._isStaticDeployment;
  }

  // Get available images from API or fallback to mock data
  static async getAvailableImages() {
    try {
      // Check cache first
      if (this._imageCache && this._cacheTimestamp && 
          (Date.now() - this._cacheTimestamp) < this.CACHE_DURATION) {
        return this._imageCache;
      }

      const data = await apiService.getPublicImages();
      this._imageCache = data;
      this._cacheTimestamp = Date.now();
      return data;
    } catch (error) {
      console.warn('Failed to fetch images from API, using mock data:', error);
      // Fallback to mock data
      return {
        images: mockGalleryImages,
        categories: {
          animals: mockGalleryImages.filter(img => img.category === 'animals'),
          farm: mockGalleryImages.filter(img => img.category === 'farm'),
          facilities: mockGalleryImages.filter(img => img.category === 'facilities')
        },
        total: mockGalleryImages.length
      };
    }
  }

  // Get image metadata from API or mock data
  static async getImageMetadata(filename) {
    const data = await this.getAvailableImages();
    return data.images.find(img => img.filename === filename);
  }

  /**
   * Get all public images with optional category filtering (synchronous for backward compatibility)
   * @param {string} category - Optional category filter ('all', 'animals', 'farm', 'facilities')
   * @returns {Array} Array of image objects
   */
  static getPublicImages(category = 'all') {
    // Use cached data if available
    if (this._imageCache && this._imageCache.images) {
      const images = this._imageCache.images.map(img => ({
        filename: img.filename,
        url: this.getImageUrl(img.filename),
        category: img.category || this.categorizeImage(img.filename),
        alt: img.alt || this.generateAltText(img.filename),
        caption: img.caption || this.generateCaption(img.filename),
        uploadedAt: img.lastModified || img.uploaded_at,
        id: img.id || img.filename,
        isPublic: img.isPublic !== false,
        fallbackUrl: this.getFallbackUrl(img.filename)
      }));

      return category === 'all' ? images : images.filter(img => img.category === category);
    }

    // Fallback to localStorage or mock data
    const savedImages = localStorage.getItem('adonai_gallery');
    const allImages = savedImages ? JSON.parse(savedImages) : mockGalleryImages;
    
    // Filter images based on public visibility settings
    const publicImages = allImages.filter(img => img.isPublic !== false);
    
    const images = publicImages.map(img => ({
      filename: img.filename,
      url: this.getImageUrl(img.filename),
      category: img.category || this.categorizeImage(img.filename),
      alt: this.generateAltText(img.filename),
      caption: img.caption || this.generateCaption(img.filename),
      uploadedAt: img.uploaded_at,
      id: img.id || img.filename,
      isPublic: img.isPublic !== false,
      fallbackUrl: this.getFallbackUrl(img.filename)
    }));

    return category === 'all' ? images : images.filter(img => img.category === category);
  }

  /**
   * Get all public images asynchronously with API data
   * @param {string} category - Optional category filter
   * @returns {Promise<Array>} Promise resolving to array of image objects
   */
  static async getPublicImagesAsync(category = 'all') {
    try {
      // Initialize gallery in localStorage if not exists
      this.initializeGallery();
      
      const data = await this.getAvailableImages();
      
      // Use API data if available, otherwise fallback to localStorage/mock data
      let allImages = data.images;
      
      if (!allImages || allImages.length === 0) {
        // Fallback to localStorage or mock data
        const savedImages = localStorage.getItem('adonai_gallery');
        allImages = savedImages ? JSON.parse(savedImages) : mockGalleryImages;
      }
      
      // Filter images based on public visibility settings
      const publicImages = allImages.filter(img => img.isPublic !== false);
      
      const images = publicImages.map(img => ({
        filename: img.filename,
        url: this.getImageUrl(img.filename),
        category: img.category || this.categorizeImage(img.filename),
        alt: img.alt || this.generateAltText(img.filename),
        caption: img.caption || this.generateCaption(img.filename),
        uploadedAt: img.lastModified || img.uploaded_at,
        id: img.id || img.filename,
        isPublic: img.isPublic !== false,
        size: img.size,
        fallbackUrl: this.getFallbackUrl(img.filename)
      }));

      if (category === 'all') {
        return images;
      }

      return images.filter(image => image.category === category);
    } catch (error) {
      console.error('Error fetching public images:', error);
      // Fallback to synchronous method
      return this.getPublicImages(category);
    }
  }

  /**
   * Initialize gallery with real production images from backend/uploads
   */
  static initializeGallery() {
    // Create real production gallery data based on actual files in backend/uploads
    const realProductionImages = [
      // Farm images
      { id: 1, filename: 'farm-1.jpg', category: 'farm', caption: 'Beautiful farm landscape with rolling hills', isPublic: true, uploaded_at: '2025-01-15' },
      { id: 2, filename: 'farm-2.jpg', category: 'farm', caption: 'Pastoral views with cattle grazing', isPublic: true, uploaded_at: '2025-01-16' },
      { id: 3, filename: 'farm-3.jpg', category: 'farm', caption: 'Modern farming operations and equipment', isPublic: true, uploaded_at: '2025-01-17' },
      { id: 4, filename: 'farm-4.jpg', category: 'farm', caption: 'Farm facilities and infrastructure', isPublic: true, uploaded_at: '2025-01-18' },
      { id: 5, filename: 'farm-5.jpg', category: 'farm', caption: 'Sustainable farming practices in action', isPublic: true, uploaded_at: '2025-01-19' },
      { id: 6, filename: 'farm-6.jpg', category: 'farm', caption: 'Farm operations during golden hour', isPublic: true, uploaded_at: '2025-01-20' },
      { id: 7, filename: 'farm-7.jpg', category: 'farm', caption: 'Agricultural landscape and farming activities', isPublic: true, uploaded_at: '2025-01-21' },
      
      // Animal images
      { id: 8, filename: 'adonai1.jpg', category: 'animals', caption: 'Dairy cattle in the pasture', isPublic: true, uploaded_at: '2025-01-22' },
      { id: 9, filename: 'adonai2.jpg', category: 'animals', caption: 'Livestock grazing in open fields', isPublic: true, uploaded_at: '2025-01-23' },
      { id: 10, filename: 'adonai3.jpg', category: 'animals', caption: 'Farm animals enjoying sunny weather', isPublic: true, uploaded_at: '2025-01-24' },
      { id: 11, filename: 'adonai4.jpg', category: 'animals', caption: 'Sheep and goats in the barnyard', isPublic: true, uploaded_at: '2025-01-25' },
      { id: 12, filename: 'adonai5.jpg', category: 'animals', caption: 'Poultry and chickens roaming freely', isPublic: true, uploaded_at: '2025-01-26' },
      { id: 13, filename: 'adonai6.jpg', category: 'animals', caption: 'Mixed livestock on the farm', isPublic: true, uploaded_at: '2025-01-27' },
      { id: 14, filename: 'adonai7.jpg', category: 'animals', caption: 'Cattle during feeding time', isPublic: true, uploaded_at: '2025-01-28' },
      { id: 15, filename: 'adonai8.jpg', category: 'animals', caption: 'Goat kids playing in the barnyard', isPublic: true, uploaded_at: '2025-01-29' },
      { id: 16, filename: 'adonai9.jpg', category: 'animals', caption: 'Sheep flock during evening feeding', isPublic: true, uploaded_at: '2025-01-30' },
      { id: 17, filename: 'adonaix.jpg', category: 'animals', caption: 'Dairy cows in the milking area', isPublic: true, uploaded_at: '2025-01-31' },
      { id: 18, filename: 'adonaixi.jpg', category: 'animals', caption: 'Rooster and chickens in the yard', isPublic: true, uploaded_at: '2025-02-01' },
      { id: 19, filename: 'adonaixii.jpg', category: 'animals', caption: 'Young calves in the nursery area', isPublic: true, uploaded_at: '2025-02-02' },
      { id: 20, filename: 'adonaixiii.jpg', category: 'animals', caption: 'Farm animals in their natural habitat', isPublic: true, uploaded_at: '2025-02-03' }
    ];

    if (!localStorage.getItem('adonai_gallery')) {
      console.log('🖼️ Initializing gallery with real production images...');
      localStorage.setItem('adonai_gallery', JSON.stringify(realProductionImages));
    }
  }

  /**
   * Generate proper URL for uploaded images with deployment-aware fallback priority
   * @param {string} filename - Image filename
   * @returns {string} Full image URL optimized for current deployment type
   */
  static getImageUrl(filename) {
    // For static deployments (Netlify, Vercel, etc.), images are copied to /uploads/Adonai/
    // For development with backend, images are served from backend/uploads/Adonai/
    
    if (this.isStaticDeployment()) {
      // Static deployment: images are copied to the build directory
      // The build script copies backend/uploads/Adonai/* to netlify-build/uploads/Adonai/
      return `${this.BASE_URL}/${filename}`;
    } else {
      // Development with backend: serve from backend uploads
      return `${this.BASE_URL}/${filename}`;
    }
  }

  /**
   * Get image URL with comprehensive fallback strategy
   * @param {string} filename - Image filename
   * @returns {string} Image URL with fallback handling
   */
  static getImageUrlWithFallback(filename) {
    // For static builds (Netlify), images are in /uploads/Adonai/
    // For development, images are served from backend
    // For mobile/offline, fallback to /images/
    
    const primaryUrl = this.getImageUrl(filename);
    
    // Add fallback handling in the component level
    return primaryUrl;
  }

  /**
   * Get optimized image URL with size parameter
   * @param {string} filename - Image filename
   * @param {string} size - Size parameter (small, medium, large, thumbnail)
   * @returns {string} Optimized image URL
   */
  static getOptimizedImageUrl(filename, size = 'medium') {
    return `/api/images/optimized/${size}/${filename}`;
  }

  /**
   * Get fallback URL for images that fail to load (deployment-aware)
   * @param {string} filename - Original filename
   * @returns {string} Fallback image URL
   */
  static getFallbackUrl(filename) {
    // For static deployments, prioritize images that are most likely to be available
    if (this.isStaticDeployment()) {
      // In static deployments, all images should be in /uploads/Adonai/
      if (filename.startsWith('adonai')) {
        // Try other animal images from uploads directory
        const animalImages = ['adonai1.jpg', 'adonai2.jpg', 'adonai3.jpg', 'adonai4.jpg', 'adonai5.jpg', 'adonai6.jpg'];
        const fallbackAnimal = animalImages.find(img => img !== filename);
        if (fallbackAnimal) {
          return `${this.BASE_URL}/${fallbackAnimal}`;
        }
        // Fallback to farm images
        return `${this.BASE_URL}/farm-1.jpg`;
      }
      
      if (filename.startsWith('farm-')) {
        // Try other farm images from uploads directory
        const farmImages = ['farm-1.jpg', 'farm-2.jpg', 'farm-3.jpg', 'farm-4.jpg', 'farm-5.jpg', 'farm-6.jpg', 'farm-7.jpg'];
        const fallbackFarm = farmImages.find(img => img !== filename);
        if (fallbackFarm) {
          return `${this.BASE_URL}/${fallbackFarm}`;
        }
      }
      
      // Final fallback to public images directory (copied during build)
      return `${this.FALLBACK_BASE_URL}/hero-farm.jpg`;
    } else {
      // Development with backend: use original logic
      if (filename.startsWith('adonai')) {
        const animalImages = ['adonai1.jpg', 'adonai2.jpg', 'adonai3.jpg', 'adonai4.jpg', 'adonai5.jpg', 'adonai6.jpg'];
        const fallbackAnimal = animalImages.find(img => img !== filename);
        if (fallbackAnimal) {
          return `${this.BASE_URL}/${fallbackAnimal}`;
        }
        return `${this.BASE_URL}/farm-1.jpg`;
      }
      
      if (filename.startsWith('farm-')) {
        const farmImages = ['farm-1.jpg', 'farm-2.jpg', 'farm-3.jpg', 'farm-4.jpg', 'farm-5.jpg', 'farm-6.jpg', 'farm-7.jpg'];
        const fallbackFarm = farmImages.find(img => img !== filename);
        if (fallbackFarm) {
          return `${this.BASE_URL}/${fallbackFarm}`;
        }
      }
      
      // Fallback to public images
      const publicImages = ['hero-farm.jpg', 'farm-2.jpg', 'farm-3.jpg', 'farm-4.jpg'];
      const randomImage = publicImages[Math.floor(Math.random() * publicImages.length)];
      return `${this.FALLBACK_BASE_URL}/${randomImage}`;
    }
  }

  /**
   * Get multiple fallback URLs in order of preference
   * @param {string} filename - Original filename
   * @returns {Array<string>} Array of fallback URLs in order of preference
   */
  static getFallbackUrls(filename) {
    const fallbacks = [];
    
    if (filename.startsWith('adonai')) {
      // Try other animal images first
      const animalImages = ['adonai1.jpg', 'adonai2.jpg', 'adonai3.jpg', 'adonai4.jpg', 'adonai5.jpg'];
      animalImages.filter(img => img !== filename).forEach(img => {
        fallbacks.push(`${this.BASE_URL}/${img}`);
      });
      // Then try farm images
      fallbacks.push(`${this.BASE_URL}/farm-1.jpg`);
      fallbacks.push(`${this.BASE_URL}/farm-2.jpg`);
    } else if (filename.startsWith('farm-')) {
      // Try other farm images first
      const farmImages = ['farm-1.jpg', 'farm-2.jpg', 'farm-3.jpg', 'farm-4.jpg', 'farm-5.jpg'];
      farmImages.filter(img => img !== filename).forEach(img => {
        fallbacks.push(`${this.BASE_URL}/${img}`);
      });
    }
    
    // Add public images as final fallbacks
    const publicImages = ['hero-farm.jpg', 'farm-2.jpg', 'farm-3.jpg', 'farm-4.jpg'];
    publicImages.forEach(img => {
      fallbacks.push(`/images/${img}`);
    });
    
    // Add placeholder as last resort
    fallbacks.push(this.getPlaceholderUrl());
    
    return fallbacks;
  }

  /**
   * Categorize images based on filename patterns
   * @param {string} filename - Image filename
   * @returns {string} Image category
   */
  static categorizeImage(filename) {
    if (filename.startsWith('adonai')) {
      return this.IMAGE_CATEGORIES.ANIMALS;
    } else if (filename.startsWith('farm-')) {
      return this.IMAGE_CATEGORIES.FARM;
    } else {
      return this.IMAGE_CATEGORIES.FACILITIES;
    }
  }

  /**
   * Get images grouped by category
   * @returns {Object} Images grouped by category
   */
  static getImagesByCategory() {
    const images = this.getPublicImages();
    
    return {
      [this.IMAGE_CATEGORIES.ANIMALS]: images.filter(img => img.category === this.IMAGE_CATEGORIES.ANIMALS),
      [this.IMAGE_CATEGORIES.FARM]: images.filter(img => img.category === this.IMAGE_CATEGORIES.FARM),
      [this.IMAGE_CATEGORIES.FACILITIES]: images.filter(img => img.category === this.IMAGE_CATEGORIES.FACILITIES)
    };
  }

  /**
   * Generate alt text for accessibility
   * @param {string} filename - Image filename
   * @returns {string} Alt text
   */
  static generateAltText(filename) {
    if (filename.startsWith('adonai')) {
      const number = filename.replace('adonai', '').replace('.jpg', '');
      return `Adonai Farm livestock - cattle, goats, sheep, and poultry ${number}`;
    } else if (filename.startsWith('farm-')) {
      const number = filename.replace('farm-', '').replace('.jpg', '');
      return `Adonai Farm operations and facilities ${number}`;
    }
    return `Adonai Farm image`;
  }

  /**
   * Generate caption for images
   * @param {string} filename - Image filename
   * @returns {string} Image caption
   */
  static generateCaption(filename) {
    if (filename.startsWith('adonai')) {
      return 'Our diverse livestock - dairy & beef cattle, goats, sheep, and poultry';
    } else if (filename.startsWith('farm-')) {
      return 'Farm operations, facilities, and sustainable farming practices';
    }
    return 'Adonai Farm - Sustainable livestock management';
  }

  /**
   * Get featured images for homepage
   * @param {number} count - Number of featured images to return
   * @returns {Array} Array of featured image objects
   */
  static getFeaturedImages(count = 6) {
    // Initialize gallery first
    this.initializeGallery();
    
    const allImages = this.getPublicImages();
    // Mix of farm and animal images for variety
    const featured = [
      ...allImages.filter(img => img.category === this.IMAGE_CATEGORIES.FARM).slice(0, Math.ceil(count / 2)),
      ...allImages.filter(img => img.category === this.IMAGE_CATEGORIES.ANIMALS).slice(0, Math.floor(count / 2))
    ];
    
    return featured.slice(0, count);
  }

  /**
   * Get featured images for homepage (async version)
   * @param {number} count - Number of featured images to return
   * @returns {Promise<Array>} Promise resolving to array of featured image objects
   */
  static async getFeaturedImagesAsync(count = 6) {
    const allImages = await this.getPublicImagesAsync();
    // Mix of farm and animal images for variety
    const featured = [
      ...allImages.filter(img => img.category === this.IMAGE_CATEGORIES.FARM).slice(0, Math.ceil(count / 2)),
      ...allImages.filter(img => img.category === this.IMAGE_CATEGORIES.ANIMALS).slice(0, Math.floor(count / 2))
    ];
    
    return featured.slice(0, count);
  }

  /**
   * Check if image exists and handle loading errors
   * @param {string} filename - Image filename
   * @returns {Promise<boolean>} Promise resolving to true if image loads successfully
   */
  static async checkImageExists(filename) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = this.getImageUrl(filename);
    });
  }

  /**
   * Get placeholder image URL for failed loads
   * @returns {string} Placeholder image URL
   */
  static getPlaceholderUrl() {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkFkb25haSBGYXJtPC90ZXh0Pjwvc3ZnPg==';
  }

  /**
   * Get optimized image with responsive sizing
   * @param {string} filename - Image filename
   * @param {Object} options - Optimization options
   * @returns {Object} Optimized image data
   */
  static getOptimizedImage(filename, options = {}) {
    const {
      size = 'medium', // small, medium, large, original
      lazy = true,
      responsive = true
    } = options;

    const baseUrl = this.getImageUrl(filename);
    const metadata = this.getImageMetadata(filename);
    
    let optimizedUrl = baseUrl;
    let dimensions = {};

    // Define size constraints
    switch (size) {
      case 'small':
        dimensions = { maxWidth: 400, maxHeight: 300 };
        break;
      case 'medium':
        dimensions = { maxWidth: 800, maxHeight: 600 };
        break;
      case 'large':
        dimensions = { maxWidth: 1200, maxHeight: 900 };
        break;
      default:
        dimensions = { maxWidth: 1600, maxHeight: 1200 };
    }

    const imageData = {
      filename,
      url: optimizedUrl,
      fallbackUrl: this.getFallbackUrl(filename),
      alt: this.generateAltText(filename),
      caption: metadata?.caption || this.generateCaption(filename),
      category: metadata?.category || this.categorizeImage(filename),
      dimensions,
      lazy,
      responsive
    };

    // Add responsive images if enabled
    if (responsive) {
      const responsiveData = generateResponsiveImages(this.BASE_URL, filename);
      imageData.srcset = responsiveData.srcset;
      imageData.sizes = responsiveData.sizes;
    }

    return imageData;
  }

  /**
   * Get images optimized for specific contexts
   * @param {string} context - Context (hero, gallery, thumbnail, card)
   * @param {string} category - Image category filter
   * @returns {Array} Array of optimized images
   */
  static getImagesForContext(context, category = 'all') {
    const images = this.getPublicImages(category);
    
    const contextOptions = {
      hero: { size: 'large', lazy: false, responsive: true },
      gallery: { size: 'medium', lazy: true, responsive: true },
      thumbnail: { size: 'small', lazy: true, responsive: false },
      card: { size: 'medium', lazy: true, responsive: true }
    };

    const options = contextOptions[context] || contextOptions.card;

    return images.map(img => this.getOptimizedImage(img.filename, options));
  }

  /**
   * Preload critical images for better performance
   * @param {Array<string>} filenames - Array of image filenames to preload
   */
  static preloadCriticalImages(filenames) {
    filenames.forEach(filename => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = this.getImageUrl(filename);
      document.head.appendChild(link);
    });
  }

  /**
   * Initialize lazy loading for images
   * @param {NodeList} images - Images to initialize lazy loading for
   */
  static initializeLazyLoading(images) {
    images.forEach(img => {
      if (img.dataset.src) {
        defaultLazyLoader.observe(img);
        handleImageError(img, this.getPlaceholderUrl());
      }
    });
  }
}

export default ImageService;