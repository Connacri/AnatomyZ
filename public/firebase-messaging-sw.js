/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCNKtoSOjKzAf1hS72VLM_flLcPt8PNof8",
  authDomain: "mega-inscriber-xcbh2.firebaseapp.com",
  projectId: "mega-inscriber-xcbh2",
  storageBucket: "mega-inscriber-xcbh2.firebasestorage.app",
  messagingSenderId: "254886564090",
  appId: "1:254886564090:web:e4214f7d6ba7a1a0baf943"
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
