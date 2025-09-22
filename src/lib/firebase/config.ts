
// @ts-nocheck
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBZYb0gopPOsLs6SO8sJkG_El7NA-7rvZM",
  authDomain: "studio-5365383067-a1636.firebaseapp.com",
  projectId: "studio-5365383067-a1636",
  storageBucket: "studio-5365383067-a1636.firebasestorage.app",
  messagingSenderId: "537281434402",
  appId: "1:537281434402:web:2e22089562af4a80008b7b"
};


const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth: Auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
