import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../AuthContext';
import { FloatingCard } from '../components/AnimatedPage';
import GlowButton from '../components/GlowButton';
import { Settings, Bell, Shield, Globe, Trash2, Save, Moon, Sun, Eye, EyeOff } from 'lucide-react';

const SETTINGS_KEY = 'civicsense_settings';

function loadSettings() {
  try {
    const s = localStorage.getItem(SETTINGS_KEY);
    if (s) return JSON.parse(s);
  } catch {}
  return {
    theme: 'dark',
    fontSize: 'normal',
    animations: true,
    highContrast: false,
    compactView: false,
    mapDefault: 'satellite',
    notifSound: true,
    notifDesktop: false,
    autoSave: true,
    language: 'en',
    privacyMode: false,
    dataExport: false,
  };
}

function saveSettings(s) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch {}
}

function ToggleRow({ label, desc, value, onChange, color = '#6366f1' }) {
  const { theme } = useTheme();
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${theme.border}` }}>
      <div>
        <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, fontSize: '0.83rem', color: theme.textPrimary }}>{label}</div>
        {desc && <div style={{ fontSize: '0.7rem', color: theme.textMuted, marginTop: 2 }}>{desc}</div>}
      </div>
      <div onClick={() => onChange(!value)}
        style={{ width: 42, height: 22, borderRadius: 11, background: value ? color : 'rgba(99,140,255,0.1)', position: 'relative', cursor: 'pointer', transition: 'all 0.25s', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: 3, left: value ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'all 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.25)' }} />
      </div>
    </div>
  );
}

function SelectRow({ label, desc, value, options, onChange }) {
  const { theme, isDark } = useTheme();
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${theme.border}`, gap: 16 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, fontSize: '0.83rem', color: theme.textPrimary }}>{label}</div>
        {desc && <div style={{ fontSize: '0.7rem', color: theme.textMuted, marginTop: 2 }}>{desc}</div>}
      </div>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ padding: '6px 12px', borderRadius: 8, fontSize: '0.78rem', fontFamily: "'Inter',sans-serif", background: isDark ? 'rgba(15,22,41,0.8)' : '#f2f3f7', border: `1px solid ${theme.border}`, color: theme.textPrimary, outline: 'none', cursor: 'pointer' }}>
        {options.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
      </select>
    </div>
  );
}

