# Setup

## 1. Tools

- Node 20 and npm 10.
- Java 17+ (JDK) — needed by the Firebase emulators and the Android build.
- Android Studio with Android SDK (API 34+), and a Samsung or Redmi phone on Android 14+ with USB debugging.

```sh
npm install          # installs all workspaces
npm test             # runs tests in every workspace
npm run typecheck
npm run lint
```

## 2. Firebase dev project (one time)

1. Create project **`daivam-dev`** in the Firebase console.
2. Upgrade to **Blaze** (needed for Cloud Functions and task queues). In Google Cloud Billing → Budgets, set a **budget alert at ₹100**.
3. Authentication → Sign-in method → enable **Phone**. Add **test phone numbers** with fixed OTPs (no real SMS in dev).
4. Firestore → create database in `asia-south1`.
5. Add an Android app with package `org.daivam.dmr`. Download `google-services.json` to `apps/mobile/` — **never commit it** (it is in `.gitignore`).
6. Google Cloud console → enable **Maps SDK for Android only**. Create an API key restricted to Android apps (`org.daivam.dmr` + your SHA-1) and to Maps SDK for Android. Set a daily quota cap. Do **not** enable Places, Geocoding, Directions or Distance Matrix.

## 3. Emulators (all local development and tests)

```sh
npx firebase login
npm run emulators         # auth, firestore, functions, tasks + UI
npm run emulators:test    # runs npm test inside the emulators
```

## 4. Run on a phone

```sh
cd apps/mobile
npx expo run:android      # development build — NOT Expo Go
```
