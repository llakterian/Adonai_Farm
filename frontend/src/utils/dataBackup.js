// Data Backup and Restore Utilities
// Provides complete system backup and restore functionality with data validation

// Define all localStorage keys used by the application
export const STORAGE_KEYS = {
  USERS: 'adonai_users',
  ANIMALS: 'adonai_animals',
  WORKERS: 'adonai_workers',
  INFRASTRUCTURE: 'adonai_infrastructure',
  TIME_ENTRIES: 'adonai_time_entries',
  GALLERY: 'adonai_gallery',
  TOKEN: 'adonai_token',
  CURRENT_USER: 'adonai_current_user',
  SETTINGS: 'adonai_settings',
  MAINTENANCE: 'adonai_maintenance'
};

// Data validation schemas
const VALIDATION_SCHEMAS = {
  users: {
    required: ['id', 'username', 'role', 'name', 'active'],
    types: {
      id: 'number',
      username: 'string',
      role: 'string',
      name: 'string',
      email: 'string',
      active: 'boolean'
    }
  },
  animals: {
    required: ['id', 'type', 'name'],
    types: {
      id: 'number',
      type: 'string',
      name: 'string',
      dob: 'string',
      sex: 'string'
    }
  },
  workers: {
    required: ['id', 'name'],
    types: {
      id: 'number',
      name: 'string',
      role: 'string',
      phone: 'string',
      email: 'string'
    }
  },
  infrastructure: {
    required: ['id', 'type', 'name'],
    types: {
      id: 'number',
      type: 'string',
      name: 'string',
      status: 'string'
    }
  },
  time_entries: {
    required: ['id', 'worker_id'],
    types: {
      id: 'number',
      worker_id: 'number',
      clock_in: 'string',
      clock_out: 'string',
      hours_worked: 'number'
    }
  },
  gallery: {
    required: ['id', 'filename'],
    types: {
      id: 'number',
      filename: 'string',
      path: 'string',
      uploaded_at: 'string'
    }
  }
};

/**
 * Create a complete backup of all system data
 * @returns {Object} Backup object containing all data and metadata
 */
export function createSystemBackup() {
  try {
    const backup = {
      metadata: {
        version: '1.0',
        created_at: new Date().toISOString(),
        created_by: getCurrentUserInfo(),
        total_size: 0,
        data_types: []
      },
      data: {}
    };

    // Backup all data types
    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
      const data = localStorage.getItem(storageKey);
      if (data) {
        try {
          const parsedData = JSON.parse(data);
          backup.data[key.toLowerCase()] = parsedData;
          backup.metadata.data_types.push(key.toLowerCase());
          backup.metadata.total_size += data.length;
        } catch (error) {
          console.warn(`Failed to parse data for ${storageKey}:`, error);
          // Store as string if JSON parsing fails
          backup.data[key.toLowerCase()] = data;
          backup.metadata.data_types.push(key.toLowerCase());
          backup.metadata.total_size += data.length;
        }
      }
    });

    // Add system statistics
    backup.metadata.statistics = {
      users_count: Array.isArray(backup.data.users) ? backup.data.users.length : 0,
      animals_count: Array.isArray(backup.data.animals) ? backup.data.animals.length : 0,
      workers_count: Array.isArray(backup.data.workers) ? backup.data.workers.length : 0,
      infrastructure_count: Array.isArray(backup.data.infrastructure) ? backup.data.infrastructure.length : 0,
      time_entries_count: Array.isArray(backup.data.time_entries) ? backup.data.time_entries.length : 0,
      gallery_count: Array.isArray(backup.data.gallery) ? backup.data.gallery.length : 0
    };

    return {
      success: true,
      backup,
      message: 'System backup created successfully'
    };
  } catch (error) {
    console.error('Error creating system backup:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to create system backup'
    };
  }
}

/**
 * Export backup data as downloadable JSON file
 * @param {Object} backup - Backup object to export
 * @param {string} filename - Optional filename for the backup
 */
export function exportBackupFile(backup, filename = null) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const defaultFilename = `adonai-farm-backup-${timestamp}.json`;
    const finalFilename = filename || defaultFilename;

    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return {
      success: true,
      filename: finalFilename,
      size: dataStr.length,
      message: 'Backup file exported successfully'
    };
  } catch (error) {
    console.error('Error exporting backup file:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to export backup file'
    };
  }
}

/**
 * Validate backup data structure and integrity
 * @param {Object} backup - Backup object to validate
 * @returns {Object} Validation result
 */
