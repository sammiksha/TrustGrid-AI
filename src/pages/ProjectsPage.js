import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { statusColor } from '../data/mockData';
import { useProjects } from '../ProjectContext';
import { useIssues } from '../IssueContext';
import { useTheme } from '../ThemeContext';
import StatusBadge from '../components/StatusBadge';
import TrustScore from '../components/TrustScore';
import { FloatingCard, StaggerContainer, StaggerItem } from '../components/AnimatedPage';
import GlowButton from '../components/GlowButton';
import { MapPin, Calendar, Plus, X } from 'lucide-react';

const CATEGORIES = ['Roads', 'Water', 'Metro', 'Sanitation', 'Traffic', 'Parks', 'Energy', 'Other'];
const STATUSES = ['on-track', 'delayed', 'critical'];

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { issues } = useIssues();
  const { theme, isDark } = useTheme();
  const { projects, addProject } = useProjects();
  const [showNew, setShowNew] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [form, setForm] = useState({
    title: '', category: 'Roads', location: '', status: 'on-track',
    budget: '', contractor: '', startDate: '', endDate: '', description: '', progress: 0,
  });

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleCreate = () => {
    if (!form.title.trim() || !form.location.trim()) return;
    const created = addProject(form);
    setShowNew(false);
    setForm({ title: '', category: 'Roads', location: '', status: 'on-track', budget: '', contractor: '', startDate: '', endDate: '', description: '', progress: 0 });
    setSuccessMsg(`✓ "${created.title}" added successfully`);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const isValid = form.title.trim() && form.location.trim();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }} style={S.page}>
      {/* Toast */}
      <AnimatePresence>
        {successMsg && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{ position: 'fixed', top: 24, right: 24, background: 'rgba(16,185,129,0.95)', backdropFilter: 'blur(16px)', borderRadius: 12, padding: '12px 20px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', zIndex: 9999, color: 'white', fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, fontSize: '0.85rem', border: '1px solid rgba(52,211,153,0.4)' }}>
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} style={S.header}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: '1.75rem', color: theme.textPrimary }}>Projects</h1>
          <p style={{ color: theme.textMuted, fontSize: '0.85rem', marginTop: 4 }}>{projects.length} active infrastructure projects across Pune</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/map" style={{ textDecoration: 'none' }}>
            <GlowButton variant="glass" size="sm" icon={<MapPin size={14} />}>View on Map</GlowButton>
          </Link>
          <GlowButton variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setShowNew(true)}>New Project</GlowButton>
        </div>
      </motion.div>

      {/* Project Grid */}
      <StaggerContainer style={S.grid}>
        {projects.map((p) => {
          const openCount = issues.filter(i => i.projectId === p.id && i.status === 'open').length;
          return (
            <StaggerItem key={p.id}>
              <FloatingCard style={S.card} glowColor={`${statusColor[p.status]}20`} onClick={() => navigate(`/projects/${p.id}`)}>
                <div style={{ padding: '1.2rem' }}>
                  <div style={{ height: 3, background: statusColor[p.status], borderRadius: 2, marginBottom: '1rem', boxShadow: `0 0 12px ${statusColor[p.status]}40` }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={S.catTag}>{p.category}</div>
                    <TrustScore score={p.trustScore} size="md" />
                  </div>

                  <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: '1rem', color: theme.textPrimary, marginBottom: 8 }}>{p.title}</h3>

                  <div style={{ display: 'flex', gap: '1rem', marginBottom: 10 }}>
                    <div style={S.metaItem}><MapPin size={11} color="#5a6d8a" />{p.location.split(',')[0]}</div>
                    <div style={S.metaItem}><Calendar size={11} color="#5a6d8a" />{p.endDate}</div>
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={S.progressLabel}>Progress</span>
                      <span style={{ ...S.progressLabel, color: statusColor[p.status], fontWeight: 700 }}>{p.progress}%</span>
                    </div>
                    <div style={S.progressTrack}>
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${p.progress}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                        style={{ ...S.progressFill, background: statusColor[p.status], boxShadow: `0 0 10px ${statusColor[p.status]}50` }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <StatusBadge status={p.status} />
                    {openCount > 0 ? (
                      <span style={{ fontSize: '0.68rem', color: '#fb7185', fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>⚠ {openCount} issues</span>
                    ) : (
                      <span style={{ fontSize: '0.68rem', color: '#34d399', fontFamily: "'JetBrains Mono',monospace" }}>✓ Clear</span>
                    )}
                  </div>

                  <div style={S.budgetRow}>
                    <span style={{ fontSize: '0.65rem', color: theme.textMuted }}>Budget: <span style={{ color: theme.textPrimary, fontWeight: 600 }}>{p.budget}</span></span>
                    <span style={{ fontSize: '0.65rem', color: theme.textMuted }}>Spent: <span style={{ color: '#6366f1', fontWeight: 600 }}>{p.spent}</span></span>
                  </div>
                </div>
              </FloatingCard>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      {/* ── New Project Modal ── */}
      <AnimatePresence>
        {showNew && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowNew(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(8px)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ scale: 0.94, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 24 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto', background: isDark ? 'rgba(10,16,36,0.99)' : '#fff', border: `1px solid ${theme.border}`, borderRadius: 20, padding: '1.75rem', boxShadow: '0 32px 80px rgba(0,0,0,0.4)' }}>

              {/* Modal header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.6rem', color: '#6366f1', marginBottom: 4 }}>ADMIN PORTAL</div>
                  <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: '1.2rem', color: theme.textPrimary, margin: 0 }}>New Infrastructure Project</h2>
                </div>
                <button onClick={() => setShowNew(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textMuted, padding: 4, borderRadius: 8, display: 'flex' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {/* Title */}
                <div>
                  <label style={S.label}>Project Title *</label>
                  <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Koregaon Park Road Resurfacing"
                    style={{ ...S.input(isDark, theme), borderColor: form.title ? '#6366f1' : theme.border }} />
                </div>

                {/* Category + Status row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={S.label}>Category</label>
                    <select value={form.category} onChange={e => set('category', e.target.value)} style={S.input(isDark, theme)}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={S.label}>Initial Status</label>
                    <div style={{ display: 'flex', gap: 5, marginTop: 6 }}>
                      {STATUSES.map(s => (
                        <button key={s} onClick={() => set('status', s)}
                          style={{ flex: 1, padding: '7px 4px', borderRadius: 8, border: `1.5px solid ${form.status === s ? statusColor[s] : theme.border}`, background: form.status === s ? `${statusColor[s]}15` : 'transparent', color: form.status === s ? statusColor[s] : theme.textMuted, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, fontSize: '0.62rem', transition: 'all 0.2s' }}>
                          {s === 'on-track' ? 'On Track' : s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label style={S.label}>Location *</label>
                  <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Koregaon Park, Pune"
                    style={{ ...S.input(isDark, theme), borderColor: form.location ? '#6366f1' : theme.border }} />
                </div>

                {/* Budget + Contractor */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={S.label}>Budget</label>
                    <input value={form.budget} onChange={e => set('budget', e.target.value)} placeholder="₹20 Cr"
                      style={S.input(isDark, theme)} />
                  </div>
                  <div>
                    <label style={S.label}>Contractor</label>
                    <input value={form.contractor} onChange={e => set('contractor', e.target.value)} placeholder="PMC Roads Dept"
                      style={S.input(isDark, theme)} />
                  </div>
                </div>

                {/* Dates */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={S.label}>Start Date</label>
                    <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)}
                      style={S.input(isDark, theme)} />
                  </div>
                  <div>
                    <label style={S.label}>End Date</label>
                    <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)}
                      style={S.input(isDark, theme)} />
                  </div>
                </div>

                {/* Progress slider */}
                <div>
                  <label style={S.label}>Initial Progress: {form.progress}%</label>
                  <input type="range" min={0} max={100} value={form.progress} onChange={e => set('progress', e.target.value)}
                    style={{ width: '100%', accentColor: '#6366f1', cursor: 'pointer', marginTop: 4 }} />
                  <div style={{ height: 5, background: isDark ? 'rgba(99,140,255,0.08)' : 'rgba(0,0,0,0.06)', borderRadius: 3, overflow: 'hidden', marginTop: 6 }}>
                    <div style={{ height: '100%', width: `${form.progress}%`, background: statusColor[form.status], borderRadius: 3, transition: 'width 0.15s' }} />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label style={S.label}>Description</label>
                  <textarea value={form.description} onChange={e => set('description', e.target.value)}
                    placeholder="Brief description of the project scope..." rows={3}
                    style={{ ...S.input(isDark, theme), resize: 'vertical', fontFamily: "'Inter',sans-serif", lineHeight: 1.6 }} />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button onClick={() => setShowNew(false)}
                    style={{ flex: 1, padding: '11px', borderRadius: 11, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textMuted, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s' }}>
                    Cancel
                  </button>
                  <button onClick={handleCreate} disabled={!isValid}
                    style={{ flex: 2, padding: '11px', borderRadius: 11, border: 'none', background: isValid ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : (isDark ? 'rgba(99,140,255,0.1)' : 'rgba(99,102,241,0.08)'), color: isValid ? 'white' : theme.textMuted, cursor: isValid ? 'pointer' : 'not-allowed', fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: '0.85rem', boxShadow: isValid ? '0 4px 20px rgba(99,102,241,0.35)' : 'none', transition: 'all 0.25s' }}>
                    + Create Project
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const S = {
  page: { padding: '1.5rem', maxWidth: 1400, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' },
  card: { cursor: 'pointer', overflow: 'hidden' },
  catTag: { fontFamily: "'JetBrains Mono',monospace", fontSize: '0.6rem', fontWeight: 700, color: '#6366f1', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 5, padding: '2px 7px' },
  metaItem: { display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.68rem', color: '#5a6d8a', fontFamily: "'JetBrains Mono',monospace" },
  progressLabel: { fontFamily: "'JetBrains Mono',monospace", fontSize: '0.6rem', color: '#5a6d8a' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressTrack: { height: 5, background: 'rgba(99,140,255,0.06)', borderRadius: 3, overflow: 'hidden' },
  budgetRow: { display: 'flex', justifyContent: 'space-between', fontFamily: "'JetBrains Mono',monospace", marginTop: 10, paddingTop: 8, borderTop: '1px solid rgba(99,140,255,0.04)' },
  label: { display: 'block', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#5a6d8a', marginBottom: 5 },
  input: (isDark, theme) => ({
    width: '100%', padding: '9px 12px', borderRadius: 10, fontSize: '0.83rem',
    fontFamily: "'Inter',sans-serif", outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box',
    background: isDark ? 'rgba(15,22,41,0.6)' : 'rgba(248,249,253,0.9)',
    border: `1.5px solid ${theme.border}`,
    color: theme.textPrimary,
  }),
};
