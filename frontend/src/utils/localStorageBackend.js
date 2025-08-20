/**
 * Local Storage Backend for Mobile Testing
 * Simulates backend functionality using localStorage
 */

// Mock data for testing - Comprehensive image collection
const MOCK_IMAGES = [
  // Farm facility images
  {
    filename: "farm-1.jpg",
    url: "/images/Adonai/farm-1.jpg",
    category: "farm",
    size: 212647,
    lastModified: "2025-08-15T06:53:10.545Z",
    alt: "Adonai Farm operations and facilities 1",
    caption: "Main farm buildings and operational facilities"
  },
  {
    filename: "farm-2.jpg",
    url: "/images/Adonai/farm-2.jpg",
    category: "farm",
    size: 106585,
    lastModified: "2025-08-15T06:53:20.336Z",
    alt: "Adonai Farm operations and facilities 2",
    caption: "Pasture land and grazing areas"
  },
  {
    filename: "farm-3.jpg",
    url: "/images/Adonai/farm-3.jpg",
    category: "farm",
    size: 267450,
    lastModified: "2025-08-15T06:53:31.034Z",
    alt: "Adonai Farm operations and facilities 3",
    caption: "Equipment storage and maintenance facilities"
  },
  {
    filename: "farm-4.jpg",
    url: "/images/Adonai/farm-4.jpg",
    category: "farm",
    size: 243034,
    lastModified: "2025-08-15T06:53:43.125Z",
    alt: "Adonai Farm operations and facilities 4",
    caption: "Feed preparation and storage areas"
  },
  {
    filename: "farm-5.jpg",
    url: "/images/Adonai/farm-5.jpg",
    category: "farm",
    size: 169225,
    lastModified: "2025-08-15T06:53:53.822Z",
    alt: "Adonai Farm operations and facilities 5",
    caption: "Dairy processing and milking facilities"
  },
  {
    filename: "farm-6.jpg",
    url: "/images/Adonai/farm-6.jpg",
    category: "farm",
    size: 160097,
    lastModified: "2025-08-15T06:54:02.461Z",
    alt: "Adonai Farm operations and facilities 6",
    caption: "Farm infrastructure and support buildings"
  },
  {
    filename: "farm-7.jpg",
    url: "/images/Adonai/farm-7.jpg",
    category: "farm",
    size: 119808,
    lastModified: "2025-08-15T06:54:22.383Z",
    alt: "Adonai Farm operations and facilities 7",
    caption: "Sustainable farming practices and land management"
  },
  // Animal images
  {
    filename: "adonai1.jpg",
    url: "/images/Adonai/adonai1.jpg",
    category: "animals",
    size: 1426574,
    lastModified: "2025-08-09T14:11:19.930Z",
    alt: "Adonai Farm livestock - cattle, goats, sheep, and poultry 1",
    caption: "Our diverse livestock - dairy & beef cattle, goats, sheep, and poultry"
  },
  {
    filename: "adonai2.jpg",
    url: "/images/Adonai/adonai2.jpg",
    category: "animals",
    size: 531604,
    lastModified: "2025-08-09T14:11:35.812Z",
    alt: "Adonai Farm livestock - cattle, goats, sheep, and poultry 2",
    caption: "Quality breeding stock and healthy animals"
  },
  {
    filename: "adonai3.jpg",
    url: "/images/Adonai/adonai3.jpg",
    category: "animals",
    size: 473486,
    lastModified: "2025-08-09T14:11:55.299Z",
    alt: "Adonai Farm livestock - cattle, goats, sheep, and poultry 3",
    caption: "Sustainable livestock management practices"
  },
  {
    filename: "adonai4.jpg",
    url: "/images/Adonai/adonai4.jpg",
    category: "animals",
    size: 861884,
    lastModified: "2025-08-09T14:12:09.611Z",
    alt: "Adonai Farm livestock - cattle, goats, sheep, and poultry 4",
    caption: "Premium breeding programs and animal care"
  },
  {
    filename: "adonai5.jpg",
    url: "/images/Adonai/adonai5.jpg",
    category: "animals",
    size: 414851,
    lastModified: "2025-08-09T14:12:25.148Z",
    alt: "Adonai Farm livestock - cattle, goats, sheep, and poultry 5",
    caption: "Healthy livestock in natural pasture settings"
  },
  {
    filename: "adonai6.jpg",
    url: "/images/Adonai/adonai6.jpg",
    category: "animals",
    size: 834620,
    lastModified: "2025-08-09T14:12:40.761Z",
    alt: "Adonai Farm livestock - cattle, goats, sheep, and poultry 6",
    caption: "Modern animal husbandry and welfare practices"
  },
  {
    filename: "adonai7.jpg",
    url: "/images/Adonai/adonai7.jpg",
    category: "animals",
    size: 849597,
    lastModified: "2025-08-09T14:13:05.469Z",
    alt: "Adonai Farm livestock - cattle, goats, sheep, and poultry 7",
    caption: "Diverse animal breeds and genetic programs"
  },
  {
    filename: "adonai8.jpg",
    url: "/images/Adonai/adonai8.jpg",
    category: "animals",
    size: 983207,
    lastModified: "2025-08-09T14:13:23.976Z",
    alt: "Adonai Farm livestock - cattle, goats, sheep, and poultry 8",
    caption: "Quality livestock production and management"
  },
  {
    filename: "adonai9.jpg",
    url: "/images/Adonai/adonai9.jpg",
    category: "animals",
    size: 1020964,
    lastModified: "2025-08-09T14:13:41.152Z",
    alt: "Adonai Farm livestock - cattle, goats, sheep, and poultry 9",
    caption: "Sustainable animal agriculture practices"
  },
  {
    filename: "adonaix.jpg",
    url: "/images/Adonai/adonaix.jpg",
    category: "animals",
    size: 957047,
    lastModified: "2025-08-09T14:13:59.887Z",
    alt: "Adonai Farm livestock - cattle, goats, sheep, and poultry 10",
    caption: "Premium livestock breeding and care"
  },
  {
    filename: "adonaixi.jpg",
    url: "/images/Adonai/adonaixi.jpg",
    category: "animals",
    size: 497827,
    lastModified: "2025-08-09T14:14:17.243Z",
    alt: "Adonai Farm livestock - cattle, goats, sheep, and poultry 11",
    caption: "Modern farming techniques and animal welfare"
  },
  {
    filename: "adonaixii.jpg",
    url: "/images/Adonai/adonaixii.jpg",
    category: "animals",
    size: 798032,
    lastModified: "2025-08-09T14:14:31.573Z",
    alt: "Adonai Farm livestock - cattle, goats, sheep, and poultry 12",
    caption: "Quality breeding stock and genetic improvement"
  },
  {
    filename: "adonaixiii.jpg",
    url: "/images/Adonai/adonaixiii.jpg",
    category: "animals",
    size: 754720,
    lastModified: "2025-08-09T14:14:58.679Z",
    alt: "Adonai Farm livestock - cattle, goats, sheep, and poultry 13",
    caption: "Comprehensive livestock management system"
  },
  // Fallback images for mobile/offline use
  {
    filename: "hero-farm.jpg",
    url: "/images/hero-farm.jpg",
    category: "farm",
    size: 500000,
    lastModified: "2025-08-15T06:55:00.000Z",
    alt: "Adonai Farm hero image - Beautiful farm landscape",
    caption: "Beautiful farm landscape in Kericho, Kenya"
  }
];