export function validateBackupData(backup) {
  const errors = [];
  const warnings = [];

  try {
    // Check backup structure
    if (!backup || typeof backup !== 'object') {
      errors.push('Invalid backup format: not an object');
      return { success: false, errors, warnings };
    }

    if (!backup.metadata || !backup.data) {
      errors.push('Invalid backup format: missing metadata or data');
      return { success: false, errors, warnings };
    }

    // Validate metadata
    if (!backup.metadata.version || !backup.metadata.created_at) {
      warnings.push('Backup metadata is incomplete');
    }

    // Validate each data type
    Object.entries(backup.data).forEach(([dataType, data]) => {
      if (VALIDATION_SCHEMAS[dataType] && Array.isArray(data)) {
        const schema = VALIDATION_SCHEMAS[dataType];

        data.forEach((item, index) => {
          // Check required fields
          schema.required.forEach(field => {
            if (!(field in item)) {
              errors.push(`${dataType}[${index}]: Missing required field '${field}'`);
            }
          });

          // Check field types
          Object.entries(schema.types).forEach(([field, expectedType]) => {
            if (field in item && typeof item[field] !== expectedType) {
              warnings.push(`${dataType}[${index}]: Field '${field}' has incorrect type (expected ${expectedType})`);
            }
          });
        });
      }
    });

    // Check for data consistency
    if (backup.data.time_entries && backup.data.workers) {
      const workerIds = new Set(backup.data.workers.map(w => w.id));
      backup.data.time_entries.forEach((entry, index) => {
        if (!workerIds.has(entry.worker_id)) {
          warnings.push(`time_entries[${index}]: References non-existent worker ID ${entry.worker_id}`);
        }
      });
    }

    return {
      success: errors.length === 0,
      errors,
      warnings,
      statistics: backup.metadata.statistics || {},
      message: errors.length === 0 ? 'Backup validation successful' : 'Backup validation failed'
    };
  } catch (error) {
    console.error('Error validating backup:', error);
    return {
      success: false,
      errors: [`Validation error: ${error.message}`],
      warnings,
      message: 'Failed to validate backup'
    };
  }
}

/**
 * Restore system data from backup
 * @param {Object} backup - Backup object to restore
 * @param {Object} options - Restore options
 * @returns {Object} Restore result
 */
export function restoreSystemData(backup, options = {}) {
  const {
    overwrite = true,
    skipValidation = false,
    dataTypes = null // Array of data types to restore, null for all
  } = options;

  try {
    // Validate backup first unless skipped
    if (!skipValidation) {
      const validation = validateBackupData(backup);
      if (!validation.success) {
        return {
          success: false,
          errors: validation.errors,
          warnings: validation.warnings,
          message: 'Backup validation failed, restore aborted'
        };
      }
    }

    const restored = [];
    const skipped = [];
    const errors = [];

    // Determine which data types to restore
    const typesToRestore = dataTypes || Object.keys(backup.data);

    typesToRestore.forEach(dataType => {
      const storageKey = STORAGE_KEYS[dataType.toUpperCase()];
      if (!storageKey) {
        errors.push(`Unknown data type: ${dataType}`);
        return;
      }

      const data = backup.data[dataType];
      if (data === undefined) {
        skipped.push(`${dataType}: No data in backup`);
        return;
      }

      // Check if data already exists
      const existingData = localStorage.getItem(storageKey);
      if (existingData && !overwrite) {
        skipped.push(`${dataType}: Data exists and overwrite is disabled`);
        return;
      }

      try {
        // Store the data
        const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
        localStorage.setItem(storageKey, dataStr);
        restored.push(`${dataType}: ${Array.isArray(data) ? data.length : 1} items`);
      } catch (error) {
        errors.push(`${dataType}: Failed to restore - ${error.message}`);
      }
    });

    return {
      success: errors.length === 0,
      restored,
      skipped,
      errors,
      message: errors.length === 0 ? 'System restore completed successfully' : 'System restore completed with errors'
    };
  } catch (error) {
    console.error('Error restoring system data:', error);
    return {
      success: false,
      errors: [error.message],
      message: 'Failed to restore system data'
    };
  }
}

/**
 * Import backup from uploaded file
 * @param {File} file - Uploaded backup file
 * @returns {Promise<Object>} Import result
 */
export function importBackupFile(file) {
  return new Promise((resolve) => {
    if (!file) {
      resolve({
        success: false,
        error: 'No file provided',
        message: 'Please select a backup file to import'
      });
      return;
    }

    if (!file.name.endsWith('.json')) {
      resolve({
        success: false,
        error: 'Invalid file type',
        message: 'Please select a valid JSON backup file'
      });
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target.result);
        resolve({
          success: true,
          backup,
          filename: file.name,
          size: file.size,
          message: 'Backup file imported successfully'
        });
      } catch (error) {
        resolve({
          success: false,
          error: error.message,
          message: 'Failed to parse backup file'
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        error: 'File read error',
        message: 'Failed to read backup file'
      });
    };

    reader.readAsText(file);
  });
}

