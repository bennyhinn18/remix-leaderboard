const CACHE_NAME = "fitness-center-v1";
const urlsToCache = [
  "/",
  "/index.css",
  "/manifest.json",
  "/icon-192x192.png",
  "/icon-512x512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  console.log('Service Worker installed');
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});

// Push event handler - this will be triggered when a push notification is received
self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');
  console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

  let notificationData = {};
  try {
    notificationData = event.data.json();
  } catch (e) {
    notificationData = {
      title: 'Byte Bash Blitz',
      body: event.data.text(),
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

  event.waitUntil(self.registration.showNotification(title, options));
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