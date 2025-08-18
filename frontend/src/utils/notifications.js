// Notification System for Farm Management
// Handles maintenance reminders, alerts, and user notifications

export class NotificationSystem {
  constructor() {
    this.notifications = this.loadNotifications();
    this.settings = this.loadSettings();
  }

  // Load notifications from localStorage
  loadNotifications() {
    const saved = localStorage.getItem('adonai_notifications');
    return saved ? JSON.parse(saved) : [];
  }

  // Load notification settings from localStorage
  loadSettings() {
    const saved = localStorage.getItem('adonai_notification_settings');
    return saved ? JSON.parse(saved) : {
      maintenanceReminders: true,
      farmEvents: true,
      systemAlerts: true,
      emailNotifications: false,
      reminderDays: 7, // Days before maintenance due
      soundEnabled: true
    };
  }

  // Save notifications to localStorage
  saveNotifications() {
    localStorage.setItem('adonai_notifications', JSON.stringify(this.notifications));
  }

  // Save settings to localStorage
  saveSettings() {
    localStorage.setItem('adonai_notification_settings', JSON.stringify(this.settings));
  }

  // Create a new notification
  createNotification(type, title, message, priority = 'medium', data = {}) {
    const notification = {
      id: Date.now() + Math.random(),
      type, // 'maintenance', 'event', 'system', 'reminder'
      title,
      message,
      priority, // 'low', 'medium', 'high', 'critical'
      data,
      timestamp: new Date().toISOString(),
      read: false,
      dismissed: false
    };

    this.notifications.unshift(notification);
    this.saveNotifications();
    
    // Show browser notification if enabled
    if (this.settings.soundEnabled && 'Notification' in window) {
      this.showBrowserNotification(notification);
    }

    return notification;
  }

