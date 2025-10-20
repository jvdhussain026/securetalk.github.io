
// Firebase Cloud Messaging Service Worker (Compat build for static SW)
// NOTE: This file MUST be at "/firebase-messaging-sw.js" (root scope).

// Use compat scripts because this file is served statically (no bundler here).
// The versions should roughly match your app's firebase version.
importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-messaging-compat.js');

// Initialize Firebase for the SW context
firebase.initializeApp({
  apiKey: 'AIzaSyBeU6Ww__epaNhRcOuWxB8PUkXIygKnpbc',
  authDomain: 'studio-5333350260-99b15.firebaseapp.com',
  projectId: 'studio-5333350260-99b15',
  storageBucket: 'sec-talk-dev.appspot.com',
  messagingSenderId: '622922275285',
  appId: '1:622922275285:web:1017cfac15bce8fe2e855c',
  measurementId: 'G-1KKYCS4V7C',
});

const messaging = firebase.messaging();

// Handle background messages explicitly so notifications work when app is closed
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);
  
  // Payload shape from FCM may include notification and webpush fields
  const notification = payload.notification || {};
  const title = notification.title || 'New Notification';
  const data = payload.data || {};
  
  // Determine notification type and set appropriate options
  const isCall = data.type === 'call' || notification.tag === 'incoming-call';
  const isMessage = data.type === 'message' || notification.tag === 'new-message';
  
  const options = {
    body: notification.body || '',
    icon: notification.icon || '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: notification.tag || 'default',
    data: {
      // Use link if provided so clicks can navigate appropriately
      url: payload?.fcmOptions?.link || (isCall ? `/call?contactId=${data.contactId}&type=${data.callType || 'voice'}&status=incoming` : `/chats/${data.contactId}`),
      ...data
    },
    requireInteraction: isCall, // Calls require interaction, messages don't
    silent: false,
    vibrate: isCall ? [200, 100, 200, 100, 200] : [200, 100, 200], // Different vibration patterns
    sound: isCall ? '/sounds/ringtone.mp3' : undefined, // Add ringtone for calls
    actions: isCall ? [
      {
        action: 'accept',
        title: 'Accept',
        icon: '/icons/accept-call.png'
      },
      {
        action: 'decline', 
        title: 'Decline',
        icon: '/icons/decline-call.png'
      }
    ] : undefined
  };

  console.log('Showing notification:', title, options);
  return self.registration.showNotification(title, options);
});

// Focus an existing client or open a new one when the user clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const data = event.notification.data || {};
  const action = event.action;
  
  // Handle call actions
  if (action === 'accept' && data.contactId) {
    event.waitUntil(
      clients.openWindow(`/call?contactId=${data.contactId}&type=${data.callType || 'voice'}&status=incoming&action=accept`)
    );
    return;
  }
  
  if (action === 'decline' && data.contactId) {
    // Handle call decline - could send a signal to the caller
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        if (clientList.length > 0) {
          // Send message to existing client to handle decline
          clientList[0].postMessage({ 
            type: 'call-declined', 
            contactId: data.contactId 
          });
          return clientList[0].focus();
        } else {
          return clients.openWindow('/');
        }
      })
    );
    return;
  }
  
  // Default behavior - navigate to appropriate page
  const urlToOpen = data.url || (data.type === 'call' ? '/calls' : '/chats');
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
      return undefined;
    })
  );
});

// Listen for messages from the client to update the service worker
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
});
