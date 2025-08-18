// System Health and Performance Monitoring Utilities
// Provides comprehensive system diagnostics and performance optimization

import { STORAGE_KEYS } from './dataBackup.js';

/**
 * Performance monitoring configuration
 */
const PERFORMANCE_CONFIG = {
  // Thresholds for performance warnings
  LARGE_DATASET_THRESHOLD: 1000, // items
  STORAGE_WARNING_THRESHOLD: 80, // percentage
  STORAGE_CRITICAL_THRESHOLD: 95, // percentage
  RESPONSE_TIME_WARNING: 100, // milliseconds
  RESPONSE_TIME_CRITICAL: 500, // milliseconds
  
  // Monitoring intervals
  MONITORING_INTERVAL: 30000, // 30 seconds
  CLEANUP_INTERVAL: 300000, // 5 minutes
  
  // Data retention
  PERFORMANCE_LOG_RETENTION: 24 * 60 * 60 * 1000, // 24 hours
  MAX_LOG_ENTRIES: 1000
};

/**
 * System health check results
 */
let systemHealthData = {
  lastCheck: null,
  status: 'unknown',
  issues: [],
  warnings: [],
  performance: {},
  storage: {},
  dataIntegrity: {}
};

/**
 * Performance monitoring data
 */
let performanceLog = [];
let monitoringActive = false;

/**
 * Perform comprehensive system health check
 * @returns {Object} Health check results
 */
export function performSystemHealthCheck() {
  const startTime = performance.now();
  const healthCheck = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    issues: [],
    warnings: [],
    performance: {},
    storage: {},
    dataIntegrity: {},
    recommendations: []
  };

  try {
    // Check storage health
    const storageHealth = checkStorageHealth();
    healthCheck.storage = storageHealth;
    
    if (storageHealth.issues.length > 0) {
      healthCheck.issues.push(...storageHealth.issues);
      healthCheck.status = 'critical';
    }
    
    if (storageHealth.warnings.length > 0) {
      healthCheck.warnings.push(...storageHealth.warnings);
      if (healthCheck.status === 'healthy') {
        healthCheck.status = 'warning';
      }
    }

    // Check data integrity
    const integrityCheck = checkDataIntegrity();
    healthCheck.dataIntegrity = integrityCheck;
    
    if (integrityCheck.issues.length > 0) {
      healthCheck.issues.push(...integrityCheck.issues);
      healthCheck.status = 'critical';
    }
    
    if (integrityCheck.warnings.length > 0) {
      healthCheck.warnings.push(...integrityCheck.warnings);
      if (healthCheck.status === 'healthy') {
        healthCheck.status = 'warning';
      }
    }

    // Check performance metrics
    const performanceCheck = checkPerformanceMetrics();
    healthCheck.performance = performanceCheck;
    
    if (performanceCheck.issues.length > 0) {
      healthCheck.issues.push(...performanceCheck.issues);
      if (healthCheck.status === 'healthy') {
        healthCheck.status = 'warning';
      }
    }

    // Generate recommendations
    healthCheck.recommendations = generateRecommendations(healthCheck);

    // Calculate check duration
    const checkDuration = performance.now() - startTime;
    healthCheck.performance.healthCheckDuration = checkDuration;

    // Update global health data
    systemHealthData = healthCheck;

    return {
      success: true,
      healthCheck,
      message: `System health check completed in ${checkDuration.toFixed(2)}ms`
    };

  } catch (error) {
    console.error('Error during system health check:', error);
    return {
      success: false,
      error: error.message,
      message: 'System health check failed'
    };
  }
}

/**
 * Check storage health and usage
 * @returns {Object} Storage health information
 */
