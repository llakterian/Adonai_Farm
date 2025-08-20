// Service Worker for Adonai Farm Management System
// Provides offline functionality and enhanced image caching

const CACHE_NAME = 'adonai-farm-v1.0.0';
const STATIC_CACHE = 'adonai-static-v1.0.0';
const DYNAMIC_CACHE = 'adonai-dynamic-v1.0.0';
const IMAGE_CACHE = 'adonai-images-v1.0.0';
const API_CACHE = 'adonai-api-v1.0.0';

// Files to cache for offline use
const STATIC_FILES = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/images/hero-farm.jpg',
  '/images/farm-2.jpg',
  '/images/farm-3.jpg',
  '/images/farm-4.jpg'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static files', error);
      })
  );

  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE &&
            cacheName !== DYNAMIC_CACHE &&
            cacheName !== IMAGE_CACHE &&
            cacheName !== API_CACHE) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Ensure the service worker takes control immediately
  self.clients.claim();
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests
  if (url.origin === location.origin) {
    // Same origin requests
    event.respondWith(handleSameOriginRequest(request));
  } else {
    // Cross-origin requests (APIs, CDNs, etc.)
    event.respondWith(handleCrossOriginRequest(request));
  }
});

// Handle same-origin requests with specialized caching strategies
async function handleSameOriginRequest(request) {
  const url = new URL(request.url);

  try {
    // For HTML pages, use network-first strategy
    if (request.headers.get('accept')?.includes('text/html')) {
      return await networkFirstStrategy(request);
    }

    // For farm images from images, use specialized image caching
    if (url.pathname.includes('/images/') && isImageRequest(request)) {
      return await imageFirstStrategy(request);
    }

    // For public images, use cache-first strategy
    if (url.pathname.includes('/images/') && isImageRequest(request)) {
      return await cacheFirstStrategy(request, IMAGE_CACHE);
    }

    // For API requests, use network-first with API cache
    if (url.pathname.includes('/api/')) {
      return await networkFirstStrategy(request, API_CACHE);
    }

    // For static assets, use cache-first strategy
    if (url.pathname.includes('/static/') ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.woff') ||
      url.pathname.endsWith('.woff2')) {
      return await cacheFirstStrategy(request);
    }

    // For other requests, use network-first strategy
    return await networkFirstStrategy(request);

  } catch (error) {
    console.error('Service Worker: Request failed', error);
    return await getOfflineFallback(request);
  }
}

// Check if request is for an image
function isImageRequest(request) {
  const url = new URL(request.url);
  return /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(url.pathname) ||
    request.headers.get('accept')?.includes('image/');
}

// Handle cross-origin requests
async function handleCrossOriginRequest(request) {
  try {
    // Try network first for cross-origin requests
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Try to serve from cache if network fails
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline fallback
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Cache-first strategy: Check cache first, then network
async function cacheFirstStrategy(request, cacheName = DYNAMIC_CACHE) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    return await getOfflineFallback(request);
  }
}

// Specialized image-first strategy for farm images
async function imageFirstStrategy(request) {
  const url = new URL(request.url);

  // Check image cache first
  const cachedResponse = await caches.match(request, { cacheName: IMAGE_CACHE });

  if (cachedResponse) {
    // Check if cached image is still fresh (24 hours)
    const cachedDate = cachedResponse.headers.get('date');
    if (cachedDate) {
      const cacheAge = Date.now() - new Date(cachedDate).getTime();
      if (cacheAge < 24 * 60 * 60 * 1000) { // 24 hours
        return cachedResponse;
      }
    }
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cache the image with extended headers
      const cache = await caches.open(IMAGE_CACHE);
      const responseToCache = networkResponse.clone();

      // Add custom headers for cache management
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cached-date', new Date().toISOString());
      headers.set('cache-control', 'public, max-age=86400'); // 24 hours

      const cachedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });

      cache.put(request, cachedResponse);
    }

    return networkResponse;
  } catch (error) {
    // If network fails, return cached version even if stale
    if (cachedResponse) {
      return cachedResponse;
    }

    // Try to find a fallback image
    return await getImageFallback(request);
  }
}

