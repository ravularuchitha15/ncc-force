const { initializeApp, getApps, getApp, cert } = require('firebase-admin/app');
const { getAuth: fbGetAuth } = require('firebase-admin/auth');
const { getStorage: fbGetStorage } = require('firebase-admin/storage');
const { getMessaging: fbGetMessaging } = require('firebase-admin/messaging');
const adminSdk = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let isInitialized = false;
let authInstance = null;
let storageInstance = null;
let messagingInstance = null;

const initFirebase = () => {
  if (getApps().length > 0) {
    isInitialized = true;
    try { authInstance = fbGetAuth(); } catch (_) {}
    try { storageInstance = fbGetStorage(); } catch (_) {}
    try { messagingInstance = fbGetMessaging(); } catch (_) {}
    return;
  }

  let credential = null;
  const serviceAccountPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
    path.join(process.cwd(), 'serviceAccountKey.json');

  // 1. Try file-based service account
  if (fs.existsSync(serviceAccountPath)) {
    try {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      credential = cert(serviceAccount);
    } catch (err) {
      if (process.env.NODE_ENV !== 'test') {
        console.warn(`[Firebase] Failed to parse service account from ${serviceAccountPath}: ${err.message}`);
      }
    }
  }

  // 2. Try inline environment variables if file not loaded
  if (
    !credential &&
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    try {
      credential = cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      });
    } catch (err) {
      if (process.env.NODE_ENV !== 'test') {
        console.warn(`[Firebase] Failed to initialize credentials from environment variables: ${err.message}`);
      }
    }
  }

  if (credential) {
    try {
      const config = { credential };
      if (process.env.FIREBASE_STORAGE_BUCKET) {
        config.storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
      }

      initializeApp(config);
      isInitialized = true;
      try { authInstance = fbGetAuth(); } catch (_) {}
      try { storageInstance = fbGetStorage(); } catch (_) {}
      try { messagingInstance = fbGetMessaging(); } catch (_) {}

      if (process.env.NODE_ENV !== 'test') {
        console.log('✔ [Firebase] Admin SDK initialized successfully');
      }
    } catch (err) {
      if (process.env.NODE_ENV !== 'test') {
        console.warn(`[Firebase] Initialization error: ${err.message}`);
      }
    }
  } else {
    if (process.env.NODE_ENV !== 'test') {
      console.log('ℹ [Firebase] Running in unconfigured/local fallback mode (set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY in .env)');
    }
  }
};

initFirebase();

const isFirebaseReady = () => isInitialized && getApps().length > 0;

const getAuthService = () => {
  if (!isFirebaseReady()) return null;
  return authInstance || fbGetAuth();
};

const getStorageService = () => {
  if (!isFirebaseReady()) return null;
  return storageInstance || fbGetStorage();
};

const getMessagingService = () => {
  if (!isFirebaseReady()) return null;
  return messagingInstance || fbGetMessaging();
};

const getBucketService = () => {
  const st = getStorageService();
  return st ? st.bucket(process.env.FIREBASE_STORAGE_BUCKET || undefined) : null;
};

// Unified admin compatibility object
const admin = {
  ...adminSdk,
  initializeApp,
  getApps,
  getApp,
  cert,
  auth: () => getAuthService(),
  storage: () => getStorageService(),
  messaging: () => getMessagingService(),
  credential: { cert }
};

module.exports = {
  admin,
  getAuth: getAuthService,
  getStorage: getStorageService,
  getMessaging: getMessagingService,
  get auth() {
    return getAuthService();
  },
  get storage() {
    return getStorageService();
  },
  get bucket() {
    return getBucketService();
  },
  get messaging() {
    return getMessagingService();
  },
  isFirebaseReady,
  initFirebase
};
