// lib/firebase.js
// Client-side Firebase config for Phone (OTP) Authentication.
// Values come from NEXT_PUBLIC_* env vars so they are safe to expose to the browser
// (Firebase web API keys are not secret — see Firebase docs) but are still kept out
// of source control by living in .env.local.

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Next.js can re-run this module in dev (hot reload) — guard against
// "Firebase App named '[DEFAULT]' already exists" errors.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
