
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getMessaging } from 'firebase/messaging';
import { getStorage } from 'firebase/storage';

// --- Start of Centralized Initialization ---

let firebaseApp: FirebaseApp;
if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApp();
}

const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);
const database = getDatabase(firebaseApp);

export { firebaseApp, auth, firestore, storage, database };

// --- End of Centralized Initialization ---


// IMPORTANT: DO NOT MODIFY THIS FUNCTION - It is now DEPRECATED
export function initializeFirebase() {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    return getSdks(app);
}

export function getSdks(app: FirebaseApp) {
  return {
    firebaseApp: app,
    auth: getAuth(app),
    firestore: getFirestore(app),
    database: getDatabase(app),
    storage: getStorage(app),
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
