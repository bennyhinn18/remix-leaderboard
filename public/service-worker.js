// Version should be updated with each deployment to force cache refresh
const CACHE_VERSION = "Basher Terminal v2.1.0";
const CACHE_NAME = `${CACHE_VERSION}`;

const urlsToCache = [
  "/",
  "/manifest.webmanifest",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// Install event - cache resources and skip waiting
self.addEventListener("install", (event) => {
  console.log(`[SW] Installing version ${CACHE_VERSION}`);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log(`[SW] Caching resources for ${CACHE_VERSION}`);
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Force the new service worker to activate immediately
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches and claim clients
self.addEventListener("activate", (event) => {
  console.log(`[SW] Activating version ${CACHE_VERSION}`);
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log(`[SW] Deleting old cache: ${cacheName}`);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients immediately
      self.clients.claim()
    ]).then(() => {
      console.log(`[SW] Version ${CACHE_VERSION} is now active`);
      
      // Notify all clients about the update
      return self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SW_UPDATED',
            version: CACHE_VERSION
          });
        });
      });
    })
  );
});

// Fetch event - network first for HTML, cache first for assets
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip requests to different origins
  if (url.origin !== self.location.origin) {
    return;
  }
  
  // Network first strategy for HTML pages and API calls
  if (request.headers.get('accept')?.includes('text/html') || 
      url.pathname.startsWith('/api/') ||
      url.pathname.includes('?')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request);
        })
    );
  } 
  // Cache first strategy for static assets
  else {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response;
        }
        return fetch(request).then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
  }
});

// Message event - handle messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Received SKIP_WAITING message');
    self.skipWaiting();
  }
});

// Push event handler - this will be triggered when a push notification is received
self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');
  console.log(`[Service Worker] Push had this data: "${event.data ? event.data.text() : 'No data'}"`);

  // Check if we have permission first
  if (self.Notification && self.Notification.permission !== 'granted') {
    console.log('[SW] No notification permission, skipping notification display');
    return;
  }

  let notificationData = {};
  try {
    if (event.data) {
      notificationData = event.data.json();
    }
  } catch (e) {
    notificationData = {
      title: 'Byte Bash Blitz',
      body: event.data ? event.data.text() : 'Something new happened!',
      icon: '/icons/icon-192x192.png'
    };
  }

  const title = notificationData.title || 'Byte Bash Blitz';
  const options = {
    body: notificationData.body || 'Something new happened!',
    icon: notificationData.icon || '/icons/icon-192x192.png',
    badge: '/icons/badge-96x96.png',
    data: {
      url: notificationData.url || '/',
      actionUrl: notificationData.actionUrl
    },
    actions: notificationData.actions || [],
    vibrate: [100, 50, 100]
  };

  event.waitUntil(
    self.registration.showNotification(title, options).catch(error => {
      console.log('[SW] Failed to show notification:', error.message);
      // Send message to client about the notification failure
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'NOTIFICATION_FAILED',
            error: error.message
          });
        });
      });
    })
  );
});

// Notification click handler - opens the relevant page when notification is clicked
self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click received.');

  event.notification.close();

  // Handle notification click - either go to a specific URL or the default URL
  const clickUrl = event.notification.data?.url || '/';
  
  // If the action is clicked, use that URL instead
  if (event.action) {
    const action = event.notification.data.actions?.find(a => a.action === event.action);
    if (action && action.url) {
      event.waitUntil(clients.openWindow(action.url));
      return;
    }
  }

  // This looks to see if the current window is already open and focuses if it is
  event.waitUntil(
    clients.matchAll({
      type: 'window'
    })
    .then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.includes(self.location.origin) && 'focus' in client)
          return client.focus();
      }
      if (clients.openWindow) {
        return clients.openWindow(clickUrl);
      }
    })
  );
});