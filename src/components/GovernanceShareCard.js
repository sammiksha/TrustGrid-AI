import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Download, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { projects } from '../data/mockData';
import { useIssues } from '../IssueContext';
import GlowButton from './GlowButton';

function computeStats(issues) {
  const totalProjects = projects.length;
  const onTrack = projects.filter(p => p.status === 'on-track').length;
  const avgTrust = Math.round(projects.reduce((a, p) => a + p.trustScore, 0) / totalProjects);
  const resolved = issues.filter(i => i.status === 'resolved').length;
  const total = issues.length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const catCounts = {};
  issues.forEach(i => { catCounts[i.category || 'Other'] = (catCounts[i.category || 'Other'] || 0) + 1; });
  const topCategory = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
  const trend = avgTrust >= 70 ? '+4%' : avgTrust >= 50 ? '+1%' : '-3%';
  const trendUp = avgTrust >= 70;
  return { totalProjects, onTrack, avgTrust, resolutionRate, topCategory, trend, trendUp, totalIssues: total };
}

function CardFace({ stats }) {
  const trustColor = stats.avgTrust >= 70 ? '#34d399' : stats.avgTrust >= 50 ? '#fbbf24' : '#fb7185';
  return (
    <div id="governance-card" style={{
      width: 360, background: '#0f1629', border: '1px solid rgba(99,140,255,0.15)',
      borderRadius: 16, padding: '20px', fontFamily: "'Plus Jakarta Sans',sans-serif", boxSizing: 'border-box',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Decorative gradient orb for TrustGrid AI futuristic look */}
      <div style={{ position: 'absolute', top: -50, right: -50, width: 100, height: 100, background: trustColor, filter: 'blur(60px)', opacity: 0.15, borderRadius: '50%' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '0.95rem', color: '#e2e8f0' }}>TrustGrid AI</div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.58rem', color: '#64748b', marginTop: 1 }}>Ward Report Card · Pune</div>
        </div>
        <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, padding: '4px 10px', fontSize: '0.65rem', fontFamily: "'JetBrains Mono',monospace", color: '#60a5fa' }}>
          {new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
        </div>
      </div>
      <div style={{ background: 'rgba(15,22,41,0.5)', borderRadius: 12, padding: '14px', textAlign: 'center', marginBottom: 12, border: '1px solid rgba(99,140,255,0.08)' }}>
        <div style={{ fontSize: '0.62rem', fontFamily: "'JetBrains Mono',monospace", color: '#64748b', marginBottom: 4 }}>CITY TRUST SCORE</div>
        <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: '2.8rem', color: trustColor, lineHeight: 1, textShadow: `0 0 20px ${trustColor}40` }}>{stats.avgTrust}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 4 }}>
          {stats.trendUp ? <TrendingUp size={12} color="#34d399" /> : <TrendingDown size={12} color="#fb7185" />}
          <span style={{ fontSize: '0.7rem', color: stats.trendUp ? '#34d399' : '#fb7185', fontWeight: 600 }}>{stats.trend} MoM</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        {[
          ['Projects On Track', `${stats.onTrack}/${stats.totalProjects}`, '#60a5fa'],
          ['Issue Resolution', `${stats.resolutionRate}%`, stats.resolutionRate >= 60 ? '#34d399' : '#fbbf24'],
          ['Open Issues', stats.totalIssues, stats.totalIssues < 10 ? '#34d399' : '#fb7185'],
          ['Top Problem', stats.topCategory, '#94a3b8'],
        ].map(([label, value, color]) => (
          <div key={label} style={{ background: 'rgba(15,22,41,0.5)', borderRadius: 10, padding: '10px', border: '1px solid rgba(99,140,255,0.06)' }}>
            <div style={{ fontSize: '0.6rem', fontFamily: "'JetBrains Mono',monospace", color: '#64748b', marginBottom: 3 }}>{label.toUpperCase()}</div>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: '0.9rem', color }}>{value}</div>
          </div>
        ))}
      </div>
      <div style={{ borderTop: '1px solid rgba(99,140,255,0.08)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.62rem', color: '#64748b', fontFamily: "'JetBrains Mono',monospace" }}>civicsense.in · TrustGrid AI v3</span>
        <span style={{ fontSize: '0.62rem', color: '#60a5fa', fontFamily: "'JetBrains Mono',monospace" }}>#TransparentBharat</span>
      </div>
    </div>
  );
}

export default function GovernanceShareCard() {
  const { issues } = useIssues();
  const stats = computeStats(issues);
  const [shared, setShared] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      if (window.html2canvas) {
        const el = document.getElementById('governance-card');
        const canvas = await window.html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#0f1629' });
        const link = document.createElement('a');
        link.download = `trustgrid-ward-report-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } else {
        alert('Add html2canvas CDN to index.html to enable PNG download.');
      }
    } catch (e) { console.error(e); }
    setDownloading(false);
  };

  const handleShare = async () => {
    const text = `🏙️ TrustGrid AI — Pune Ward Report\n\n✅ Trust Score: ${stats.avgTrust}/100\n📊 Issue Resolution: ${stats.resolutionRate}%\n🏗️ Projects On Track: ${stats.onTrack}/${stats.totalProjects}\n⚠️ Top Issue: ${stats.topCategory}\n\nTrack your city's infrastructure transparency at civicsense.in\n#TransparentBharat #CivicSense`;
    if (navigator.share) {
      await navigator.share({ title: 'TrustGrid Ward Report', text });
      setShared(true);
    } else {
      await navigator.clipboard.writeText(text);
      setShared(true);
      setTimeout(() => setShared(false), 3000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      whileInView={{ opacity: 1, scale: 1 }} 
      viewport={{ once: true }} 
      transition={{ duration: 0.4 }} 
      style={S.panel}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.2rem' }}>
        <div style={S.iconWrap}><Share2 size={16} color="#60a5fa" /></div>
        <div>
          <h3 style={S.title}>Governance Score Card</h3>
          <span style={S.subtitle}>Share on WhatsApp / Twitter to pressure your corporator</span>
        </div>
      </div>
      <motion.div 
        whileHover={{ scale: 1.02 }} 
        transition={{ type: 'spring', stiffness: 400, damping: 25 }} 
        style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}
      >
        <CardFace stats={stats} />
      </motion.div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <GlowButton onClick={handleShare} variant={shared ? 'success' : 'primary'} icon={shared ? <CheckCircle size={14} /> : <Share2 size={14} />}>
          {shared ? 'Copied!' : 'Share / Copy'}
        </GlowButton>
        <GlowButton onClick={handleDownload} variant="secondary" icon={<Download size={14} />} loading={downloading}>
          {downloading ? 'Saving...' : 'Download PNG'}
        </GlowButton>
      </div>
      <p style={{ textAlign: 'center', fontSize: '0.65rem', color: '#5a6d8a', marginTop: 8, fontFamily: "'JetBrains Mono',monospace" }}>
        Add html2canvas to index.html to enable PNG export
      </p>
    </motion.div>
  );
}

const S = {
  panel: { background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(99,140,255,0.1)', borderRadius: 16, padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
  iconWrap: { width: 32, height: 32, background: 'rgba(59,130,246,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(59,130,246,0.2)' },
  title: { fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: '0.92rem', color: '#e2e8f0', margin: 0 },
  subtitle: { fontFamily: "'JetBrains Mono',monospace", fontSize: '0.6rem', color: '#64748b' },
};
