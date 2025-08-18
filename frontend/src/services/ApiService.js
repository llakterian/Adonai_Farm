/**
 * API Service Layer
 * Handles switching between backend API and localStorage for mobile testing
 */

import config from '../config.js';
import localStorageBackend from '../utils/localStorageBackend.js';

class ApiService {
  constructor() {
    this.useLocalStorage = config.USE_LOCAL_STORAGE;
    console.log(`🔧 API Service initialized - Mode: ${this.useLocalStorage ? 'localStorage' : 'backend'}`);
  }

  // Helper method to make HTTP requests
  async makeRequest(url, options = {}) {
    if (this.useLocalStorage) {
      // Return mock response for localStorage mode
      return { ok: true, json: async () => ({ mock: true }) };
    }

    try {
      const response = await fetch(`${config.API_BASE_URL}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      console.warn('Backend request failed, falling back to localStorage:', error);
      this.useLocalStorage = true;
      return { ok: true, json: async () => ({ fallback: true }) };
    }
  }

  // Authentication methods
  async login(username, password) {
    if (this.useLocalStorage) {
      return await localStorageBackend.login(username, password);
    }

    const response = await this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });

    return await response.json();
  }

  async logout() {
    if (this.useLocalStorage) {
      return await localStorageBackend.logout();
    }

    const response = await this.makeRequest('/auth/logout', {
      method: 'POST'
    });

    return await response.json();
  }

  // Image methods
  async getPublicImages() {
    if (this.useLocalStorage) {
      return await localStorageBackend.getPublicImages();
    }

    const response = await this.makeRequest('/api/public/images');
    return await response.json();
  }

  // Animals methods
  async getAnimals() {
    if (this.useLocalStorage) {
      return await localStorageBackend.getAnimals();
    }

    const token = localStorage.getItem('adonai_token');
    const response = await this.makeRequest('/api/livestock', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return await response.json();
  }

  async addAnimal(animal) {
    if (this.useLocalStorage) {
      return await localStorageBackend.addAnimal(animal);
    }

    const token = localStorage.getItem('adonai_token');
    const response = await this.makeRequest('/api/livestock', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(animal)
    });

    return await response.json();
  }

  async updateAnimal(id, animal) {
    if (this.useLocalStorage) {
      return await localStorageBackend.updateAnimal(id, animal);
    }

    const token = localStorage.getItem('adonai_token');
    const response = await this.makeRequest(`/api/livestock/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(animal)
    });

    return await response.json();
  }

  async deleteAnimal(id) {
    if (this.useLocalStorage) {
      return await localStorageBackend.deleteAnimal(id);
    }

    const token = localStorage.getItem('adonai_token');
    const response = await this.makeRequest(`/api/livestock/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return await response.json();
  }

  // Workers methods
  async getWorkers() {
    if (this.useLocalStorage) {
      return await localStorageBackend.getWorkers();
    }

    const token = localStorage.getItem('adonai_token');
    const response = await this.makeRequest('/api/workers', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return await response.json();
  }

  async addWorker(worker) {
    if (this.useLocalStorage) {
      return await localStorageBackend.addWorker(worker);
    }

    const token = localStorage.getItem('adonai_token');
    const response = await this.makeRequest('/api/workers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(worker)
    });

    return await response.json();
  }

  // Contact methods
  async submitContact(contactData) {
    if (this.useLocalStorage) {
      return await localStorageBackend.submitContact(contactData);
    }

    const response = await this.makeRequest('/api/contact', {
      method: 'POST',
      body: JSON.stringify(contactData)
    });

    return await response.json();
  }

  async getContacts() {
    if (this.useLocalStorage) {
      return await localStorageBackend.getContacts();
    }

    const token = localStorage.getItem('adonai_token');
    const response = await this.makeRequest('/api/contacts', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return await response.json();
  }

  // Health check
  async health() {
    if (this.useLocalStorage) {
      return await localStorageBackend.health();
    }

    const response = await this.makeRequest('/api/health');
    return await response.json();
  }

  // Switch modes (for testing)
  switchToLocalStorage() {
    this.useLocalStorage = true;
    localStorage.setItem('use-local-storage', 'true');
    console.log('🔄 Switched to localStorage mode');
  }

  switchToBackend() {
    this.useLocalStorage = false;
    localStorage.removeItem('use-local-storage');
    console.log('🔄 Switched to backend mode');
  }

  getCurrentMode() {
    return this.useLocalStorage ? 'localStorage' : 'backend';
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;