import React, { useState, useEffect } from 'react';
import { mockAnimals } from '../mockData.js';

export default function AnimalShowcase() {
  const [animals, setAnimals] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [loading, setLoading] = useState(true);

  // Animal categories for filtering
  const animalCategories = [
    { id: 'all', name: 'All Animals', icon: '🐾', color: '#4a7c59' },
    { id: 'cattle', name: 'Cattle', icon: '🐄', color: '#8B4513' },
    { id: 'goats', name: 'Goats', icon: '🐐', color: '#D2691E' },
    { id: 'sheep', name: 'Sheep', icon: '🐑', color: '#F5DEB3' },
    { id: 'poultry', name: 'Poultry', icon: '🐔', color: '#FFD700' }
  ];

  useEffect(() => {
    loadAnimals();
  }, []);

  const loadAnimals = () => {
    setLoading(true);

    // Enhanced animal data with more creative content
    const enhancedAnimals = mockAnimals.map((animal, index) => ({
      ...animal,
      category: categorizeAnimal(animal.type),
      description: generateDescription(animal),
      funFact: generateFunFact(animal),
      personality: generatePersonality(animal),
      achievements: generateAchievements(animal),
      favoriteActivity: generateFavoriteActivity(animal),
      age: calculateAge(animal.dob)
    }));

    setAnimals(enhancedAnimals);
    setLoading(false);
  };

  const categorizeAnimal = (type) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('cattle')) return 'cattle';
    if (lowerType.includes('goat')) return 'goats';
    if (lowerType.includes('sheep')) return 'sheep';
    if (lowerType.includes('chicken') || lowerType.includes('poultry')) return 'poultry';
    return 'other';
  };

  const generateDescription = (animal) => {
    const descriptions = {
      'Dairy Cattle': `Meet ${animal.name}, one of our star dairy producers! This gentle giant provides fresh, creamy milk daily and loves spending time in our lush pastures.`,
      'Beef Cattle': `${animal.name} is a magnificent member of our beef herd, known for their strong build and calm temperament. They enjoy grazing under the Kericho sun.`,
      'Dairy Goat': `${animal.name} is a playful and intelligent goat who produces rich, nutritious milk. Known for their curious nature and friendly personality.`,
      'Beef Goat': `Strong and spirited, ${animal.name} is an excellent example of our quality breeding program. They love exploring and climbing around the farm.`,
      'Pedigree Sheep': `${animal.name} is a prize-winning sheep with exceptional wool quality. Their gentle nature makes them a favorite among visitors.`,
      'Sheep': `${animal.name} is a sweet and docile member of our flock, contributing to both our wool and meat production with their excellent genetics.`,
      'Chicken': `${animal.name} is a productive and happy hen who lays beautiful eggs daily. She enjoys free-ranging and foraging around the farm.`,
      'Poultry': `${animal.name} is part of our thriving poultry family, living a free-range lifestyle and contributing to our sustainable farming practices.`
    };
    return descriptions[animal.type] || `${animal.name} is a wonderful ${animal.type.toLowerCase()} who brings joy to our farm every day.`;
  };

  const generateFunFact = (animal) => {
    const facts = {
      'Dairy Cattle': 'Can produce up to 30 liters of milk per day and has four stomach compartments!',
      'Beef Cattle': 'Can weigh up to 800kg and has an excellent memory for faces and places.',
      'Dairy Goat': 'Goat milk is naturally easier to digest than cow milk and is rich in calcium.',
      'Beef Goat': 'Goats are excellent climbers and can jump up to 5 feet high!',
      'Pedigree Sheep': 'Can produce up to 7kg of premium wool per year.',
      'Sheep': 'Sheep have excellent memories and can recognize up to 50 different faces.',
      'Chicken': 'Can lay up to 300 eggs per year and has over 30 different vocalizations.',
      'Poultry': 'Chickens are descendants of wild jungle fowl and can live up to 10 years.'
    };
    return facts[animal.type] || 'Every animal has unique characteristics that make them special!';
  };

  const generatePersonality = (animal) => {
    const personalities = [
      'Gentle and calm', 'Playful and curious', 'Friendly and social', 'Independent and strong',
      'Intelligent and alert', 'Peaceful and content', 'Energetic and active', 'Wise and observant',
      'Affectionate and loyal', 'Adventurous and bold', 'Patient and nurturing', 'Spirited and lively'
    ];
    return personalities[animal.id % personalities.length];
  };

  const generateAchievements = (animal) => {
    const achievements = {
      'Dairy Cattle': ['Top milk producer 2023', 'Excellent health record', 'Mother of 3 healthy calves'],
      'Beef Cattle': ['Prize winner at local show', 'Excellent weight gain', 'Perfect breeding record'],
      'Dairy Goat': ['Highest milk fat content', 'Champion climber', 'Friendliest goat award'],
      'Beef Goat': ['Fastest growing kid', 'Best forager', 'Most adventurous explorer'],
      'Pedigree Sheep': ['Best wool quality 2023', 'Show champion', 'Perfect fleece score'],
      'Sheep': ['Excellent mother', 'Consistent wool producer', 'Flock leader'],
      'Chicken': ['Top egg layer', 'Pest control expert', 'Best broody hen'],
      'Poultry': ['Free-range champion', 'Insect hunter', 'Flock protector']
    };
    const typeAchievements = achievements[animal.type] || ['Healthy and happy', 'Farm favorite', 'Great personality'];
    return typeAchievements.slice(0, 2); // Return 2 achievements
  };

  const generateFavoriteActivity = (animal) => {
    const activities = {
      'Dairy Cattle': 'Grazing in the morning dew',
      'Beef Cattle': 'Sunbathing in the afternoon',
      'Dairy Goat': 'Climbing on rocks and logs',
      'Beef Goat': 'Exploring new areas of the farm',
      'Pedigree Sheep': 'Peaceful grazing with the flock',
      'Sheep': 'Following the shepherd around',
      'Chicken': 'Dust bathing and foraging',
      'Poultry': 'Scratching for insects and seeds'
    };
    return activities[animal.type] || 'Enjoying farm life';
  };

  const calculateAge = (dob) => {
    if (!dob) return 'Age unknown';
    const birthDate = new Date(dob);
    const today = new Date();
    const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());

    if (ageInMonths < 12) {
      return `${ageInMonths} month${ageInMonths !== 1 ? 's' : ''} old`;
    } else {
      const years = Math.floor(ageInMonths / 12);
      const months = ageInMonths % 12;
      return `${years} year${years !== 1 ? 's' : ''}${months > 0 ? ` ${months} month${months !== 1 ? 's' : ''}` : ''} old`;
    }
  };

  const handleImageError = (e) => {
    e.target.style.display = 'none';
    e.target.nextSibling.style.display = 'flex';
  };

  const filteredAnimals = selectedCategory === 'all'
    ? animals
    : animals.filter(animal => animal.category === selectedCategory);

  const openAnimalModal = (animal) => {
    setSelectedAnimal(animal);
  };

  const closeAnimalModal = () => {
    setSelectedAnimal(null);
  };

  if (loading) {
    return (
      <div className="animal-showcase-loading">
        <div className="loading-spinner"></div>
        <p>Loading our amazing animal family...</p>
      </div>
    );
  }

  return (
    <div className="animal-showcase">
      {/* Hero Section */}
      <section className="animal-showcase-hero">
        <div className="hero-background"></div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="container">
            <div className="hero-text">
              <span className="hero-badge">🐾 Meet Our Family</span>
              <h1 className="hero-title">
                Our Amazing <span className="highlight">Animal Family</span>
              </h1>
              <p className="hero-subtitle">
                Get to know the wonderful animals that call Adonai Farm home. Each one has their own
                unique personality and plays an important role in our sustainable farming ecosystem.
              </p>
              <div className="hero-stats">
                <div className="stat">
                  <span className="stat-number">{animals.length}</span>
                  <span className="stat-label">Happy Animals</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{animalCategories.length - 1}</span>
                  <span className="stat-label">Animal Types</span>
                </div>
                <div className="stat">
                  <span className="stat-number">100%</span>
                  <span className="stat-label">Pasture Raised</span>
                </div>
                <div className="stat">
                  <span className="stat-number">24/7</span>
                  <span className="stat-label">Care & Love</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="animal-category-filter">
        <div className="container">
          <h2 className="filter-title">🔍 Explore by Animal Type</h2>
          <div className="filter-buttons">
            {animalCategories.map(category => (
              <button
                key={category.id}
                className={`filter-btn ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
                style={{ '--category-color': category.color }}
              >
                <span className="filter-icon">{category.icon}</span>
                <span className="filter-name">{category.name}</span>
                <span className="filter-count">
                  ({category.id === 'all' ? animals.length : animals.filter(a => a.category === category.id).length})
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Animals Grid */}
      <section className="animals-showcase-grid">
        <div className="container">
          <div className="section-header">
            <h2>
              {selectedCategory === 'all' ? '🌟 All Our Animals' :
                `${animalCategories.find(c => c.id === selectedCategory)?.icon} Our ${animalCategories.find(c => c.id === selectedCategory)?.name}`}
            </h2>
            <p>Click on any animal to learn more about their story and personality!</p>
          </div>

          {filteredAnimals.length === 0 ? (
            <div className="no-animals">
              <div className="no-animals-icon">🐾</div>
              <h3>No animals found in this category</h3>
              <p>Try selecting a different category to meet our animals.</p>
            </div>
          ) : (
            <div className="animals-grid">
              {filteredAnimals.map((animal, index) => (
                <div
                  key={animal.id}
                  className="animal-card"
                  onClick={() => openAnimalModal(animal)}
                >
                  <div className="animal-image-container">
                    <img
                      src={`/images/${animal.image}`}
                      alt={`${animal.name} - ${animal.type}`}
                      className="animal-image"
                      onError={handleImageError}
                    />
                    <div className="image-placeholder" style={{ display: 'none' }}>
                      <span className="placeholder-icon">
                        {animalCategories.find(c => c.id === animal.category)?.icon || '🐾'}
                      </span>
                      <span className="placeholder-text">{animal.name}</span>
                    </div>
                    <div className="animal-overlay">
                      <span className="animal-age">{animal.age}</span>
                      <span className="animal-sex">{animal.sex === 'M' ? '♂️ Male' : '♀️ Female'}</span>
                    </div>
                    {animal.isFeatured && (
                      <div className="featured-badge">⭐ Featured</div>
                    )}
                  </div>

                  <div className="animal-content">
                    <div className="animal-header">
                      <h3 className="animal-name">{animal.name}</h3>
                      <p className="animal-type">{animal.type}</p>
                    </div>

                    <div className="animal-personality">
                      <span className="personality-icon">😊</span>
                      <span className="personality-text">{animal.personality}</span>
                    </div>

                    <p className="animal-description">{animal.description.substring(0, 120)}...</p>

                    <div className="animal-highlights">
                      <div className="highlight">
                        <span className="highlight-icon">🎯</span>
                        <span className="highlight-text">{animal.favoriteActivity}</span>
                      </div>
                    </div>

                    <div className="animal-achievements">
                      {animal.achievements.slice(0, 1).map((achievement, idx) => (
                        <span key={idx} className="achievement-badge">
                          🏆 {achievement}
                        </span>
                      ))}
                    </div>

                    <div className="learn-more">
                      <span>Click to learn more about {animal.name} →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Animal Care Philosophy */}
      <section className="animal-care-philosophy">
        <div className="container">
          <div className="section-header">
            <h2>🌱 Our Animal Care Philosophy</h2>
            <p>Every animal at Adonai Farm receives the highest standard of care, love, and attention</p>
          </div>

          <div className="care-principles">
            <div className="principle-card">
              <div className="principle-icon">❤️</div>
              <h3>Love & Compassion</h3>
              <p>Every animal is treated with love, respect, and individual attention. We believe happy animals are healthy animals.</p>
            </div>

            <div className="principle-card">
              <div className="principle-icon">🌿</div>
              <h3>Natural Living</h3>
              <p>Our animals enjoy spacious pastures, fresh air, and the freedom to express their natural behaviors.</p>
            </div>

            <div className="principle-card">
              <div className="principle-icon">🏥</div>
              <h3>Health First</h3>
              <p>Regular health check-ups, preventive care, and immediate attention to any health concerns ensure optimal well-being.</p>
            </div>

            <div className="principle-card">
              <div className="principle-icon">🌾</div>
              <h3>Quality Nutrition</h3>
              <p>Fresh, nutritious feed and access to clean water ensure our animals receive the best possible nutrition.</p>
            </div>

            <div className="principle-card">
              <div className="principle-icon">🏡</div>
              <h3>Comfortable Shelter</h3>
              <p>Clean, spacious, and well-ventilated housing provides comfort and protection from the elements.</p>
            </div>

            <div className="principle-card">
              <div className="principle-icon">🌍</div>
              <h3>Sustainable Practices</h3>
              <p>We use environmentally friendly farming methods that benefit both our animals and the planet.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Visit CTA */}
      <section className="visit-cta">
        <div className="container">
          <div className="cta-content">
            <div className="cta-text">
              <h2>🚜 Want to Meet Our Animals in Person?</h2>
              <p>
                Schedule a farm tour to meet our amazing animals up close, learn about their personalities,
                and see how we care for them every day. It's an experience the whole family will love!
              </p>
              <div className="cta-features">
                <div className="cta-feature">
                  <span className="feature-icon">👨‍👩‍👧‍👦</span>
                  <span>Family-friendly tours</span>
                </div>
                <div className="cta-feature">
                  <span className="feature-icon">📚</span>
                  <span>Educational experiences</span>
                </div>
                <div className="cta-feature">
                  <span className="feature-icon">📸</span>
                  <span>Photo opportunities</span>
                </div>
                <div className="cta-feature">
                  <span className="feature-icon">🥛</span>
                  <span>Fresh farm products</span>
                </div>
              </div>
            </div>
            <div className="cta-actions">
              <a href="/contact" className="btn btn-primary btn-large">
                📞 Schedule a Tour
              </a>
              <a href="/services" className="btn btn-outline btn-large">
                🌾 Our Services
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Animal Detail Modal */}
      {selectedAnimal && (
        <div className="animal-modal-overlay" onClick={closeAnimalModal}>
          <div className="animal-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeAnimalModal}>✕</button>

            <div className="modal-content">
              <div className="modal-image">
                <img
                  src={`/images/${selectedAnimal.image}`}
                  alt={`${selectedAnimal.name} - ${selectedAnimal.type}`}
                  onError={handleImageError}
                />
                <div className="image-placeholder" style={{ display: 'none' }}>
                  <span className="placeholder-icon">
                    {animalCategories.find(c => c.id === selectedAnimal.category)?.icon || '🐾'}
                  </span>
                  <span className="placeholder-text">{selectedAnimal.name}</span>
                </div>
              </div>

              <div className="modal-info">
                <div className="modal-header">
                  <h2>{selectedAnimal.name}</h2>
                  <p className="modal-type">{selectedAnimal.type}</p>
                  <div className="modal-badges">
                    <span className="age-badge">{selectedAnimal.age}</span>
                    <span className="sex-badge">{selectedAnimal.sex === 'M' ? '♂️ Male' : '♀️ Female'}</span>
                    {selectedAnimal.isFeatured && <span className="featured-badge">⭐ Featured</span>}
                  </div>
                </div>

                <div className="modal-description">
                  <h3>About {selectedAnimal.name}</h3>
                  <p>{selectedAnimal.description}</p>
                </div>

                <div className="modal-details">
                  <div className="detail-item">
                    <h4>😊 Personality</h4>
                    <p>{selectedAnimal.personality}</p>
                  </div>

                  <div className="detail-item">
                    <h4>🎯 Favorite Activity</h4>
                    <p>{selectedAnimal.favoriteActivity}</p>
                  </div>

                  <div className="detail-item">
                    <h4>💡 Fun Fact</h4>
                    <p>{selectedAnimal.funFact}</p>
                  </div>

                  <div className="detail-item">
                    <h4>🏆 Achievements</h4>
                    <div className="achievements-list">
                      {selectedAnimal.achievements.map((achievement, idx) => (
                        <span key={idx} className="achievement-item">
                          ✨ {achievement}
                        </span>
                      ))}
                    </div>
                  </div>

                  {selectedAnimal.notes && (
                    <div className="detail-item">
                      <h4>📝 Special Notes</h4>
                      <p>{selectedAnimal.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}