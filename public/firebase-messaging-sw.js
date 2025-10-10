
// This service worker is dedicated to handling Firebase Cloud Messaging push notifications.

// Import the Firebase app and messaging modules
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging/sw";

// IMPORTANT: Do not use the firebaseConfig from your project here.
// Firebase will automatically handle initialization when this script is
// deployed with Firebase Hosting. For local development, you might need
// to manually provide the config.
const firebaseConfig = {
  apiKey: "AIzaSyBeU6Ww__epaNhRcOuWxB8PUkXIygKnpbc",
  authDomain: "studio-5333350260-99b15.firebaseapp.com",
  projectId: "studio-5333350260-99b15",
  storageBucket: "studio-5333350260-99b15.appspot.com",
  messagingSenderId: "622922275285",
  appId: "1:622922275285:web:1017cfac15bce8fe2e855c",
  measurementId: "G-1KKYCS4V7C"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Background message handler - this is where you can customize notifications
// when your app is in the background or closed.
// For now, we will let FCM handle it automatically.
// You can add custom logic here later if needed.

self.addEventListener('install', function(event) {
  console.log('FCM Service Worker installed.');
});

self.addEventListener('activate', function(event) {
  console.log('FCM Service Worker activated.');
});
