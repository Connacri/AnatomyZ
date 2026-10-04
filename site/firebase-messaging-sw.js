/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAhQIRfoN39v_5xuESaacbsZmgMlmdqz5U",
  authDomain: "gen-lang-client-0479958060.firebaseapp.com",
  projectId: "gen-lang-client-0479958060",
  storageBucket: "gen-lang-client-0479958060.firebasestorage.app",
  messagingSenderId: "986358610101",
  appId: "1:986358610101:web:c5207407fb1477d666a6fc"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message received: ', payload);
  const notificationTitle = payload.notification?.title || payload.data?.title || 'AnatomyZ';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'Nouvelle notification AnatomyZ.',
    icon: '/icon.png',
    badge: '/favicon.png',
    data: payload.data || {},
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
