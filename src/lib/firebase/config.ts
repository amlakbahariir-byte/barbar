
// @ts-nocheck
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  "projectId": "barbarv2-77183437-30c60",
  "appId": "1:1071435216491:web:ff4af89f38fdae3142232e",
  "apiKey": "AIzaSyAS6jOtuO4_nQ9EcNxb6aPy5QnNTV1OHNI",
  "authDomain": "barbarv2-77183437-30c60.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "1071435216491"
};


const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth: Auth = getAuth(app);

export { app, auth };