/**
 * Get current user information for backup metadata
 * @returns {Object} Current user info
 */
function getCurrentUserInfo() {
  try {
    const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (userStr) {
      const user = JSON.parse(userStr);
      return {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      };
    }
  } catch (error) {
    console.warn('Failed to get current user info:', error);
  }
  return {
    id: null,
    username: 'unknown',
    name: 'Unknown User',
    role: 'unknown'
  };
}

/**
 * Get system storage usage statistics
 * @returns {Object} Storage usage information
 */
export function getStorageUsage() {
  try {
    let totalSize = 0;
    const usage = {};

    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
      const data = localStorage.getItem(storageKey);
      if (data) {
        const size = data.length;
        usage[key.toLowerCase()] = {
          size,
          items: 0
        };

        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) {
            usage[key.toLowerCase()].items = parsed.length;
          } else if (typeof parsed === 'object') {
            usage[key.toLowerCase()].items = 1;
          }
        } catch (error) {
          usage[key.toLowerCase()].items = 1;
        }

        totalSize += size;
      }
    });

    // Estimate localStorage quota (usually 5-10MB)
    const estimatedQuota = 5 * 1024 * 1024; // 5MB
    const usagePercentage = (totalSize / estimatedQuota) * 100;

    return {
      totalSize,
      estimatedQuota,
      usagePercentage: Math.min(usagePercentage, 100),
      breakdown: usage,
      message: `Using ${(totalSize / 1024).toFixed(1)}KB of estimated ${(estimatedQuota / 1024 / 1024).toFixed(0)}MB quota`
    };
  } catch (error) {
    console.error('Error calculating storage usage:', error);
    return {
      totalSize: 0,
      estimatedQuota: 0,
      usagePercentage: 0,
      breakdown: {},
      error: error.message,
      message: 'Failed to calculate storage usage'
    };
  }
}

/**
 * Clean up old or invalid data entries
 * @param {Object} options - Cleanup options
 * @returns {Object} Cleanup result
 */
export function cleanupStorageData(options = {}) {
  const {
    removeOrphaned = true,
    removeDuplicates = true,
    validateData = true
  } = options;

  try {
    const cleaned = [];
    const errors = [];

    // Clean up time entries with invalid worker references
    if (removeOrphaned) {
      const workersData = localStorage.getItem(STORAGE_KEYS.WORKERS);
      const timeEntriesData = localStorage.getItem(STORAGE_KEYS.TIME_ENTRIES);

      if (workersData && timeEntriesData) {
        const workers = JSON.parse(workersData);
        const timeEntries = JSON.parse(timeEntriesData);
        const workerIds = new Set(workers.map(w => w.id));

        const validTimeEntries = timeEntries.filter(entry => workerIds.has(entry.worker_id));
        const removedCount = timeEntries.length - validTimeEntries.length;

        if (removedCount > 0) {
          localStorage.setItem(STORAGE_KEYS.TIME_ENTRIES, JSON.stringify(validTimeEntries));
          cleaned.push(`Removed ${removedCount} orphaned time entries`);
        }
      }
    }

    // Remove duplicate entries based on ID
    if (removeDuplicates) {
      [STORAGE_KEYS.ANIMALS, STORAGE_KEYS.WORKERS, STORAGE_KEYS.INFRASTRUCTURE, STORAGE_KEYS.USERS].forEach(storageKey => {
        const data = localStorage.getItem(storageKey);
        if (data) {
          try {
            const items = JSON.parse(data);
            if (Array.isArray(items)) {
              const uniqueItems = [];
              const seenIds = new Set();

              items.forEach(item => {
                if (item.id && !seenIds.has(item.id)) {
                  seenIds.add(item.id);
                  uniqueItems.push(item);
                }
              });

              const removedCount = items.length - uniqueItems.length;
              if (removedCount > 0) {
                localStorage.setItem(storageKey, JSON.stringify(uniqueItems));
                cleaned.push(`Removed ${removedCount} duplicate entries from ${storageKey}`);
              }
            }
          } catch (error) {
            errors.push(`Failed to clean ${storageKey}: ${error.message}`);
          }
        }
      });
    }

    return {
      success: errors.length === 0,
      cleaned,
      errors,
      message: cleaned.length > 0 ? 'Storage cleanup completed' : 'No cleanup needed'
    };
  } catch (error) {
    console.error('Error during storage cleanup:', error);
    return {
      success: false,
      errors: [error.message],
      message: 'Failed to cleanup storage data'
    };
  }
}