const CACHE_NAME = 'admin-dashboard-v1';
const ADMIN_CACHE_NAME = 'admin-dashboard-admin-v1';
const API_CACHE_NAME = 'admin-dashboard-api-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/admin',
  '/admin/dashboard',
  '/admin/calendar',
  '/admin/files',
  '/admin/personnel',
  '/admin/projects',
  '/admin/clients',
  '/admin/invoices',
  '/admin/quotations',
  '/admin/services',
  '/admin/tasks',
  '/admin/reports',
  '/admin/settings',
  '/manifest.json'
];

// Admin-specific assets that should always be cached
const ADMIN_ASSETS = [
  '/admin/dashboard',
  '/admin/calendar',
  '/admin/files',
  '/admin/personnel'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(CACHE_NAME).then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Cache admin-specific assets
      caches.open(ADMIN_CACHE_NAME).then((cache) => {
        console.log('Caching admin assets');
        return cache.addAll(ADMIN_ASSETS);
      })
    ]).then(() => {
      // Force the waiting service worker to become the active service worker
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches
          if (cacheName !== CACHE_NAME && 
              cacheName !== ADMIN_CACHE_NAME && 
              cacheName !== API_CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - handle network requests with different strategies
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // Different caching strategies based on request type
  if (url.pathname.startsWith('/admin')) {
    // Admin pages - Cache First with Network Fallback
    event.respondWith(adminCacheFirst(event.request));
  } else if (url.pathname.startsWith('/api/')) {
    // API requests - Network First with Cache Fallback
    event.respondWith(networkFirstWithCache(event.request));
  } else if (isStaticAsset(url.pathname)) {
    // Static assets - Cache First
    event.respondWith(cacheFirst(event.request));
  } else {
    // Other requests - Network First
    event.respondWith(networkFirst(event.request));
  }
});

// Cache First strategy (for admin pages and static assets)
async function cacheFirst(request) {
  try {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    
    const response = await fetch(request);
    if (response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    return new Response('Offline - Content not available', { 
      status: 503, 
      statusText: 'Service Unavailable' 
    });
  }
}

// Admin Cache First strategy (optimized for admin dashboard)
async function adminCacheFirst(request) {
  try {
    const cached = await caches.match(request);
    if (cached) {
      // Return cached version immediately
      return cached;
    }
    
    const response = await fetch(request);
    if (response.status === 200) {
      const cache = await caches.open(ADMIN_CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('Admin cache first strategy failed:', error);
    // Return offline admin page if available
    const offlinePage = await caches.match('/admin');
    if (offlinePage) {
      return offlinePage;
    }
    
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Admin Dashboard - Offline</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .container { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .icon { font-size: 48px; margin-bottom: 20px; }
            h1 { color: #333; margin-bottom: 15px; }
            p { color: #666; margin-bottom: 20px; }
            .button { display: inline-block; background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">🏗️</div>
            <h1>Admin Dashboard Offline</h1>
            <p>You're currently offline. Some features may not be available until you reconnect to the internet.</p>
            <a href="/admin" class="button" onclick="window.location.reload()">Try Again</a>
          </div>
        </body>
      </html>
      `,
      { 
        status: 200, 
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

// Network First strategy (for dynamic content)
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    
    console.error('Network first strategy failed:', error);
    return new Response('Offline - Content not available', { 
      status: 503, 
      statusText: 'Service Unavailable' 
    });
  }
}

// Network First with Cache for API requests
async function networkFirstWithCache(request) {
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    
    console.error('API request failed:', error);
    return new Response(JSON.stringify({ 
      error: 'Offline', 
      message: 'This feature is not available offline' 
    }), { 
      status: 503, 
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Check if the request is for a static asset
function isStaticAsset(pathname) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2'];
  return staticExtensions.some(ext => pathname.endsWith(ext));
}

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Sync any pending data when connection is restored
  console.log('Performing background sync...');
  
  // This could include:
  // - Uploading files that were queued while offline
  // - Syncing form submissions
  // - Updating cached data
  
  try {
    // Example: Sync pending admin actions
    const pendingActions = await getStoredPendingActions();
    for (const action of pendingActions) {
      await syncAction(action);
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function getStoredPendingActions() {
  // Retrieve pending actions from IndexedDB or localStorage
  return [];
}

async function syncAction(action) {
  // Sync individual action
  console.log('Syncing action:', action);
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Admin Dashboard Notification';
  const body = data.body || 'You have a new notification';
  const icon = data.icon || '/icon-192x192.png';
  const badge = data.badge || '/badge-72x72.png';
  
  const options = {
    body,
    icon,
    badge,
    vibrate: [100, 50, 100],
    data: data.data || {},
    actions: [
      {
        action: 'open',
        title: 'Open Dashboard',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Dismiss',
        icon: '/close-icon.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/admin/dashboard')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default action - open admin dashboard
    event.waitUntil(
      clients.openWindow('/admin')
    );
  }
});

// Message handling for communication with the main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

console.log('Service Worker loaded successfully');