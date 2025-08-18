// Advanced Search and Filtering System for Farm Management

export class SearchManager {
  constructor() {
    this.searchHistory = this.loadSearchHistory();
    this.savedFilters = this.loadSavedFilters();
  }

  // Load search history from localStorage
  loadSearchHistory() {
    const saved = localStorage.getItem('adonai_search_history');
    return saved ? JSON.parse(saved) : [];
  }

  // Load saved filters from localStorage
  loadSavedFilters() {
    const saved = localStorage.getItem('adonai_saved_filters');
    return saved ? JSON.parse(saved) : [];
  }

  // Save search history
  saveSearchHistory() {
    localStorage.setItem('adonai_search_history', JSON.stringify(this.searchHistory));
  }

  // Save filters
  saveSavedFilters() {
    localStorage.setItem('adonai_saved_filters', JSON.stringify(this.savedFilters));
  }

  // Add search to history
  addToHistory(query, dataType, results) {
    const historyItem = {
      id: Date.now(),
      query,
      dataType,
      resultCount: results.length,
      timestamp: new Date().toISOString()
    };

    // Remove duplicate queries
    this.searchHistory = this.searchHistory.filter(item => 
      !(item.query === query && item.dataType === dataType)
    );

    // Add to beginning of history
    this.searchHistory.unshift(historyItem);

    // Keep only last 50 searches
    this.searchHistory = this.searchHistory.slice(0, 50);
    
    this.saveSearchHistory();
  }

  // Global search across all data types
  globalSearch(query, options = {}) {
    const {
      includeAnimals = true,
      includeWorkers = true,
      includeInfrastructure = true,
      includeUsers = true,
      limit = 100
    } = options;

    const results = {
      animals: [],
      workers: [],
      infrastructure: [],
      users: [],
      total: 0
    };

    if (includeAnimals) {
      const animals = JSON.parse(localStorage.getItem('adonai_animals') || '[]');
      results.animals = this.searchAnimals(animals, query);
    }

    if (includeWorkers) {
      const workers = JSON.parse(localStorage.getItem('adonai_workers') || '[]');
      results.workers = this.searchWorkers(workers, query);
    }

    if (includeInfrastructure) {
      const infrastructure = JSON.parse(localStorage.getItem('adonai_infrastructure') || '[]');
      results.infrastructure = this.searchInfrastructure(infrastructure, query);
    }

    if (includeUsers) {
      const users = JSON.parse(localStorage.getItem('adonai_users') || '[]');
      results.users = this.searchUsers(users, query);
    }

    results.total = results.animals.length + results.workers.length + 
                   results.infrastructure.length + results.users.length;

    // Add to search history
    this.addToHistory(query, 'global', results);

    return results;
  }

  // Search animals with advanced filtering
  searchAnimals(animals, query, filters = {}) {
    let filtered = [...animals];

    // Text search
    if (query && query.trim()) {
      const searchTerms = query.toLowerCase().split(' ');
      filtered = filtered.filter(animal => {
        const searchableText = [
          animal.name,
          animal.species,
          animal.breed,
          animal.tag_number,
          animal.notes,
          animal.health_status,
          animal.location
        ].join(' ').toLowerCase();

        return searchTerms.every(term => searchableText.includes(term));
      });
    }

    // Apply filters
    if (filters.species && filters.species.length > 0) {
      filtered = filtered.filter(animal => filters.species.includes(animal.species));
    }

    if (filters.healthStatus && filters.healthStatus.length > 0) {
      filtered = filtered.filter(animal => filters.healthStatus.includes(animal.health_status));
    }

    if (filters.ageRange) {
      const { min, max } = filters.ageRange;
      filtered = filtered.filter(animal => {
        const age = this.calculateAge(animal.birth_date);
        return age >= min && age <= max;
      });
    }

    if (filters.weightRange) {
      const { min, max } = filters.weightRange;
      filtered = filtered.filter(animal => {
        const weight = parseFloat(animal.weight) || 0;
        return weight >= min && weight <= max;
      });
    }

    if (filters.dateRange) {
      const { startDate, endDate } = filters.dateRange;
      filtered = filtered.filter(animal => {
        const birthDate = new Date(animal.birth_date);
        return birthDate >= new Date(startDate) && birthDate <= new Date(endDate);
      });
    }

    if (filters.hasBreeding !== undefined) {
      filtered = filtered.filter(animal => {
        const hasBreeding = !!(animal.breeding_date || animal.last_breeding);
        return hasBreeding === filters.hasBreeding;
      });
    }

    if (filters.location && filters.location.length > 0) {
      filtered = filtered.filter(animal => filters.location.includes(animal.location));
    }

    // Sort results by relevance
    return this.sortByRelevance(filtered, query, ['name', 'tag_number', 'species']);
  }