function checkStorageHealth() {
  const storage = {
    totalSize: 0,
    usage: {},
    issues: [],
    warnings: [],
    recommendations: []
  };

  try {
    // Calculate storage usage for each data type
    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
      const data = localStorage.getItem(storageKey);
      if (data) {
        const size = data.length;
        let itemCount = 0;

        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) {
            itemCount = parsed.length;
          } else if (typeof parsed === 'object') {
            itemCount = 1;
          }
        } catch (error) {
          itemCount = 1;
        }

        storage.usage[key.toLowerCase()] = {
          size,
          itemCount,
          sizeKB: (size / 1024).toFixed(2)
        };

        storage.totalSize += size;

        // Check for large datasets
        if (itemCount > PERFORMANCE_CONFIG.LARGE_DATASET_THRESHOLD) {
          storage.warnings.push(`Large dataset detected in ${key}: ${itemCount} items`);
          storage.recommendations.push(`Consider archiving old ${key.toLowerCase()} data`);
        }
      }
    });

    // Estimate localStorage quota and usage percentage
    const estimatedQuota = 5 * 1024 * 1024; // 5MB typical quota
    const usagePercentage = (storage.totalSize / estimatedQuota) * 100;
    
    storage.totalSizeKB = (storage.totalSize / 1024).toFixed(2);
    storage.totalSizeMB = (storage.totalSize / 1024 / 1024).toFixed(2);
    storage.usagePercentage = Math.min(usagePercentage, 100);
    storage.estimatedQuotaMB = (estimatedQuota / 1024 / 1024).toFixed(0);

    // Check storage thresholds
    if (usagePercentage >= PERFORMANCE_CONFIG.STORAGE_CRITICAL_THRESHOLD) {
      storage.issues.push(`Critical storage usage: ${usagePercentage.toFixed(1)}%`);
      storage.recommendations.push('Immediate cleanup required - consider data archival');
    } else if (usagePercentage >= PERFORMANCE_CONFIG.STORAGE_WARNING_THRESHOLD) {
      storage.warnings.push(`High storage usage: ${usagePercentage.toFixed(1)}%`);
      storage.recommendations.push('Consider cleaning up old data or creating backups');
    }

    // Check for localStorage availability
    try {
      const testKey = 'adonai_health_test';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
    } catch (error) {
      storage.issues.push('localStorage is not available or full');
      storage.recommendations.push('Clear browser data or use a different browser');
    }

  } catch (error) {
    storage.issues.push(`Storage health check failed: ${error.message}`);
  }

  return storage;
}

/**
 * Check data integrity across all data types
 * @returns {Object} Data integrity information
 */
function checkDataIntegrity() {
  const integrity = {
    issues: [],
    warnings: [],
    statistics: {},
    orphanedData: {},
    duplicates: {},
    recommendations: []
  };

  try {
    // Load all data
    const data = {};
    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          // Skip parsing for token and other non-JSON data
          if (storageKey === 'adonai_token' || storageKey.includes('token')) {
            // Token is just a string, not JSON
            data[key.toLowerCase()] = stored;
          } else {
            data[key.toLowerCase()] = JSON.parse(stored);
          }
        } catch (error) {
          // Only warn about actual JSON parsing failures
          if (!storageKey.includes('token')) {
            integrity.warnings.push(`Failed to parse ${key} data: ${error.message}`);
          }
        }
      }
    });

    // Check for orphaned time entries
    if (data.time_entries && data.workers) {
      const workerIds = new Set(data.workers.map(w => w.id));
      const orphanedEntries = data.time_entries.filter(entry => !workerIds.has(entry.worker_id));
      
      if (orphanedEntries.length > 0) {
        integrity.orphanedData.time_entries = orphanedEntries.length;
        integrity.warnings.push(`${orphanedEntries.length} orphaned time entries found`);
        integrity.recommendations.push('Run storage cleanup to remove orphaned time entries');
      }
    }

    // Check for duplicate IDs in each data type
    ['users', 'animals', 'workers', 'infrastructure'].forEach(dataType => {
      if (data[dataType] && Array.isArray(data[dataType])) {
        const ids = data[dataType].map(item => item.id).filter(id => id !== undefined);
        const uniqueIds = new Set(ids);
        const duplicateCount = ids.length - uniqueIds.size;
        
        if (duplicateCount > 0) {
          integrity.duplicates[dataType] = duplicateCount;
          integrity.warnings.push(`${duplicateCount} duplicate IDs found in ${dataType}`);
          integrity.recommendations.push(`Remove duplicate entries from ${dataType}`);
        }

        integrity.statistics[dataType] = {
          total: data[dataType].length,
          withIds: ids.length,
          uniqueIds: uniqueIds.size
        };
      }
    });

    // Check for missing required fields
    const requiredFields = {
      users: ['id', 'username', 'role'],
      animals: ['id', 'type', 'name'],
      workers: ['id', 'name'],
      infrastructure: ['id', 'type', 'name']
    };

    Object.entries(requiredFields).forEach(([dataType, fields]) => {
      if (data[dataType] && Array.isArray(data[dataType])) {
        data[dataType].forEach((item, index) => {
          fields.forEach(field => {
            if (!(field in item) || item[field] === null || item[field] === undefined) {
              integrity.warnings.push(`${dataType}[${index}]: Missing required field '${field}'`);
            }
          });
        });
      }
    });

    // Check data consistency
    if (data.current_user && data.users) {
      const currentUser = data.current_user;
      const userExists = data.users.some(u => u.id === currentUser.id);
      if (!userExists) {
        integrity.warnings.push('Current user not found in users list');
        integrity.recommendations.push('Re-login to refresh user session');
      }
    }

  } catch (error) {
    integrity.issues.push(`Data integrity check failed: ${error.message}`);
  }

  return integrity;
}

