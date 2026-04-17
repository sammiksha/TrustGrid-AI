// ============================================================
//  Dashboard v3 — Sovereign Infrastructure Command Center
//  Light theme primary, with TiltCard, ScrollReveal, glassmorphism
// ============================================================
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Filler, Tooltip, Legend } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { trendData, statusColor } from '../data/mockData';
import { useProjects } from '../ProjectContext';
import { useIssues } from '../IssueContext';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';
import StatusBadge from '../components/StatusBadge';
import TrustScore from '../components/TrustScore';
import { FloatingCard, CountUp, StaggerContainer, StaggerItem, ScrollReveal, TiltCard } from '../components/AnimatedPage';
import { InfraMetricCard, InfraCard, InfraChip, InfraTelemetry, NeonProgress } from '../components/InfraCard';
import GlowButton from '../components/GlowButton';
import { ArrowRight, TrendingUp, AlertTriangle, Activity, BarChart3, Map, FileText, Zap, Radio, Cpu, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Filler, Tooltip, Legend);

const BLUE = '#0ea5e9'; const PURPLE = '#6366f1'; const CYAN = '#06b6d4';
const GREEN = '#10b981'; const YELLOW = '#f59e0b'; const RED = '#f43f5e'; const SLATE = '#88929b';

// Dynamic tooltip/axis styles (will be generated inside component but exported as defaults)
const tooltipStyleLight = {
  backgroundColor: 'rgba(255,255,255,0.97)',
  titleColor: '#1a1b25',
  bodyColor: '#6b7280',
  borderColor: 'rgba(99,102,241,0.15)',
  borderWidth: 1,
  padding: 14,
  cornerRadius: 12,
  titleFont: { family: "'Plus Jakarta Sans',sans-serif", weight: '700', size: 13 },
  bodyFont: { family: "'Inter',sans-serif", size: 12 },
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
};
const tooltipStyleDark = {
  backgroundColor: '#0a1020',
  titleColor: '#e2e8f0',
  bodyColor: '#94a3b8',
  borderColor: 'rgba(59,130,246,0.2)',
  borderWidth: 1,
  padding: 14,
  cornerRadius: 12,
  titleFont: { family: "'Outfit',sans-serif", weight: '700', size: 13 },
  bodyFont: { family: "'Plus Jakarta Sans',sans-serif", size: 12 },
};

const axisStyleLight = {
  grid: { color: 'rgba(99,102,241,0.06)', drawBorder: false },
  ticks: { color: '#9ca3af', font: { family: "'JetBrains Mono',monospace", size: 10 }, padding: 6 },
  border: { display: false },
};
const axisStyleDark = {
  grid: { color: 'rgba(59,130,246,0.04)', drawBorder: false },
  ticks: { color: '#5a6d8a', font: { family: "'JetBrains Mono',monospace", size: 10 }, padding: 6 },
  border: { display: false },
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning ☀️';
  if (hour < 17) return 'Good Afternoon 🌤️';
  if (hour < 21) return 'Good Evening 🌆';
  return 'Good Night 🌙';
}

// Animated live pulse dot component
function LiveIndicator({ color = '#34d399', label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%', background: color,
        boxShadow: `0 0 6px ${color}`, display: 'inline-block',
        animation: 'pulse 2s ease infinite',
      }} />
      {label && <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.55rem', color: color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>}
    </div>
  );
}

