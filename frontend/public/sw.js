// Service Worker for CSS Caching and FOUC Prevention
const CACHE_NAME = 'eco-donations-css-v2';
const CRITICAL_RESOURCES = [
  '/src/styles/css/base.css',
  '/src/styles/css/home.css',
  '/src/styles/css/donate.css',
  '/src/styles/css/dashboard.css',
  '/src/styles/css/history.css',
  '/src/styles/css/foundation.css',
  '/src/styles/css/governance.css',
  '/src/styles/css/whitepaper.css',
  '/js/anti-fouc.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'
];

// Install event - cache critical resources
self.addEventListener('install', function(event) {
  console.log('SW: Installing service worker for CSS caching...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('SW: Caching critical CSS resources');
        return cache.addAll(CRITICAL_RESOURCES);
      })
      .catch(function(error) {
        console.warn('SW: Failed to cache some resources:', error);
      })
  );
});

// Fetch event - serve cached CSS instantly
self.addEventListener('fetch', function(event) {
  // Only handle CSS and font requests
  if (event.request.url.includes('.css') || event.request.url.includes('fonts.googleapis.com') || event.request.url.includes('anti-fouc.js')) {
    event.respondWith(
      caches.match(event.request)
        .then(function(response) {
          // Return cached version if available
          if (response) {
            console.log('SW: Serving cached resource:', event.request.url);
            return response;
          }

          // Otherwise fetch and cache
          return fetch(event.request)
            .then(function(response) {
              // Don't cache if not a valid response
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }

              // Cache the response
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(function(cache) {
                  cache.put(event.request, responseToCache);
                });

              return response;
            });
        })
    );
  }
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
  console.log('SW: Activating service worker...');

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Message event - handle cache updates
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_CRITICAL_CSS') {
    // Force update critical CSS cache
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(CRITICAL_RESOURCES);
      })
      .then(function() {
        event.ports[0].postMessage({ success: true });
      })
      .catch(function(error) {
        event.ports[0].postMessage({ success: false, error: error.message });
      });
  }
});
