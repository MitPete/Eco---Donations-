/**
 * Lazy Loading Manager
 * Implements lazy loading for images and heavy content
 */

class LazyLoadManager {
  constructor() {
    this.imageObserver = null;
    this.init();
  }

  init() {
    // Check for Intersection Observer support
    if ('IntersectionObserver' in window) {
      this.imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            this.loadImage(img);
            observer.unobserve(img);
          }
        });
      });

      // Start observing lazy images
      this.observeLazyImages();
    } else {
      // Fallback for older browsers
      this.loadAllImages();
    }
  }

  observeLazyImages() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => {
      this.imageObserver.observe(img);
    });
  }

  loadImage(img) {
    img.src = img.dataset.src;
    img.classList.remove('lazy');
    img.classList.add('loaded');

    // Remove data-src to prevent reloading
    delete img.dataset.src;
  }

  loadAllImages() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => this.loadImage(img));
  }
}

/**
 * Performance Monitor
 * Tracks page load times and performance metrics
 */

class PerformanceMonitor {
  constructor() {
    this.startTime = performance.now();
    this.init();
  }

  init() {
    // Monitor page load
    window.addEventListener('load', () => {
      this.recordPageLoad();
    });

    // Monitor contract loading
    document.addEventListener('contractsLoaded', () => {
      this.recordContractLoad();
    });
  }

  recordPageLoad() {
    const loadTime = performance.now() - this.startTime;
    console.log(`📊 Page load time: ${loadTime.toFixed(2)}ms`);

    // Track in analytics (if available)
    if (window.gtag) {
      window.gtag('event', 'page_load_time', {
        value: Math.round(loadTime),
        custom_parameter: window.location.pathname
      });
    }

    // Show warning if load time is slow
    if (loadTime > 3000) {
      console.warn(`⚠️ Slow page load detected: ${loadTime.toFixed(2)}ms`);
    }
  }

  recordContractLoad() {
    const contractLoadTime = performance.now() - this.startTime;
    console.log(`📊 Contract load time: ${contractLoadTime.toFixed(2)}ms`);
  }

  // Get current performance metrics
  getMetrics() {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        totalTime: navigation.loadEventEnd - navigation.fetchStart
      };
    }
    return null;
  }
}

/**
 * Resource Preloader
 * Preloads critical resources for better performance
 */

class ResourcePreloader {
  constructor() {
    this.preloadQueue = [];
    this.init();
  }

  init() {
    // Preload critical CSS
    this.preloadCSS([
      '/css/base.css',
      '/css/toast.css'
    ]);

    // Preload critical JavaScript
    this.preloadJS([
      '/js/toast.js',
      '/ethers.umd.min.js'
    ]);
  }

  preloadCSS(urls) {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = url;
      document.head.appendChild(link);
    });
  }

  preloadJS(urls) {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'script';
      link.href = url;
      document.head.appendChild(link);
    });
  }

  preloadImage(url) {
    const img = new Image();
    img.src = url;
    this.preloadQueue.push(img);
  }
}

// Initialize performance optimization
document.addEventListener('DOMContentLoaded', () => {
  window.lazyLoader = new LazyLoadManager();
  window.performanceMonitor = new PerformanceMonitor();
  window.resourcePreloader = new ResourcePreloader();

  console.log('🚀 Performance optimization initialized');
});

// Export for manual usage
window.LazyLoadManager = LazyLoadManager;
window.PerformanceMonitor = PerformanceMonitor;
window.ResourcePreloader = ResourcePreloader;
