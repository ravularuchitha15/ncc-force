import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

export const firebaseConfig = {
  apiKey: 'AIzaSyDVg84-Ybq8vTJQKiFzxv_h_FtV65e6aBM',
  authDomain: 'ncc-force-7acd3.firebaseapp.com',
  projectId: 'ncc-force-7acd3',
  storageBucket: 'ncc-force-7acd3.firebasestorage.app',
  messagingSenderId: '203200358376',
  appId: '1:203200358376:web:58e4ea4a38c6f77fcba65d',
  measurementId: 'G-01BY1X0HFE',
};

// Initialize Firebase
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Optional browser analytics
export let analytics = null;
if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {});
}

export default app;