/**
 * Check performance metrics and identify bottlenecks
 * @returns {Object} Performance information
 */
function checkPerformanceMetrics() {
  const performance = {
    issues: [],
    warnings: [],
    metrics: {},
    recommendations: []
  };

  try {
    // Measure localStorage access performance
    const storagePerformance = measureStoragePerformance();
    performance.metrics.storage = storagePerformance;

    if (storagePerformance.averageReadTime > PERFORMANCE_CONFIG.RESPONSE_TIME_CRITICAL) {
      performance.issues.push(`Slow storage read performance: ${storagePerformance.averageReadTime.toFixed(2)}ms`);
      performance.recommendations.push('Consider reducing data size or implementing data pagination');
    } else if (storagePerformance.averageReadTime > PERFORMANCE_CONFIG.RESPONSE_TIME_WARNING) {
      performance.warnings.push(`Moderate storage read performance: ${storagePerformance.averageReadTime.toFixed(2)}ms`);
      performance.recommendations.push('Monitor storage performance and consider optimization');
    }

    // Check browser performance
    const browserMetrics = getBrowserPerformanceMetrics();
    performance.metrics.browser = browserMetrics;

    // Memory usage estimation
    const memoryEstimate = estimateMemoryUsage();
    performance.metrics.memory = memoryEstimate;

    if (memoryEstimate.estimatedUsageMB > 50) {
      performance.warnings.push(`High estimated memory usage: ${memoryEstimate.estimatedUsageMB.toFixed(1)}MB`);
      performance.recommendations.push('Consider implementing data virtualization for large datasets');
    }

    // Check for performance log
    if (performanceLog.length > 0) {
      const recentLogs = performanceLog.slice(-10);
      const avgResponseTime = recentLogs.reduce((sum, log) => sum + log.responseTime, 0) / recentLogs.length;
      
      performance.metrics.recentAvgResponseTime = avgResponseTime;
      
      if (avgResponseTime > PERFORMANCE_CONFIG.RESPONSE_TIME_WARNING) {
        performance.warnings.push(`Recent average response time is high: ${avgResponseTime.toFixed(2)}ms`);
      }
    }

  } catch (error) {
    performance.issues.push(`Performance check failed: ${error.message}`);
  }

  return performance;
}

/**
 * Measure localStorage access performance
 * @returns {Object} Storage performance metrics
 */
