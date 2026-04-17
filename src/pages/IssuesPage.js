import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { statusColor } from '../data/mockData';
import { useProjects } from '../ProjectContext';
import { useIssues } from '../IssueContext';
import { useTheme } from '../ThemeContext';
import StatusBadge from '../components/StatusBadge';
import { FloatingCard, StaggerContainer, StaggerItem } from '../components/AnimatedPage';
import GlowButton from '../components/GlowButton';
import { AlertTriangle, Filter, ExternalLink, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import BeforeAfterSlider from '../components/BeforeAfterSlider';

export default function IssuesPage() {
  const { issues } = useIssues();
  const { theme, isDark } = useTheme();
  const { projects } = useProjects();
  const [filter, setFilter] = useState('all'); // 'all' | 'open' | 'resolved' | 'in-progress'
  const [search, setSearch] = useState('');

  const filtered = issues.filter(issue => {
    const matchStatus = filter === 'all' || issue.status === filter;
    const matchSearch = !search || issue.title.toLowerCase().includes(search.toLowerCase()) || issue.description?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = {
    all: issues.length,
    open: issues.filter(i => i.status === 'open').length,
    'in-progress': issues.filter(i => i.status === 'in-progress').length,
    resolved: issues.filter(i => i.status === 'resolved').length,
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} style={{ padding: '1.5rem', maxWidth: 1100, margin: '0 auto' }}>
      
      {/* Header */}
      <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: '1.75rem', color: theme.textPrimary, marginBottom: 4 }}>
            All Issues
          </h1>
          <p style={{ color: theme.textMuted, fontSize: '0.85rem' }}>
            {issues.length} citizen reports across {projects.length} projects
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/report" style={{ textDecoration: 'none' }}>
            <GlowButton variant="primary" size="sm" icon={<AlertTriangle size={14} />}>Report New</GlowButton>
          </Link>
        </div>
      </motion.div>

      {/* Filter Bar */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        style={{ display: 'flex', gap: 10, marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 200,
          background: isDark ? 'rgba(10,16,36,0.7)' : '#f2f3f7',
          border: `1px solid ${theme.border}`, borderRadius: 10, padding: '8px 12px',
        }}>
          <Search size={13} color={theme.textMuted} />
          <input
            placeholder="Search issues…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', background: 'none', outline: 'none', fontSize: '0.82rem', color: theme.textPrimary, width: '100%', fontFamily: "'Inter',sans-serif" }}
          />
        </div>
        {/* Status filters */}
        {[['all','All'], ['open','Open'], ['in-progress','In Progress'], ['resolved','Resolved']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)} style={{
            padding: '7px 14px', borderRadius: 9, fontSize: '0.78rem', fontWeight: 600,
            fontFamily: "'Inter',sans-serif", cursor: 'pointer', transition: 'all 0.2s',
            background: filter === val
              ? isDark ? 'rgba(99,102,241,0.18)' : 'rgba(99,102,241,0.1)'
              : isDark ? 'rgba(10,16,36,0.5)' : '#f2f3f7',
            border: `1px solid ${filter === val ? 'rgba(99,102,241,0.35)' : theme.border}`,
            color: filter === val ? '#6366f1' : theme.textMuted,
            boxShadow: filter === val ? '0 0 12px rgba(99,102,241,0.12)' : 'none',
          }}>
            {label} <span style={{ opacity: 0.65, fontSize: '0.7rem' }}>({counts[val]})</span>
          </button>
        ))}
      </motion.div>

      {/* Issues List */}
      <StaggerContainer style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: theme.textMuted, fontFamily: "'JetBrains Mono',monospace", fontSize: '0.82rem' }}>
            No issues match your filter.
          </div>
        ) : filtered.map((issue) => {
          const proj = projects.find(p => p.id === issue.projectId);
          const sevColor = issue.severity === 'high' ? '#f43f5e' : issue.severity === 'medium' ? '#f59e0b' : '#10b981';
          return (
            <StaggerItem key={issue.id}>
              <FloatingCard style={{ overflow: 'hidden' }} glowColor={`${sevColor}15`}>
                <div style={{ padding: '1rem 1.2rem', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 4, minHeight: 50, borderRadius: 2, background: sevColor, boxShadow: `0 0 8px ${sevColor}40`, flexShrink: 0, marginTop: 2 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <h4 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: '0.92rem', color: theme.textPrimary }}>{issue.title}</h4>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{
                          padding: '3px 8px', borderRadius: 6, fontSize: '0.58rem', fontWeight: 700,
                          fontFamily: "'JetBrains Mono',monospace",
                          background: `${sevColor}12`, color: sevColor, border: `1px solid ${sevColor}25`
                        }}>{issue.severity.toUpperCase()}</span>
                        <StatusBadge status={issue.status} />
                      </div>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: theme.textMuted, lineHeight: 1.5, marginBottom: 6 }}>{issue.description}</p>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.68rem', color: theme.textFaint, fontFamily: "'JetBrains Mono',monospace", flexWrap: 'wrap' }}>
                      <span>📍 {proj?.location?.split(',')[0] || 'Pune'}</span>
                      <span>👤 {issue.reporter}</span>
                      <span>📅 {issue.date}</span>
                      <span style={{ color: '#6366f1' }}>▲ {issue.reports} reports</span>
                    </div>
                    {issue.status === 'resolved' && (
                      <div style={{ marginTop: '1rem' }}>
                        <BeforeAfterSlider projectId={issue.id} status={issue.status} isAdmin={false} />
                      </div>
                    )}
                  </div>
                </div>
              </FloatingCard>
            </StaggerItem>
          );
        })}
      </StaggerContainer>
    </motion.div>
  );
}
