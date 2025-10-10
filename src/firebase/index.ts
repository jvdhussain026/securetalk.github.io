
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'
import { getDatabase } from 'firebase/database';
import { getMessaging } from 'firebase/messaging';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  let app;
  if (!getApps().length) {
    // In a Firebase App Hosting context, the config is provided automatically.
    // In other contexts, you must provide a config object.
    try {
        app = initializeApp();
    } catch (e) {
        console.warn("Automatic Firebase initialization failed. This is expected in a local development environment. Falling back to the provided firebaseConfig.", e);
        app = initializeApp(firebaseConfig);
    }
  } else {
    app = getApp();
  }
  return getSdks(app);
}

export function getSdks(firebaseApp: FirebaseApp) {
  const isClient = typeof window !== 'undefined';
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
    database: getDatabase(firebaseApp),
    // Only initialize messaging on the client side
    messaging: isClient ? getMessaging(firebaseApp) : null,
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './non-blocking-reads';
export * from './errors';
export * from './error-emitter';