function measureStoragePerformance() {
  const metrics = {
    readTests: [],
    writeTests: [],
    averageReadTime: 0,
    averageWriteTime: 0
  };

  try {
    // Test read performance
    Object.values(STORAGE_KEYS).forEach(storageKey => {
      const startTime = performance.now();
      localStorage.getItem(storageKey);
      const endTime = performance.now();
      metrics.readTests.push(endTime - startTime);
    });

    // Test write performance
    const testData = JSON.stringify({ test: 'performance', timestamp: Date.now() });
    const writeStartTime = performance.now();
    localStorage.setItem('adonai_perf_test', testData);
    const writeEndTime = performance.now();
    localStorage.removeItem('adonai_perf_test');
    metrics.writeTests.push(writeEndTime - writeStartTime);

    // Calculate averages
    metrics.averageReadTime = metrics.readTests.length > 0 
      ? metrics.readTests.reduce((sum, time) => sum + time, 0) / metrics.readTests.length 
      : 0;
    
    metrics.averageWriteTime = metrics.writeTests.length > 0
      ? metrics.writeTests.reduce((sum, time) => sum + time, 0) / metrics.writeTests.length
      : 0;

  } catch (error) {
    console.warn('Storage performance measurement failed:', error);
  }

  return metrics;
}

/**
 * Get browser performance metrics
 * @returns {Object} Browser performance information
 */
function getBrowserPerformanceMetrics() {
  const metrics = {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    hardwareConcurrency: navigator.hardwareConcurrency || 'unknown'
  };

  // Performance API metrics if available
  if (window.performance) {
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      metrics.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
      metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
      metrics.firstPaint = navigation.responseEnd - navigation.fetchStart;
    }

    // Memory info if available (Chrome)
    if (performance.memory) {
      metrics.memoryUsage = {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }
  }

  return metrics;
}

/**
 * Estimate memory usage based on stored data
 * @returns {Object} Memory usage estimation
 */
function estimateMemoryUsage() {
  let totalSize = 0;
  const breakdown = {};

  Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
    const data = localStorage.getItem(storageKey);
    if (data) {
      const size = data.length * 2; // Rough estimate: 2 bytes per character
      breakdown[key.toLowerCase()] = size;
      totalSize += size;
    }
  });

  return {
    estimatedUsageBytes: totalSize,
    estimatedUsageKB: (totalSize / 1024).toFixed(2),
    estimatedUsageMB: (totalSize / 1024 / 1024).toFixed(2),
    breakdown
  };
}

/**
 * Generate recommendations based on health check results
 * @param {Object} healthCheck - Health check results
 * @returns {Array} Array of recommendations
 */
function generateRecommendations(healthCheck) {
  const recommendations = [];

  // Collect all recommendations from sub-checks
  if (healthCheck.storage.recommendations) {
    recommendations.push(...healthCheck.storage.recommendations);
  }
  if (healthCheck.dataIntegrity.recommendations) {
    recommendations.push(...healthCheck.dataIntegrity.recommendations);
  }
  if (healthCheck.performance.recommendations) {
    recommendations.push(...healthCheck.performance.recommendations);
  }

  // Add general recommendations based on overall status
  if (healthCheck.status === 'critical') {
    recommendations.push('Immediate attention required - system has critical issues');
    recommendations.push('Consider creating a backup before making changes');
  } else if (healthCheck.status === 'warning') {
    recommendations.push('System monitoring recommended - some issues detected');
    recommendations.push('Schedule regular maintenance to prevent issues');
  } else {
    recommendations.push('System is healthy - continue regular monitoring');
    recommendations.push('Consider creating periodic backups as preventive measure');
  }

  // Remove duplicates
  return [...new Set(recommendations)];
}

/**
 * Start continuous performance monitoring
 * @param {Object} options - Monitoring options
 */
export function startPerformanceMonitoring(options = {}) {
  if (monitoringActive) {
    console.warn('Performance monitoring is already active');
    return;
  }

  const {
    interval = PERFORMANCE_CONFIG.MONITORING_INTERVAL,
    logRetention = PERFORMANCE_CONFIG.PERFORMANCE_LOG_RETENTION,
    maxLogEntries = PERFORMANCE_CONFIG.MAX_LOG_ENTRIES
  } = options;

  monitoringActive = true;

  const monitoringInterval = setInterval(() => {
    try {
      const timestamp = Date.now();
      const startTime = performance.now();
      
      // Perform lightweight health check
      const quickCheck = performQuickHealthCheck();
      const endTime = performance.now();
      
      // Log performance data
      const logEntry = {
        timestamp,
        responseTime: endTime - startTime,
        status: quickCheck.status,
        storageUsage: quickCheck.storageUsage,
        issueCount: quickCheck.issueCount,
        warningCount: quickCheck.warningCount
      };

      performanceLog.push(logEntry);

      // Cleanup old log entries
      const cutoffTime = timestamp - logRetention;
      performanceLog = performanceLog.filter(entry => entry.timestamp > cutoffTime);
      
      // Limit log size
      if (performanceLog.length > maxLogEntries) {
        performanceLog = performanceLog.slice(-maxLogEntries);
      }

    } catch (error) {
      console.error('Performance monitoring error:', error);
    }
  }, interval);

  // Store interval ID for cleanup
  window.adonaiPerformanceMonitoring = monitoringInterval;

  console.log('Performance monitoring started');
}

