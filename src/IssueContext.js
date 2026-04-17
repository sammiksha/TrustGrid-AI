// ============================================================
//  IssueContext — Global State + Firebase Firestore Sync
//  Works offline (local) or online (Firebase) seamlessly
// ============================================================
import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialIssues } from './data/mockData';

const ISSUES_KEY = 'civicsense_issues';

function loadIssues() {
  try {
    const stored = localStorage.getItem(ISSUES_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return initialIssues;
}

const IssueContext = createContext(null);

export function IssueProvider({ children }) {
  const [issues, setIssues] = useState(loadIssues);
  const [firebaseMode, setFirebaseMode] = useState(false);

  // Persist issues to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(ISSUES_KEY, JSON.stringify(issues));
    } catch {}
  }, [issues]);

  // Sync across tabs if Firebase is not active
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === ISSUES_KEY && e.newValue) {
        setIssues(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    // Try to subscribe to Firestore real-time updates
    let unsub = null;
    const tryFirebase = async () => {
      try {
        const fb = await import('./firebase');
        if (!fb.initialized || !fb.db) return;
        unsub = fb.subscribeToIssues((firestoreIssues) => {
          if (firestoreIssues && firestoreIssues.length > 0) {
            setIssues(firestoreIssues);
            setFirebaseMode(true);
          }
        });
      } catch (e) {
        // Not configured — stay local
      }
    };
    tryFirebase();
    return () => { if (unsub) unsub(); };
  }, []);

  const addIssue = async (issueData) => {
    const newIssue = {
      ...issueData,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      status: 'open',
      reports: 1,
      upvotes: 0,
    };

    // Optimistic local update (instant UI)
    setIssues(prev => [newIssue, ...prev]);

    // Sync to Firestore if connected
    if (firebaseMode) {
      try {
        const fb = await import('./firebase');
        if (fb.initialized) await fb.addIssueToFirestore(issueData);
      } catch (e) { /* keep local */ }
    }
  };

  const updateIssue = async (id, updates) => {
    setIssues(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));

    if (firebaseMode && typeof id === 'string') {
      try {
        const fb = await import('./firebase');
        if (fb.initialized && updates.status) await fb.updateIssueStatus(id, updates.status);
      } catch (e) {}
    }
  };

  const upvoteIssue = async (id) => {
    setIssues(prev => prev.map(i => i.id === id ? { ...i, reports: (i.reports || 0) + 1 } : i));
    if (firebaseMode && typeof id === 'string') {
      try {
        const fb = await import('./firebase');
        if (fb.initialized) await fb.upvoteIssue(id);
      } catch (e) {}
    }
  };

  return (
    <IssueContext.Provider value={{ issues, addIssue, updateIssue, upvoteIssue, firebaseMode }}>
      {children}
    </IssueContext.Provider>
  );
}

export const useIssues = () => useContext(IssueContext);
