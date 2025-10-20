// RJB TRANZ PWA Service Worker
// Progressive Web App functionality for offline support and caching

const CACHE_NAME = 'rjb-tranz-v1.0.0';
const STATIC_CACHE_NAME = 'rjb-tranz-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'rjb-tranz-dynamic-v1.0.0';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/main.css',
  '/src/index.css',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap',
  'https://i.ibb.co/6LY7bxR/rjb-logo.jpg'
];

// Assets that can be cached on demand
const CACHEABLE_ASSETS = [
  '/src/components/',
  '/src/hooks/',
  '/src/utils/',
  '/src/services/',
  'https://fonts.gstatic.com/'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('📦 Pre-caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Static assets cached successfully');
        // Force activation of new service worker
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Error caching static assets:', error);
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME && 
                cacheName !== CACHE_NAME) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
            return Promise.resolve();
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activated');
        // Take control of all open tabs immediately
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('❌ Error activating service worker:', error);
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other protocol requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          console.log('📦 Serving from cache:', event.request.url);
          
          // Update cache in background for next time
          fetch(event.request)
            .then((response) => {
              if (response.ok) {
                const responseClone = response.clone();
                caches.open(DYNAMIC_CACHE_NAME)
                  .then((cache) => {
                    cache.put(event.request, responseClone);
                  });
              }
            })
            .catch(() => {
              // Network failed, cached version already served
            });
          
          return cachedResponse;
        }

        // Not in cache, fetch from network
        return fetch(event.request)
          .then((response) => {
            // Only cache successful responses
            if (!response.ok) {
              return response;
            }

            const responseClone = response.clone();
            const url = event.request.url;

            // Cache responses for cacheable assets
            if (CACHEABLE_ASSETS.some(asset => url.includes(asset)) ||
                url.includes('fonts.googleapis.com') ||
                url.includes('fonts.gstatic.com') ||
                url.endsWith('.js') ||
                url.endsWith('.css') ||
                url.endsWith('.png') ||
                url.endsWith('.jpg') ||
                url.endsWith('.jpeg') ||
                url.endsWith('.svg') ||
                url.endsWith('.ico')) {
              
              caches.open(DYNAMIC_CACHE_NAME)
                .then((cache) => {
                  console.log('💾 Caching asset:', url);
                  cache.put(event.request, responseClone);
                });
            }

            return response;
          })
          .catch((error) => {
            console.log('🔌 Network failed for:', event.request.url);
            
            // Provide offline fallback for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            
            // For other requests, return a generic error response
            return new Response('Offline - Content not available', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Background sync event - sync data when online
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'transaction-sync') {
    event.waitUntil(
      syncTransactionData()
    );
  } else if (event.tag === 'exchange-rate-sync') {
    event.waitUntil(
      syncExchangeRates()
    );
  }
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('📢 Push notification received:', event);
  
  let notificationData = {
    title: 'RJB TRANZ',
    body: 'You have a new notification',
    icon: 'https://i.ibb.co/6LY7bxR/rjb-logo.jpg',
    badge: 'https://i.ibb.co/6LY7bxR/rjb-logo.jpg',
    tag: 'rjb-tranz-notification',
    requireInteraction: false,
    data: {
      url: '/'
    }
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (error) {
      console.error('Error parsing push data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event);
  
  event.notification.close();
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url.includes(url) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Otherwise, open new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Message event - handle messages from main app
self.addEventListener('message', (event) => {
  console.log('💬 Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }
  
  if (event.data && event.data.type === 'CACHE_CLEAR') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }).then(() => {
        event.ports[0].postMessage({ success: true });
      })
    );
    return;
  }
});

// Sync transaction data function
async function syncTransactionData() {
  try {
    console.log('🔄 Syncing transaction data...');
    
    // Get stored transaction data from IndexedDB or localStorage
    const storedData = await getStoredTransactions();
    
    if (storedData && storedData.length > 0) {
      // Send to server
      const response = await fetch('/api/transactions/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(storedData)
      });
      
      if (response.ok) {
        console.log('✅ Transaction data synced successfully');
        await clearStoredTransactions();
        
        // Notify main app of successful sync
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'SYNC_COMPLETE',
            data: { transactions: storedData.length }
          });
        });
      }
    }
  } catch (error) {
    console.error('❌ Error syncing transaction data:', error);
  }
}

// Sync exchange rates function
async function syncExchangeRates() {
  try {
    console.log('🔄 Syncing exchange rates...');
    
    const response = await fetch('/api/exchange-rates');
    if (response.ok) {
      const rates = await response.json();
      
      // Store in cache for offline use
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      await cache.put('/api/exchange-rates', new Response(JSON.stringify(rates)));
      
      console.log('✅ Exchange rates synced successfully');
    }
  } catch (error) {
    console.error('❌ Error syncing exchange rates:', error);
  }
}

// Helper functions for data storage
async function getStoredTransactions() {
  // In a real app, this would read from IndexedDB
  return [];
}

async function clearStoredTransactions() {
  // In a real app, this would clear IndexedDB data
  return true;
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('⏰ Periodic sync triggered:', event.tag);
  
  if (event.tag === 'exchange-rates-update') {
    event.waitUntil(syncExchangeRates());
  }
});

console.log('🚀 RJB TRANZ Service Worker loaded successfully');