/**
 * Stop performance monitoring
 */
export function stopPerformanceMonitoring() {
  if (window.adonaiPerformanceMonitoring) {
    clearInterval(window.adonaiPerformanceMonitoring);
    delete window.adonaiPerformanceMonitoring;
    monitoringActive = false;
    console.log('Performance monitoring stopped');
  }
}

/**
 * Perform quick health check for monitoring
 * @returns {Object} Quick health check results
 */
function performQuickHealthCheck() {
  let totalSize = 0;
  let issueCount = 0;
  let warningCount = 0;

  // Quick storage check
  Object.values(STORAGE_KEYS).forEach(storageKey => {
    const data = localStorage.getItem(storageKey);
    if (data) {
      totalSize += data.length;
    }
  });

  const estimatedQuota = 5 * 1024 * 1024;
  const usagePercentage = (totalSize / estimatedQuota) * 100;

  if (usagePercentage >= PERFORMANCE_CONFIG.STORAGE_CRITICAL_THRESHOLD) {
    issueCount++;
  } else if (usagePercentage >= PERFORMANCE_CONFIG.STORAGE_WARNING_THRESHOLD) {
    warningCount++;
  }

  const status = issueCount > 0 ? 'critical' : warningCount > 0 ? 'warning' : 'healthy';

  return {
    status,
    storageUsage: usagePercentage,
    issueCount,
    warningCount
  };
}

/**
 * Get current system health data
 * @returns {Object} Current health data
 */
export function getCurrentHealthData() {
  return systemHealthData;
}

/**
 * Get performance monitoring log
 * @param {number} limit - Maximum number of entries to return
 * @returns {Array} Performance log entries
 */
export function getPerformanceLog(limit = 100) {
  return performanceLog.slice(-limit);
}

/**
 * Clear performance monitoring log
 */
export function clearPerformanceLog() {
  performanceLog = [];
}

/**
 * Get system diagnostics summary
 * @returns {Object} Diagnostics summary
 */
export function getSystemDiagnostics() {
  const healthCheck = performSystemHealthCheck();
  const storageUsage = checkStorageHealth();
  const browserMetrics = getBrowserPerformanceMetrics();
  const memoryEstimate = estimateMemoryUsage();

  return {
    timestamp: new Date().toISOString(),
    overall: {
      status: healthCheck.success ? healthCheck.healthCheck.status : 'error',
      lastCheck: systemHealthData.lastCheck,
      monitoringActive
    },
    storage: {
      totalSizeMB: storageUsage.totalSizeMB,
      usagePercentage: storageUsage.usagePercentage,
      itemCounts: Object.fromEntries(
        Object.entries(storageUsage.usage).map(([key, data]) => [key, data.itemCount])
      )
    },
    performance: {
      estimatedMemoryMB: memoryEstimate.estimatedUsageMB,
      logEntries: performanceLog.length,
      averageResponseTime: performanceLog.length > 0 
        ? performanceLog.slice(-10).reduce((sum, log) => sum + log.responseTime, 0) / Math.min(10, performanceLog.length)
        : 0
    },
    browser: {
      platform: browserMetrics.platform,
      online: browserMetrics.onLine,
      hardwareConcurrency: browserMetrics.hardwareConcurrency
    },
    recommendations: healthCheck.success ? healthCheck.healthCheck.recommendations : []
  };
}