  // Search workers with advanced filtering
  searchWorkers(workers, query, filters = {}) {
    let filtered = [...workers];

    // Text search
    if (query && query.trim()) {
      const searchTerms = query.toLowerCase().split(' ');
      filtered = filtered.filter(worker => {
        const searchableText = [
          worker.name,
          worker.role,
          worker.department,
          worker.phone,
          worker.email,
          worker.skills,
          worker.notes
        ].join(' ').toLowerCase();

        return searchTerms.every(term => searchableText.includes(term));
      });
    }

    // Apply filters
    if (filters.role && filters.role.length > 0) {
      filtered = filtered.filter(worker => filters.role.includes(worker.role));
    }

    if (filters.department && filters.department.length > 0) {
      filtered = filtered.filter(worker => filters.department.includes(worker.department));
    }

    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(worker => filters.status.includes(worker.status));
    }

    if (filters.salaryRange) {
      const { min, max } = filters.salaryRange;
      filtered = filtered.filter(worker => {
        const salary = parseFloat(worker.salary) || 0;
        return salary >= min && salary <= max;
      });
    }

    if (filters.hireDate) {
      const { startDate, endDate } = filters.hireDate;
      filtered = filtered.filter(worker => {
        const hireDate = new Date(worker.hire_date);
        return hireDate >= new Date(startDate) && hireDate <= new Date(endDate);
      });
    }

    if (filters.skills && filters.skills.length > 0) {
      filtered = filtered.filter(worker => {
        const workerSkills = (worker.skills || '').toLowerCase().split(',').map(s => s.trim());
        return filters.skills.some(skill => 
          workerSkills.some(ws => ws.includes(skill.toLowerCase()))
        );
      });
    }