export default function SettingsPage() {
  const { theme, isDark, toggle } = useTheme();
  const { user, logout } = useAuth();
  const [settings, setSettings] = useState(loadSettings);
  const [saved, setSaved] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const set = (k, v) => setSettings(prev => ({ ...prev, [k]: v }));

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleClearData = () => {
    if (!confirmClear) { setConfirmClear(true); setTimeout(() => setConfirmClear(false), 4000); return; }
    localStorage.removeItem('civicsense_projects');
    localStorage.removeItem('civicsense_issues');
    localStorage.removeItem('civicsense_profile');
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem('civicsense_chat_history');
    setConfirmClear(false);
    alert('All local data cleared. Refreshing...');
    window.location.reload();
  };

  const sections = [
    {
      title: 'Appearance', icon: Sun, color: '#f59e0b',
      content: (
        <>
          <div style={{ padding: '12px 0', borderBottom: `1px solid ${theme.border}` }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, fontSize: '0.83rem', color: theme.textPrimary, marginBottom: 8 }}>Color Theme</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[['dark', '🌑 Dark Mode', '#1e3a8a'], ['light', '☀️ Light Mode', '#6366f1']].map(([val, label, col]) => (
                <button key={val} onClick={toggle}
                  style={{ flex: 1, padding: '10px', borderRadius: 10, border: `1.5px solid ${(val === 'dark') === isDark ? col : theme.border}`, background: (val === 'dark') === isDark ? `${col}12` : 'transparent', color: (val === 'dark') === isDark ? col : theme.textMuted, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, fontSize: '0.78rem', transition: 'all 0.2s' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <SelectRow label="Font Size" value={settings.fontSize} onChange={v => set('fontSize', v)} options={[['small', 'Small'], ['normal', 'Normal'], ['large', 'Large']]} />
          <ToggleRow label="Smooth Animations" desc="Enable page transitions and micro-animations" value={settings.animations} onChange={v => set('animations', v)} />
          <ToggleRow label="Compact View" desc="Reduce padding and card spacing" value={settings.compactView} onChange={v => set('compactView', v)} color="#8b5cf6" />
          <ToggleRow label="High Contrast" desc="Increase text contrast for accessibility" value={settings.highContrast} onChange={v => set('highContrast', v)} color="#f59e0b" />
        </>
      ),
    },
    {
      title: 'Notifications', icon: Bell, color: '#f43f5e',
      content: (
        <>
          <ToggleRow label="In-App Notifications" desc="Show notifications inside the platform" value={settings.notifSound} onChange={v => set('notifSound', v)} color="#f43f5e" />
          <ToggleRow label="Desktop Notifications" desc="Push notifications in your browser" value={settings.notifDesktop} onChange={v => set('notifDesktop', v)} color="#f43f5e" />
          <ToggleRow label="Auto-save drafts" desc="Automatically save issue report drafts" value={settings.autoSave} onChange={v => set('autoSave', v)} />
        </>
      ),
    },
    {
      title: 'Map & Display', icon: Globe, color: '#06b6d4',
      content: (
        <>
          <SelectRow label="Default Map Style" value={settings.mapDefault} onChange={v => set('mapDefault', v)} options={[['satellite', 'Satellite'], ['streets', 'Streets'], ['dark', 'Dark Mode']]} />
          <SelectRow label="Display Language" value={settings.language} onChange={v => set('language', v)} options={[['en', 'English'], ['en-IN', 'English (India)']]} />
        </>
      ),
    },
    {
      title: 'Privacy & Data', icon: Shield, color: '#10b981',
      content: (
        <>
          <ToggleRow label="Privacy Mode" desc="Hide your name from public issue reports" value={settings.privacyMode} onChange={v => set('privacyMode', v)} color="#10b981" />
          <div style={{ padding: '12px 0', borderBottom: `1px solid ${theme.border}` }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, fontSize: '0.83rem', color: theme.textPrimary, marginBottom: 4 }}>Export My Data</div>
            <div style={{ fontSize: '0.7rem', color: theme.textMuted, marginBottom: 10 }}>Download all your reported issues and profile data</div>
            <GlowButton variant="glass" size="sm" onClick={() => { const data = { issues: JSON.parse(localStorage.getItem('civicsense_issues') || '[]'), profile: JSON.parse(localStorage.getItem('civicsense_profile') || '{}') }; const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'civicsense_data.json'; a.click(); }}>
              Export as JSON
            </GlowButton>
          </div>
          <div style={{ padding: '12px 0' }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, fontSize: '0.83rem', color: '#f43f5e', marginBottom: 4 }}>Clear All Local Data</div>
            <div style={{ fontSize: '0.7rem', color: theme.textMuted, marginBottom: 10 }}>Resets projects, issues, profile, and settings to defaults. Cannot be undone.</div>
            <button onClick={handleClearData}
              style={{ padding: '8px 16px', borderRadius: 9, border: '1px solid rgba(244,63,94,0.3)', background: confirmClear ? 'rgba(244,63,94,0.15)' : 'transparent', color: '#f43f5e', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, fontSize: '0.78rem', transition: 'all 0.2s' }}>
              {confirmClear ? '⚠ Click again to confirm' : '🗑 Clear All Data'}
            </button>
          </div>
        </>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '1.5rem', maxWidth: 800, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: '1.75rem', color: theme.textPrimary }}>Settings</h1>
          <p style={{ color: theme.textMuted, fontSize: '0.82rem', marginTop: 4 }}>Preferences are stored locally and persist across sessions</p>
        </div>
        <GlowButton variant="primary" size="sm" icon={<Save size={14} />} onClick={handleSave}>Save All Settings</GlowButton>
      </motion.div>

      {saved && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '1rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '10px 16px', color: '#34d399', fontSize: '0.82rem', fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600 }}>
          ✓ Settings saved — preferences will persist across logins
        </motion.div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {sections.map(({ title, icon: Icon, color, content }) => (
          <motion.div key={title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <FloatingCard style={{ padding: '1.25rem 1.5rem' }} glowColor={`${color}10`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: `1px solid ${theme.border}` }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: `${color}12`, border: `1px solid ${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={15} color={color} />
                </div>
                <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: '0.95rem', color: theme.textPrimary }}>{title}</span>
              </div>
              {content}
            </FloatingCard>
          </motion.div>
        ))}

        {/* Account actions */}
        <FloatingCard style={{ padding: '1.25rem 1.5rem' }} glowColor="rgba(244,63,94,0.08)">
          <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: '0.95rem', color: theme.textPrimary, marginBottom: '0.75rem' }}>Account</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <GlowButton variant="glass" size="sm" onClick={() => window.location.hash = '/profile'}>View Profile</GlowButton>
            <button onClick={logout}
              style={{ padding: '8px 16px', borderRadius: 9, border: '1px solid rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.08)', color: '#f43f5e', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, fontSize: '0.78rem', transition: 'all 0.2s' }}>
              🚪 Log Out
            </button>
          </div>
        </FloatingCard>
      </div>
    </motion.div>
  );
}
