"use client";
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { requestNotificationPermissionAndToken, onForegroundMessage } from '@/lib/firebase';
import notificationService from '@/app/service/api/notifications';

export default function NotificationsInit() {
  const { data: session, status } = useSession();
  const [registered, setRegistered] = useState(false);

  // Register service worker (firebase messaging) once
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    (async () => {
      try {
        // Avoid duplicate registration
        const registrations = await navigator.serviceWorker.getRegistrations();
        const already = registrations.find(r => r.active && r.active.scriptURL.includes('firebase-messaging-sw.js'));
        if (already) return; // already registered
        await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        // console.log('Firebase messaging SW registered');
      } catch (e) {
        console.error('Failed registering firebase-messaging-sw.js', e);
      }
    })();
  }, []);

  useEffect(() => {
    if (status !== 'authenticated' || registered) return;
    (async () => {
      try {
        const token = await requestNotificationPermissionAndToken();
        if (!token) return;
        await notificationService.registerToken(token);
        setRegistered(true);
      } catch (e) {
        console.error('Notification registration failed', e);
      }
    })();
  }, [status, registered]);

  useEffect(() => {
    const unsubscribe = onForegroundMessage((payload) => {
      const { notification } = payload; // standard FCM shape
      if (notification?.title) {
        // Show native notification if permission is granted and page visible
        if (Notification.permission === 'granted' && document.visibilityState === 'visible') {
          new Notification(notification.title, {
            body: notification.body,
            icon: '/icons/icon-192x192.png'
          });
        }
      }
    });
    return () => { (unsubscribe as any)?.(); };
  }, []);

  return null;
}