// Get fallback image for failed image requests
async function getImageFallback(request) {
  const url = new URL(request.url);
  const filename = url.pathname.split('/').pop();

  // Try to find similar images in cache
  const cache = await caches.open(IMAGE_CACHE);
  const cachedRequests = await cache.keys();

  // For animal images, try other animal images
  if (filename.startsWith('adonai')) {
    for (const cachedRequest of cachedRequests) {
      const cachedUrl = new URL(cachedRequest.url);
      const cachedFilename = cachedUrl.pathname.split('/').pop();
      if (cachedFilename.startsWith('adonai') && cachedFilename !== filename) {
        const fallbackResponse = await cache.match(cachedRequest);
        if (fallbackResponse) return fallbackResponse;
      }
    }
  }

  // For farm images, try other farm images
  if (filename.startsWith('farm-')) {
    for (const cachedRequest of cachedRequests) {
      const cachedUrl = new URL(cachedRequest.url);
      const cachedFilename = cachedUrl.pathname.split('/').pop();
      if (cachedFilename.startsWith('farm-') && cachedFilename !== filename) {
        const fallbackResponse = await cache.match(cachedRequest);
        if (fallbackResponse) return fallbackResponse;
      }
    }
  }

  // Try public images as final fallback
  const publicImageFallbacks = ['/images/hero-farm.jpg', '/images/farm-2.jpg', '/images/farm-3.jpg'];
  for (const fallbackUrl of publicImageFallbacks) {
    const fallbackResponse = await caches.match(fallbackUrl);
    if (fallbackResponse) return fallbackResponse;
  }

  // Return placeholder image
  return new Response(getPlaceholderImageSVG(), {
    headers: { 'Content-Type': 'image/svg+xml' }
  });
}

// Generate placeholder image SVG
function getPlaceholderImageSVG() {
  return `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f5f5f5" stroke="#ddd" stroke-width="2"/>
    <text x="50%" y="40%" font-family="Arial" font-size="18" fill="#999" text-anchor="middle" dy=".3em">Adonai Farm</text>
    <text x="50%" y="60%" font-family="Arial" font-size="14" fill="#bbb" text-anchor="middle" dy=".3em">Image Not Available</text>
  </svg>`;
}

// Network-first strategy: Try network first, then cache
async function networkFirstStrategy(request, cacheName = DYNAMIC_CACHE) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    return await getOfflineFallback(request);
  }
}

// Get offline fallback response
async function getOfflineFallback(request) {
  const url = new URL(request.url);

  // For HTML requests, return the main app shell
  if (request.headers.get('accept')?.includes('text/html')) {
    const cachedApp = await caches.match('/');
    if (cachedApp) {
      return cachedApp;
    }

    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Adonai Farm - Offline</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 2rem; 
              background: #f5f5dc;
              color: #2d5016;
            }
            .offline-message {
              max-width: 400px;
              margin: 2rem auto;
              padding: 2rem;
              background: white;
              border-radius: 10px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .emoji { font-size: 3rem; margin-bottom: 1rem; }
            h1 { color: #2d5016; margin-bottom: 1rem; }
            p { margin-bottom: 1rem; line-height: 1.6; }
            .btn {
              background: #2d5016;
              color: white;
              padding: 0.75rem 1.5rem;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              font-size: 1rem;
            }
          </style>
        </head>
        <body>
          <div class="offline-message">
            <div class="emoji">📱</div>
            <h1>You're Offline</h1>
            <p>Adonai Farm is currently offline. Your data is safely stored locally and will sync when you're back online.</p>
            <p>You can still view your cached data and make changes that will be synced later.</p>
            <button class="btn" onclick="window.location.reload()">Try Again</button>
          </div>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }

  // For other requests, return a simple offline response
  return new Response('Offline', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: { 'Content-Type': 'text/plain' }
  });
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);

  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineData());
  }
});

// Sync offline data when connection is restored
async function syncOfflineData() {
  try {
    // Get offline queue from IndexedDB or localStorage
    const offlineQueue = await getOfflineQueue();

    for (const item of offlineQueue) {
      try {
        await processOfflineItem(item);
        await removeFromOfflineQueue(item.id);
      } catch (error) {
        console.error('Failed to sync offline item:', item, error);
      }
    }

    console.log('Service Worker: Offline data synced successfully');
  } catch (error) {
    console.error('Service Worker: Failed to sync offline data', error);
  }
}

// Get offline queue (placeholder - would use IndexedDB in production)
async function getOfflineQueue() {
  // This would typically use IndexedDB
  // For now, return empty array as localStorage is handled by the main app
  return [];
}

// Process offline item (placeholder)
async function processOfflineItem(item) {
  // This would make actual API calls to sync data
  console.log('Processing offline item:', item);
}

// Remove item from offline queue (placeholder)
async function removeFromOfflineQueue(itemId) {
  // This would remove the item from IndexedDB
  console.log('Removing offline item:', itemId);
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');

  const options = {
    body: event.data ? event.data.text() : 'New notification from Adonai Farm',
    icon: '/images/farm-icon-192.png',
    badge: '/images/farm-badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/images/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/images/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Adonai Farm', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');

  event.notification.close();

  if (event.action === 'explore') {
    // Open the app to the notifications page
    event.waitUntil(
      clients.openWindow('/notifications')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return cache.addAll(event.data.payload);
      })
    );
  }
});

console.log('Service Worker: Loaded successfully');