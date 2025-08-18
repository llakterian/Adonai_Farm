/**
 * Performance Testing and Monitoring Utilities
 * Provides tools for measuring and optimizing application performance
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.isEnabled = import.meta.env.DEV || 
                     localStorage.getItem('performance-monitoring') === 'true';
    
    if (this.isEnabled) {
      this.initializeObservers();
    }
  }

  /**
   * Initialize performance observers
   */
  initializeObservers() {
    // Performance Observer for navigation timing
    if ('PerformanceObserver' in window) {
      try {
        // Navigation timing
        const navObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.entryType === 'navigation') {
              this.recordNavigationMetrics(entry);
            }
          });
        });
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.set('navigation', navObserver);

        // Resource timing
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.entryType === 'resource') {
              this.recordResourceMetrics(entry);
            }
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.set('resource', resourceObserver);

        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.recordMetric('LCP', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);

        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            this.recordMetric('FID', entry.processingStart - entry.startTime);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.set('fid', fidObserver);

        // Cumulative Layout Shift
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.recordMetric('CLS', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('cls', clsObserver);

      } catch (error) {
        console.warn('Performance Observer not fully supported:', error);
      }
    }
  }

  /**
   * Record navigation timing metrics
   */
  recordNavigationMetrics(entry) {
    const metrics = {
      'DNS Lookup': entry.domainLookupEnd - entry.domainLookupStart,
      'TCP Connection': entry.connectEnd - entry.connectStart,
      'TLS Handshake': entry.secureConnectionStart > 0 ? 
                      entry.connectEnd - entry.secureConnectionStart : 0,
      'Request': entry.responseStart - entry.requestStart,
      'Response': entry.responseEnd - entry.responseStart,
      'DOM Processing': entry.domContentLoadedEventStart - entry.responseEnd,
      'Resource Loading': entry.loadEventStart - entry.domContentLoadedEventStart,
      'Total Load Time': entry.loadEventEnd - entry.navigationStart,
      'Time to Interactive': entry.domInteractive - entry.navigationStart,
      'DOM Content Loaded': entry.domContentLoadedEventEnd - entry.navigationStart
    };

    Object.entries(metrics).forEach(([name, value]) => {
      this.recordMetric(name, value);
    });
  }

  /**
   * Record resource timing metrics
   */
  recordResourceMetrics(entry) {
    const resourceType = this.getResourceType(entry.name);
    const loadTime = entry.responseEnd - entry.startTime;
    
    if (!this.metrics.has(`${resourceType}_load_times`)) {
      this.metrics.set(`${resourceType}_load_times`, []);
    }
    
    this.metrics.get(`${resourceType}_load_times`).push({
      name: entry.name,
      loadTime,
      size: entry.transferSize || 0,
      cached: entry.transferSize === 0 && entry.decodedBodySize > 0
    });
  }

  /**
   * Get resource type from URL
   */
  getResourceType(url) {
    if (url.includes('.js')) return 'javascript';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return 'image';
    if (url.includes('/api/')) return 'api';
    return 'other';
  }

  /**
   * Record a performance metric
   */
  recordMetric(name, value) {
    if (!this.isEnabled) return;
    
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    this.metrics.get(name).push({
      value,
      timestamp: Date.now()
    });
  }

  /**
   * Start timing a custom operation
   */
  startTiming(name) {
    if (!this.isEnabled) return;
    
    const startTime = performance.now();
    return {
      end: () => {
        const endTime = performance.now();
        this.recordMetric(name, endTime - startTime);
        return endTime - startTime;
      }
    };
  }

  /**
   * Measure React component render time
   */
  measureComponentRender(componentName, renderFn) {
    if (!this.isEnabled) return renderFn();
    
    const timer = this.startTiming(`${componentName}_render`);
    const result = renderFn();
    timer.end();
    return result;
  }

  /**
   * Measure image loading performance
   */
  measureImageLoad(imageUrl) {
    if (!this.isEnabled) return Promise.resolve();
    
    return new Promise((resolve) => {
      const timer = this.startTiming('image_load');
      const img = new Image();
      
      img.onload = () => {
        const loadTime = timer.end();
        this.recordMetric('image_load_success', loadTime);
        resolve({ success: true, loadTime });
      };
      
      img.onerror = () => {
        const loadTime = timer.end();
        this.recordMetric('image_load_error', loadTime);
        resolve({ success: false, loadTime });
      };
      
      img.src = imageUrl;
    });
  }

  /**
   * Get performance report
   */
  getPerformanceReport() {
    if (!this.isEnabled) return null;
    
    const report = {
      timestamp: new Date().toISOString(),
      metrics: {},
      summary: {}
    };

    // Process metrics
    this.metrics.forEach((values, name) => {
      if (Array.isArray(values) && values.length > 0) {
        const numericValues = values.map(v => typeof v === 'object' ? v.value : v);
        report.metrics[name] = {
          count: values.length,
          average: numericValues.reduce((a, b) => a + b, 0) / numericValues.length,
          min: Math.min(...numericValues),
          max: Math.max(...numericValues),
          latest: numericValues[numericValues.length - 1]
        };
      }
    });

    // Generate summary
    report.summary = this.generatePerformanceSummary(report.metrics);
    
    return report;
  }

  /**
   * Generate performance summary with recommendations
   */
  generatePerformanceSummary(metrics) {
    const summary = {
      score: 100,
      issues: [],
      recommendations: []
    };

    // Check Core Web Vitals
    if (metrics.LCP && metrics.LCP.latest > 2500) {
      summary.score -= 20;
      summary.issues.push('Largest Contentful Paint is slow');
      summary.recommendations.push('Optimize image loading and reduce server response time');
    }

    if (metrics.FID && metrics.FID.latest > 100) {
      summary.score -= 15;
      summary.issues.push('First Input Delay is high');
      summary.recommendations.push('Reduce JavaScript execution time and optimize event handlers');
    }

    if (metrics.CLS && metrics.CLS.latest > 0.1) {
      summary.score -= 15;
      summary.issues.push('Cumulative Layout Shift is high');
      summary.recommendations.push('Reserve space for images and avoid inserting content above existing content');
    }

    // Check load times
    if (metrics['Total Load Time'] && metrics['Total Load Time'].latest > 3000) {
      summary.score -= 10;
      summary.issues.push('Total page load time is slow');
      summary.recommendations.push('Enable code splitting and optimize bundle size');
    }

    // Check image performance
    if (metrics.image_load_times) {
      const avgImageLoad = metrics.image_load_times.average;
      if (avgImageLoad > 1000) {
        summary.score -= 10;
        summary.issues.push('Image loading is slow');
        summary.recommendations.push('Implement image optimization and lazy loading');
      }
    }

    return summary;
  }

  /**
   * Log performance report to console
   */
  logPerformanceReport() {
    if (!this.isEnabled) return;
    
    const report = this.getPerformanceReport();
    if (report) {
      console.group('🚀 Performance Report');
      console.log('Score:', report.summary.score + '/100');
      
      if (report.summary.issues.length > 0) {
        console.group('⚠️ Issues');
        report.summary.issues.forEach(issue => console.log('•', issue));
        console.groupEnd();
      }
      
      if (report.summary.recommendations.length > 0) {
        console.group('💡 Recommendations');
        report.summary.recommendations.forEach(rec => console.log('•', rec));
        console.groupEnd();
      }
      
      console.group('📊 Detailed Metrics');
      Object.entries(report.metrics).forEach(([name, data]) => {
        console.log(`${name}:`, `${data.latest.toFixed(2)}ms (avg: ${data.average.toFixed(2)}ms)`);
      });
      console.groupEnd();
      
      console.groupEnd();
    }
  }

  /**
   * Test bundle size and loading performance
   */
  async testBundlePerformance() {
    if (!this.isEnabled) return;
    
    const timer = this.startTiming('bundle_analysis');
    
    try {
      // Analyze loaded scripts
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      
      const bundleInfo = {
        scripts: scripts.length,
        stylesheets: stylesheets.length,
        totalResources: scripts.length + stylesheets.length
      };
      
      // Check for code splitting
      const hasCodeSplitting = scripts.some(script => 
        script.src.includes('chunk') || script.src.includes('lazy')
      );
      
      bundleInfo.hasCodeSplitting = hasCodeSplitting;
      
      console.log('📦 Bundle Analysis:', bundleInfo);
      
      if (!hasCodeSplitting) {
        console.warn('⚠️ No code splitting detected. Consider implementing lazy loading.');
      }
      
      timer.end();
      return bundleInfo;
      
    } catch (error) {
      console.error('Bundle analysis failed:', error);
      timer.end();
      return null;
    }
  }

  /**
   * Test cross-browser compatibility
   */
  testBrowserCompatibility() {
    if (!this.isEnabled) return;
    
    const features = {
      'Intersection Observer': 'IntersectionObserver' in window,
      'Service Worker': 'serviceWorker' in navigator,
      'Web Workers': 'Worker' in window,
      'Local Storage': 'localStorage' in window,
      'Session Storage': 'sessionStorage' in window,
      'Fetch API': 'fetch' in window,
      'Promise': 'Promise' in window,
      'ES6 Classes': (() => {
        try {
          // Check if class syntax is supported without eval
          return typeof class {} === 'function';
        } catch (e) {
          return false;
        }
      })(),
      'CSS Grid': CSS.supports('display', 'grid'),
      'CSS Flexbox': CSS.supports('display', 'flex'),
      'WebP Support': (() => {
        const canvas = document.createElement('canvas');
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      })()
    };
    
    console.group('🌐 Browser Compatibility');
    Object.entries(features).forEach(([feature, supported]) => {
      console.log(`${supported ? '✅' : '❌'} ${feature}`);
    });
    console.groupEnd();
    
    return features;
  }

  /**
   * Test mobile performance
   */
  testMobilePerformance() {
    if (!this.isEnabled) return;
    
    const isMobile = window.innerWidth <= 768;
    const touchSupport = 'ontouchstart' in window;
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    const mobileMetrics = {
      isMobile,
      touchSupport,
      devicePixelRatio,
      screenSize: {
        width: window.screen.width,
        height: window.screen.height
      },
      viewportSize: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      } : null
    };
    
    console.group('📱 Mobile Performance');
    console.log('Device Info:', mobileMetrics);
    
    if (isMobile && devicePixelRatio > 2) {
      console.warn('⚠️ High DPI mobile device detected. Ensure images are optimized.');
    }
    
    if (mobileMetrics.connection && mobileMetrics.connection.effectiveType === '2g') {
      console.warn('⚠️ Slow connection detected. Consider data-saving optimizations.');
    }
    
    console.groupEnd();
    
    return mobileMetrics;
  }

  /**
   * Run comprehensive performance test
   */
  async runPerformanceTest() {
    if (!this.isEnabled) return;
    
    console.log('🧪 Running Performance Test Suite...');
    
    const results = {
      timestamp: new Date().toISOString(),
      bundle: await this.testBundlePerformance(),
      browser: this.testBrowserCompatibility(),
      mobile: this.testMobilePerformance(),
      metrics: this.getPerformanceReport()
    };
    
    // Wait a bit for metrics to be collected
    setTimeout(() => {
      this.logPerformanceReport();
    }, 2000);
    
    return results;
  }

  /**
   * Enable performance monitoring
   */
  enable() {
    this.isEnabled = true;
    localStorage.setItem('performance-monitoring', 'true');
    this.initializeObservers();
  }

  /**
   * Disable performance monitoring
   */
  disable() {
    this.isEnabled = false;
    localStorage.removeItem('performance-monitoring');
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }

  /**
   * Clean up observers
   */
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.metrics.clear();
  }
}

// Create global performance monitor instance
const performanceMonitor = new PerformanceMonitor();

// Export utilities
export default performanceMonitor;

export const {
  recordMetric,
  startTiming,
  measureComponentRender,
  measureImageLoad,
  getPerformanceReport,
  logPerformanceReport,
  testBundlePerformance,
  testBrowserCompatibility,
  testMobilePerformance,
  runPerformanceTest,
  enable: enablePerformanceMonitoring,
  disable: disablePerformanceMonitoring
} = performanceMonitor;

// Auto-run performance test in development
if (import.meta.env.DEV) {
  // Run test after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      performanceMonitor.runPerformanceTest();
    }, 1000);
  });
}

// Expose to window for manual testing
if (typeof window !== 'undefined') {
  window.performanceMonitor = performanceMonitor;
}