const MOCK_ANIMALS = [
  { id: 1, type: 'Cattle', name: 'Bessie', dob: '2022-03-15', sex: 'Female', notes: 'Dairy cow, excellent milk production' },
  { id: 2, type: 'Goat', name: 'Billy', dob: '2023-01-20', sex: 'Male', notes: 'Breeding goat, good temperament' },
  { id: 3, type: 'Sheep', name: 'Woolly', dob: '2022-11-10', sex: 'Female', notes: 'High quality wool producer' },
  { id: 4, type: 'Chicken', name: 'Henrietta', dob: '2023-05-05', sex: 'Female', notes: 'Good egg layer' },
  { id: 5, type: 'Cattle', name: 'Thunder', dob: '2021-08-12', sex: 'Male', notes: 'Breeding bull, strong genetics' }
];

const MOCK_WORKERS = [
  { id: 1, name: 'John Kiprop', employee_id: 'EMP001', role: 'Farm Manager', hourly_rate: 500, phone: '+254722123456' },
  { id: 2, name: 'Mary Chebet', employee_id: 'EMP002', role: 'Animal Caretaker', hourly_rate: 350, phone: '+254733234567' },
  { id: 3, name: 'Peter Rotich', employee_id: 'EMP003', role: 'Field Worker', hourly_rate: 300, phone: '+254744345678' }
];

