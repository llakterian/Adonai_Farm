/**
 * PublicContentService - Manages public content configuration and visibility
 * Handles the flow between admin management and public display
 */

import { farmInfo, farmServices, featuredAnimals } from '../mockData.js';

class PublicContentService {
  constructor() {
    this.storageKeys = {
      publicSettings: 'adonai_public_settings',
      farmContent: 'adonai_farm_content',
      animals: 'adonai_animals',
      gallery: 'adonai_gallery',
      inquiries: 'adonai_inquiries'
    };
    
    this.initializeDefaults();
  }

  // Initialize default public content settings
  initializeDefaults() {
    const defaultSettings = {
      // General website settings
      websiteEnabled: true,
      maintenanceMode: false,
      
      // Content visibility settings
      showFarmInfo: true,
      showContactInfo: true,
      showServices: true,
      showAnimals: true,
      showGallery: true,
      allowInquiries: true,
      
      // Animal visibility settings
      visibleAnimalTypes: ['Dairy Cattle', 'Beef Cattle', 'Sheep', 'Dairy Goat', 'Chicken'],
      featuredAnimals: [],
      hideBreedingInfo: true,
      hideMedicalInfo: true,
      hideFinancialInfo: true,
      
      // Gallery settings
      publicImageCategories: ['farm', 'animals', 'facilities'],
      maxImagesPerCategory: 20,
      
      // Contact settings
      enableContactForm: true,
      enablePhoneContact: true,
      enableEmailContact: true,
      enableLocationInfo: true,
      
      // SEO settings
      siteTitle: 'Adonai Farm - Sustainable Livestock Management',
      siteDescription: 'Premium livestock farming in Kericho, Kenya. Quality dairy, beef, and agricultural products with modern sustainable practices.',
      siteKeywords: ['Adonai Farm', 'livestock', 'dairy', 'beef', 'Kericho', 'Kenya', 'sustainable farming'],
      
      // Social media settings
      showSocialMedia: true,
      socialMediaLinks: {
        facebook: 'https://facebook.com/adonaifarm',
        instagram: 'https://instagram.com/adonaifarm',
        twitter: 'https://twitter.com/adonaifarm'
      }
    };

    const defaultFarmContent = {
      ...farmInfo,
      customSections: [],
      announcements: [],
      testimonials: [],
      farmNews: []
    };

    // Initialize if not exists
    if (!localStorage.getItem(this.storageKeys.publicSettings)) {
      this.savePublicSettings(defaultSettings);
    }
    
    if (!localStorage.getItem(this.storageKeys.farmContent)) {
      this.saveFarmContent(defaultFarmContent);
    }
  }

  // Get public settings
  getPublicSettings() {
    const settings = localStorage.getItem(this.storageKeys.publicSettings);
    return settings ? JSON.parse(settings) : {};
  }

  // Save public settings
  savePublicSettings(settings) {
    localStorage.setItem(this.storageKeys.publicSettings, JSON.stringify(settings));
    return true;
  }

  // Get farm content
  getFarmContent() {
    const content = localStorage.getItem(this.storageKeys.farmContent);
    return content ? JSON.parse(content) : farmInfo;
  }

  // Save farm content
  saveFarmContent(content) {
    localStorage.setItem(this.storageKeys.farmContent, JSON.stringify(content));
    return true;
  }

  // Get public animals (filtered for public display)
  getPublicAnimals() {
    const settings = this.getPublicSettings();
    const animals = this.getAllAnimals();
    
    if (!settings.showAnimals) {
      return [];
    }

    return animals.filter(animal => {
      // Check if animal type is visible
      if (!settings.visibleAnimalTypes.includes(animal.type)) {
        return false;
      }
      
      // Check individual animal visibility
      if (animal.isPublicVisible === false) {
        return false;
      }
      
      return true;
    }).map(animal => this.sanitizeAnimalForPublic(animal, settings));
  }

  // Get featured animals
  getFeaturedAnimals() {
    const settings = this.getPublicSettings();
    const publicAnimals = this.getPublicAnimals();
    
    return publicAnimals.filter(animal => 
      settings.featuredAnimals.includes(animal.id)
    );
  }

  // Sanitize animal data for public display
  sanitizeAnimalForPublic(animal, settings = null) {
    if (!settings) {
      settings = this.getPublicSettings();
    }

    const publicAnimal = {
      id: animal.id,
      name: animal.name,
      type: animal.type,
      sex: animal.sex,
      age: this.calculateAge(animal.dob),
      description: this.generatePublicDescription(animal),
      image: this.getAnimalImage(animal),
      isFeatured: settings.featuredAnimals.includes(animal.id)
    };

    // Add safe notes if available
    if (animal.notes && !settings.hideBreedingInfo) {
      publicAnimal.notes = this.sanitizeNotes(animal.notes, settings);
    }

    return publicAnimal;
  }

