# HiveMind 🐝
### A cute couple reminder app with shared checklists & punch card streaks

Dark honey theme · Google Calendar sync · Live Firebase sync · Partner punch cards

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Firebase
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project → name it **hivemind**
3. Add an **Android app** with package `com.hivemind.app`
4. Download `google-services.json` → put it in the project root
5. Enable these Firebase services:
   - **Authentication** → Sign-in method → Google
   - **Firestore Database** → Start in production mode
   - **Cloud Messaging** (for partner push notifications)
6. Copy your config values into `src/utils/firebase.ts`

### 3. Set up Google OAuth (for sign-in)
1. Go to [console.cloud.google.com](https://console.cloud.google.com) → same project
2. APIs & Services → Credentials → Create Credential → OAuth Client ID
3. Create one for **Android** (use SHA-1 from `keytool`), one for **iOS**, one for **Web**
4. Paste the client IDs into `src/hooks/useGoogleAuth.ts`

### 4. Deploy Firestore security rules
```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

### 5. Run
```bash
npm start         # Expo dev server
npm run android   # Android
npm run ios       # iOS (macOS only)
```

---

## Auth & Partner Linking Flow

```
App opens
  └─ AuthGate checks Firebase Auth state
       ├─ loading         → 🐝 animated splash
       ├─ unauthenticated → WelcomeScreen  (Google sign-in)
       ├─ needs-partner   → PartnerLinkScreen
       │    ├─ "invite partner" tab → generates 6-char code, 24hr expiry
       │    │    └─ share via system share sheet or clipboard copy
       │    └─ "enter a code" tab  → 6 animated input boxes
       │         └─ validates → links both users → 🎉 celebration screen
       └─ authenticated   → main tab app (Home / Calendar / Lists / Streaks / Profile)
```

**How invite codes work:**
1. User A taps "invite partner" → `makeInviteCode()` generates e.g. `HB7K2Q`
2. Code stored in `/invites/HB7K2Q` with `createdBy`, `expiresAt` (24hr), `used: false`
3. User B enters `HB7K2Q` → validation: exists ✓, not used ✓, not expired ✓, not own code ✓
4. Both `/users/{id}` docs updated: `partnerId` + `partnerLinked: true`
5. `/partners/{pairId}` record created (pairId = sorted UIDs joined by `_`)
6. Invite marked `used: true` — can't be reused
7. Firestore `participants` arrays now populated → all queries work for both partners

---

## Project Structure

```
hivemind/
├── app/                          # Expo Router screens
│   ├── _layout.tsx               # Root layout + AuthGate
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Tab bar (Home/Cal/Lists/Streaks/Profile)
│   │   ├── index.tsx             # 🏠 Home — reminders feed
│   │   ├── calendar.tsx          # 📅 Calendar — Google Calendar sync
│   │   ├── lists.tsx             # ☑️  Lists — shared checklists
│   │   ├── streaks.tsx           # 🐝 Streaks — punch cards
│   │   └── profile.tsx           # 🍯 Profile — account & partner settings
│   ├── streak/
│   │   ├── [id].tsx              # Punch card detail
│   │   └── new.tsx               # Create punch card
│   └── reminder/
│       └── new.tsx               # Create reminder / checklist / event
│
├── src/
│   ├── theme/index.ts            # Colors, typography, spacing tokens
│   ├── types/index.ts            # TypeScript data models
│   ├── hooks/
│   │   └── useGoogleAuth.ts      # expo-auth-session Google OAuth hook
│   ├── store/
│   │   ├── authStore.ts          # Auth state + partner linking (Zustand)
│   │   ├── reminderStore.ts      # Reminders CRUD + calendar sync
│   │   ├── checklistStore.ts     # Checklists + real-time item toggle
│   │   └── punchCardStore.ts     # Punch cards + punching logic
│   ├── components/
│   │   ├── AuthGate.tsx          # Auth router (loading/unauth/needs-partner/authed)
│   │   └── PunchCard.tsx         # Punch card UI component
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── WelcomeScreen.tsx      # Google sign-in + floating bees
│   │   │   ├── PartnerLinkScreen.tsx  # Invite / enter code tabs
│   │   │   └── ProfileScreen.tsx      # Account, partner, notifications
│   │   ├── StreaksScreen.tsx          # Punch card feed
│   │   ├── CreatePunchCardScreen.tsx  # New punch card form
│   │   └── CreateReminderScreen.tsx   # New reminder / checklist / event
│   └── utils/
│       ├── firebase.ts           # Firebase init (fill in your keys)
│       ├── notifications.ts      # Expo notifications + FCM partner push
│       └── calendar.ts           # Google Calendar via expo-calendar
│
├── firestore.rules               # Security rules (deploy these!)
├── app.config.ts                 # Expo app config
└── package.json
```

---

## Features

### 🔐 Auth (new)
- Google Sign-In via `expo-auth-session`
- Persistent sessions via Firebase Auth
- `AuthGate` component automatically routes to the right screen

### 🔗 Partner Linking (new)
- Generate a 6-character invite code (e.g. `HB7K2Q`)
- 24-hour expiry, single-use
- Animated 6-box code entry
- Instant celebration screen on success
- Unlink from Profile screen

### 🏠 Home
- Greets you by first name, real-time from Firebase
- Reminder feed with shared/mine/partner/lists filters
- Streak teaser banner linking to Streaks tab

### 📅 Calendar
- Mini calendar with per-day event dots (shared/mine/partner)
- Google Calendar sync via `expo-calendar`

### ☑️ Lists
- Real-time Firestore sync — partner sees checks instantly
- Per-item attribution, live "partner is viewing" indicator
- Activity feed with push notifications

### 🎫 Streaks (Punch Cards)
- Physical punch card design with perforations & notches
- Customizable goal, emoji, punch count, reward
- Per-punch avatar attribution
- Completion with "reward unlocked" state

### 🍯 Profile (new)
- Linked partner display card
- Per-notification-type toggles
- Partner unlink with confirmation
- Sign out

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React Native + Expo SDK 52 |
| Navigation | Expo Router v4 (file-based) |
| Auth | Firebase Auth + expo-auth-session (Google OAuth) |
| State | Zustand |
| Database | Firebase Firestore (real-time listeners) |
| Push | Expo Notifications + FCM |
| Calendar | expo-calendar |
| Fonts | Syne (display) + Nunito (body) |
| Animations | React Native Animated API |
