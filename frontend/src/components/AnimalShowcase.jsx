import React, { useState, useEffect } from 'react';
import ImageService from '../services/ImageService.js';
import PublicContentService from '../services/PublicContentService.js';
import { featuredAnimals, mockAnimals } from '../mockData.js';

/**
 * AnimalShowcase - Public display of farm animals
 * Filters and displays only public-safe animal information
 * Integrates with uploaded animal images (adonai1.jpg to adonaixiii.jpg)
 */
export default function AnimalShowcase() {
  const [animals, setAnimals] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  // Animal categories for filtering
  const animalCategories = [
    { id: 'all', name: 'All Animals', icon: '🐾' },
    { id: 'cattle', name: 'Cattle', icon: '🐄' },
    { id: 'goats', name: 'Goats', icon: '🐐' },
    { id: 'sheep', name: 'Sheep', icon: '🐑' },
    { id: 'poultry', name: 'Poultry', icon: '🐔' }
  ];

  useEffect(() => {
    loadPublicAnimals();
  }, []);

  const loadPublicAnimals = () => {
    setLoading(true);
    
    try {
      // Use PublicContentService to get properly filtered and sanitized animals
      const publicAnimals = PublicContentService.getPublicAnimals();
      
      // Add category information for filtering
      const animalsWithCategories = publicAnimals.map(animal => ({
        ...animal,
        category: categorizeAnimal(animal.type)
      }));

      // Sort animals to show featured ones first
      const sortedAnimals = animalsWithCategories.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return 0;
      });

      setAnimals(sortedAnimals);
    } catch (error) {
      console.error('Error loading public animals:', error);
      // Fallback to empty array
      setAnimals([]);
    }
    
    setLoading(false);
  };

  // Categorize animals for filtering
  const categorizeAnimal = (type) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('cattle') || lowerType.includes('cow') || lowerType.includes('bull')) {
      return 'cattle';
    } else if (lowerType.includes('goat')) {
      return 'goats';
    } else if (lowerType.includes('sheep') || lowerType.includes('ram')) {
      return 'sheep';
    } else if (lowerType.includes('chicken') || lowerType.includes('poultry')) {
      return 'poultry';
    }
    return 'other';
  };

  // Generate public-friendly description for animals
  const generatePublicDescription = (animal) => {
    const descriptions = {
      'Dairy Cattle': 'One of our productive dairy cows, contributing to our daily fresh milk production',
      'Beef Cattle': 'A healthy member of our beef cattle herd, raised on natural pastures',
      'Dairy Goat': 'A friendly goat known for producing rich, creamy milk',
      'Beef Goat': 'A sturdy goat raised for quality meat production',
      'Sheep': 'A gentle sheep contributing to our wool and meat production',
      'Pedigree Sheep': 'A prize-winning sheep with excellent genetics and wool quality',
      'Chicken': 'A happy free-range chicken providing fresh eggs daily',
      'Poultry': 'Part of our poultry flock, enjoying free-range life on the farm'
    };
    
    return descriptions[animal.type] || `A wonderful ${animal.type.toLowerCase()} that calls Adonai Farm home`;
  };

  // Generate fun facts for animals
  const generateFunFact = (animal) => {
    const facts = {
      'Dairy Cattle': 'Can produce up to 30 liters of milk per day',
      'Beef Cattle': 'Spends most of the day grazing on our natural pastures',
      'Dairy Goat': 'Goat milk is easier to digest than cow milk',
      'Beef Goat': 'Goats are excellent climbers and love exploring',
      'Sheep': 'Sheep have excellent memories and can recognize faces',
      'Pedigree Sheep': 'Produces some of the finest wool in the region',
      'Chicken': 'Lays approximately 250 eggs per year',
      'Poultry': 'Can live up to 8-10 years with proper care'
    };
    
    return facts[animal.type] || 'Each animal has its own unique personality';
  };

  // Get appropriate image for animal
  const getAnimalImage = (animal, index) => {
    // Map to available adonai images
    const animalImages = [
      'adonai1.jpg', 'adonai2.jpg', 'adonai3.jpg', 'adonai4.jpg', 
      'adonai5.jpg', 'adonai6.jpg', 'adonai7.jpg', 'adonai8.jpg',
      'adonai9.jpg', 'adonaix.jpg', 'adonaixi.jpg', 'adonaixii.jpg', 'adonaixiii.jpg'
    ];
    
    return animalImages[index % animalImages.length];
  };

  // Calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) return 'Age unknown';
    
    const birthDate = new Date(dob);
    const today = new Date();
    const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + 
                       (today.getMonth() - birthDate.getMonth());
    
    if (ageInMonths < 12) {
      return `${ageInMonths} month${ageInMonths !== 1 ? 's' : ''} old`;
    } else {
      const years = Math.floor(ageInMonths / 12);
      const months = ageInMonths % 12;
      return `${years} year${years !== 1 ? 's' : ''}${months > 0 ? ` ${months} month${months !== 1 ? 's' : ''}` : ''} old`;
    }
  };

  // Filter out sensitive information from notes
  const filterSensitiveInfo = (notes) => {
    if (!notes) return '';
    
    // Remove sensitive keywords and information
    const sensitiveKeywords = [
      'breeding', 'mating', 'pregnancy', 'birth', 'medical', 'treatment',
      'medication', 'vaccine', 'cost', 'price', 'profit', 'loss', 'financial',
      'artificial insemination', 'AI', 'semen', 'embryo'
    ];
    
    let filteredNotes = notes.toLowerCase();
    sensitiveKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b.*?(?=\\.|$)`, 'gi');
      filteredNotes = filteredNotes.replace(regex, '');
    });
    
    // Clean up and return only if there's meaningful content left
    filteredNotes = filteredNotes.trim();
    return filteredNotes.length > 10 ? filteredNotes : '';
  };

  // Filter animals by category
  const filteredAnimals = selectedCategory === 'all' 
    ? animals 
    : animals.filter(animal => animal.category === selectedCategory);

  const handleImageError = (e) => {
    const img = e.target;
    const originalSrc = img.src;
    
    // If we haven't tried the fallback yet
    if (!img.dataset.fallbackAttempted) {
      img.dataset.fallbackAttempted = 'true';
      const fallbackUrl = ImageService.getFallbackUrl(img.dataset.originalFilename || 'adonai1.jpg');
      img.src = fallbackUrl;
      return;
    }
    
    // If fallback also failed, use placeholder
    img.src = ImageService.getPlaceholderUrl();
    img.alt = 'Farm animal image not available';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading our amazing animals...</p>
      </div>
    );
  }

  return (
    <div className="animal-showcase">
      {/* Hero Section */}
      <section className="showcase-hero">
        <div className="container">
          <h1>Meet Our Animal Family</h1>
          <p className="hero-description">
            Get to know the wonderful animals that call Adonai Farm home. Each one is cared for with love, 
            attention, and the highest standards of animal welfare.
          </p>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">{animals.length}</span>
              <span className="stat-label">Featured Animals</span>
            </div>
            <div className="stat">
              <span className="stat-number">{animalCategories.length - 1}</span>
              <span className="stat-label">Animal Types</span>
            </div>
            <div className="stat">
              <span className="stat-number">100%</span>
              <span className="stat-label">Pasture Raised</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="category-filter">
        <div className="container">
          <div className="filter-buttons">
            {animalCategories.map(category => (
              <button
                key={category.id}
                className={`filter-btn ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className="filter-icon">{category.icon}</span>
                <span className="filter-name">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Animals Grid */}
      <section className="animals-grid-section">
        <div className="container">
          {filteredAnimals.length === 0 ? (
            <div className="no-animals">
              <h3>No animals found in this category</h3>
              <p>Try selecting a different category to see our animals.</p>
            </div>
          ) : (
            <div className="animals-grid">
              {filteredAnimals.map(animal => (
                <div key={animal.id} className="animal-showcase-card">
                  <div className="animal-image-container">
                    <img 
                      src={ImageService.getImageUrl(animal.image)}
                      alt={`${animal.name} - ${animal.type}`}
                      className="animal-image"
                      onError={handleImageError}
                    />
                    <div className="animal-overlay">
                      <span className="animal-age">{animal.age}</span>
                      <span className="animal-sex">{animal.sex === 'M' ? '♂️' : animal.sex === 'F' ? '♀️' : ''}</span>
                    </div>
                  </div>
                  
                  <div className="animal-content">
                    <div className="animal-header">
                      <h3 className="animal-name">{animal.name}</h3>
                      <p className="animal-type">{animal.type}</p>
                    </div>
                    
                    <p className="animal-description">{animal.description}</p>
                    
                    {animal.funFact && (
                      <div className="fun-fact">
                        <span className="fun-fact-icon">💡</span>
                        <span className="fun-fact-text">{animal.funFact}</span>
                      </div>
                    )}
                    
                    {animal.publicNotes && (
                      <div className="animal-notes">
                        <span className="notes-icon">📝</span>
                        <span className="notes-text">{animal.publicNotes}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Farm Practices Section */}
      <section className="farm-practices">
        <div className="container">
          <div className="section-header">
            <h2>Our Animal Care Philosophy</h2>
            <p>Learn about how we ensure the health, happiness, and well-being of all our animals</p>
          </div>
          
          <div className="practices-grid">
            <div className="practice-card">
              <div className="practice-icon">🌱</div>
              <h3>Natural Feeding</h3>
              <p>Our animals graze on natural pastures and receive supplemental feed made from locally-sourced, high-quality ingredients.</p>
            </div>
            
            <div className="practice-card">
              <div className="practice-icon">❤️</div>
              <h3>Health Monitoring</h3>
              <p>Regular health check-ups and preventive care ensure our animals stay healthy and comfortable throughout their lives.</p>
            </div>
            
            <div className="practice-card">
              <div className="practice-icon">🏡</div>
              <h3>Comfortable Housing</h3>
              <p>Spacious, clean, and well-ventilated housing provides our animals with comfortable shelter and room to move freely.</p>
            </div>
            
            <div className="practice-card">
              <div className="practice-icon">🌿</div>
              <h3>Sustainable Practices</h3>
              <p>We use rotational grazing and sustainable farming methods that benefit both our animals and the environment.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="showcase-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Want to Meet Our Animals in Person?</h2>
            <p>Schedule a farm tour to see our animals up close and learn more about our farming practices.</p>
            <div className="cta-actions">
              <a href="/contact" className="btn btn-primary">Schedule a Tour</a>
              <a href="/services" className="btn btn-outline">View Our Products</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}