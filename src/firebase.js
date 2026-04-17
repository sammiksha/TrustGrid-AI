// ============================================================
//  CivicSense · TrustGrid AI — Firebase Configuration
//  Backend: Firebase (Auth + Firestore + Storage)
//  ⚠ Replace firebaseConfig with YOUR values from Firebase Console
//  ⚡ Without real config: app works in LOCAL MODE (no persistence)
// ============================================================

// ─── HOW TO GET YOUR CONFIG ──────────────────────────────────
// 1. Go to https://console.firebase.google.com
// 2. Create project "civicsense-trustgrid"
// 3. Enable: Authentication (Email/Password), Firestore, Storage
// 4. Project Settings → Your Apps → Web App → Copy config below

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "",
};

// ─── INITIALIZE (safe — won't crash if config is empty) ──────
let app = null;
export let auth = null;
export let db = null;
export let storage = null;
let initialized = false;

const isConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey.length > 10;

if (isConfigured) {
  try {
    const { initializeApp } = require('firebase/app');
    const { getAuth } = require('firebase/auth');
    const { getFirestore } = require('firebase/firestore');
    const { getStorage } = require('firebase/storage');
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    initialized = true;
    console.log('✅ Firebase connected!');
  } catch (e) {
    console.warn('Firebase init failed:', e.message);
  }
} else {
  console.log('ℹ Firebase not configured — running in LOCAL MODE');
  console.log('ℹ See FIREBASE_SETUP.md to activate Firebase');
}

export { initialized };

// ─── AUTH HELPERS ────────────────────────────────────────────
export const loginUser = async (email, password) => {
  if (!auth) throw new Error('Firebase not configured');
  const { signInWithEmailAndPassword } = require('firebase/auth');
  return signInWithEmailAndPassword(auth, email, password);
};

export const registerUser = async (email, password, name, role) => {
  if (!auth || !db) throw new Error('Firebase not configured');
  const { createUserWithEmailAndPassword, updateProfile } = require('firebase/auth');
  const { collection, addDoc, serverTimestamp } = require('firebase/firestore');
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  await addDoc(collection(db, 'users'), {
    uid: cred.user.uid, name, email, role,
    createdAt: serverTimestamp(),
  });
  return cred;
};

export const logoutUser = async () => {
  if (!auth) return;
  const { signOut } = require('firebase/auth');
  return signOut(auth);
};

export const onAuthChange = (callback) => {
  if (!auth) return () => {};
  const { onAuthStateChanged } = require('firebase/auth');
  return onAuthStateChanged(auth, callback);
};

// ─── FIRESTORE: ISSUES (real-time) ───────────────────────────
export const subscribeToIssues = (callback) => {
  if (!db) return null;
  const { collection, query, orderBy, onSnapshot } = require('firebase/firestore');
  const q = query(collection(db, 'issues'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};

export const addIssueToFirestore = async (issueData) => {
  if (!db) throw new Error('Firestore not ready');
  const { collection, addDoc, serverTimestamp } = require('firebase/firestore');
  return addDoc(collection(db, 'issues'), {
    ...issueData,
    createdAt: serverTimestamp(),
    status: 'open',
    reports: 1,
    upvotes: 0,
  });
};

export const updateIssueStatus = async (issueId, status) => {
  if (!db) return;
  const { doc, updateDoc, serverTimestamp } = require('firebase/firestore');
  await updateDoc(doc(db, 'issues', issueId), { status, updatedAt: serverTimestamp() });
};

export const upvoteIssue = async (issueId) => {
  if (!db) return;
  const { doc, updateDoc, increment } = require('firebase/firestore');
  await updateDoc(doc(db, 'issues', issueId), { upvotes: increment(1) });
};

// ─── FIRESTORE: PROJECTS ─────────────────────────────────────
export const getProjects = async () => {
  if (!db) return [];
  const { collection, getDocs } = require('firebase/firestore');
  const snap = await getDocs(collection(db, 'projects'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const seedProjects = async (projects) => {
  if (!db) return;
  const { collection, getDocs, addDoc } = require('firebase/firestore');
  const snap = await getDocs(collection(db, 'projects'));
  if (snap.empty) {
    for (const p of projects) {
      await addDoc(collection(db, 'projects'), p);
    }
    console.log('✅ Projects seeded to Firestore!');
  }
};

// ─── STORAGE: PHOTO UPLOAD ───────────────────────────────────
export const uploadIssuePhoto = async (file, issueId) => {
  if (!storage) throw new Error('Storage not ready');
  const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');
  const storageRef = ref(storage, `issues/${issueId}/${file.name}`);
  const snap = await uploadBytes(storageRef, file);
  return getDownloadURL(snap.ref);
};

// ─── ALERTS ──────────────────────────────────────────────────
export const addAlert = async (alertData) => {
  if (!db) return;
  const { collection, addDoc, serverTimestamp } = require('firebase/firestore');
  return addDoc(collection(db, 'alerts'), {
    ...alertData, createdAt: serverTimestamp(), read: false,
  });
};
