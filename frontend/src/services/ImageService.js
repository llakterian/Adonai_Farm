import { generateResponsiveImages, handleImageError, defaultLazyLoader } from '../utils/imageOptimization.js';
import apiService from './ApiService.js';

// Centralized list of all images available in frontend/public/images
// Updated to match actual files in the /images directory
const allPublicImages = [
  // Animals Category
  { id: 1, filename: 'Dairycows.jpg', category: 'animals', caption: 'Our healthy dairy cows in the pasture.' },
  { id: 2, filename: 'Beefcattle.jpg', category: 'animals', caption: 'Our strong and well-cared-for beef cattle.' },
  { id: 3, filename: 'Cattlefeed.jpg', category: 'animals', caption: 'Cattle enjoying their nutritious feed.' },
  { id: 4, filename: 'Cowfeeds.jpg', category: 'animals', caption: 'Providing quality feed for our cattle.' },
  { id: 5, filename: 'Heifer1.jpg', category: 'animals', caption: 'A young heifer, the future of our herd.' },
  { id: 6, filename: 'GoAtS.jpg', category: 'animals', caption: 'A playful group of goats.' },
  { id: 7, filename: 'Goatsale.jpg', category: 'animals', caption: 'Our quality goats available for sale.' },
  { id: 8, filename: 'Goatpen.jpg', category: 'animals', caption: 'Goats resting in their clean and spacious pen.' },
  { id: 9, filename: 'Bighegoat.jpg', category: 'animals', caption: 'Our impressive breeding he-goat.' },
  { id: 10, filename: 'Ewes.jpg', category: 'animals', caption: 'Ewes with their young lambs.' },
  { id: 11, filename: 'Dairycow.jpg', category: 'animals', caption: 'A beautiful dairy cow in the field.' },
  { id: 12, filename: 'Dairycows1.jpg', category: 'animals', caption: 'More of our prized dairy cattle.' },
  { id: 13, filename: 'Cattlefeeding.jpg', category: 'animals', caption: 'Feeding time for our cattle.' },
  { id: 14, filename: 'Dewormingcows.jpg', category: 'animals', caption: 'Regular health care for our cattle.' },
  { id: 15, filename: 'Dorpersheep.jpg', category: 'animals', caption: 'Our Dorper sheep breed.' },
  { id: 16, filename: 'Chicken.jpg', category: 'animals', caption: 'Free-range chickens on the farm.' },
  { id: 17, filename: 'Goats(1).jpg', category: 'animals', caption: 'Another view of our goat herd.' },
  { id: 18, filename: 'Hegoat.jpg', category: 'animals', caption: 'A strong breeding male goat.' },
  { id: 19, filename: 'Ram.jpg', category: 'animals', caption: 'Our breeding ram.' },
  { id: 20, filename: 'Sheep2.jpg', category: 'animals', caption: 'Healthy sheep grazing.' },
  { id: 21, filename: 'adonai1.jpg', category: 'animals', caption: 'Adonai Farm livestock showcase.' },

  // Farm Category
  { id: 22, filename: 'Maizefarm.jpg', category: 'farm', caption: 'A lush and thriving maize farm.' },
  { id: 23, filename: 'Potatoes.jpg', category: 'farm', caption: 'Fresh potatoes from our fields.' },
  { id: 24, filename: 'Potatoes1.jpg', category: 'farm', caption: 'Harvesting fresh potatoes from our fields.' },
  { id: 25, filename: 'Strawberry.jpg', category: 'farm', caption: 'Juicy strawberries grown on our farm.' },
  { id: 26, filename: 'Teafarm-3.jpg', category: 'farm', caption: 'Expansive tea fields under the morning sun.' },
  { id: 27, filename: 'Teafarm-4.jpg', category: 'farm', caption: 'Tea plantation in full bloom.' },
  { id: 28, filename: 'Teafarm-6.jpg', category: 'farm', caption: 'Rolling tea hills at Adonai Farm.' },
  { id: 29, filename: 'Teafarm-7.jpg', category: 'farm', caption: 'Tea farming excellence.' },
  { id: 30, filename: 'Teafarm.jpg', category: 'farm', caption: 'Our main tea plantation.' },
  { id: 31, filename: 'Tractor.jpg', category: 'farm', caption: 'Our modern tractor at work in the fields.' },
  { id: 32, filename: 'Tractor1.jpg', category: 'farm', caption: 'Farm equipment for efficient operations.' },
  { id: 33, filename: 'Visitors.jpg', category: 'farm', caption: 'Welcoming visitors for a tour of the farm.' },
  { id: 34, filename: 'Visitorsday.jpg', category: 'farm', caption: 'A special day for farm visitors.' },
  { id: 35, filename: 'Frenchbeans.jpg', category: 'farm', caption: 'Fresh French beans from our garden.' },
  { id: 36, filename: 'Tosh1.jpg', category: 'farm', caption: 'Farm operations and management.' },
  { id: 37, filename: 'Tosh2.jpg', category: 'farm', caption: 'Daily farm activities.' },
  { id: 38, filename: 'adonai7.jpg', category: 'farm', caption: 'Adonai Farm operations.' },
  { id: 39, filename: 'adonaix.jpg', category: 'farm', caption: 'Adonai Farm landscape.' },
  { id: 40, filename: 'adonaixii.jpg', category: 'farm', caption: 'Adonai Farm infrastructure.' },
  { id: 41, filename: 'adonaixiii.jpg', category: 'farm', caption: 'Adonai Farm overview.' },
  { id: 42, filename: 'farm-2.jpg', category: 'farm', caption: 'Agricultural activities at Adonai Farm.' },
  { id: 43, filename: 'farm-5.jpg', category: 'farm', caption: 'Modern farming at Adonai.' }
];

