/* ==============================================
   MOBILE TOUCH INTERACTION UTILITIES
   Task 4: Mobile admin interface touch optimization
   ============================================== */

/**
 * Mobile Touch Optimization Utilities
 * Provides enhanced touch interactions, performance monitoring, and mobile-specific features
 */

class MobileTouchOptimizer {
  constructor() {
    this.isMobile = this.detectMobile();
    this.touchStartTime = 0;
    this.touchStartPos = { x: 0, y: 0 };
    this.performanceMetrics = {
      touchLatency: [],
      scrollPerformance: [],
      renderTime: []
    };
    
    if (this.isMobile) {
      this.init();
    }
  }

  /**
   * Detect if device is mobile
   */
  detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768;
  }

  /**
   * Initialize mobile touch optimizations
   */
  init() {
    this.setupTouchEvents();
    this.optimizeScrolling();
    this.setupPerformanceMonitoring();
    this.setupAccessibilityEnhancements();
    this.setupGestureHandling();
    
    console.log('🔧 Mobile touch optimization initialized');
  }

  /**
   * Setup enhanced touch events for better feedback
   */
  setupTouchEvents() {
    // Add touch feedback to all interactive elements
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    
    // Prevent double-tap zoom on buttons and form elements
    const interactiveElements = 'button, .btn, input, select, textarea, .admin-tab, .card';
    document.addEventListener('touchend', (e) => {
      if (e.target.matches(interactiveElements)) {
        e.preventDefault();
        // Trigger click after preventing default
        setTimeout(() => {
          if (e.target.click) {
            e.target.click();
          }
        }, 10);
      }
    });
  }

  /**
   * Handle touch start events
   */
  handleTouchStart(e) {
    this.touchStartTime = performance.now();
    this.touchStartPos = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };

    // Add visual feedback for touch
    const target = e.target.closest('button, .btn, .admin-tab, .card, .stat-card, .animal-card');
    if (target) {
      target.classList.add('touch-active');
      
      // Create ripple effect
      this.createRippleEffect(target, e.touches[0]);
    }
  }

  /**
   * Handle touch end events
   */
  handleTouchEnd(e) {
    const touchEndTime = performance.now();
    const touchLatency = touchEndTime - this.touchStartTime;
    
    // Track touch performance
    this.performanceMetrics.touchLatency.push(touchLatency);
    if (this.performanceMetrics.touchLatency.length > 100) {
      this.performanceMetrics.touchLatency.shift();
    }

    // Remove visual feedback
    const target = e.target.closest('button, .btn, .admin-tab, .card, .stat-card, .animal-card');
    if (target) {
      setTimeout(() => {
        target.classList.remove('touch-active');
      }, 150);
    }

    // Log slow touches for debugging
    if (touchLatency > 100) {
      console.warn(`⚠️ Slow touch response: ${touchLatency.toFixed(2)}ms`);
    }
  }

  /**
   * Handle touch move events for gesture recognition
   */
  handleTouchMove(e) {
    const currentPos = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };

    const deltaX = currentPos.x - this.touchStartPos.x;
    const deltaY = currentPos.y - this.touchStartPos.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // If significant movement, remove touch feedback
    if (distance > 10) {
      const target = e.target.closest('button, .btn, .admin-tab, .card, .stat-card, .animal-card');
      if (target) {
        target.classList.remove('touch-active');
      }
    }
  }

  /**
   * Create ripple effect for touch feedback
   */
  createRippleEffect(element, touch) {
    const rect = element.getBoundingClientRect();
    const ripple = document.createElement('div');
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(74, 158, 255, 0.3);
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
      z-index: 1000;
    `;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (touch.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (touch.clientY - rect.top - size / 2) + 'px';
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    // Remove ripple after animation
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 600);
  }

  /**
   * Optimize scrolling performance
   */
  optimizeScrolling() {
    // Enable smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Optimize scroll containers
    const scrollContainers = document.querySelectorAll('.admin-container, .modal, .card');
    scrollContainers.forEach(container => {
      container.style.webkitOverflowScrolling = 'touch';
      container.style.overscrollBehavior = 'contain';
    });

    // Monitor scroll performance
    let scrollStartTime = 0;
    let isScrolling = false;

    document.addEventListener('scroll', () => {
      if (!isScrolling) {
        scrollStartTime = performance.now();
        isScrolling = true;
      }
    }, { passive: true });

    document.addEventListener('scrollend', () => {
      if (isScrolling) {
        const scrollTime = performance.now() - scrollStartTime;
        this.performanceMetrics.scrollPerformance.push(scrollTime);
        if (this.performanceMetrics.scrollPerformance.length > 50) {
          this.performanceMetrics.scrollPerformance.shift();
        }
        isScrolling = false;
      }
    }, { passive: true });
  }

  /**
   * Setup performance monitoring
   */
  setupPerformanceMonitoring() {
    // Monitor frame rate
    let lastFrameTime = performance.now();
    let frameCount = 0;
    let fps = 60;

    const measureFPS = () => {
      const currentTime = performance.now();
      frameCount++;
      
      if (currentTime - lastFrameTime >= 1000) {
        fps = Math.round((frameCount * 1000) / (currentTime - lastFrameTime));
        frameCount = 0;
        lastFrameTime = currentTime;
        
        // Log performance warnings
        if (fps < 30) {
          console.warn(`⚠️ Low FPS detected: ${fps}fps`);
        }
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);

    // Monitor memory usage (if available)
    if (performance.memory) {
      setInterval(() => {
        const memoryInfo = performance.memory;
        const memoryUsage = (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100;
        
        if (memoryUsage > 80) {
          console.warn(`⚠️ High memory usage: ${memoryUsage.toFixed(1)}%`);
        }
      }, 30000);
    }
  }

  /**
   * Setup accessibility enhancements for mobile
   */
  setupAccessibilityEnhancements() {
    // Ensure minimum touch target sizes
    const interactiveElements = document.querySelectorAll('button, .btn, a, input, select, textarea');
    interactiveElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      if (rect.width < 44 || rect.height < 44) {
        element.style.minWidth = '44px';
        element.style.minHeight = '44px';
        element.style.padding = '12px 16px';
      }
    });

    // Add focus indicators for keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    });

    // Announce page changes for screen readers
    const announcePageChange = (message) => {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.style.position = 'absolute';
      announcement.style.left = '-10000px';
      announcement.textContent = message;
      document.body.appendChild(announcement);
      
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    };

    // Listen for route changes
    window.addEventListener('popstate', () => {
      const pageTitle = document.title;
      announcePageChange(`Navigated to ${pageTitle}`);
    });
  }

  /**
   * Setup gesture handling
   */
  setupGestureHandling() {
    let startX = 0;
    let startY = 0;
    let startTime = 0;

    document.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startTime = Date.now();
      }
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 1) {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const endTime = Date.now();
        
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const deltaTime = endTime - startTime;
        
        // Detect swipe gestures
        const minSwipeDistance = 50;
        const maxSwipeTime = 300;
        
        if (Math.abs(deltaX) > minSwipeDistance && deltaTime < maxSwipeTime) {
          if (deltaX > 0) {
            this.handleSwipeRight(e);
          } else {
            this.handleSwipeLeft(e);
          }
        }
        
        if (Math.abs(deltaY) > minSwipeDistance && deltaTime < maxSwipeTime) {
          if (deltaY > 0) {
            this.handleSwipeDown(e);
          } else {
            this.handleSwipeUp(e);
          }
        }
      }
    }, { passive: true });
  }

  /**
   * Handle swipe gestures
   */
  handleSwipeRight(e) {
    // Could be used for navigation or dismissing modals
    console.log('👉 Swipe right detected');
  }

  handleSwipeLeft(e) {
    // Could be used for navigation or opening menus
    console.log('👈 Swipe left detected');
  }

  handleSwipeUp(e) {
    // Could be used for pull-to-refresh
    console.log('👆 Swipe up detected');
  }

  handleSwipeDown(e) {
    // Could be used for pull-to-refresh
    console.log('👇 Swipe down detected');
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    const avgTouchLatency = this.performanceMetrics.touchLatency.length > 0 
      ? this.performanceMetrics.touchLatency.reduce((a, b) => a + b, 0) / this.performanceMetrics.touchLatency.length 
      : 0;

    const avgScrollPerformance = this.performanceMetrics.scrollPerformance.length > 0
      ? this.performanceMetrics.scrollPerformance.reduce((a, b) => a + b, 0) / this.performanceMetrics.scrollPerformance.length
      : 0;

    return {
      isMobile: this.isMobile,
      averageTouchLatency: avgTouchLatency.toFixed(2) + 'ms',
      averageScrollTime: avgScrollPerformance.toFixed(2) + 'ms',
      touchSamples: this.performanceMetrics.touchLatency.length,
      scrollSamples: this.performanceMetrics.scrollPerformance.length
    };
  }

  /**
   * Optimize interface for current device
   */
  optimizeForDevice() {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
      ratio: window.devicePixelRatio || 1
    };

    // Adjust for high DPI displays
    if (viewport.ratio > 2) {
      document.documentElement.style.setProperty('--mobile-border-width', '0.5px');
    }

    // Adjust for very small screens
    if (viewport.width < 360) {
      document.documentElement.style.setProperty('--mobile-font-size', '14px');
      document.documentElement.style.setProperty('--mobile-padding', '8px');
    }

    // Adjust for large phones/small tablets
    if (viewport.width > 600 && viewport.width <= 768) {
      document.documentElement.style.setProperty('--mobile-grid-columns', '2');
    }

    console.log(`📱 Optimized for device: ${viewport.width}x${viewport.height} @${viewport.ratio}x`);
  }

  /**
   * Add CSS for touch feedback
   */
  addTouchFeedbackStyles() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes ripple {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
      
      .touch-active {
        transform: scale(0.98) !important;
        transition: transform 0.1s ease !important;
      }
      
      .keyboard-navigation *:focus {
        outline: 2px solid var(--mobile-accent, #4a9eff) !important;
        outline-offset: 2px !important;
      }
      
      /* Enhanced touch targets for mobile */
      @media (max-width: 768px) {
        button, .btn, a, input, select, textarea {
          min-height: 44px !important;
          min-width: 44px !important;
          touch-action: manipulation !important;
        }
        
        /* Prevent text selection on touch */
        .admin-container * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
        }
        
        /* Allow text selection in inputs and content areas */
        input, textarea, .animal-notes, .modal p {
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          -ms-user-select: text !important;
          user-select: text !important;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

// Initialize mobile touch optimizer when DOM is ready
let mobileTouchOptimizer = null;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    mobileTouchOptimizer = new MobileTouchOptimizer();
    mobileTouchOptimizer.addTouchFeedbackStyles();
    mobileTouchOptimizer.optimizeForDevice();
  });
} else {
  mobileTouchOptimizer = new MobileTouchOptimizer();
  mobileTouchOptimizer.addTouchFeedbackStyles();
  mobileTouchOptimizer.optimizeForDevice();
}

// Re-optimize on orientation change
window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    if (mobileTouchOptimizer) {
      mobileTouchOptimizer.optimizeForDevice();
    }
  }, 100);
});

// Export for use in other modules
export { MobileTouchOptimizer };
export default mobileTouchOptimizer;