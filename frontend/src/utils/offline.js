// Offline Support Utilities for Farm Management System

class OfflineManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.offlineQueue = this.loadOfflineQueue();
    this.setupEventListeners();
    this.showConnectionStatus();
  }

  // Load offline queue from localStorage
  loadOfflineQueue() {
    const saved = localStorage.getItem('adonai_offline_queue');
    return saved ? JSON.parse(saved) : [];
  }

  // Save offline queue to localStorage
  saveOfflineQueue() {
    localStorage.setItem('adonai_offline_queue', JSON.stringify(this.offlineQueue));
  }

  // Setup online/offline event listeners
  setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.showConnectionStatus();
      this.processOfflineQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.showConnectionStatus();
    });

    // Listen for beforeunload to save any pending data
    window.addEventListener('beforeunload', () => {
      this.saveOfflineData();
    });
  }

  // Show connection status indicator
  showConnectionStatus() {
    let indicator = document.querySelector('.offline-indicator');
    
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'offline-indicator';
      document.body.appendChild(indicator);
    }

    if (this.isOnline) {
      indicator.textContent = '✅ Back online - Syncing data...';
      indicator.classList.add('online-indicator');
      indicator.classList.add('show');
      
      setTimeout(() => {
        indicator.classList.remove('show');
      }, 3000);
    } else {
      indicator.textContent = '📱 Offline mode - Changes will sync when connected';
      indicator.classList.remove('online-indicator');
      indicator.classList.add('show');
    }
  }

  // Add action to offline queue
  queueOfflineAction(action, data) {
    const queueItem = {
      id: Date.now() + Math.random(),
      action,
      data,
      timestamp: new Date().toISOString(),
      retries: 0
    };

    this.offlineQueue.push(queueItem);
    this.saveOfflineQueue();
    
    console.log('Queued offline action:', action, data);
  }

  // Process offline queue when back online
  async processOfflineQueue() {
    if (!this.isOnline || this.offlineQueue.length === 0) return;

    console.log('Processing offline queue:', this.offlineQueue.length, 'items');

    const processedItems = [];
    
    for (const item of this.offlineQueue) {
      try {
        await this.processQueueItem(item);
        processedItems.push(item.id);
      } catch (error) {
        console.error('Failed to process queue item:', item, error);
        item.retries = (item.retries || 0) + 1;
        
        // Remove items that have failed too many times
        if (item.retries > 3) {
          processedItems.push(item.id);
          console.warn('Removing failed queue item after 3 retries:', item);
        }
      }
    }

    // Remove processed items from queue
    this.offlineQueue = this.offlineQueue.filter(item => !processedItems.includes(item.id));
    this.saveOfflineQueue();

    if (processedItems.length > 0) {
      this.showSyncComplete(processedItems.length);
    }
  }

  // Process individual queue item
  async processQueueItem(item) {
    switch (item.action) {
      case 'add_animal':
        return this.syncAnimalData(item.data, 'add');
      case 'update_animal':
        return this.syncAnimalData(item.data, 'update');
      case 'delete_animal':
        return this.syncAnimalData(item.data, 'delete');
      case 'add_worker':
        return this.syncWorkerData(item.data, 'add');
      case 'update_worker':
        return this.syncWorkerData(item.data, 'update');
      case 'add_infrastructure':
        return this.syncInfrastructureData(item.data, 'add');
      case 'update_infrastructure':
        return this.syncInfrastructureData(item.data, 'update');
      case 'upload_photo':
        return this.syncPhotoData(item.data);
      default:
        console.warn('Unknown offline action:', item.action);
    }
  }

  // Sync animal data (placeholder for actual API calls)
  async syncAnimalData(data, operation) {
    // In a real implementation, this would make API calls
    // For now, we'll just ensure the data is in localStorage
    const animals = JSON.parse(localStorage.getItem('adonai_animals') || '[]');
    
    switch (operation) {
      case 'add':
        if (!animals.find(a => a.id === data.id)) {
          animals.push(data);
        }
        break;
      case 'update':
        const updateIndex = animals.findIndex(a => a.id === data.id);
        if (updateIndex !== -1) {
          animals[updateIndex] = data;
        }
        break;
      case 'delete':
        const deleteIndex = animals.findIndex(a => a.id === data.id);
        if (deleteIndex !== -1) {
          animals.splice(deleteIndex, 1);
        }
        break;
    }
    
    localStorage.setItem('adonai_animals', JSON.stringify(animals));
    return Promise.resolve();
  }

  // Sync worker data
  async syncWorkerData(data, operation) {
    const workers = JSON.parse(localStorage.getItem('adonai_workers') || '[]');
    
    switch (operation) {
      case 'add':
        if (!workers.find(w => w.id === data.id)) {
          workers.push(data);
        }
        break;
      case 'update':
        const updateIndex = workers.findIndex(w => w.id === data.id);
        if (updateIndex !== -1) {
          workers[updateIndex] = data;
        }
        break;
    }
    
    localStorage.setItem('adonai_workers', JSON.stringify(workers));
    return Promise.resolve();
  }

  // Sync infrastructure data
  async syncInfrastructureData(data, operation) {
    const infrastructure = JSON.parse(localStorage.getItem('adonai_infrastructure') || '[]');
    
    switch (operation) {
      case 'add':
        if (!infrastructure.find(i => i.id === data.id)) {
          infrastructure.push(data);
        }
        break;
      case 'update':
        const updateIndex = infrastructure.findIndex(i => i.id === data.id);
        if (updateIndex !== -1) {
          infrastructure[updateIndex] = data;
        }
        break;
    }
    
    localStorage.setItem('adonai_infrastructure', JSON.stringify(infrastructure));
    return Promise.resolve();
  }

  // Sync photo data
  async syncPhotoData(data) {
    const photos = JSON.parse(localStorage.getItem('adonai_gallery') || '[]');
    
    if (!photos.find(p => p.id === data.id)) {
      photos.push(data);
      localStorage.setItem('adonai_gallery', JSON.stringify(photos));
    }
    
    return Promise.resolve();
  }

  // Show sync completion message
  showSyncComplete(count) {
    const indicator = document.querySelector('.offline-indicator');
    if (indicator) {
      indicator.textContent = `✅ Synced ${count} offline changes`;
      indicator.classList.add('online-indicator');
      indicator.classList.add('show');
      
      setTimeout(() => {
        indicator.classList.remove('show');
      }, 3000);
    }
  }

  // Save current data before page unload
  saveOfflineData() {
    // Ensure all current data is saved to localStorage
    const currentData = {
      timestamp: new Date().toISOString(),
      url: window.location.href
    };
    
    localStorage.setItem('adonai_last_session', JSON.stringify(currentData));
  }

  // Check if data is available offline
  isDataAvailable(dataType) {
    const data = localStorage.getItem(`adonai_${dataType}`);
    return data && JSON.parse(data).length > 0;
  }

  // Get offline data
  getOfflineData(dataType) {
    const data = localStorage.getItem(`adonai_${dataType}`);
    return data ? JSON.parse(data) : [];
  }

  // Cache essential data for offline use
  cacheEssentialData() {
    const essentialKeys = [
      'adonai_animals',
      'adonai_workers', 
      'adonai_infrastructure',
      'adonai_users',
      'adonai_gallery',
      'adonai_current_user',
      'adonai_notifications'
    ];

    const cachedData = {};
    essentialKeys.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        cachedData[key] = JSON.parse(data);
      }
    });

    localStorage.setItem('adonai_offline_cache', JSON.stringify({
      data: cachedData,
      timestamp: new Date().toISOString()
    }));
  }

  // Restore cached data
  restoreCachedData() {
    const cached = localStorage.getItem('adonai_offline_cache');
    if (!cached) return false;

    try {
      const { data, timestamp } = JSON.parse(cached);
      const cacheAge = Date.now() - new Date(timestamp).getTime();
      
      // Use cached data if it's less than 24 hours old
      if (cacheAge < 24 * 60 * 60 * 1000) {
        Object.keys(data).forEach(key => {
          if (!localStorage.getItem(key)) {
            localStorage.setItem(key, JSON.stringify(data[key]));
          }
        });
        return true;
      }
    } catch (error) {
      console.error('Failed to restore cached data:', error);
    }
    
    return false;
  }

  // Get storage usage for offline data
  getStorageUsage() {
    let totalSize = 0;
    const offlineKeys = [];
    
    for (let key in localStorage) {
      if (key.startsWith('adonai_')) {
        const size = localStorage[key].length;
        totalSize += size;
        offlineKeys.push({ key, size });
      }
    }

    return {
      totalSize,
      totalSizeFormatted: this.formatBytes(totalSize),
      keys: offlineKeys.sort((a, b) => b.size - a.size)
    };
  }

  // Format bytes to human readable
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Clean up old offline data
  cleanupOfflineData() {
    const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    
    // Clean up old queue items
    this.offlineQueue = this.offlineQueue.filter(item => 
      new Date(item.timestamp) > cutoffDate
    );
    this.saveOfflineQueue();

    // Clean up old cached data
    const cached = localStorage.getItem('adonai_offline_cache');
    if (cached) {
      try {
        const { timestamp } = JSON.parse(cached);
        if (new Date(timestamp) < cutoffDate) {
          localStorage.removeItem('adonai_offline_cache');
        }
      } catch (error) {
        localStorage.removeItem('adonai_offline_cache');
      }
    }
  }
}

// Create singleton instance
export const offlineManager = new OfflineManager();

// Helper functions for components to use
export const queueOfflineAction = (action, data) => {
  offlineManager.queueOfflineAction(action, data);
};

export const isOnline = () => offlineManager.isOnline;

export const isDataAvailable = (dataType) => offlineManager.isDataAvailable(dataType);

export const getOfflineData = (dataType) => offlineManager.getOfflineData(dataType);

// Initialize offline support
export const initializeOfflineSupport = () => {
  // Cache essential data
  offlineManager.cacheEssentialData();
  
  // Clean up old data
  offlineManager.cleanupOfflineData();
  
  // Try to restore cached data if needed
  offlineManager.restoreCachedData();
  
  console.log('Offline support initialized');
};