/**
 * ImageService - Handles farm image management and categorization with optimization
 * Manages images from frontend/public/images folder with rich metadata and responsive sizing
 * Optimized for both development and production environments
 */
class ImageService {
  static BASE_URL = '/images'; // Always serves from public/images folder
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
      console.warn('Failed to fetch images from API, using real local data:', error);
      // Fallback to the centralized public images list
      return {
        images: allPublicImages,
        categories: {
          animals: allPublicImages.filter(img => img.category === 'animals'),
          farm: allPublicImages.filter(img => img.category === 'farm'),
          facilities: allPublicImages.filter(img => img.category === 'facilities')
        },
        total: allPublicImages.length
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
    // This function will now exclusively use the centralized `allPublicImages` list.
    const images = allPublicImages.map(img => ({
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

  /**
   * Get all public images asynchronously with API data
   * @param {string} category - Optional category filter
   * @returns {Promise<Array>} Promise resolving to array of image objects
   */
  static async getPublicImagesAsync(category = 'all') {
    try {
      // This async function will also use the centralized `allPublicImages` list as a fallback.
      const data = await this.getAvailableImages();
      let allImages = data.images;

      if (!allImages || allImages.length === 0) {
        allImages = allPublicImages;
      }

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
      return this.getPublicImages(category); // Fallback to sync method
    }
  }

  /**
   * Initialize gallery with real images from frontend/public/images
   */
  static initializeGallery() {
    // Use the centralized list of images from public/images folder
    const realProductionImages = allPublicImages.map((img, index) => ({
      id: index + 1,
      filename: img.filename,
      category: img.category,
      caption: img.caption,
      isPublic: true,
      uploaded_at: new Date().toISOString().split('T')[0] // Current date
    }));

    // Always update localStorage to ensure we have the latest images
    localStorage.setItem('adonai_gallery', JSON.stringify(realProductionImages));
  }

  /**
   * Generate proper URL for images from public/images folder
   * @param {string} filename - Image filename
   * @returns {string} Full image URL
   */
  static getImageUrl(filename) {
    // Always use the public/images folder
    return `${this.BASE_URL}/${filename}`;
  }

  /**
   * Get image URL with comprehensive fallback strategy
   * @param {string} filename - Image filename
   * @returns {string} Image URL with fallback handling
   */
  static getImageUrlWithFallback(filename) {
    // Always use the public/images folder
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
   * Get fallback URL for images that fail to load
   * @param {string} filename - Original filename
   * @returns {string} Fallback image URL
   */
  static getFallbackUrl(filename) {
    // Use the actual images from public/images folder
    if (filename.startsWith('adonai')) {
      // Try other adonai images
      const animalImages = ['adonai1.jpg', 'adonai2.jpg', 'adonai3.jpg', 'adonai4.jpg', 'adonai5.jpg', 'adonai6.jpg'];
      const fallbackAnimal = animalImages.find(img => img !== filename);
      if (fallbackAnimal) {
        return `${this.BASE_URL}/${fallbackAnimal}`;
      }
      return `${this.BASE_URL}/farm-1.jpg`;
    }

    if (filename.startsWith('farm-')) {
      // Try other farm images
      const farmImages = ['farm-1.jpg', 'farm-2.jpg', 'farm-3.jpg', 'farm-4.jpg', 'farm-5.jpg', 'farm-6.jpg', 'farm-7.jpg'];
      const fallbackFarm = farmImages.find(img => img !== filename);
      if (fallbackFarm) {
        return `${this.BASE_URL}/${fallbackFarm}`;
      }
    }

    if (['Dairycows.jpg', 'Beefcattle.jpg', 'Cattlefeed.jpg', 'Cowfeeds.jpg', 'Heifer1.jpg', 'GoAtS.jpg'].includes(filename)) {
      // Try other animal images
      const animalImages = ['Dairycows.jpg', 'Beefcattle.jpg', 'GoAtS.jpg', 'Ewes.jpg', 'Bighegoat.jpg'];
      const fallbackAnimal = animalImages.find(img => img !== filename);
      if (fallbackAnimal) {
        return `${this.BASE_URL}/${fallbackAnimal}`;
      }
    }

    if (['Tractor.jpg', 'Maizefarm.jpg', 'Teafarm-3.jpg', 'Visitors.jpg', 'Potatoes1.jpg', 'Strawberry.jpg'].includes(filename)) {
      // Try other farm images
      const farmImages = ['Tractor.jpg', 'Maizefarm.jpg', 'Teafarm-3.jpg', 'Visitors.jpg', 'Tractor1.jpg'];
      const fallbackFarm = farmImages.find(img => img !== filename);
      if (fallbackFarm) {
        return `${this.BASE_URL}/${fallbackFarm}`;
      }
    }

    // Default fallbacks
    const defaultImages = ['adonai1.jpg', 'farm-1.jpg', 'Dairycows.jpg', 'Tractor.jpg'];
    const randomImage = defaultImages[Math.floor(Math.random() * defaultImages.length)];
    return `${this.BASE_URL}/${randomImage}`;
  }

  /**
   * Get multiple fallback URLs in order of preference
   * @param {string} filename - Original filename
   * @returns {Array<string>} Array of fallback URLs in order of preference
   */
  static getFallbackUrls(filename) {
    const fallbacks = [];

    if (filename.startsWith('adonai')) {
      // Try other adonai images first
      const animalImages = ['adonai1.jpg', 'adonai2.jpg', 'adonai3.jpg', 'adonai4.jpg', 'adonai5.jpg', 'adonai6.jpg'];
      animalImages.filter(img => img !== filename).forEach(img => {
        fallbacks.push(`${this.BASE_URL}/${img}`);
      });
      // Then try farm images
      fallbacks.push(`${this.BASE_URL}/farm-1.jpg`);
      fallbacks.push(`${this.BASE_URL}/farm-2.jpg`);
    } else if (filename.startsWith('farm-')) {
      // Try other farm images first
      const farmImages = ['farm-1.jpg', 'farm-2.jpg', 'farm-3.jpg', 'farm-4.jpg', 'farm-5.jpg', 'farm-6.jpg', 'farm-7.jpg'];
      farmImages.filter(img => img !== filename).forEach(img => {
        fallbacks.push(`${this.BASE_URL}/${img}`);
      });
    } else if (['Dairycows.jpg', 'Beefcattle.jpg', 'Cattlefeed.jpg', 'Cowfeeds.jpg', 'Heifer1.jpg', 'GoAtS.jpg'].includes(filename)) {
      // Try other animal images first
      const animalImages = ['Dairycows.jpg', 'Beefcattle.jpg', 'GoAtS.jpg', 'Ewes.jpg', 'Bighegoat.jpg'];
      animalImages.filter(img => img !== filename).forEach(img => {
        fallbacks.push(`${this.BASE_URL}/${img}`);
      });
    } else if (['Tractor.jpg', 'Maizefarm.jpg', 'Teafarm-3.jpg', 'Visitors.jpg', 'Potatoes1.jpg', 'Strawberry.jpg'].includes(filename)) {
      // Try other farm images first
      const farmImages = ['Tractor.jpg', 'Maizefarm.jpg', 'Teafarm-3.jpg', 'Visitors.jpg', 'Tractor1.jpg'];
      farmImages.filter(img => img !== filename).forEach(img => {
        fallbacks.push(`${this.BASE_URL}/${img}`);
      });
    }

    // Add default images as final fallbacks
    const defaultImages = ['adonai1.jpg', 'farm-1.jpg', 'Dairycows.jpg', 'Tractor.jpg'];
    defaultImages.forEach(img => {
      if (!fallbacks.includes(`${this.BASE_URL}/${img}`)) {
        fallbacks.push(`${this.BASE_URL}/${img}`);
      }
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

// Initialize gallery on module load
ImageService.initializeGallery();

export default ImageService;