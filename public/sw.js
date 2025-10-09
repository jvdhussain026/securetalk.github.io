
// This is a custom service worker.
// `next-pwa` will use this as a base and add its own caching logic on top.

// Listen for the 'push' event
self.addEventListener('push', function(event) {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error('Push event data is not valid JSON:', event.data.text());
      data = { title: 'New Message', body: event.data.text() };
    }
  }

  const title = data.title || 'Secure Talk';
  const options = {
    body: data.body || 'You have a new message.',
    icon: '/icons/icon-192x192.png', // Path to an icon
    badge: '/icons/badge-72x72.png', // Path to a badge icon
    data: {
      url: data.url || '/', // URL to open on click
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Listen for notification click
self.addEventListener('notificationclick', function(event) {
  event.notification.close(); // Close the notification

  const urlToOpen = event.notification.data.url || '/';

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    }).then(function(clientList) {
      // If a window for the app is already open, focus it
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// This is required to make the service worker installable
self.addEventListener('fetch', function(event) {
  // You can add custom fetch handling here if needed
  // For now, we'll let next-pwa handle it.
});
