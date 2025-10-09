
// This gives the service worker access to all the APIs
// that it needs to function.
self.importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js'
);

// This code listens for the user's confirmation to update the app.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// The precacheAndRoute() method efficiently caches and responds to
// requests for URLs in the manifest.
// See https://goo.gl/S9QRab
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);

// Listen for push events
self.addEventListener('push', (event) => {
  let payload;
  try {
    payload = event.data ? event.data.json() : { title: 'Secure Talk', body: 'You have a new message.' };
  } catch (e) {
    console.error('Error parsing push notification payload:', e);
    payload = { title: 'Secure Talk', body: 'You have a new message.' };
  }

  const { title, body, icon, badge, tag } = payload;

  const options = {
    body,
    icon: icon || '/icons/icon-192x192.png',
    badge: badge || '/icons/badge-72x72.png',
    tag: tag || 'default-tag',
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});


// Listen for notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        // If a window for the app is already open, focus it
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

