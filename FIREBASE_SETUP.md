# Firebase Setup (Medeasy)

This project uses **Firebase Authentication** (Google + Email/Password) and **Cloud Firestore** (saved medicines + activity logs).

## 1) Create a Firebase project
1. Go to the Firebase Console.
2. Create a new project (or use an existing one).

## 2) Add a Web App
1. In Project Settings, add a Web App.
2. Copy the Firebase config values.

## 3) Configure environment variables
1. Copy `.env.example` to `.env`.
2. Fill in:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

Restart the dev server after editing `.env`.

## 4) Enable Authentication Providers
In Firebase Console → Authentication → Sign-in method:
- Enable **Google**
- Enable **Email/Password**

## 5) Firestore database
In Firebase Console → Firestore Database:
- Create a database (Production mode recommended).

### Suggested security rules (example)
Use rules that allow users to read/write only their own document.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 6) Notes
- Medeasy never stores plaintext passwords. Email/password credentials are handled by Firebase Auth.
- User data stored in Firestore is limited to what the app needs (folders + activity events).

