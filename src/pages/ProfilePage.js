import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';
import { useIssues } from '../IssueContext';
import { useProjects } from '../ProjectContext';
import { FloatingCard, CountUp } from '../components/AnimatedPage';
import GlowButton from '../components/GlowButton';
import { User, Mail, Phone, MapPin, Shield, Activity, AlertTriangle, CheckCircle, Save } from 'lucide-react';

const PROFILE_KEY = 'civicsense_profile';

function loadProfile(user) {
  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    if (stored) return { ...JSON.parse(stored) };
  } catch {}
  return {
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    ward: 'Koregaon Park Ward, Pune',
    bio: 'Active citizen contributing to Pune\'s civic transparency.',
    notifications: true,
    reportUpdates: true,
    newsletter: false,
  };
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  const { issues } = useIssues();
  const { projects } = useProjects();
  const [profile, setProfile] = useState(() => loadProfile(user));
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setProfile(loadProfile(user));
  }, [user]);

  const set = (k, v) => setProfile(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch {}
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2500);
  };

  const myIssues = issues.filter(i => i.reporter === (user?.name || ''));
  const resolved = myIssues.filter(i => i.status === 'resolved').length;
  const open = myIssues.filter(i => i.status === 'open').length;

  const inp = {
    width: '100%', padding: '9px 12px', borderRadius: 10, fontSize: '0.83rem',
    fontFamily: "'Inter',sans-serif", outline: 'none', boxSizing: 'border-box',
    background: isDark ? 'rgba(15,22,41,0.6)' : '#f2f3f7',
    border: `1.5px solid ${editing ? 'rgba(99,102,241,0.35)' : theme.border}`,
    color: theme.textPrimary, transition: 'all 0.2s',
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '1.5rem', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: '1.75rem', color: theme.textPrimary }}>My Profile</h1>
          <p style={{ color: theme.textMuted, fontSize: '0.82rem', marginTop: 4 }}>Your civic identity — changes are saved locally and persist across logins</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {!editing ? (
            <GlowButton variant="primary" size="sm" icon={<User size={14} />} onClick={() => setEditing(true)}>Edit Profile</GlowButton>
          ) : (
            <>
              <GlowButton variant="glass" size="sm" onClick={() => setEditing(false)}>Cancel</GlowButton>
              <GlowButton variant="primary" size="sm" icon={<Save size={14} />} onClick={handleSave}>Save Changes</GlowButton>
            </>
          )}
        </div>
      </motion.div>

      {/* Success toast */}
      {saved && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          style={{ marginBottom: '1rem', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 10, padding: '10px 16px', color: '#34d399', fontSize: '0.82rem', fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600 }}>
          ✓ Profile saved successfully — will persist across logins
        </motion.div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left: Avatar card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <FloatingCard style={{ padding: '1.5rem', textAlign: 'center' }} glowColor="rgba(99,102,241,0.12)">
            <div style={{ width: 80, height: 80, borderRadius: 20, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '2rem', fontWeight: 800, color: 'white', fontFamily: "'Outfit',sans-serif", boxShadow: '0 0 30px rgba(99,102,241,0.3)' }}>
              {(profile.name || 'U')[0].toUpperCase()}
            </div>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: '1.1rem', color: theme.textPrimary, marginBottom: 4 }}>{profile.name || 'Citizen'}</div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.62rem', color: theme.textMuted, marginBottom: 12 }}>{profile.email}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: user?.role === 'gov-admin' ? 'rgba(16,185,129,0.1)' : 'rgba(99,102,241,0.1)', border: user?.role === 'gov-admin' ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(99,102,241,0.15)', borderRadius: 8, padding: '4px 10px' }}>
              <Shield size={11} color={user?.role === 'gov-admin' ? '#34d399' : '#6366f1'} />
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.6rem', fontWeight: 700, color: user?.role === 'gov-admin' ? '#34d399' : '#6366f1' }}>
                {user?.role === 'gov-admin' ? 'GOV ADMIN' : 'CITIZEN'}
              </span>
            </div>
          </FloatingCard>

          {/* Stats */}
          <FloatingCard style={{ padding: '1rem' }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.58rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Activity Stats</div>
            {[
              { label: 'Issues Reported', value: myIssues.length, icon: Activity, color: '#6366f1' },
              { label: 'Resolved', value: resolved, icon: CheckCircle, color: '#10b981' },
              { label: 'Open', value: open, icon: AlertTriangle, color: '#f43f5e' },
              { label: 'Projects Tracked', value: projects.length, icon: Shield, color: '#8b5cf6' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: `1px solid ${theme.border}` }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={13} color={color} />
                </div>
                <span style={{ flex: 1, fontSize: '0.78rem', color: theme.textPrimary, fontFamily: "'Inter',sans-serif" }}>{label}</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.85rem', fontWeight: 700, color }}><CountUp target={value} duration={1} /></span>
              </div>
            ))}
          </FloatingCard>
        </div>

        {/* Right: Edit form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <FloatingCard style={{ padding: '1.5rem' }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.6rem', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>Personal Information</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                { label: 'Full Name', key: 'name', icon: User, placeholder: 'Your full name' },
                { label: 'Email', key: 'email', icon: Mail, placeholder: 'your@email.com' },
                { label: 'Phone', key: 'phone', icon: Phone, placeholder: '+91 98765 43210' },
                { label: 'Ward / Area', key: 'ward', icon: MapPin, placeholder: 'e.g. Baner Ward, Pune' },
              ].map(({ label, key, icon: Icon, placeholder }) => (
                <div key={key}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: "'JetBrains Mono',monospace", fontSize: '0.58rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>
                    <Icon size={10} />{label}
                  </label>
                  <input value={profile[key] || ''} onChange={e => set(key, e.target.value)} disabled={!editing} placeholder={placeholder} style={{ ...inp, opacity: editing ? 1 : 0.75, cursor: editing ? 'text' : 'default' }} />
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.58rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Bio</label>
              <textarea value={profile.bio || ''} onChange={e => set('bio', e.target.value)} disabled={!editing} rows={3} placeholder="Tell your city about yourself..." style={{ ...inp, resize: 'vertical', lineHeight: 1.6, opacity: editing ? 1 : 0.75 }} />
            </div>
          </FloatingCard>

          <FloatingCard style={{ padding: '1.5rem' }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.6rem', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>Notification Preferences</div>
            {[
              { label: 'Issue status updates', key: 'reportUpdates', desc: 'Get notified when your reported issues change status' },
              { label: 'Platform notifications', key: 'notifications', desc: 'Alerts for high-severity issues in your ward' },
              { label: 'Weekly newsletter', key: 'newsletter', desc: 'Weekly city governance transparency digest' },
            ].map(({ label, key, desc }) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${theme.border}` }}>
                <div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, fontSize: '0.83rem', color: theme.textPrimary }}>{label}</div>
                  <div style={{ fontSize: '0.72rem', color: theme.textMuted, marginTop: 2 }}>{desc}</div>
                </div>
                <div onClick={() => editing && set(key, !profile[key])}
                  style={{ width: 42, height: 22, borderRadius: 11, background: profile[key] ? '#6366f1' : (isDark ? 'rgba(99,140,255,0.1)' : '#e2e8f0'), position: 'relative', cursor: editing ? 'pointer' : 'default', transition: 'all 0.25s', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: 3, left: profile[key] ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'all 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                </div>
              </div>
            ))}
          </FloatingCard>
        </div>
      </div>
    </motion.div>
  );
}
