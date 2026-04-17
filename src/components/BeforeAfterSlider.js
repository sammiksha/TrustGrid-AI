import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, CheckCircle, Calendar, Lock, Eye } from 'lucide-react';
import { FloatingCard } from './AnimatedPage';
import { useTheme } from '../ThemeContext';

// ─── LocalStorage persistence ─────────────────────────────────
const storageKey = (id) => `civicsense_ba_${id}`;

function loadImages(id) {
  try {
    const raw = localStorage.getItem(storageKey(id));
    if (raw) return JSON.parse(raw);
  } catch {}
  return { before: null, after: null };
}

function saveImages(id, before, after) {
  try {
    localStorage.setItem(storageKey(id), JSON.stringify({ before, after }));
  } catch {}
}

// ─── Drag-to-compare slider ───────────────────────────────────
function SliderCore({ beforeUrl, afterUrl, beforeDate, afterDate }) {
  const { theme } = useTheme();
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const ref = useRef(null);

  const updatePos = useCallback((clientX) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos(Math.round((Math.max(0, Math.min(clientX - rect.left, rect.width)) / rect.width) * 100));
  }, []);

  const onMouseDown = (e) => { setDragging(true); updatePos(e.clientX); };
  const onMouseMove = useCallback((e) => { if (dragging) updatePos(e.clientX); }, [dragging, updatePos]);
  const onMouseUp = useCallback(() => setDragging(false), []);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); };
  }, [onMouseMove, onMouseUp]);

  return (
    <div ref={ref} onMouseDown={onMouseDown}
      onTouchMove={e => updatePos(e.touches[0].clientX)}
      onTouchStart={e => updatePos(e.touches[0].clientX)}
      style={{ position: 'relative', width: '100%', height: 220, borderRadius: 12, overflow: 'hidden', cursor: 'col-resize', userSelect: 'none', border: `1.5px solid ${theme.border}` }}>
      <img src={afterUrl} alt="After" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', width: `${pos}%` }}>
        <img src={beforeUrl} alt="Before" style={{ position: 'absolute', inset: 0, width: `${(100 / Math.max(pos, 1)) * 100}%`, maxWidth: 'none', height: '100%', objectFit: 'cover' }} />
      </div>
      <motion.div animate={{ left: `${pos}%` }} transition={{ type: 'spring', stiffness: 500, damping: 50 }}
        style={{ position: 'absolute', top: 0, bottom: 0, width: 2, background: 'rgba(255,255,255,0.85)', transform: 'translateX(-50%)', zIndex: 10 }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 34, height: 34, borderRadius: '50%', background: 'rgba(10,14,30,0.85)', border: '2px solid #3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
          <span style={{ fontSize: 13, color: '#60a5fa', fontWeight: 700, letterSpacing: -1 }}>{'‹›'}</span>
        </div>
      </motion.div>
      <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.65)', color: 'white', fontSize: '0.62rem', padding: '3px 8px', borderRadius: 6, fontFamily: "'JetBrains Mono',monospace" }}>BEFORE · {beforeDate}</div>
      <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(59,130,246,0.85)', color: 'white', fontSize: '0.62rem', padding: '3px 8px', borderRadius: 6, fontFamily: "'JetBrains Mono',monospace" }}>AFTER · {afterDate}</div>
      <motion.div animate={{ opacity: dragging ? 0 : 1 }} style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.5)', color: 'rgba(255,255,255,0.8)', fontSize: '0.6rem', padding: '2px 10px', borderRadius: 10, fontFamily: "'JetBrains Mono',monospace", whiteSpace: 'nowrap' }}>
        ← drag to compare →
      </motion.div>
    </div>
  );
}

