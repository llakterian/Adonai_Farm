// Comprehensive mock data for Adonai Farm
// This file contains all the mock data exported from auth.js plus additional farm data

import { 
  mockAnimals, 
  mockWorkers, 
  mockGalleryImages, 
  mockProductionRecords, 
  mockFeedRecords, 
  mockHealthRecords, 
  mockBreedingRecords 
} from './auth.js';

// Export all existing mock data
export {
  mockAnimals,
  mockWorkers,
  mockGalleryImages,
  mockProductionRecords,
  mockFeedRecords,
  mockHealthRecords,
  mockBreedingRecords
};

// Additional farm information for public display
export const farmInfo = {
  name: "Adonai Farm",
  tagline: "Sustainable Livestock Management with Modern Technology",
  mission: "Managing our livestock with care, precision, and modern technology for sustainable farming excellence.",
  established: "2018",
  location: {
    address: "Chepsir",
    city: "Kericho",
    state: "Kericho County",
    country: "Kenya",
    coordinates: { lat: -0.3676, lng: 35.2834 }
  },
  contact: {
    phone: "+254 722 759 217",
    email: "info@adonaifarm.co.ke",
    website: "www.adonaifarm.co.ke"
  },
  socialMedia: {
    facebook: "facebook.com/adonaifarm",
    instagram: "@adonaifarm",
    twitter: "@adonaifarm"
  },
  operatingHours: {
    weekdays: "6:00 AM - 6:00 PM",
    weekends: "7:00 AM - 5:00 PM",
    tours: "By appointment only"
  }
};

// Farm statistics for public display
export const farmStats = {
  totalAnimals: mockAnimals.length,
  animalTypes: [...new Set(mockAnimals.map(a => a.type))].length,
  totalAcres: 250,
  yearsInOperation: new Date().getFullYear() - 2018,
  dailyMilkProduction: mockProductionRecords.milk[0]?.totalLiters || 0,
  dailyEggProduction: mockProductionRecords.eggs[0]?.totalCount || 0,
  staff: mockWorkers.length
};

// Services offered by the farm
export const farmServices = [
  {
    id: 1,
    name: "Premium Dairy Products",
    description: "Fresh milk, cheese, and dairy products from our Holstein and Jersey cows",
    category: "products",
    available: true,
    pricing: "Contact for pricing",
    image: "adonai1.jpg"
  },
  {
    id: 2,
    name: "Farm Fresh Eggs",
    description: "Free-range eggs from our Rhode Island Red and Leghorn chickens",
    category: "products",
    available: true,
    pricing: "KES 600/dozen",
    image: "adonai6.jpg"
  },
  {
    id: 3,
    name: "Premium Wool",
    description: "High-quality wool from our Romney and Merino sheep",
    category: "products",
    available: "seasonal",
    pricing: "Contact for pricing",
    image: "adonai4.jpg"
  },
  {
    id: 4,
    name: "Grass-Fed Beef",
    description: "Premium Angus beef from our pasture-raised cattle",
    category: "products",
    available: "seasonal",
    pricing: "Contact for pricing",
    image: "adonai2.jpg"
  },
  {
    id: 5,
    name: "Farm Tours & Education",
    description: "Educational tours for schools, families, and agricultural enthusiasts",
    category: "services",
    available: true,
    pricing: "KES 1,500/person",
    image: "farm-1.jpg"
  },
  {
    id: 6,
    name: "Livestock Breeding Services",
    description: "Professional breeding services with champion bloodlines",
    category: "services",
    available: true,
    pricing: "Contact for pricing",
    image: "adonai5.jpg"
  },
  {
    id: 7,
    name: "Agricultural Consulting",
    description: "Expert advice on sustainable farming practices and livestock management",
    category: "services",
    available: true,
    pricing: "KES 10,000/hour",
    image: "farm-3.jpg"
  }
];

// Featured animals for public display (subset of all animals with public-friendly info)
export const featuredAnimals = [
  {
    id: 1,
    name: "Bessie",
    type: "Holstein Dairy Cow",
    description: "Our star milk producer, known for her gentle nature and excellent health record",
    image: "adonai1.jpg",
    funFact: "Produces over 28 liters of milk daily",
    age: "2 years old"
  },
  {
    id: 2,
    name: "Thunder",
    type: "Angus Bull",
    description: "Our prize breeding bull with champion genetics and calm temperament",
    image: "adonai2.jpg",
    funFact: "Weighs nearly 1000kg but is gentle as a lamb",
    age: "3 years old"
  },
  {
    id: 3,
    name: "Nanny & Luna",
    type: "Dairy Goats",
    description: "Our friendly goat duo, always ready to greet visitors with their playful antics",
    image: "adonai3.jpg",
    funFact: "Produce the creamiest goat milk in the region",
    age: "1-2 years old"
  },
  {
    id: 4,
    name: "Woolly & Cotton",
    type: "Prize Sheep",
    description: "Our wool-producing champions, providing premium quality fleece",
    image: "adonai4.jpg",
    funFact: "Woolly's fleece won first place at the county fair",
    age: "1-2 years old"
  },
  {
    id: 5,
    name: "Champion",
    type: "Suffolk Ram",
    description: "Our pedigree ram with show-winning genetics and impressive stature",
    image: "adonai5.jpg",
    funFact: "Has sired over 20 prize-winning offspring",
    age: "3 years old"
  },
  {
    id: 6,
    name: "The Flock",
    type: "Free-Range Chickens",
    description: "Our happy chickens roam freely, producing the freshest eggs daily",
    image: "adonai6.jpg",
    funFact: "Lay over 25 eggs per day combined",
    age: "Various ages"
  }
];

