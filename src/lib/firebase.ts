// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  "projectId": "studio-5333350260-99b15",
  "appId": "1:622922275285:web:1017cfac15bce8fe2e855c",
  "apiKey": "AIzaSyBeU6Ww__epaNhRcOuWxB8PUkXIygKnpbc",
  "authDomain": "studio-5333350260-99b15.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "622922275285"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
