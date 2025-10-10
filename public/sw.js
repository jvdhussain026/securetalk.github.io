// This is a basic service worker for handling push notifications.

self.addEventListener('push', (event) => {
  const data = event.data.json();
  const title = data.notification.title || 'New Notification';
  const options = {
    body: data.notification.body || 'You have a new message.',
    icon: data.webpush.notification.icon || '/icon-192x192.png',
    badge: data.webpush.notification.badge,
    tag: data.webpush.notification.tag,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // This example focuses on the push notification, and does not handle clicks yet.
  // In a real app, you would define behavior here, like focusing a window.
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientsArr) => {
      const hadWindowToFocus = clientsArr.some((windowClient) =>
        windowClient.url.includes('/') ? (windowClient.focus(), true) : false
      );

      if (!hadWindowToFocus) {
        clients.openWindow('/').then((windowClient) => (windowClient ? windowClient.focus() : null));
      }
    })
  );
});