// Farm practices and sustainability information
export const farmPractices = [
  {
    title: "Sustainable Grazing",
    description: "Rotational grazing practices that maintain soil health and pasture quality",
    icon: "🌱",
    benefits: ["Improved soil fertility", "Better animal nutrition", "Environmental conservation"]
  },
  {
    title: "Animal Welfare",
    description: "Comprehensive health monitoring and comfortable living conditions for all animals",
    icon: "❤️",
    benefits: ["Regular health checkups", "Spacious living areas", "Natural behaviors encouraged"]
  },
  {
    title: "Quality Feed",
    description: "Nutritious, locally-sourced feed supplemented with farm-grown forage",
    icon: "🌾",
    benefits: ["Better animal health", "Superior product quality", "Support for local suppliers"]
  },
  {
    title: "Modern Technology",
    description: "Digital record-keeping and monitoring systems for optimal farm management",
    icon: "📱",
    benefits: ["Precise health tracking", "Efficient operations", "Data-driven decisions"]
  }
];

// Testimonials from customers/visitors
export const testimonials = [
  {
    id: 1,
    name: "Sarah Mitchell",
    role: "Local Customer",
    text: "The milk from Adonai Farm is the freshest and creamiest we've ever tasted. You can really taste the difference quality care makes!",
    rating: 5,
    date: "2024-01-15"
  },
  {
    id: 2,
    name: "Dr. James Wilson",
    role: "Agricultural Consultant",
    text: "Adonai Farm represents the perfect blend of traditional farming values and modern sustainable practices. Truly impressive operation.",
    rating: 5,
    date: "2024-01-20"
  },
  {
    id: 3,
    name: "Emma Thompson",
    role: "School Teacher",
    text: "Our students loved the educational tour! The staff was knowledgeable and the animals were clearly well-cared for. Highly recommend!",
    rating: 5,
    date: "2024-02-01"
  }
];

// Recent farm news/updates
export const farmNews = [
  {
    id: 1,
    title: "New Calves Born This Spring",
    summary: "We're excited to welcome three healthy calves to our dairy herd this season.",
    date: "2024-02-10",
    category: "animals",
    image: "adonaixii.jpg"
  },
  {
    id: 2,
    title: "Award-Winning Wool at County Fair",
    summary: "Our sheep Woolly took first place in the wool quality competition at the annual county fair.",
    date: "2024-02-05",
    category: "awards",
    image: "adonai4.jpg"
  },
  {
    id: 3,
    title: "Sustainable Farming Certification",
    summary: "Adonai Farm has received certification for our sustainable and environmentally-friendly farming practices.",
    date: "2024-01-28",
    category: "sustainability",
    image: "farm-1.jpg"
  }
];

// Helper functions for data manipulation
export const dataHelpers = {
  // Get animals by type
  getAnimalsByType: (type) => mockAnimals.filter(animal => animal.type === type),
  
  // Get production data for date range
  getProductionByDateRange: (startDate, endDate, type = 'all') => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (type === 'all') {
      return {
        milk: mockProductionRecords.milk.filter(record => {
          const date = new Date(record.date);
          return date >= start && date <= end;
        }),
        eggs: mockProductionRecords.eggs.filter(record => {
          const date = new Date(record.date);
          return date >= start && date <= end;
        }),
        wool: mockProductionRecords.wool.filter(record => {
          const date = new Date(record.date);
          return date >= start && date <= end;
        })
      };
    }
    
    return mockProductionRecords[type]?.filter(record => {
      const date = new Date(record.date);
      return date >= start && date <= end;
    }) || [];
  },
  
  // Get health records for specific animal
  getHealthRecordsForAnimal: (animalId) => {
    return mockHealthRecords.filter(record => record.animalId === animalId);
  },
  
  // Get breeding records for specific animal
  getBreedingRecordsForAnimal: (animalId) => {
    return mockBreedingRecords.filter(record => 
      record.maleId === animalId || record.femaleId === animalId
    );
  },
  
  // Calculate farm statistics
  calculateStats: () => {
    const totalMilkProduction = mockProductionRecords.milk.reduce((sum, record) => sum + record.totalLiters, 0);
    const totalEggProduction = mockProductionRecords.eggs.reduce((sum, record) => sum + record.totalCount, 0);
    const averageMilkQuality = mockProductionRecords.milk.reduce((sum, record, index, array) => {
      const qualityScore = record.averageQuality === 'A+' ? 4 : record.averageQuality === 'A' ? 3 : 2;
      return index === array.length - 1 ? (sum + qualityScore) / array.length : sum + qualityScore;
    }, 0);
    
    return {
      totalMilkProduction,
      totalEggProduction,
      averageMilkQuality: averageMilkQuality > 3.5 ? 'A+' : averageMilkQuality > 2.5 ? 'A' : 'B',
      healthyAnimals: mockAnimals.filter(animal => 
        animal.healthRecords && animal.healthRecords.length > 0
      ).length,
      breedingSuccess: mockBreedingRecords.filter(record => record.success).length
    };
  }
};

export default {
  farmInfo,
  farmStats,
  farmServices,
  featuredAnimals,
  farmPractices,
  testimonials,
  farmNews,
  dataHelpers,
  mockAnimals,
  mockWorkers,
  mockGalleryImages,
  mockProductionRecords,
  mockFeedRecords,
  mockHealthRecords,
  mockBreedingRecords
};