// ─── Side-by-side display (user panel) ───────────────────────
function SideBySide({ beforeUrl, afterUrl, beforeDate, afterDate }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {[
        { url: beforeUrl, label: 'BEFORE', date: beforeDate, accent: '#64748b' },
        { url: afterUrl,  label: 'AFTER',  date: afterDate,  accent: '#3b82f6' },
      ].map(({ url, label, date, accent }) => (
        <div key={label} style={{ borderRadius: 10, overflow: 'hidden', border: `1.5px solid ${accent}30`, position: 'relative' }}
          onMouseEnter={e => { const img = e.currentTarget.querySelector('img'); if (img) img.style.transform = 'scale(1.06)'; }}
          onMouseLeave={e => { const img = e.currentTarget.querySelector('img'); if (img) img.style.transform = 'scale(1)'; }}>
          <img src={url} alt={label} style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }} />
          <div style={{ position: 'absolute', top: 7, left: 7, background: `${accent}cc`, color: 'white', fontSize: '0.58rem', padding: '2px 7px', borderRadius: 5, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>
            {label} · {date}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
// Props:
//   projectId – unique ID for storage
//   status    – current project/issue status string
//   isAdmin   – show upload controls if true; read-only view if false
export default function BeforeAfterSlider({ projectId, status, isAdmin = false }) {
  const { theme, isDark } = useTheme();
  const isResolved = status === 'resolved';
  const saved = loadImages(projectId);

  const [before, setBefore] = useState(saved.before || null);
  const [after,  setAfter]  = useState(saved.after  || null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(!!(saved.before && saved.after));

  useEffect(() => {
    if (before || after) saveImages(projectId, before, after);
  }, [before, after, projectId]);

  // Sync across tabs
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === storageKey(projectId)) {
        if (e.newValue) {
          const parsed = JSON.parse(e.newValue);
          setBefore(parsed.before || null);
          setAfter(parsed.after || null);
          setDone(!!(parsed.before && parsed.after));
        } else {
          setBefore(null);
          setAfter(null);
          setDone(false);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [projectId]);

  const handleFile = (type, file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const date = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    if (type === 'before') setBefore({ url, date });
    else setAfter({ url, date });
  };

  const handleSave = async () => {
    setUploading(true);
    await new Promise(r => setTimeout(r, 700));
    saveImages(projectId, before, after);
    setUploading(false);
    setDone(true);
  };

  const handleReset = () => {
    setBefore(null); setAfter(null); setDone(false);
    localStorage.removeItem(storageKey(projectId));
  };

  // ── NOT RESOLVED → locked for everyone ───────────────────
  if (!isResolved) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginTop: '1.2rem', padding: '1.2rem', borderRadius: 14, border: `1.5px dashed ${theme.border}`, background: isDark?'rgba(15,22,41,0.35)':theme.surfaceMid, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center' }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: isDark?'rgba(99,140,255,0.06)':'rgba(0,0,0,0.03)', border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Lock size={20} color={theme.textMuted} />
        </div>
        <div>
          <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: '0.9rem', color: theme.textPrimary, marginBottom: 4 }}>
            Before / After Photos Locked
          </div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.65rem', color: theme.textSecondary, lineHeight: 1.6 }}>
            Photos can only be uploaded once<br />the project status is{' '}
            <span style={{ color: theme.success, fontWeight: 800 }}>Resolved</span>
          </div>
        </div>
        <span style={{ padding: '3px 12px', borderRadius: 20, border: '1px solid rgba(251,113,133,0.3)', background: 'rgba(251,113,133,0.1)', color: '#fb7185', fontSize: '0.65rem', fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>
          🔒 {status?.replace('-', ' ').toUpperCase() || 'PENDING'} → Update to RESOLVED to unlock
        </span>
      </motion.div>
    );
  }

  // ── RESOLVED + Images exist → show comparison ────────────
  if (before && after) {
    return (
      <FloatingCard style={{ padding: '1.2rem', marginTop: '1.2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.9rem' }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Eye size={14} color={theme.success} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: '0.88rem', color: theme.textPrimary }}>Before / After Photo Timeline</div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.58rem', color: theme.success }}>✓ Resolved · Visual proof of completed work · Publicly visible</div>
          </div>
          <span style={{ background: 'rgba(16,185,129,0.08)', color: theme.success, fontSize: '0.62rem', padding: '3px 9px', borderRadius: 8, border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'JetBrains Mono',monospace" }}>
            <CheckCircle size={10} /> Saved
          </span>
        </div>

        {isAdmin
          ? <SliderCore beforeUrl={before.url} afterUrl={after.url} beforeDate={before.date} afterDate={after.date} />
          : <SideBySide beforeUrl={before.url} afterUrl={after.url} beforeDate={before.date} afterDate={after.date} />
        }

        {isAdmin && (
          <button onClick={handleReset}
            style={{ marginTop: 10, width: '100%', padding: '6px', borderRadius: 8, border: '1px solid rgba(99,140,255,0.1)', background: 'transparent', color: '#475569', cursor: 'pointer', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.6rem' }}>
            ↺ Replace Images
          </button>
        )}
      </FloatingCard>
    );
  }

  // ── RESOLVED + No images + not admin → placeholder ────────
  if (!isAdmin) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ marginTop: '1.2rem', padding: '1rem', borderRadius: 14, border: `1.5px dashed ${theme.border}`, background: isDark?'rgba(16,185,129,0.03)':'rgba(16,185,129,0.05)', textAlign: 'center' }}>
        <Camera size={18} color={theme.textMuted} style={{ marginBottom: 6 }} />
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.65rem', color: theme.textSecondary, fontWeight: 500 }}>
          No before/after photos uploaded yet
        </div>
      </motion.div>
    );
  }

  // ── RESOLVED + Admin → upload UI ─────────────────────────
  return (
    <FloatingCard style={{ padding: '1.2rem', marginTop: '1.2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.9rem' }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Camera size={14} color={theme.primary} />
        </div>
        <div>
          <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: '0.9rem', color: theme.textPrimary }}>Upload Before / After Photos</div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.6rem', color: theme.success, fontWeight: 600 }}>🔓 Unlocked — Project is Resolved</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        {[
          { type: 'before', label: 'Before Photo', state: before },
          { type: 'after',  label: 'After Photo',  state: after  },
        ].map(({ type, label, state }) => (
          <motion.label key={type} whileHover={{ scale: 1.02 }}
            style={{ position: 'relative', border: `2px dashed ${state ? theme.success : theme.border}`, borderRadius: 10, padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'pointer', background: state ? 'rgba(16,185,129,0.06)' : (isDark?'rgba(15,22,41,0.4)':'rgba(0,0,0,0.02)'), transition: 'all 0.2s' }}>
            <input type="file" accept="image/*" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} onChange={e => handleFile(type, e.target.files[0])} />
            {state ? <CheckCircle size={18} color={theme.success} /> : <Upload size={18} color={theme.textMuted} />}
            <span style={{ fontSize: '0.68rem', color: state ? theme.success : theme.textSecondary, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>
              {state ? '✓ Ready' : label}
            </span>
            {state && (
              <>
                <span style={{ fontSize: '0.58rem', color: theme.textMuted, display: 'flex', alignItems: 'center', gap: 3 }}><Calendar size={8} /> {state.date}</span>
                <img src={state.url} alt="" style={{ width: '100%', height: 55, objectFit: 'cover', borderRadius: 6, marginTop: 3 }} />
              </>
            )}
          </motion.label>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        {before && after && !done && (
          <button onClick={handleSave} disabled={uploading}
            style={{ flex: 2, padding: '8px', borderRadius: 9, border: 'none', background: uploading ? theme.border : theme.primary, color: 'white', cursor: uploading ? 'not-allowed' : 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: '0.78rem', boxShadow: `0 4px 12px ${theme.primary}40` }}>
            {uploading ? '⏳ Saving...' : '✓ Save & Publish Images'}
          </button>
        )}
        {(before || after) && (
          <button onClick={handleReset}
            style={{ flex: 1, padding: '8px', borderRadius: 9, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textSecondary, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, fontSize: '0.78rem' }}>
            Reset
          </button>
        )}
      </div>

      {!before && !after && (
        <p style={{ textAlign: 'center', color: theme.textMuted, fontSize: '0.65rem', marginTop: 8, fontFamily: "'JetBrains Mono',monospace", fontWeight: 500 }}>
          Upload two photos — public can see real project impact
        </p>
      )}
    </FloatingCard>
  );
}
