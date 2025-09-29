// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: 'AIzaSyBvOP2-PxtMkn8ZEkJisV83L6a7qokjafI',
  authDomain: 'myprojects-58533.firebaseapp.com',
  projectId: 'myprojects-58533',
  storageBucket: 'myprojects-58533.firebasestorage.app',
  messagingSenderId: '867095278625',
  appId: '1:867095278625:web:c4a3699664e12a84b79f60',
  measurementId: 'G-H19DZ0WW4Z'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

let messaging: Messaging | null = null;
if (typeof window !== 'undefined') {
  try {
    messaging = getMessaging(app);
  } catch (err) {
    console.error('Failed to init Firebase messaging', err);
  }
}

export const requestNotificationPermissionAndToken = async (): Promise<string | null> => {
  if (!messaging) return null;
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.warn('Missing NEXT_PUBLIC_FIREBASE_VAPID_KEY');
      return null;
    }
    const token = await getToken(messaging, { vapidKey });
    return token || null;
  } catch (e) {
    console.error('Error getting FCM token', e);
    return null;
  }
};

export const onForegroundMessage = (cb: (payload: any) => void) => {
  if (!messaging) return () => {};
  return onMessage(messaging, (payload) => {
    cb(payload);
  });
};

export { app };