    return this.sortByRelevance(filtered, query, ['name', 'role', 'department']);
  }

  // Search infrastructure with advanced filtering
  searchInfrastructure(infrastructure, query, filters = {}) {
    let filtered = [...infrastructure];

    // Text search
    if (query && query.trim()) {
      const searchTerms = query.toLowerCase().split(' ');
      filtered = filtered.filter(item => {
        const searchableText = [
          item.name,
          item.type,
          item.category,
          item.model,
          item.notes,
          item.current_usage
        ].join(' ').toLowerCase();

        return searchTerms.every(term => searchableText.includes(term));
      });
    }

    // Apply filters
    if (filters.category && filters.category.length > 0) {
      filtered = filtered.filter(item => filters.category.includes(item.category));
    }

    if (filters.type && filters.type.length > 0) {
      filtered = filtered.filter(item => filters.type.includes(item.type));
    }

    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(item => filters.status.includes(item.status));
    }

    if (filters.valueRange) {
      const { min, max } = filters.valueRange;
      filtered = filtered.filter(item => {
        const value = parseFloat(item.current_value || item.value) || 0;
        return value >= min && value <= max;
      });
    }

    if (filters.yearRange) {
      const { min, max } = filters.yearRange;
      filtered = filtered.filter(item => {
        const year = parseInt(item.year) || 0;
        return year >= min && year <= max;
      });
    }

    if (filters.usageHours) {
      const { min, max } = filters.usageHours;
      filtered = filtered.filter(item => {
        const hours = parseInt(item.usage_hours) || 0;
        return hours >= min && hours <= max;
      });
    }

    return this.sortByRelevance(filtered, query, ['name', 'type', 'model']);
  }

  // Search users with advanced filtering
  searchUsers(users, query, filters = {}) {
    let filtered = [...users];

    // Text search
    if (query && query.trim()) {
      const searchTerms = query.toLowerCase().split(' ');
      filtered = filtered.filter(user => {
        const searchableText = [
          user.name,
          user.username,
          user.email,
          user.role,
          user.department
        ].join(' ').toLowerCase();

        return searchTerms.every(term => searchableText.includes(term));
      });
    }

    // Apply filters
    if (filters.role && filters.role.length > 0) {
      filtered = filtered.filter(user => filters.role.includes(user.role));
    }

    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(user => filters.status.includes(user.status));
    }

    if (filters.lastLogin) {
      const { startDate, endDate } = filters.lastLogin;
      filtered = filtered.filter(user => {
        if (!user.last_login) return false;
        const lastLogin = new Date(user.last_login);
        return lastLogin >= new Date(startDate) && lastLogin <= new Date(endDate);
      });
    }

    return this.sortByRelevance(filtered, query, ['name', 'username', 'email']);
  }

  // Sort results by relevance to search query
  sortByRelevance(items, query, searchFields) {
    if (!query || !query.trim()) return items;

    const searchTerms = query.toLowerCase().split(' ');
    
    return items.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      searchFields.forEach(field => {
        const valueA = (a[field] || '').toLowerCase();
        const valueB = (b[field] || '').toLowerCase();

        searchTerms.forEach(term => {
          // Exact match gets highest score
          if (valueA === term) scoreA += 10;
          if (valueB === term) scoreB += 10;

          // Starts with term gets high score
          if (valueA.startsWith(term)) scoreA += 5;
          if (valueB.startsWith(term)) scoreB += 5;

          // Contains term gets medium score
          if (valueA.includes(term)) scoreA += 2;
          if (valueB.includes(term)) scoreB += 2;
        });
      });

      return scoreB - scoreA;
    });
  }

  // Calculate age from birth date
  calculateAge(birthDate) {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    const ageInMs = today - birth;
    const ageInYears = ageInMs / (365.25 * 24 * 60 * 60 * 1000);
    return Math.floor(ageInYears);
  }

  // Save a filter preset
  saveFilterPreset(name, dataType, filters, query = '') {
    const preset = {
      id: Date.now(),
      name,
      dataType,
      filters,
      query,
      timestamp: new Date().toISOString()
    };

    // Remove existing preset with same name and data type
    this.savedFilters = this.savedFilters.filter(f => 
      !(f.name === name && f.dataType === dataType)
    );

    this.savedFilters.push(preset);
    this.saveSavedFilters();

    return preset;
  }

  // Load a filter preset
  loadFilterPreset(presetId) {
    return this.savedFilters.find(f => f.id === presetId);
  }

  // Delete a filter preset
  deleteFilterPreset(presetId) {
    this.savedFilters = this.savedFilters.filter(f => f.id !== presetId);
    this.saveSavedFilters();
  }

  // Get filter presets for a data type
  getFilterPresets(dataType) {
    return this.savedFilters.filter(f => f.dataType === dataType);
  }

  // Get search suggestions based on history
  getSearchSuggestions(query, dataType = null, limit = 10) {
    const filtered = this.searchHistory.filter(item => {
      const matchesQuery = item.query.toLowerCase().includes(query.toLowerCase());
      const matchesType = !dataType || item.dataType === dataType;
      return matchesQuery && matchesType;
    });

    return filtered
      .slice(0, limit)
      .map(item => ({
        query: item.query,
        dataType: item.dataType,
        resultCount: item.resultCount
      }));
  }

  // Clear search history
  clearSearchHistory() {
    this.searchHistory = [];
    this.saveSearchHistory();
  }

  // Get popular searches
  getPopularSearches(dataType = null, limit = 10) {
    const searchCounts = {};
    
    this.searchHistory.forEach(item => {
      if (!dataType || item.dataType === dataType) {
        const key = `${item.query}|${item.dataType}`;
        searchCounts[key] = (searchCounts[key] || 0) + 1;
      }
    });

    return Object.entries(searchCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([key, count]) => {
        const [query, type] = key.split('|');
        return { query, dataType: type, count };
      });
  }

  // Export search results to CSV
  exportSearchResults(results, dataType, query) {
    let csvContent = '';
    let headers = [];
    let rows = [];

    switch (dataType) {
      case 'animals':
        headers = ['Name', 'Species', 'Breed', 'Tag Number', 'Age', 'Weight', 'Health Status', 'Location'];
        rows = results.map(animal => [
          animal.name,
          animal.species,
          animal.breed,
          animal.tag_number,
          this.calculateAge(animal.birth_date),
          animal.weight,
          animal.health_status,
          animal.location
        ]);
        break;

      case 'workers':
        headers = ['Name', 'Role', 'Department', 'Phone', 'Email', 'Salary', 'Status'];
        rows = results.map(worker => [
          worker.name,
          worker.role,
          worker.department,
          worker.phone,
          worker.email,
          worker.salary,
          worker.status
        ]);
        break;

      case 'infrastructure':
        headers = ['Name', 'Type', 'Category', 'Model', 'Year', 'Value', 'Status', 'Usage Hours'];
        rows = results.map(item => [
          item.name,
          item.type,
          item.category,
          item.model,
          item.year,
          item.current_value || item.value,
          item.status,
          item.usage_hours
        ]);
        break;

      default:
        return null;
    }

    csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `adonai-farm-search-${dataType}-${query.replace(/[^a-zA-Z0-9]/g, '_')}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}

// Create singleton instance
export const searchManager = new SearchManager();

// Helper functions for components
export const globalSearch = (query, options) => searchManager.globalSearch(query, options);
export const searchAnimals = (animals, query, filters) => searchManager.searchAnimals(animals, query, filters);
export const searchWorkers = (workers, query, filters) => searchManager.searchWorkers(workers, query, filters);
export const searchInfrastructure = (infrastructure, query, filters) => searchManager.searchInfrastructure(infrastructure, query, filters);
export const saveFilterPreset = (name, dataType, filters, query) => searchManager.saveFilterPreset(name, dataType, filters, query);
export const getFilterPresets = (dataType) => searchManager.getFilterPresets(dataType);
export const getSearchSuggestions = (query, dataType, limit) => searchManager.getSearchSuggestions(query, dataType, limit);