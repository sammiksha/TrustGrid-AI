// ============================================================
//  Topbar v3 — Theme-aware (Dark / Light "Elegant Sentinel")
//  Features: live page meta, animated search, notif bell,
//             user chip, theme-reactive colors
//  Notifications: Dynamic — pulls from real issues context
// ============================================================
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, MapPin, Command, X, LogOut, User, Settings, CheckCheck } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../AuthContext';
import { useIssues } from '../IssueContext';
import { useProjects } from '../ProjectContext';

const PAGE_META = {
  '/':         { name: 'Dashboard',    color: '#6366f1', darkColor: '#3b82f6', emoji: '📊' },
  '/map':      { name: 'Map View',     color: '#06b6d4', darkColor: '#06b6d4', emoji: '🗺️' },
  '/projects': { name: 'Projects',     color: '#8b5cf6', darkColor: '#8b5cf6', emoji: '🏗️' },
  '/analytics':{ name: 'Analytics',   color: '#d946ef', darkColor: '#d946ef', emoji: '📈' },
  '/issues':   { name: 'All Issues',   color: '#f43f5e', darkColor: '#f43f5e', emoji: '⚠️' },
  '/report':   { name: 'Report Issue', color: '#f59e0b', darkColor: '#f59e0b', emoji: '📝' },
  '/trust':    { name: 'Trust Scores', color: '#10b981', darkColor: '#10b981', emoji: '🏆' },
  '/admin':    { name: 'Gov Portal',   color: '#10b981', darkColor: '#34d399', emoji: '🏛️' },
  '/ai-chat':  { name: 'CivicBot AI',  color: '#3b82f6', darkColor: '#60a5fa', emoji: '🤖' },
  '/profile':  { name: 'My Profile',   color: '#8b5cf6', darkColor: '#a78bfa', emoji: '👤' },
  '/settings': { name: 'Settings',     color: '#6366f1', darkColor: '#818cf8', emoji: '⚙️' },
};

const SEV_ICON = { high: '🔴', medium: '🟡', low: '🟢' };

function buildNotifications(issues, projects) {
  const notifs = [];

  // ── New project notifications ──
  const recentProjects = projects.filter(p => {
    if (!p.startDate && !p.id) return false;
    // Projects added recently (ID-based for dynamically added projects)
    if (typeof p.id === 'number' && p.id > 1000000000) {
      const addedAgo = Date.now() - p.id;
      return addedAgo < 7 * 24 * 60 * 60 * 1000; // within 7 days
    }
    return false;
  });
  recentProjects.slice(0, 2).forEach(p => {
    notifs.push({
      id: `proj-new-${p.id}`,
      icon: '🏗️',
      title: `New project: ${p.title}`,
      sub: `${p.category || 'Infrastructure'} · ${p.location || 'Pune'}`,
      time: 'Just added',
      unread: true,
      type: 'success',
    });
  });
  // Also show initial projects as a static notification if no recent ones
  if (recentProjects.length === 0 && projects.length > 0) {
    notifs.push({
      id: 'proj-count',
      icon: '🏗️',
      title: `${projects.length} active projects in Pune`,
      sub: `${projects.filter(p => p.status === 'on-track').length} on track · ${projects.filter(p => p.status === 'delayed').length} delayed`,
      time: 'Today',
      unread: false,
      type: 'info',
    });
  }

  // ── Open high-severity issues ──
  issues.filter(i => i.severity === 'high' && i.status === 'open').slice(0, 2).forEach(i => {
    notifs.push({
      id: `issue-h-${i.id}`,
      icon: '⚠️',
      title: `High severity: ${i.title}`,
      sub: `${i.reports} reports · ${i.date}`,
      time: i.date,
      unread: true,
      type: 'alert',
    });
  });

  // ── Real-time resolved issue notifications ──
  issues.filter(i => i.status === 'resolved').forEach(i => {
    notifs.push({
      id: `issue-r-${i.id}`,
      icon: '✅',
      title: `Issue resolved: ${i.title}`,
      sub: `Marked resolved · ${i.reporter}`,
      time: i.date || 'Recently',
      unread: true,
      type: 'success',
    });
  });

  // ── In-review issues ──
  issues.filter(i => i.status === 'in-review').slice(0, 2).forEach(i => {
    notifs.push({
      id: `issue-ir-${i.id}`,
      icon: '🔍',
      title: `Under review: ${i.title}`,
      sub: `${i.reports} citizens affected`,
      time: i.date,
      unread: false,
      type: 'info',
    });
  });

  // ── System notification ──
  notifs.push({
    id: 'sys-trust',
    icon: '📊',
    title: 'City trust score updated',
    sub: 'Pune City Score: 61% — view analytics',
    time: 'Today',
    unread: false,
    type: 'info',
  });

  return notifs;
}

