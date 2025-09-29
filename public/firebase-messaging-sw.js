/* global self */
// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyBvOP2-PxtMkn8ZEkJisV83L6a7qokjafI',
  authDomain: 'myprojects-58533.firebaseapp.com',
  projectId: 'myprojects-58533',
  storageBucket: 'myprojects-58533.firebasestorage.app',
  messagingSenderId: '867095278625',
  appId: '1:867095278625:web:c4a3699664e12a84b79f60',
  measurementId: 'G-H19DZ0WW4Z'
});

const messaging = firebase.messaging();

function resolveTargetUrl(data) {
  console.log('Resolving target URL for notification data:', data);
  if (!data) return '/';
  switch (data.type) {
    case 'urgent_request':
      return '/manage/pending-requests';
    case 'urgent_request_approved':
      return '/admin/optimise-table';
    default:
      return '/';
  }
}

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  // console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notification = payload.notification || {};
  const notificationTitle = notification.title || 'Notification';
  const notificationOptions = {
    body: notification.body,
    icon: '/icons/icon-192x192.png',
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const data = event.notification?.data || {};
  const targetUrl = data.targetUrl || resolveTargetUrl(data);
  const finalUrl = targetUrl.startsWith('http')
    ? targetUrl
    : self.location.origin + (targetUrl.startsWith('/') ? targetUrl : '/' + targetUrl);

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          // Just focus the tab — Next.js will handle routing from the URL
          return client.focus();
        }
      }
      // If no client open, open new window with target route
      if (clients.openWindow) {
        return clients.openWindow(finalUrl);
      }
    })
  );
});