  // Show browser notification
  async showBrowserNotification(notification) {
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id
      });
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          tag: notification.id
        });
      }
    }
  }

  // Check for maintenance reminders
  checkMaintenanceReminders() {
    if (!this.settings.maintenanceReminders) return;

    const infrastructure = JSON.parse(localStorage.getItem('adonai_infrastructure') || '[]');
    const today = new Date();
    const reminderThreshold = this.settings.reminderDays * 24 * 60 * 60 * 1000; // Convert days to milliseconds

    infrastructure.forEach(item => {
      if (item.category === 'vehicle' || item.category === 'equipment') {
        // Check usage-based maintenance
        if (item.usage_hours && item.usage_hours > 0) {
          const maintenanceInterval = this.getMaintenanceInterval(item.type);
          const hoursSinceLastMaintenance = item.usage_hours % maintenanceInterval;
          const hoursUntilMaintenance = maintenanceInterval - hoursSinceLastMaintenance;

          if (hoursUntilMaintenance <= 50) { // Within 50 hours of maintenance
            const existingNotification = this.notifications.find(n => 
              n.type === 'maintenance' && 
              n.data.itemId === item.id && 
              !n.dismissed
            );

            if (!existingNotification) {
              this.createNotification(
                'maintenance',
                `Maintenance Due: ${item.name}`,
                `${item.name} needs maintenance in ${hoursUntilMaintenance} hours of operation`,
                'high',
                { itemId: item.id, itemType: item.type, hoursUntil: hoursUntilMaintenance }
              );
            }
          }
        }

        // Check time-based maintenance for items in maintenance status
        if (item.status === 'Maintenance') {
          const existingNotification = this.notifications.find(n => 
            n.type === 'maintenance' && 
            n.data.itemId === item.id && 
            n.data.status === 'in_maintenance' &&
            !n.dismissed
          );

          if (!existingNotification) {
            this.createNotification(
              'maintenance',
              `Item Under Maintenance: ${item.name}`,
              `${item.name} is currently under maintenance and unavailable`,
              'medium',
              { itemId: item.id, itemType: item.type, status: 'in_maintenance' }
            );
          }
        }
      }

      // Check building maintenance (annual inspections)
      if (item.category === 'building' && item.construction_date) {
        const constructionDate = new Date(item.construction_date);
        const yearsSinceConstruction = (today - constructionDate) / (365.25 * 24 * 60 * 60 * 1000);
        
        if (yearsSinceConstruction >= 1) {
          const lastInspectionKey = `building_inspection_${item.id}`;
          const lastInspection = localStorage.getItem(lastInspectionKey);
          const lastInspectionDate = lastInspection ? new Date(lastInspection) : constructionDate;
          const daysSinceInspection = (today - lastInspectionDate) / (24 * 60 * 60 * 1000);

          if (daysSinceInspection >= 365 - this.settings.reminderDays) {
            const existingNotification = this.notifications.find(n => 
              n.type === 'maintenance' && 
              n.data.itemId === item.id && 
              n.data.inspectionType === 'annual' &&
              !n.dismissed
            );

            if (!existingNotification) {
              this.createNotification(
                'maintenance',
                `Annual Inspection Due: ${item.name}`,
                `${item.name} requires annual inspection (${Math.ceil(365 - daysSinceInspection)} days remaining)`,
                'medium',
                { itemId: item.id, itemType: item.type, inspectionType: 'annual' }
              );
            }
          }
        }
      }
    });
  }

  // Get maintenance interval based on equipment type
  getMaintenanceInterval(type) {
    const intervals = {
      'Tractor': 250,      // Every 250 hours
      'Truck': 300,        // Every 300 hours
      'Pickup': 400,       // Every 400 hours
      'Equipment': 200,    // Every 200 hours
      'Machinery': 150,    // Every 150 hours
      'Implements': 500,   // Every 500 hours
      'Tools': 1000        // Every 1000 hours
    };
    return intervals[type] || 250;
  }

  // Check for farm events and deadlines
  checkFarmEvents() {
    if (!this.settings.farmEvents) return;

    const animals = JSON.parse(localStorage.getItem('adonai_animals') || '[]');
    const today = new Date();

    animals.forEach(animal => {
      // Check breeding schedules
      if (animal.breeding_date) {
        const breedingDate = new Date(animal.breeding_date);
        const gestationPeriod = this.getGestationPeriod(animal.species);
        const dueDate = new Date(breedingDate.getTime() + gestationPeriod * 24 * 60 * 60 * 1000);
        const daysUntilDue = Math.ceil((dueDate - today) / (24 * 60 * 60 * 1000));

        if (daysUntilDue <= this.settings.reminderDays && daysUntilDue > 0) {
          const existingNotification = this.notifications.find(n => 
            n.type === 'event' && 
            n.data.animalId === animal.id && 
            n.data.eventType === 'breeding_due' &&
            !n.dismissed
          );

          if (!existingNotification) {
            this.createNotification(
              'event',
              `Birth Expected: ${animal.name}`,
              `${animal.name} is expected to give birth in ${daysUntilDue} days`,
              'high',
              { animalId: animal.id, eventType: 'breeding_due', daysUntil: daysUntilDue }
            );
          }
        }
      }

      // Check vaccination schedules
      if (animal.last_vaccination) {
        const lastVaccination = new Date(animal.last_vaccination);
        const vaccinationInterval = 365; // Annual vaccination
        const nextVaccination = new Date(lastVaccination.getTime() + vaccinationInterval * 24 * 60 * 60 * 1000);
        const daysUntilVaccination = Math.ceil((nextVaccination - today) / (24 * 60 * 60 * 1000));

        if (daysUntilVaccination <= this.settings.reminderDays && daysUntilVaccination > 0) {
          const existingNotification = this.notifications.find(n => 
            n.type === 'event' && 
            n.data.animalId === animal.id && 
            n.data.eventType === 'vaccination_due' &&
            !n.dismissed
          );

          if (!existingNotification) {
            this.createNotification(
              'event',
              `Vaccination Due: ${animal.name}`,
              `${animal.name} needs vaccination in ${daysUntilVaccination} days`,
              'medium',
              { animalId: animal.id, eventType: 'vaccination_due', daysUntil: daysUntilVaccination }
            );
          }
        }
      }
    });
  }

  // Get gestation period for different species (in days)
  getGestationPeriod(species) {
    const periods = {
      'Cattle': 283,
      'Sheep': 147,
      'Goat': 150,
      'Pig': 114,
      'Horse': 340,
      'Chicken': 21,
      'Duck': 28,
      'Turkey': 28
    };
    return periods[species] || 283;
  }

  // Check system health and generate alerts
  checkSystemHealth() {
    if (!this.settings.systemAlerts) return;

    // Check localStorage usage
    const usage = this.getStorageUsage();
    if (usage.percentage > 80) {
      const existingNotification = this.notifications.find(n => 
        n.type === 'system' && 
        n.data.alertType === 'storage_high' &&
        !n.dismissed
      );

      if (!existingNotification) {
        this.createNotification(
          'system',
          'Storage Usage High',
          `Local storage is ${usage.percentage}% full (${usage.used}/${usage.total}). Consider backing up and cleaning data.`,
          'medium',
          { alertType: 'storage_high', usage: usage.percentage }
        );
      }
    }

    // Check data integrity
    this.checkDataIntegrity();
  }

  // Get localStorage usage statistics
  getStorageUsage() {
    let total = 0;
    let used = 0;

    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length;
      }
    }

    // Estimate total available (5MB typical limit)
    total = 5 * 1024 * 1024; // 5MB in characters
    const percentage = Math.round((used / total) * 100);

    return {
      used: this.formatBytes(used),
      total: this.formatBytes(total),
      percentage
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

  // Check data integrity
  checkDataIntegrity() {
    const dataKeys = ['adonai_animals', 'adonai_workers', 'adonai_infrastructure', 'adonai_users'];
    let corruptedData = [];

    dataKeys.forEach(key => {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          JSON.parse(data);
        }
      } catch (error) {
        corruptedData.push(key);
      }
    });

    if (corruptedData.length > 0) {
      this.createNotification(
        'system',
        'Data Corruption Detected',
        `Corrupted data detected in: ${corruptedData.join(', ')}. Please restore from backup.`,
        'critical',
        { alertType: 'data_corruption', corruptedKeys: corruptedData }
      );
    }
  }

  // Mark notification as read
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
    }
  }

  // Dismiss notification
  dismissNotification(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.dismissed = true;
      this.saveNotifications();
    }
  }

  // Get active notifications (not dismissed)
  getActiveNotifications() {
    return this.notifications.filter(n => !n.dismissed);
  }

  // Get unread notifications
  getUnreadNotifications() {
    return this.notifications.filter(n => !n.read && !n.dismissed);
  }

  // Get notifications by type
  getNotificationsByType(type) {
    return this.notifications.filter(n => n.type === type && !n.dismissed);
  }

  // Get notifications by priority
  getNotificationsByPriority(priority) {
    return this.notifications.filter(n => n.priority === priority && !n.dismissed);
  }

  // Update notification settings
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  // Run all checks
  runAllChecks() {
    this.checkMaintenanceReminders();
    this.checkFarmEvents();
    this.checkSystemHealth();
  }

  // Clear old notifications (older than 30 days)
  clearOldNotifications() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    this.notifications = this.notifications.filter(n => 
      new Date(n.timestamp) > thirtyDaysAgo || !n.dismissed
    );
    this.saveNotifications();
  }

  // Get notification statistics
  getStatistics() {
    const total = this.notifications.length;
    const unread = this.getUnreadNotifications().length;
    const byType = {
      maintenance: this.getNotificationsByType('maintenance').length,
      event: this.getNotificationsByType('event').length,
      system: this.getNotificationsByType('system').length,
      reminder: this.getNotificationsByType('reminder').length
    };
    const byPriority = {
      critical: this.getNotificationsByPriority('critical').length,
      high: this.getNotificationsByPriority('high').length,
      medium: this.getNotificationsByPriority('medium').length,
      low: this.getNotificationsByPriority('low').length
    };

    return { total, unread, byType, byPriority };
  }
}

// Create singleton instance
export const notificationSystem = new NotificationSystem();

// Auto-run checks every hour
setInterval(() => {
  notificationSystem.runAllChecks();
  notificationSystem.clearOldNotifications();
}, 60 * 60 * 1000); // 1 hour

// Run initial check
notificationSystem.runAllChecks();