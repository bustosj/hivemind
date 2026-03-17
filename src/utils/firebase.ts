// ─────────────────────────────────────────
//  Firebase — Config & Initialization
//
//  HOW TO SET UP:
//  1. Go to https://console.firebase.google.com
//  2. Create a new project called "hivemind"
//  3. Add an Android app (use package: com.hivemind.app)
//  4. Copy your config values below
//  5. Enable: Authentication (Google), Firestore, Cloud Messaging
// ─────────────────────────────────────────

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// 🔑 Replace these with your Firebase project values
const firebaseConfig = {
  apiKey:            'YOUR_API_KEY',
  authDomain:        'YOUR_PROJECT.firebaseapp.com',
  projectId:         'YOUR_PROJECT_ID',
  storageBucket:     'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId:             'YOUR_APP_ID',
};

const app  = initializeApp(firebaseConfig);

export const db      = getFirestore(app);
export const auth    = getAuth(app);
export default app;

// ── Firestore Collection Paths ────────────
//
//  users/{userId}
//  users/{userId}/reminders/{reminderId}
//  users/{userId}/checklists/{checklistId}
//  punchCards/{cardId}          ← top-level so both partners can write
//  partners/{pairId}            ← link record between two users
//
