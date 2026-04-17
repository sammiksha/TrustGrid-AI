# 🔥 Firebase Setup Guide for CivicSense TrustGrid AI

## Step 1 — Create Firebase Project
1. Go to https://console.firebase.google.com
2. Click **"Add project"**
3. Name it: `civicsense-trustgrid`
4. Enable Google Analytics (optional) → **Create project**

## Step 2 — Enable Authentication
1. Left sidebar → **Build → Authentication**
2. Click **"Get started"**
3. Enable **Email/Password** provider
4. Create test users:
   - `ananya@civicsense.in` / `citizen123`
   - `admin@pmc.gov.in` / `admin123`

## Step 3 — Enable Firestore Database
1. Left sidebar → **Build → Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
4. Select region: `asia-south1` (Mumbai)

### Firestore Collections Structure:
```
/projects/{id}
  - title, category, location, lat, lng
  - status, trustScore, progress
  - budget, spent, contractor
  - startDate, endDate, description

/issues/{id}
  - title, description, severity, status
  - projectId, lat, lng, location
  - reporter, reporterEmail, date
  - reports, upvotes, aiLabel, aiConfidence
  - createdAt (serverTimestamp)

/users/{id}
  - uid, name, email, role
  - createdAt

/alerts/{id}
  - message, type, read
  - createdAt
```

## Step 4 — Enable Storage
1. Left sidebar → **Build → Storage**
2. Click **"Get started"** → **"Start in test mode"**

## Step 5 — Get Web App Config
1. **Project Settings** (gear icon) → **Your apps**
2. Click **"Add app"** → Web icon `</>`
3. Register app as `CivicSense Web`
4. **Copy the firebaseConfig object**

## Step 6 — Paste Config
Open `src/firebase.js` and replace the `firebaseConfig` object:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",           // ← your key
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123...",
  appId: "1:123...:web:abc...",
};
```

## Step 7 — Firestore Security Rules
Go to Firestore → **Rules** tab → paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /issues/{id} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
    match /projects/{id} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /users/{id} {
      allow read, write: if request.auth != null;
    }
    match /alerts/{id} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Step 8 — Storage Rules
Go to Storage → **Rules** tab → paste:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /issues/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Step 9 — Run the App
```bash
npm install
npm start
```

---

## ⚡ Without Firebase (Local Mode)
The app works perfectly without Firebase using in-memory state.
All features work — issues just won't persist after page refresh.

---

## 🚀 Vercel Deployment
```bash
npm install -g vercel
npm run build
vercel --prod
```
Or connect your GitHub repo to Vercel for auto-deploy.

Add Firebase config as Vercel Environment Variables:
- `REACT_APP_FIREBASE_API_KEY`
- `REACT_APP_FIREBASE_AUTH_DOMAIN`
- `REACT_APP_FIREBASE_PROJECT_ID`
- etc.

Then update firebase.js to use `process.env.REACT_APP_FIREBASE_*`