  // Sanitize notes to remove sensitive information
  sanitizeNotes(notes, settings) {
    if (!notes) return '';

    let sanitizedNotes = notes;

    // Remove breeding information if hidden
    if (settings.hideBreedingInfo) {
      const breedingKeywords = [
        'breeding', 'mating', 'pregnancy', 'pregnant', 'birth', 'calving',
        'artificial insemination', 'AI', 'semen', 'embryo', 'gestation'
      ];
      breedingKeywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b.*?(?=\\.|$)`, 'gi');
        sanitizedNotes = sanitizedNotes.replace(regex, '');
      });
    }

    // Remove medical information if hidden
    if (settings.hideMedicalInfo) {
      const medicalKeywords = [
        'medication', 'medicine', 'vaccine', 'vaccination', 'treatment',
        'disease', 'illness', 'sick', 'injury', 'vet', 'veterinary'
      ];
      medicalKeywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b.*?(?=\\.|$)`, 'gi');
        sanitizedNotes = sanitizedNotes.replace(regex, '');
      });
    }

    // Remove financial information if hidden
    if (settings.hideFinancialInfo) {
      const financialKeywords = [
        'cost', 'price', 'profit', 'loss', 'revenue', 'income', 'expense',
        'budget', 'financial', 'money', 'dollar', 'ksh', 'kes'
      ];
      financialKeywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b.*?(?=\\.|$)`, 'gi');
        sanitizedNotes = sanitizedNotes.replace(regex, '');
      });
    }

    return sanitizedNotes.trim();
  }

  // Generate public-friendly description
  generatePublicDescription(animal) {
    const descriptions = {
      'Dairy Cattle': `${animal.name} is one of our productive dairy cows, contributing to our daily fresh milk production with excellent health and temperament.`,
      'Beef Cattle': `${animal.name} is a healthy member of our beef cattle herd, raised on natural pastures with the highest standards of animal welfare.`,
      'Dairy Goat': `${animal.name} is a friendly goat known for producing rich, creamy milk and has a wonderful personality that visitors love.`,
      'Beef Goat': `${animal.name} is a sturdy goat raised for quality meat production, enjoying free-range life on our sustainable pastures.`,
      'Sheep': `${animal.name} is a gentle sheep contributing to our wool and meat production, well-cared for with modern farming practices.`,
      'Pedigree Sheep': `${animal.name} is a prize-winning sheep with excellent genetics and wool quality, representing the best of our breeding program.`,
      'Chicken': `${animal.name} is a happy free-range chicken providing fresh eggs daily and enjoying the freedom of our natural environment.`,
      'Poultry': `${animal.name} is part of our poultry flock, enjoying free-range life on the farm and contributing to our sustainable egg production.`
    };
    
    return descriptions[animal.type] || `${animal.name} is a wonderful ${animal.type.toLowerCase()} that calls Adonai Farm home.`;
  }

  // Calculate age from date of birth
  calculateAge(dob) {
    if (!dob) return 'Age unknown';
    
    const birthDate = new Date(dob);
    const today = new Date();
    const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + 
                       (today.getMonth() - birthDate.getMonth());
    
    if (ageInMonths < 1) {
      return 'Less than 1 month old';
    } else if (ageInMonths < 12) {
      return `${ageInMonths} month${ageInMonths !== 1 ? 's' : ''} old`;
    } else {
      const years = Math.floor(ageInMonths / 12);
      const months = ageInMonths % 12;
      return `${years} year${years !== 1 ? 's' : ''}${months > 0 ? ` ${months} month${months !== 1 ? 's' : ''}` : ''} old`;
    }
  }

  // Get animal image
  getAnimalImage(animal) {
    // Map to available adonai images based on animal type and ID
    const animalImages = [
      'adonai1.jpg', 'adonai2.jpg', 'adonai3.jpg', 'adonai4.jpg', 
      'adonai5.jpg', 'adonai6.jpg', 'adonai7.jpg', 'adonai8.jpg',
      'adonai9.jpg', 'adonaix.jpg', 'adonaixi.jpg', 'adonaixii.jpg', 'adonaixiii.jpg'
    ];
    
    return animalImages[animal.id % animalImages.length];
  }

  // Get all animals from storage
  getAllAnimals() {
    const animals = localStorage.getItem(this.storageKeys.animals);
    return animals ? JSON.parse(animals) : [];
  }

  // Update animal visibility
  updateAnimalVisibility(animalId, isVisible) {
    const animals = this.getAllAnimals();
    const updatedAnimals = animals.map(animal => 
      animal.id === animalId 
        ? { ...animal, isPublicVisible: isVisible }
        : animal
    );
    
    localStorage.setItem(this.storageKeys.animals, JSON.stringify(updatedAnimals));
    return true;
  }

  // Toggle featured animal
  toggleFeaturedAnimal(animalId) {
    const settings = this.getPublicSettings();
    const isFeatured = settings.featuredAnimals.includes(animalId);
    
    const updatedFeatured = isFeatured
      ? settings.featuredAnimals.filter(id => id !== animalId)
      : [...settings.featuredAnimals, animalId];
    
    const updatedSettings = {
      ...settings,
      featuredAnimals: updatedFeatured
    };
    
    this.savePublicSettings(updatedSettings);
    return !isFeatured;
  }

  // Get public gallery images
  getPublicGalleryImages() {
    const settings = this.getPublicSettings();
    const images = this.getAllGalleryImages();
    
    if (!settings.showGallery) {
      return [];
    }

    return images.filter(image => {
      // Check if image is marked as public
      if (image.isPublic === false) {
        return false;
      }
      
      // Check if image category is allowed
      if (!settings.publicImageCategories.includes(image.category)) {
        return false;
      }
      
      return true;
    });
  }

  // Get all gallery images from storage
  getAllGalleryImages() {
    const images = localStorage.getItem(this.storageKeys.gallery);
    return images ? JSON.parse(images) : [];
  }

  // Update image visibility
  updateImageVisibility(imageId, isPublic) {
    const images = this.getAllGalleryImages();
    const updatedImages = images.map(image => 
      image.id === imageId 
        ? { ...image, isPublic: isPublic }
        : image
    );
    
    localStorage.setItem(this.storageKeys.gallery, JSON.stringify(updatedImages));
    return true;
  }

  // Get public services
  getPublicServices() {
    const settings = this.getPublicSettings();
    
    if (!settings.showServices) {
      return [];
    }

    return farmServices.filter(service => service.available !== false);
  }

  // Save contact inquiry
  saveContactInquiry(inquiry) {
    const inquiries = this.getContactInquiries();
    const newInquiry = {
      id: Date.now(),
      ...inquiry,
      timestamp: new Date().toISOString(),
      status: 'new',
      isRead: false
    };
    
    inquiries.push(newInquiry);
    localStorage.setItem(this.storageKeys.inquiries, JSON.stringify(inquiries));
    
    return newInquiry;
  }

  // Get contact inquiries
  getContactInquiries() {
    const inquiries = localStorage.getItem(this.storageKeys.inquiries);
    return inquiries ? JSON.parse(inquiries) : [];
  }

  // Update inquiry status
  updateInquiryStatus(inquiryId, status) {
    const inquiries = this.getContactInquiries();
    const updatedInquiries = inquiries.map(inquiry => 
      inquiry.id === inquiryId 
        ? { ...inquiry, status, isRead: true }
        : inquiry
    );
    
    localStorage.setItem(this.storageKeys.inquiries, JSON.stringify(updatedInquiries));
    return true;
  }

  // Get public statistics
  getPublicStatistics() {
    const animals = this.getPublicAnimals();
    const images = this.getPublicGalleryImages();
    const services = this.getPublicServices();
    
    return {
      totalAnimals: animals.length,
      animalTypes: [...new Set(animals.map(a => a.type))].length,
      featuredAnimals: animals.filter(a => a.isFeatured).length,
      galleryImages: images.length,
      availableServices: services.length,
      yearsInOperation: new Date().getFullYear() - 2018
    };
  }

  // Validate public content settings
  validateSettings(settings) {
    const errors = [];
    
    if (!settings.siteTitle || settings.siteTitle.trim().length === 0) {
      errors.push('Site title is required');
    }
    
    if (!settings.siteDescription || settings.siteDescription.trim().length === 0) {
      errors.push('Site description is required');
    }
    
    if (settings.visibleAnimalTypes.length === 0) {
      errors.push('At least one animal type must be visible');
    }
    
    return errors;
  }

  // Export public content configuration
  exportConfiguration() {
    return {
      settings: this.getPublicSettings(),
      farmContent: this.getFarmContent(),
      publicAnimals: this.getPublicAnimals(),
      publicImages: this.getPublicGalleryImages(),
      exportDate: new Date().toISOString()
    };
  }

  // Import public content configuration
  importConfiguration(config) {
    try {
      if (config.settings) {
        this.savePublicSettings(config.settings);
      }
      
      if (config.farmContent) {
        this.saveFarmContent(config.farmContent);
      }
      
      return { success: true, message: 'Configuration imported successfully' };
    } catch (error) {
      return { success: false, message: 'Failed to import configuration: ' + error.message };
    }
  }
}

// Create singleton instance
const publicContentService = new PublicContentService();

export default publicContentService;