export default function Topbar({ user: propUser }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, isDark } = useTheme();
  const { user: authUser, logout } = useAuth();
  const { issues } = useIssues();
  const { projects } = useProjects();
  const user = propUser || authUser;
  const raw = PAGE_META[location.pathname] || PAGE_META[Object.keys(PAGE_META).find(k => k !== '/' && location.pathname.startsWith(k)) || '/'] || PAGE_META['/'];
  const meta = { ...raw, color: isDark ? raw.darkColor : raw.color };
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [readIds, setReadIds] = useState(new Set());
  const bellRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);

  // ── Live search results ──────────────────────────────────────
  const searchResults = useMemo(() => {
    if (!searchVal.trim() || searchVal.length < 2) return [];
    const q = searchVal.toLowerCase();
    const projResults = projects
      .filter(p => p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
      .slice(0, 4)
      .map(p => ({ type: 'project', id: p.id, title: p.title, sub: `${p.category} · ${p.location.split(',')[0]}`, path: `/projects/${p.id}`, emoji: '🏗️' }));
    const issueResults = issues
      .filter(i => i.title.toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q))
      .slice(0, 3)
      .map(i => ({ type: 'issue', id: i.id, title: i.title, sub: `${i.severity} severity · ${i.status}`, path: '/issues', emoji: '⚠️' }));
    return [...projResults, ...issueResults].slice(0, 6);
  }, [searchVal, projects, issues]);

  // Build live notifications from real issue + project data
  const allNotifs = useMemo(() => buildNotifications(issues, projects), [issues, projects]);
  const notifs = allNotifs.map(n => ({ ...n, unread: n.unread && !readIds.has(n.id) }));
  const unreadCount = notifs.filter(n => n.unread).length;

  const markRead = (id) => setReadIds(prev => new Set([...prev, id]));
  const markAllRead = () => setReadIds(new Set(allNotifs.map(n => n.id)));

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchFocused(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <motion.div
      initial={{ y: -6, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      style={{
        height: 58,
        background: isDark ? 'rgba(6,10,22,0.92)' : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${theme.border}`,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 22px',
        boxShadow: isDark
          ? '0 4px 24px rgba(0,0,0,0.25)'
          : '0 1px 16px rgba(0,0,0,0.06)',
        position: 'relative', zIndex: 50, flexShrink: 0,
        transition: 'background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease',
      }}
    >
      {/* Animated bottom gradient border */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
        background: isDark
          ? `linear-gradient(90deg, transparent, ${meta.color}50, ${meta.color}70, ${meta.color}50, transparent)`
          : `linear-gradient(90deg, transparent, ${meta.color}30, ${meta.color}50, ${meta.color}30, transparent)`,
        animation: 'gradientShift 4s ease infinite',
        backgroundSize: '200% 100%',
      }} />

      {/* ── LEFT: page identity ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Live pulse dot */}
        <motion.div
          animate={{ scale: [1, 1.35, 1], opacity: [1, 0.55, 1] }}
          transition={{ repeat: Infinity, duration: 2.2 }}
          style={{
            width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
            background: meta.color,
            boxShadow: `0 0 8px ${meta.color}80`,
          }}
        />

        {/* Page emoji + name */}
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.28 }}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <span style={{ fontSize: '1rem' }}>{meta.emoji}</span>
          <span style={{
            fontFamily: isDark ? "'Outfit', sans-serif" : "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700, fontSize: '1rem',
            color: theme.textPrimary,
            transition: 'color 0.3s',
          }}>
            {meta.name}
          </span>
        </motion.div>

        {/* Location pill */}
        <motion.div
          whileHover={{ scale: 1.04 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 3,
            background: isDark ? 'rgba(59,130,246,0.06)' : `${meta.color}0D`,
            border: `1px solid ${isDark ? 'rgba(59,130,246,0.15)' : `${meta.color}25`}`,
            borderRadius: 6, padding: '3px 8px',
            fontFamily: "'JetBrains Mono', monospace", fontSize: '0.58rem',
            color: meta.color, cursor: 'default',
            transition: 'all 0.25s',
          }}
        >
          <MapPin size={10} />
          <span>Pune, Maharashtra</span>
        </motion.div>
      </div>

      {/* ── RIGHT: search + actions ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Search */}
        <div ref={searchRef} style={{ position: 'relative' }}>
          <motion.div
            animate={{
              borderColor: searchFocused ? (isDark ? `${meta.color}50` : `${meta.color}60`) : theme.border,
              boxShadow: searchFocused ? (isDark ? `0 0 20px ${meta.color}18, 0 0 40px ${meta.color}08` : `0 0 0 3px ${meta.color}14`) : 'none',
              width: searchFocused ? 300 : 210,
            }}
            transition={{ duration: 0.28 }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: isDark ? 'rgba(10,16,36,0.7)' : '#f2f3f7', border: `1px solid ${theme.border}`, borderRadius: 10, padding: '7px 12px', overflow: 'hidden', cursor: 'text', transition: 'background 0.3s' }}
          >
            <Search size={13} color={searchFocused ? meta.color : theme.textMuted} style={{ flexShrink: 0, transition: 'color 0.25s' }} />
            <input
              style={{ border: 'none', background: 'none', outline: 'none', fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: theme.textPrimary, width: '100%', minWidth: 0 }}
              placeholder="Search projects, issues..."
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onKeyDown={e => { if (e.key === 'Escape') { setSearchVal(''); setSearchFocused(false); } }}
            />
            {searchVal && (
              <button onClick={() => setSearchVal('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                <X size={12} color={theme.textMuted} />
              </button>
            )}
          </motion.div>

          {/* Search results dropdown */}
          <AnimatePresence>
            {searchFocused && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                style={{ position: 'absolute', top: '110%', left: 0, right: 0, zIndex: 300, background: isDark ? 'rgba(10,16,36,0.98)' : 'rgba(255,255,255,0.99)', backdropFilter: 'blur(24px)', border: `1px solid ${theme.border}`, borderRadius: 12, boxShadow: isDark ? '0 16px 48px rgba(0,0,0,0.5)' : '0 16px 48px rgba(0,0,0,0.12)', overflow: 'hidden' }}
              >
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}`, fontFamily: "'JetBrains Mono',monospace", fontSize: '0.55rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchVal}"
                </div>
                {searchResults.map(r => (
                  <div key={`${r.type}-${r.id}`}
                    onClick={() => { navigate(r.path); setSearchVal(''); setSearchFocused(false); }}
                    style={{ padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer', borderBottom: `1px solid ${theme.border}`, transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontSize: '1rem', flexShrink: 0 }}>{r.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, fontSize: '0.8rem', color: theme.textPrimary }}>{r.title}</div>
                      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.62rem', color: theme.textMuted }}>{r.sub}</div>
                    </div>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.55rem', color: theme.textMuted, flexShrink: 0, background: isDark ? 'rgba(99,140,255,0.08)' : 'rgba(99,102,241,0.06)', padding: '2px 6px', borderRadius: 4 }}>{r.type}</span>
                  </div>
                ))}
                <div style={{ padding: '6px 14px', textAlign: 'center' }}>
                  <span onClick={() => { navigate('/issues'); setSearchVal(''); setSearchFocused(false); }}
                    style={{ fontSize: '0.68rem', color: '#6366f1', cursor: 'pointer', fontFamily: "'JetBrains Mono',monospace" }}>
                    View all issues →
                  </span>
                </div>
              </motion.div>
            )}
            {searchFocused && searchVal.length >= 2 && searchResults.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ position: 'absolute', top: '110%', left: 0, right: 0, zIndex: 300, background: isDark ? 'rgba(10,16,36,0.98)' : 'rgba(255,255,255,0.99)', backdropFilter: 'blur(24px)', border: `1px solid ${theme.border}`, borderRadius: 12, padding: '16px', textAlign: 'center', color: theme.textMuted, fontSize: '0.78rem', fontFamily: "'JetBrains Mono',monospace" }}
              >
                No results for "{searchVal}"
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notification bell */}
        <div ref={bellRef} style={{ position: 'relative' }}>
          <motion.button
            whileHover={{ scale: 1.06, background: isDark ? 'rgba(244,63,94,0.1)' : 'rgba(244,63,94,0.08)', borderColor: 'rgba(244,63,94,0.3)' }}
            whileTap={{ scale: 0.92 }}
            onClick={() => { setShowNotifs(v => !v); setShowProfile(false); }}
            style={{
              position: 'relative',
              background: showNotifs ? (isDark ? 'rgba(244,63,94,0.1)' : 'rgba(244,63,94,0.08)') : (isDark ? 'rgba(59,130,246,0.07)' : 'rgba(0,0,0,0.04)'),
              border: `1px solid ${showNotifs ? 'rgba(244,63,94,0.3)' : theme.border}`,
              borderRadius: 10, padding: 9, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              outline: 'none', flexShrink: 0, transition: 'all 0.2s',
            }}
            title="Notifications"
          >
            <Bell size={16} color={isDark ? '#60a5fa' : '#6366f1'} />
            {unreadCount > 0 && (
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{
                  position: 'absolute', top: 5, right: 5,
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#f43f5e', border: `1.5px solid ${isDark ? '#060a16' : '#fff'}`,
                  boxShadow: '0 0 5px rgba(244,63,94,0.6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.4rem', color: 'white', fontWeight: 800,
                }}
              />
            )}
          </motion.button>

          {/* Notification dropdown */}
          <AnimatePresence>
            {showNotifs && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute', top: '110%', right: 0, width: 340, zIndex: 200,
                  background: isDark ? 'rgba(10,16,36,0.97)' : 'rgba(255,255,255,0.98)',
                  backdropFilter: 'blur(24px)', border: `1px solid ${theme.border}`,
                  borderRadius: 14, boxShadow: isDark ? '0 16px 48px rgba(0,0,0,0.5)' : '0 16px 48px rgba(0,0,0,0.12)',
                  overflow: 'hidden',
                }}
              >
                <div style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: '0.85rem', color: theme.textPrimary }}>Notifications</span>
                    {unreadCount > 0 && (
                      <span style={{ marginLeft: 8, background: '#f43f5e', color: 'white', fontSize: '0.58rem', fontWeight: 700, padding: '1px 6px', borderRadius: 10 }}>{unreadCount}</span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: '#6366f1', fontSize: '0.7rem', fontFamily: "'JetBrains Mono',monospace" }}>
                      <CheckCheck size={12} /> Mark all read
                    </button>
                  )}
                </div>
                {notifs.length === 0 && (
                  <div style={{ padding: '20px 16px', textAlign: 'center', color: theme.textMuted, fontSize: '0.78rem', fontFamily: "'JetBrains Mono',monospace" }}>
                    No notifications
                  </div>
                )}
                {notifs.map(n => (
                  <div key={n.id} onClick={() => markRead(n.id)}
                    style={{
                      padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer',
                      background: n.unread ? (isDark ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.04)') : 'transparent',
                      borderBottom: `1px solid ${theme.border}`, transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = n.unread ? (isDark ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.04)') : 'transparent'}
                  >
                    <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: 1 }}>{n.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, fontSize: '0.78rem', color: theme.textPrimary, marginBottom: 2 }}>{n.title}</div>
                      <div style={{ fontSize: '0.68rem', color: theme.textMuted, fontFamily: "'JetBrains Mono',monospace" }}>{n.sub}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                      <span style={{ fontSize: '0.62rem', color: theme.textMuted, fontFamily: "'JetBrains Mono',monospace" }}>{n.time}</span>
                      {n.unread && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1' }} />}
                    </div>
                  </div>
                ))}
                <div style={{ padding: '10px 16px', textAlign: 'center' }}>
                  <span
                    onClick={() => { navigate('/issues'); setShowNotifs(false); }}
                    style={{ fontSize: '0.72rem', color: '#6366f1', cursor: 'pointer', fontFamily: "'JetBrains Mono',monospace" }}
                  >
                    View all issues →
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User chip */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <motion.div
            whileHover={{ scale: 1.02, background: isDark ? `${meta.color}15` : `${meta.color}0C`, borderColor: `${meta.color}40` }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { setShowProfile(v => !v); setShowNotifs(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: showProfile ? (isDark ? `${meta.color}15` : `${meta.color}0C`) : (isDark ? 'rgba(59,130,246,0.07)' : 'rgba(0,0,0,0.04)'),
              border: `1px solid ${showProfile ? `${meta.color}40` : theme.border}`,
              borderRadius: 10, padding: '6px 10px', cursor: 'pointer',
              flexShrink: 0, transition: 'all 0.2s',
            }}
          >
            <div style={{
              width: 26, height: 26, borderRadius: 8, flexShrink: 0,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.68rem', fontWeight: 800, color: 'white',
              boxShadow: '0 0 10px rgba(99,102,241,0.3)',
            }}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '0.8rem', fontWeight: 700, color: isDark ? '#93c5fd' : '#6366f1' }}>
              {user?.name?.split(' ')[0] || 'User'}
            </span>
            <span style={{
              fontFamily: "'JetBrains Mono',monospace", fontSize: '0.48rem', fontWeight: 700,
              padding: '2px 5px', borderRadius: 4,
              background: user?.role === 'gov-admin' ? 'rgba(16,185,129,0.12)' : (isDark ? 'rgba(59,130,246,0.12)' : 'rgba(99,102,241,0.10)'),
              color: user?.role === 'gov-admin' ? '#34d399' : (isDark ? '#60a5fa' : '#6366f1'),
              border: `1px solid ${user?.role === 'gov-admin' ? 'rgba(16,185,129,0.2)' : (isDark ? 'rgba(59,130,246,0.2)' : 'rgba(99,102,241,0.18)')}`,
            }}>
              {user?.role === 'gov-admin' ? 'ADMIN' : 'USER'}
            </span>
          </motion.div>

          {/* Profile dropdown */}
          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute', top: '110%', right: 0, width: 220, zIndex: 200,
                  background: isDark ? 'rgba(10,16,36,0.97)' : 'rgba(255,255,255,0.98)',
                  backdropFilter: 'blur(24px)', border: `1px solid ${theme.border}`,
                  borderRadius: 14, boxShadow: isDark ? '0 16px 48px rgba(0,0,0,0.5)' : '0 16px 48px rgba(0,0,0,0.12)',
                  overflow: 'hidden',
                }}
              >
                {/* User info */}
                <div style={{ padding: '14px 16px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800, color: 'white' }}>
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: '0.82rem', color: theme.textPrimary }}>{user?.name || 'User'}</div>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.6rem', color: theme.textMuted }}>{user?.email || ''}</div>
                  </div>
                </div>
                {/* Menu items */}
                {[
                  { icon: User, label: 'My Profile', action: () => { navigate('/profile'); setShowProfile(false); } },
                  { icon: Settings, label: 'Settings', action: () => { navigate('/settings'); setShowProfile(false); } },
                ].map(({ icon: Icon, label, action }) => (
                  <div key={label} onClick={action}
                    style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Icon size={14} color={theme.textMuted} />
                    <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '0.82rem', color: theme.textPrimary }}>{label}</span>
                  </div>
                ))}
                <div style={{ borderTop: `1px solid ${theme.border}` }}>
                  <div onClick={() => { logout(); setShowProfile(false); }}
                    style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(244,63,94,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={14} color="#f43f5e" />
                    <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '0.82rem', color: '#f43f5e', fontWeight: 600 }}>Log Out</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
