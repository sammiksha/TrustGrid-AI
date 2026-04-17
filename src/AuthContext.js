// ============================================================
//  AuthContext — Separate User & Admin Login + Custom Signup
// ============================================================
import React, { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'civicsense_registered_users';

// Pre-seeded ADMIN accounts (hardcoded, not editable via signup)
const ADMIN_USERS = [
  { uid: 'admin-1', email: 'admin@pmc.gov.in',          password: 'admin123',       name: 'Rajesh Patil',    role: 'gov-admin' },
  { uid: 'admin-2', email: 'director@pmc.gov.in',       password: 'director123',    name: 'Priya Deshmukh',  role: 'gov-admin' },
  { uid: 'admin-3', email: 'commissioner@pmc.gov.in',   password: 'commissioner123',name: 'Suresh Jadhav',   role: 'gov-admin' },
];

// Pre-seeded CITIZEN accounts (stored in localStorage on first run)
const DEFAULT_CITIZENS = [
  { uid: 'user-1', email: 'ananya@civicsense.in', password: 'citizen123', name: 'Ananya Kumar',  role: 'citizen' },
  { uid: 'user-2', email: 'arjun@civicsense.in',  password: 'arjun123',   name: 'Arjun Sharma', role: 'citizen' },
];

function getRegisteredUsers() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_CITIZENS;
  } catch { return DEFAULT_CITIZENS; }
}

function saveRegisteredUsers(users) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(users)); } catch {}
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    let unsub = null;
    try {
      const fb = require('./firebase');
      if (!fb.auth || !fb.initialized) return;
      unsub = fb.onAuthChange(async (fbUser) => {
        if (fbUser) {
          const isAdmin = ADMIN_USERS.some(a => a.email === fbUser.email);
          setUser({ uid: fbUser.uid, email: fbUser.email, name: fbUser.displayName || fbUser.email.split('@')[0], role: isAdmin ? 'gov-admin' : 'citizen' });
        } else { setUser(null); }
      });
    } catch (e) {}
    return () => { if (unsub) unsub(); };
  }, []);

  // LOGIN — portal: 'user' | 'admin'
  const login = async (email, password, portal = 'user') => {
    setAuthLoading(true);
    try {
      const fb = require('./firebase');
      if (fb.initialized && fb.auth) { await fb.loginUser(email, password); setAuthLoading(false); return { ok: true }; }
    } catch (e) {}

    if (portal === 'admin') {
      const found = ADMIN_USERS.find(u => u.email === email && u.password === password);
      if (found) { const { password: _, ...safe } = found; setUser(safe); setAuthLoading(false); return { ok: true }; }
      setAuthLoading(false);
      return { ok: false, error: 'Invalid admin credentials. Contact your department IT.' };
    } else {
      const users = getRegisteredUsers();
      const found = users.find(u => u.email === email && u.password === password);
      if (found) { const { password: _, ...safe } = found; setUser(safe); setAuthLoading(false); return { ok: true }; }
      setAuthLoading(false);
      return { ok: false, error: 'Invalid email or password. Try signing up.' };
    }
  };

  // SIGNUP — citizens only
  const signup = async (name, email, password) => {
    setAuthLoading(true);
    if (!name.trim() || name.trim().length < 2) { setAuthLoading(false); return { ok: false, error: 'Please enter your full name (min 2 characters).' }; }
    if (!email.includes('@')) { setAuthLoading(false); return { ok: false, error: 'Please enter a valid email address.' }; }
    if (password.length < 6) { setAuthLoading(false); return { ok: false, error: 'Password must be at least 6 characters.' }; }
    const users = getRegisteredUsers();
    if (users.find(u => u.email === email)) { setAuthLoading(false); return { ok: false, error: 'This email is already registered. Please sign in.' }; }
    if (ADMIN_USERS.find(u => u.email === email)) { setAuthLoading(false); return { ok: false, error: 'This email is reserved for admin accounts.' }; }
    const newUser = { uid: `user-${Date.now()}`, email, password, name: name.trim(), role: 'citizen' };
    saveRegisteredUsers([...users, newUser]);
    const { password: _, ...safe } = newUser;
    setUser(safe);
    setAuthLoading(false);
    return { ok: true };
  };

  const logout = async () => {
    try { const fb = require('./firebase'); if (fb.initialized) await fb.logoutUser(); } catch (e) {}
    setUser(null);
  };

  const switchRole = () => { setUser(u => u ? { ...u, role: u.role === 'gov-admin' ? 'citizen' : 'gov-admin' } : u); };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, switchRole, authLoading, ADMIN_USERS }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
