
// @ts-nocheck
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  "projectId": "studio-1766914539-f6cf7",
  "appId": "1:929997868052:web:aee9050443c82fcaa76b01",
  "apiKey": "AIzaSyCaig6O-U9o7xzi50L9NVmgH97XvoAfutI",
  "authDomain": "studio-1766914539-f6cf7.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "929997868052"
};


const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth: Auth = getAuth(app);

export { app, auth };
