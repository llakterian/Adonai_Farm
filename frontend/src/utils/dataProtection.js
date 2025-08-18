/**
 * Data Protection Utilities for Adonai Farm Management System
 * Ensures no sensitive admin data is exposed on public routes
 */

// Sensitive fields that should never be exposed publicly
const SENSITIVE_FIELDS = [
  'password',
  'password_hash',
  'token',
  'session',
  'api_key',
  'secret',
  'private',
  'internal',
  'admin',
  'employee_id',
  'hourly_rate',
  'salary',
  'cost',
  'price',
  'financial',
  'breeding_records',
  'health_records',
  'veterinary',
  'medical',
  'treatment',
  'medication',
  'notes' // Internal notes should be filtered
];

// Admin-only animal data fields
const ADMIN_ONLY_ANIMAL_FIELDS = [
  'employee_id',
  'hourly_rate',
  'cost',
  'price',
  'breeding_records',
  'health_records',
  'veterinary_records',
  'medical_history',
  'treatment_history',
  'medication',
  'internal_notes',
  'purchase_price',
  'sale_price',
  'breeding_value',
  'genetic_data',
  'parentId',
  'tagNumber'
];

// Admin-only worker data fields
const ADMIN_ONLY_WORKER_FIELDS = [
  'employee_id',
  'hourly_rate',
  'salary',
  'phone',
  'email',
  'address',
  'emergency_contact',
  'social_security',
  'bank_details',
  'performance_reviews',
  'disciplinary_records'
];

/**
 * Data sanitizer for public consumption
 */
