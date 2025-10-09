// This is a basic service worker that allows the app to be installed and handles push notifications.

// Install event: cache necessary assets (optional, but good for offline capability)
self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  // You can add caching strategies here if needed.
  // event.waitUntil(
  //   caches.open('v1').then((cache) => {
  //     return cache.addAll([
  //       // list of assets to cache
  //     ]);
  //   })
  // );
});

// Activate event: clean up old caches (optional)
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
});

// Fetch event: serve from cache if available (optional)
self.addEventListener('fetch', (event) => {
  // You can add fetch event listeners here, e.g., for caching strategies.
});

// THIS IS THE PUSH NOTIFICATION LISTENER
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Received.');
  if (!event.data) {
    console.error('[Service Worker] Push event but no data');
    return;
  }
  
  try {
    const data = event.data.json();
    console.log('[Service Worker] Push data: ', data);
    
    const title = data.title || 'Secure Talk';
    const options = {
      body: data.body || 'You have a new message.',
      icon: data.icon || '/icons/icon-192x192.png',
      badge: data.badge || '/icons/icon-96x96.png', // Badge for the notification bar
      tag: data.tag || 'default-tag', // Used to group notifications
      renotify: true, // Vibrate/play sound for a new notification even if one with the same tag exists.
      data: {
        url: data.url || '/', // URL to open on notification click
      },
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (e) {
    console.error('Error processing push data:', e);
     // Fallback for non-JSON data
    const title = 'Secure Talk';
    const options = {
      body: event.data.text(),
      icon: '/icons/icon-192x192.png',
    };
    event.waitUntil(self.registration.showNotification(title, options));
  }
});


// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click Received.');
  event.notification.close();

  const urlToOpen = event.notification.data.url || '/';

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    }).then((clientList) => {
      // If a window for the app is already open, focus it.
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window.
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