export default function Dashboard() {
  const { issues } = useIssues();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { projects } = useProjects();
  const tooltipStyle = isDark ? tooltipStyleDark : tooltipStyleLight;
  const axisStyle    = isDark ? axisStyleDark    : axisStyleLight;
  const avgTrust = projects.length > 0 ? Math.round(projects.reduce((a, p) => a + p.trustScore, 0) / projects.length) : 0;
  const openIssues = issues.filter(i => i.status === 'open').length;
  const resolved = issues.filter(i => i.status === 'resolved').length;
  const greeting = useMemo(() => getGreeting(), []);

  const lineData = {
    labels: trendData.map(d => d.month),
    datasets: [
      {
        label: 'Reported',
        data: trendData.map(d => d.issues),
        borderColor: RED,
        backgroundColor: `${RED}14`,
        fill: true,
        tension: 0.45,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: RED,
        pointBorderColor: isDark ? '#0a1020' : '#ffffff',
        pointBorderWidth: 2,
        borderWidth: 2.5,
      },
      {
        label: 'Resolved',
        data: trendData.map(d => d.resolved),
        borderColor: BLUE,
        backgroundColor: `${BLUE}10`,
        fill: true,
        tension: 0.45,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: BLUE,
        pointBorderColor: isDark ? '#0a1020' : '#ffffff',
        pointBorderWidth: 2,
        borderWidth: 2.5,
      },
    ],
  };

  const trustBarData = {
    labels: trendData.map(d => d.month),
    datasets: [{
      label: 'Trust Score',
      data: trendData.map(d => d.trust),
      backgroundColor: trendData.map(d =>
        d.trust >= 65 ? `${BLUE}BB` : d.trust >= 55 ? `${YELLOW}BB` : `${RED}BB`
      ),
      borderRadius: 10,
      borderSkipped: false,
      borderWidth: 0,
      hoverBackgroundColor: trendData.map(d =>
        d.trust >= 65 ? BLUE : d.trust >= 55 ? YELLOW : RED
      ),
    }],
  };

  const onTrack = projects.filter(p => p.status === 'on-track').length;
  const delayed = projects.filter(p => p.status === 'delayed').length;
  const critical = projects.filter(p => p.status === 'critical').length;
  const doughnut = {
    labels: ['On Track', 'Delayed', 'Critical'],
    datasets: [{
      data: [onTrack, delayed, critical],
      backgroundColor: [`${GREEN}CC`, `${YELLOW}CC`, `${RED}CC`],
      borderColor: isDark ? '#070d1e' : '#ffffff',
      borderWidth: 5,
      hoverOffset: 10,
      hoverBorderColor: isDark ? '#0a1020' : '#f4f6fb',
    }],
  };

  const kpis = [
    { label: 'Active Projects', value: projects.length, color: BLUE, suffix: '', icon: Activity, trend: '+2', trendUp: true },
    { label: 'Avg Trust Score', value: avgTrust, color: CYAN, suffix: '%', icon: TrendingUp, trend: '+5%', trendUp: true },
    { label: 'Open Issues', value: openIssues, color: RED, suffix: '', icon: AlertTriangle, trend: '-3', trendUp: false },
    { label: 'Issues Resolved', value: resolved, color: GREEN, suffix: '', icon: BarChart3, trend: '+12', trendUp: true },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={S.page}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={S.header}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <LiveIndicator color="#34d399" label="Live" />
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.55rem', color: '#3e4f6b' }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>
          <h1 style={S.h1}>
            {greeting}, <span style={S.nameGradient}>{user?.name || 'Citizen'}</span>
          </h1>
          <p style={S.sub}>Here's your city's infrastructure pulse — real-time civic intelligence</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link to="/map" style={{ textDecoration: 'none' }}>
            <GlowButton variant="glass" size="sm" icon={<Map size={13} />}>Live Map</GlowButton>
          </Link>
          <Link to="/report" style={{ textDecoration: 'none' }}>
            <GlowButton variant="primary" size="sm" icon={<FileText size={13} />}>Report Issue</GlowButton>
          </Link>
        </div>
      </motion.div>

      {/* ── KPI Cards — with 3D Tilt ── */}
      <div style={S.kpiGrid}>
        {kpis.map(({ label, value, color, suffix, icon: Icon, trend, trendUp }, i) => (
          <ScrollReveal key={label} direction="up" delay={i * 0.09} duration={0.6}>
            <TiltCard maxTilt={8} glowColor={`${color}25`} scale={1.03}>
              <InfraMetricCard
                label={label}
                value={<CountUp target={value} duration={1.2} suffix={suffix} />}
                color={color}
                icon={Icon}
                trend={trend}
                trendUp={trendUp}
                delay={0}
              />
            </TiltCard>
          </ScrollReveal>
        ))}
      </div>

      {/* ── AI Intelligence Panel ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="ai-pulse hud-brackets"
        style={S.aiBar}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Cpu size={13} color="#06b6d4" />
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.62rem', color: '#06b6d4', fontWeight: 700, letterSpacing: '0.08em' }}>
            AI INTELLIGENCE PANEL
          </span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.5rem', color: '#64748b' }}>Automated issue classification</span>
          <InfraChip label="LIVE" color="#34d399" dot />
        </div>
        <InfraTelemetry items={[
          { label: 'Trust AI', value: 'Active', color: '#34d399' },
          { label: 'Issue Classifier', value: 'Online', color: '#3b82f6' },
          { label: 'Voice NLP', value: 'Ready', color: '#8b5cf6' },
          { label: 'Map AI', value: 'Synced', color: '#06b6d4' },
        ]} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Radio size={11} color="#34d399" className="live-flicker" />
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.55rem', color: '#3e4f6b' }}>
            Real-time · 284ms latency
          </span>
        </div>
      </motion.div>

      {/* ── Charts Row ── */}
      <div style={S.chartsRow}>
        <ScrollReveal direction="left" delay={0.1}>
          <InfraCard accentColor={RED} style={{ ...S.chartCard, padding: '1.2rem' }}>
            <div style={S.cardHead}>
              <div>
                <h3 style={S.ct}>Issues vs Resolved</h3>
                <div style={{ fontSize: '0.68rem', color: 'var(--muted)', marginTop: 2, fontFamily: "'JetBrains Mono',monospace" }}>Real-time data visualization</div>
              </div>
              <div style={S.legend}>
                <span style={{ ...S.lgDot, background: RED, boxShadow: `0 0 5px ${RED}50` }} />Reported
                <span style={{ ...S.lgDot, background: BLUE, marginLeft: 8, boxShadow: `0 0 5px ${BLUE}50` }} />Resolved
              </div>
            </div>
            <div style={{ height: 230 }}>
              <Line data={lineData} options={{
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: tooltipStyle },
                scales: { x: axisStyle, y: { ...axisStyle, beginAtZero: true } },
                animation: { duration: 1200, easing: 'easeOutQuart' },
              }} />
            </div>
          </InfraCard>
        </ScrollReveal>

        <ScrollReveal direction="right" delay={0.18}>
          <InfraCard accentColor={PURPLE} style={{ ...S.chartCard, padding: '1.2rem' }}>
            <div style={S.cardHead}>
              <div>
                <h3 style={S.ct}>City Trust Score Trend</h3>
                <div style={{ fontSize: '0.68rem', color: 'var(--muted)', marginTop: 2, fontFamily: "'JetBrains Mono',monospace" }}>Trend analysis and insights</div>
              </div>
              <LiveIndicator color="#8b5cf6" label="Monthly" />
            </div>
            <div style={{ height: 230 }}>
              <Bar data={trustBarData} options={{
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: tooltipStyle },
                scales: { x: axisStyle, y: { ...axisStyle, min: 0, max: 100 } },
                animation: { duration: 1200, easing: 'easeOutQuart' },
              }} />
            </div>
          </InfraCard>
        </ScrollReveal>
      </div>

      {/* ── Bottom Row ── */}
      <div style={S.bottomRow}>
        {/* Projects */}
        <ScrollReveal direction="up" delay={0.05}>
          <InfraCard accentColor={BLUE} style={S.projectsCard}>
            <div style={{ padding: '1.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ width: 3, height: 14, borderRadius: 2, background: `linear-gradient(180deg, ${BLUE}, ${BLUE}40)`, boxShadow: `0 0 6px ${BLUE}50` }} />
                  <div>
                    <h3 style={S.ct}>Active Projects</h3>
                    <div style={{ fontSize: '0.68rem', color: 'var(--muted)', marginTop: 2, fontFamily: "'JetBrains Mono',monospace" }}>Smart project monitoring dashboard</div>
                  </div>
                </div>
                <Link to="/projects" style={{ textDecoration: 'none' }}>
                  <GlowButton variant="glass" size="sm" icon={<ArrowRight size={12} />}>View All</GlowButton>
                </Link>
              </div>
              {projects.slice(0, 5).map((p, i) => (
                <Link to={`/projects/${p.id}`} key={p.id} style={{ textDecoration: 'none' }}>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                    style={S.projRow}
                    whileHover={{ x: 4, borderRadius: 8 }}
                  >
                    <div style={{
                      width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                      background: statusColor[p.status],
                      boxShadow: `0 0 7px ${statusColor[p.status]}80`,
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text)' }}>{p.title}</div>
                      <div style={{ fontSize: '0.62rem', color: 'var(--muted)', fontFamily: "'JetBrains Mono',monospace", marginTop: 1 }}>{p.category} · {p.location.split(',')[0]}</div>
                    </div>
                    <StatusBadge status={p.status} />
                    <TrustScore score={p.trustScore} size="sm" />
                  </motion.div>
                </Link>
              ))}
            </div>
          </InfraCard>
        </ScrollReveal>

        {/* Doughnut */}
        <ScrollReveal direction="up" delay={0.13}>
          <InfraCard accentColor={CYAN} style={S.doughnutCard}>
            <div style={{ padding: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: '0.5rem' }}>
                <span style={{ width: 3, height: 14, borderRadius: 2, background: `linear-gradient(180deg, ${CYAN}, ${CYAN}40)`, boxShadow: `0 0 6px ${CYAN}50` }} />
                <div>
                  <h3 style={S.ct}>Project Status</h3>
                  <div style={{ fontSize: '0.68rem', color: 'var(--muted)', marginTop: 2, fontFamily: "'JetBrains Mono',monospace" }}>AI-powered decision support</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: '0.75rem' }}>
                {[['On Track', onTrack, GREEN], ['Delayed', delayed, YELLOW], ['Critical', critical, RED]].map(([l, v, c]) => (
                  <div key={l} style={{ flex: 1, textAlign: 'center', background: `${c}08`, border: `1px solid ${c}20`, borderRadius: 10, padding: '6px 4px', transition: 'all 0.2s' }}>
                    <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '1.2rem', color: c }}>{v}</div>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.5rem', color: 'var(--muted)' }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ height: 170, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Doughnut data={doughnut} options={{
                  responsive: true, maintainAspectRatio: false, cutout: '72%',
                  plugins: {
                    legend: { display: true, position: 'bottom', labels: {
                      color: isDark ? '#94a3b8' : '#6b7280',
                      font: { family: "'JetBrains Mono',monospace", size: 10 }, padding: 10, boxWidth: 10,
                    }},
                    tooltip: tooltipStyle,
                  },
                  animation: { duration: 1200 },
                }} />
              </div>
            </div>
          </InfraCard>
        </ScrollReveal>

        {/* Recent Issues */}
        <ScrollReveal direction="up" delay={0.2}>
          <InfraCard accentColor={RED} style={S.recentCard}>
            <div style={{ padding: '1.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ width: 3, height: 14, borderRadius: 2, background: `linear-gradient(180deg, ${RED}, ${RED}40)`, boxShadow: `0 0 6px ${RED}50` }} />
                  <div>
                    <h3 style={S.ct}>Recent Reports</h3>
                    <div style={{ fontSize: '0.68rem', color: 'var(--muted)', marginTop: 2, fontFamily: "'JetBrains Mono',monospace" }}>Automated incident tracking</div>
                  </div>
                </div>
                <Link to="/issues" style={{ textDecoration: 'none' }}>
                  <GlowButton variant="glass" size="sm" icon={<ArrowRight size={12} />}>All</GlowButton>
                </Link>
              </div>
              {issues.slice(0, 5).map((issue, i) => {
                const sevColor = issue.severity === 'high' ? RED : issue.severity === 'medium' ? YELLOW : GREEN;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                    style={S.issueRow}
                    whileHover={{ x: -3 }}
                  >
                    <div style={{ width: 3, height: 30, borderRadius: 2, background: sevColor, boxShadow: `0 0 5px ${sevColor}50`, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.79rem', color: 'var(--text)' }}>{issue.title}</div>
                      <div style={{ fontSize: '0.62rem', color: 'var(--muted)', fontFamily: "'JetBrains Mono',monospace" }}>▲{issue.reports} · {issue.date}</div>
                    </div>
                    <StatusBadge status={issue.status} />
                  </motion.div>
                );
              })}
            </div>
          </InfraCard>
        </ScrollReveal>
      </div>

      <style>{`
        @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.1)} }
      `}</style>
    </motion.div>
  );
}

const S = {
  page: { padding: '1.5rem', maxWidth: 1400, margin: '0 auto' },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: '1.4rem', flexWrap: 'wrap', gap: '1rem',
  },
  h1: {
    fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: '1.75rem',
    color: 'var(--text-bright, #0f172a)',
    marginBottom: 3,
  },
  nameGradient: {
    background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
  },
  sub: { color: 'var(--muted)', fontSize: '0.82rem', marginTop: 3 },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' },
  kpiCard: { borderRadius: 18, overflow: 'hidden', position: 'relative' },
  aiBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '8px 16px', background: 'rgba(14,165,233,0.05)',
    border: '1px solid rgba(14,165,233,0.12)', borderRadius: 14, marginBottom: '1rem',
    flexWrap: 'wrap', gap: 8,
  },
  chartsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' },
  chartCard: { position: 'relative', overflow: 'hidden' },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' },
  ct: { fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)' },
  legend: { display: 'flex', alignItems: 'center', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.58rem', color: 'var(--muted)', gap: 5 },
  lgDot: { width: 8, height: 8, borderRadius: '50%', display: 'inline-block' },
  bottomRow: { display: 'grid', gridTemplateColumns: '1.4fr 0.8fr 1fr', gap: '1rem' },
  projectsCard: {},
  doughnutCard: {},
  recentCard: {},
  projRow: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 6px',
    borderBottom: '1px solid rgba(99,102,241,0.06)', cursor: 'pointer',
    transition: 'all 0.2s', borderRadius: 8,
  },
  issueRow: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
    borderBottom: '1px solid rgba(99,102,241,0.06)',
  },
};