class LocalStorageBackend {
  constructor() {
    this.initializeData();
  }

  initializeData() {
    // Initialize with mock data if not exists
    if (!localStorage.getItem('adonai_images')) {
      localStorage.setItem('adonai_images', JSON.stringify(MOCK_IMAGES));
    }
    if (!localStorage.getItem('adonai_animals')) {
      localStorage.setItem('adonai_animals', JSON.stringify(MOCK_ANIMALS));
    }
    if (!localStorage.getItem('adonai_workers')) {
      localStorage.setItem('adonai_workers', JSON.stringify(MOCK_WORKERS));
    }
    if (!localStorage.getItem('adonai_user')) {
      localStorage.setItem('adonai_user', JSON.stringify({
        username: 'admin',
        password: 'adonai123' // In real app, this would be hashed
      }));
    }
    if (!localStorage.getItem('adonai_contacts')) {
      localStorage.setItem('adonai_contacts', JSON.stringify([]));
    }
  }

  // Image API simulation
  async getPublicImages() {
    const images = JSON.parse(localStorage.getItem('adonai_images') || '[]');
    const categories = {
      animals: images.filter(img => img.category === 'animals'),
      farm: images.filter(img => img.category === 'farm'),
      facilities: images.filter(img => img.category === 'facilities')
    };

    return {
      images,
      categories,
      total: images.length
    };
  }

  // Authentication simulation
  async login(username, password) {
    const user = JSON.parse(localStorage.getItem('adonai_user') || '{}');
    if (username === user.username && password === user.password) {
      const token = 'mock-jwt-token-' + Date.now();
      localStorage.setItem('adonai_auth_token', token);
      localStorage.setItem('adonai_auth_user', JSON.stringify({ username }));
      return { token };
    }
    throw new Error('Invalid credentials');
  }

  async logout() {
    localStorage.removeItem('adonai_auth_token');
    localStorage.removeItem('adonai_auth_user');
    return { success: true };
  }

  isAuthenticated() {
    return !!localStorage.getItem('adonai_auth_token');
  }

  // Animals API simulation
  async getAnimals() {
    return JSON.parse(localStorage.getItem('adonai_animals') || '[]');
  }

  async addAnimal(animal) {
    const animals = JSON.parse(localStorage.getItem('adonai_animals') || '[]');
    const newAnimal = { ...animal, id: Date.now() };
    animals.push(newAnimal);
    localStorage.setItem('adonai_animals', JSON.stringify(animals));
    return newAnimal;
  }

  async updateAnimal(id, animal) {
    const animals = JSON.parse(localStorage.getItem('adonai_animals') || '[]');
    const index = animals.findIndex(a => a.id === parseInt(id));
    if (index !== -1) {
      animals[index] = { ...animals[index], ...animal };
      localStorage.setItem('adonai_animals', JSON.stringify(animals));
      return animals[index];
    }
    throw new Error('Animal not found');
  }

  async deleteAnimal(id) {
    const animals = JSON.parse(localStorage.getItem('adonai_animals') || '[]');
    const filtered = animals.filter(a => a.id !== parseInt(id));
    localStorage.setItem('adonai_animals', JSON.stringify(filtered));
    return { success: true };
  }

  // Workers API simulation
  async getWorkers() {
    return JSON.parse(localStorage.getItem('adonai_workers') || '[]');
  }

  async addWorker(worker) {
    const workers = JSON.parse(localStorage.getItem('adonai_workers') || '[]');
    const newWorker = { ...worker, id: Date.now() };
    workers.push(newWorker);
    localStorage.setItem('adonai_workers', JSON.stringify(workers));
    return newWorker;
  }

  // Contact form simulation
  async submitContact(contactData) {
    const contacts = JSON.parse(localStorage.getItem('adonai_contacts') || '[]');
    const newContact = {
      ...contactData,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      status: 'new'
    };
    contacts.push(newContact);
    localStorage.setItem('adonai_contacts', JSON.stringify(contacts));

    // Simulate email notification
    console.log('📧 Contact form submitted:', newContact);
    return { success: true, message: 'Thank you for your inquiry! We will get back to you soon.' };
  }

  async getContacts() {
    return JSON.parse(localStorage.getItem('adonai_contacts') || '[]');
  }

  // Health check
  async health() {
    return { ok: true, mode: 'localStorage' };
  }
}

// Create singleton instance
const localStorageBackend = new LocalStorageBackend();

export default localStorageBackend;