export class PublicDataSanitizer {
  /**
   * Remove sensitive fields from an object
   * @param {Object} data - Data object to sanitize
   * @param {Array} additionalSensitiveFields - Additional fields to remove
   * @returns {Object} Sanitized data object
   */
  static sanitizeObject(data, additionalSensitiveFields = []) {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sensitiveFields = [...SENSITIVE_FIELDS, ...additionalSensitiveFields];
    const sanitized = {};

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      
      // Skip sensitive fields
      if (sensitiveFields.some(field => lowerKey.includes(field.toLowerCase()))) {
        continue;
      }

      // Recursively sanitize nested objects
      if (value && typeof value === 'object') {
        if (Array.isArray(value)) {
          sanitized[key] = value.map(item => this.sanitizeObject(item, additionalSensitiveFields));
        } else {
          sanitized[key] = this.sanitizeObject(value, additionalSensitiveFields);
        }
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Sanitize animal data for public display
   * @param {Object|Array} animals - Animal data to sanitize
   * @returns {Object|Array} Sanitized animal data
   */
  static sanitizeAnimalData(animals) {
    if (!animals) return animals;

    const sanitizeAnimal = (animal) => {
      if (!animal || typeof animal !== 'object') return animal;

      const publicAnimal = {
        id: animal.id,
        type: animal.type,
        name: animal.name,
        sex: animal.sex,
        breed: animal.breed,
        age: animal.age || this.calculateAge(animal.dob),
        description: animal.public_description || this.generatePublicDescription(animal),
        category: animal.category || this.categorizeAnimal(animal.type),
        image: animal.image,
        isPublic: animal.isPublic !== false // Default to public unless explicitly set to false
      };

      // Only include safe, visitor-friendly information
      if (animal.fun_fact) {
        publicAnimal.funFact = animal.fun_fact;
      }

      if (animal.public_notes) {
        publicAnimal.notes = animal.public_notes;
      }

      return publicAnimal;
    };

    if (Array.isArray(animals)) {
      return animals
        .filter(animal => animal.isPublic !== false) // Only show public animals
        .map(sanitizeAnimal);
    } else {
      return sanitizeAnimal(animals);
    }
  }

  /**
   * Sanitize worker data for public display (very limited info)
   * @param {Object|Array} workers - Worker data to sanitize
   * @returns {Object|Array} Sanitized worker data
   */
  static sanitizeWorkerData(workers) {
    if (!workers) return workers;

    const sanitizeWorker = (worker) => {
      if (!worker || typeof worker !== 'object') return worker;

      // Only show very basic, public-safe information
      return {
        id: worker.id,
        name: worker.public_name || worker.first_name || 'Farm Staff',
        role: worker.public_role || 'Farm Team Member',
        specialties: worker.public_specialties || [],
        bio: worker.public_bio || ''
      };
    };

    if (Array.isArray(workers)) {
      return workers
        .filter(worker => worker.isPublic === true) // Only show explicitly public workers
        .map(sanitizeWorker);
    } else {
      return sanitizeWorker(workers);
    }
  }

  /**
   * Sanitize gallery images for public display
   * @param {Object|Array} images - Image data to sanitize
   * @returns {Object|Array} Sanitized image data
   */
  static sanitizeImageData(images) {
    if (!images) return images;

    const sanitizeImage = (image) => {
      if (!image || typeof image !== 'object') return image;

      return {
        id: image.id,
        filename: image.filename,
        url: image.url || image.path,
        category: image.category,
        caption: image.public_caption || image.caption,
        alt: image.alt,
        uploadedAt: image.uploaded_at,
        isPublic: image.isPublic !== false
      };
    };

    if (Array.isArray(images)) {
      return images
        .filter(image => image.isPublic !== false) // Only show public images
        .map(sanitizeImage);
    } else {
      return sanitizeImage(images);
    }
  }

  /**
   * Calculate age from date of birth
   * @param {string} dob - Date of birth
   * @returns {string} Age description
   */
  static calculateAge(dob) {
    if (!dob) return 'Unknown age';

    const birthDate = new Date(dob);
    const today = new Date();
    const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + 
                       (today.getMonth() - birthDate.getMonth());

    if (ageInMonths < 12) {
      return `${ageInMonths} months old`;
    } else {
      const years = Math.floor(ageInMonths / 12);
      const months = ageInMonths % 12;
      if (months === 0) {
        return `${years} year${years > 1 ? 's' : ''} old`;
      } else {
        return `${years} year${years > 1 ? 's' : ''}, ${months} month${months > 1 ? 's' : ''} old`;
      }
    }
  }

  /**
   * Generate public-friendly description for animals
   * @param {Object} animal - Animal data
   * @returns {string} Public description
   */
  static generatePublicDescription(animal) {
    if (!animal) return '';

    const descriptions = {
      'Dairy Cattle': 'One of our gentle dairy cows, providing fresh milk daily.',
      'Beef Cattle': 'A healthy member of our beef cattle herd.',
      'Dairy Goat': 'A friendly dairy goat known for producing quality milk.',
      'Beef Goat': 'Part of our goat herd, raised with care and attention.',
      'Sheep': 'A woolly member of our sheep flock.',
      'Pedigree Sheep': 'A prize-winning sheep with excellent bloodlines.',
      'Chicken': 'One of our free-range chickens, providing fresh eggs.',
      'Poultry': 'Part of our diverse poultry collection.'
    };

    return descriptions[animal.type] || 'A beloved member of our farm family.';
  }

  /**
   * Categorize animals for public display
   * @param {string} type - Animal type
   * @returns {string} Category
   */
  static categorizeAnimal(type) {
    if (!type) return 'livestock';

    const lowerType = type.toLowerCase();
    
    if (lowerType.includes('cattle') || lowerType.includes('cow') || lowerType.includes('bull')) {
      return 'cattle';
    } else if (lowerType.includes('goat')) {
      return 'goats';
    } else if (lowerType.includes('sheep')) {
      return 'sheep';
    } else if (lowerType.includes('chicken') || lowerType.includes('poultry')) {
      return 'poultry';
    } else {
      return 'livestock';
    }
  }

  /**
   * Validate that data doesn't contain sensitive information
   * @param {Object} data - Data to validate
   * @returns {Object} Validation result
   */
  static validatePublicData(data) {
    const issues = [];
    
    const checkObject = (obj, path = '') => {
      if (!obj || typeof obj !== 'object') return;

      for (const [key, value] of Object.entries(obj)) {
        const fullPath = path ? `${path}.${key}` : key;
        const lowerKey = key.toLowerCase();

        // Check for sensitive field names
        if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field.toLowerCase()))) {
          issues.push({
            type: 'sensitive_field',
            path: fullPath,
            field: key,
            message: `Potentially sensitive field "${key}" found`
          });
        }

        // Check for sensitive values
        if (typeof value === 'string') {
          if (value.includes('password') || value.includes('secret') || value.includes('token')) {
            issues.push({
              type: 'sensitive_value',
              path: fullPath,
              message: `Potentially sensitive value in field "${key}"`
            });
          }
        }

        // Recursively check nested objects
        if (value && typeof value === 'object') {
          if (Array.isArray(value)) {
            value.forEach((item, index) => {
              checkObject(item, `${fullPath}[${index}]`);
            });
          } else {
            checkObject(value, fullPath);
          }
        }
      }
    };

