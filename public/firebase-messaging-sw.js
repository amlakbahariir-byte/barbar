
// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
  apiKey: "AIzaSyBZYb0gopPOsLs6SO8sJkG_El7NA-7rvZM",
  authDomain: "studio-5365383067-a1636.firebaseapp.com",
  projectId: "studio-5365383067-a1636",
  storageBucket: "studio-5365383067-a1636.firebasestorage.app",
  messagingSenderId: "537281434402",
  appId: "1:537281434402:web:2e22089562af4a80008b7b"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload
  );
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png' // you can use any icon here
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
