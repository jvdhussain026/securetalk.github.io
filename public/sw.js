
// This is a basic service worker file for handling push notifications.

self.addEventListener('push', (event) => {
  const data = event.data.json();
  const title = data.title || 'New Message';
  const options = {
    body: data.body || 'You have a new message.',
    icon: '/icon-192x192.png', // Path to your app's icon
    badge: '/badge-72x72.png', // Path to a smaller badge icon
    data: {
      url: data.url || '/', // URL to open when notification is clicked
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data.url || '/';

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (const c of clientList) {
            if (c.focused) {
                client = c;
            }
        }
        if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
        } else if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
        }
      }
      return clients.openWindow(urlToOpen);
    })
  );
});