    checkObject(data);

    return {
      isValid: issues.length === 0,
      issues,
      riskLevel: issues.length === 0 ? 'low' : issues.length < 3 ? 'medium' : 'high'
    };
  }
}

/**
 * Route-based data protection
 */
export class RouteDataProtection {
  /**
   * Check if current route should have access to admin data
   * @returns {boolean} True if admin route
   */
  static isAdminRoute() {
    const path = window.location.pathname;
    return path.startsWith('/dashboard') || path.startsWith('/admin');
  }

  /**
   * Check if user is authenticated for admin access
   * @returns {boolean} True if authenticated
   */
  static isAuthenticated() {
    const token = localStorage.getItem('adonai_token');
    const sessionExpiry = localStorage.getItem('adonai_session_expiry');
    
    if (!token || !sessionExpiry) {
      return false;
    }
    
    // Check if session has expired
    if (Date.now() > parseInt(sessionExpiry)) {
      return false;
    }
    
    return true;
  }

  /**
   * Filter data based on current route and authentication status
   * @param {Object} data - Data to filter
   * @param {string} dataType - Type of data (animals, workers, images, etc.)
   * @returns {Object} Filtered data
   */
  static filterDataForRoute(data, dataType) {
    // If on admin route and authenticated, return full data
    if (this.isAdminRoute() && this.isAuthenticated()) {
      return data;
    }

    // Otherwise, sanitize for public consumption
    switch (dataType) {
      case 'animals':
        return PublicDataSanitizer.sanitizeAnimalData(data);
      case 'workers':
        return PublicDataSanitizer.sanitizeWorkerData(data);
      case 'images':
        return PublicDataSanitizer.sanitizeImageData(data);
      default:
        return PublicDataSanitizer.sanitizeObject(data);
    }
  }

  /**
   * Log potential data exposure attempts
   * @param {string} dataType - Type of data accessed
   * @param {Object} context - Additional context
   */
  static logDataAccess(dataType, context = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: 'data_access',
      dataType,
      route: window.location.pathname,
      isAdminRoute: this.isAdminRoute(),
      isAuthenticated: this.isAuthenticated(),
      userAgent: navigator.userAgent,
      ...context
    };

    // Store in localStorage for monitoring
    try {
      const logs = JSON.parse(localStorage.getItem('adonai_data_access_logs') || '[]');
      logs.push(logEntry);
      
      // Keep only last 50 logs
      if (logs.length > 50) {
        logs.splice(0, logs.length - 50);
      }
      
      localStorage.setItem('adonai_data_access_logs', JSON.stringify(logs));
    } catch (error) {
      console.warn('Failed to log data access:', error);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Data Access:', logEntry);
    }
  }
}

export default {
  PublicDataSanitizer,
  RouteDataProtection
};