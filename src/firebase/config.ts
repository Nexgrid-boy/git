import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Load config from firebase-applet-config.json or environment
import configJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: configJson.apiKey,
  authDomain: configJson.authDomain,
  projectId: configJson.projectId,
  storageBucket: configJson.storageBucket,
  messagingSenderId: configJson.messagingSenderId,
  appId: configJson.appId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;
