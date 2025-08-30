/**
 * Application Configuration
 * Handles switching between backend API and localStorage for mobile testing
 */

// Detect if we're in a mobile/offline environment
const isMobileTest = () => {
  // Check if we're on a mobile device or if backend is not available
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isFileProtocol = window.location.protocol === 'file:';

  // Use localStorage if mobile, file protocol, or explicitly set
  return isMobile || isFileProtocol || localStorage.getItem('use-local-storage') === 'true';
};

const config = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_URL || (
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:4000'
      : window.location.origin
  ),

  // Feature flags
  USE_LOCAL_STORAGE: isMobileTest(),

  // App settings
  APP_NAME: 'Adonai Farm',
  APP_VERSION: '1.0.0',

  // Contact information
  CONTACT_INFO: {
    phone: '+254 722 759 217',
    email: 'info@adonaifarm.co.ke',
    address: 'Chepsir, Kericho, Kenya',
    coordinates: {
      lat: -0.3676,
      lng: 35.2833
    }
  },

  // Farm information
  FARM_INFO: {
    name: 'Adonai Farm',
    established: '1990s',
    location: 'Kericho, Kenya',
    specialties: [
      'Sustainable Livestock Management',
      'Quality Breeding Programs',
      'Farm Tours & Education',
      'Premium Agricultural Products'
    ],
    animals: {
      cattle: 'Dairy & Beef Cattle',
      goats: 'Dairy & Meat Goats',
      sheep: 'Wool & Meat Sheep',
      poultry: 'Chickens & Ducks'
    }
  },

  // SEO Configuration
  SEO: {
    title: '🌾 Adonai Farm - Modern Livestock Farm in Kericho, Kenya',
    description: 'Adonai Farm - Modern livestock farm in Kericho, Kenya specializing in sustainable farming, quality breeding, farm tours, and premium agricultural products. Visit our farm today!',
    keywords: 'livestock farm Kenya, Kericho farm, sustainable farming, livestock breeding, farm tours Kenya, agricultural consulting, premium beef Kenya, dairy products Kericho',
    ogImage: '/images/hero-farm.jpg'
  }
};

// Debug logging
if (import.meta.env.DEV) {
  console.log('🔧 App Configuration:', {
    useLocalStorage: config.USE_LOCAL_STORAGE,
    apiBaseUrl: config.API_BASE_URL,
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    protocol: window.location.protocol,
    hostname: window.location.hostname
  });
}

export default config;