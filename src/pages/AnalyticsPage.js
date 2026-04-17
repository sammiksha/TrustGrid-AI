import React from 'react';
import { motion } from 'framer-motion';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, RadialLinearScale, Filler, Tooltip, Legend, Title } from 'chart.js';
import { Bar, Line, Doughnut, Radar, PolarArea } from 'react-chartjs-2';
import { trendData } from '../data/mockData';
import { useProjects } from '../ProjectContext';
import { useIssues } from '../IssueContext';
import { useTheme } from '../ThemeContext';
import { FloatingCard, AnimatedPage, CountUp, StaggerContainer, StaggerItem } from '../components/AnimatedPage';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, RadialLinearScale, Filler, Tooltip, Legend, Title);

const BLUE = '#3b82f6'; const BLUE2 = '#60a5fa'; const BLUE3 = '#93c5fd';
const GREEN = '#10b981'; const YELLOW = '#f59e0b'; const RED = '#f43f5e'; const SLATE = '#5a6d8a';

const tooltipStyle = { backgroundColor: '#0f1629', titleColor: '#e2e8f0', bodyColor: '#94a3b8', borderColor: 'rgba(99,140,255,0.15)', borderWidth: 1, padding: 14, cornerRadius: 10, titleFont: { family: "'Outfit',sans-serif", weight: '700' }, bodyFont: { family: "'Plus Jakarta Sans',sans-serif" } };
const axisStyle = { grid: { color: 'rgba(99,140,255,0.06)', drawBorder: false }, ticks: { color: SLATE, font: { family: "'JetBrains Mono',monospace", size: 10 } } };

export default function AnalyticsPage() {
  const { issues } = useIssues();
  const { theme, isDark } = useTheme();
  const { projects } = useProjects();
  const avgTrust = projects.length > 0 ? Math.round(projects.reduce((a, p) => a + p.trustScore, 0) / projects.length) : 0;
  const openIssues = issues.filter(i => i.status === 'open').length;
  const resolved = issues.filter(i => i.status === 'resolved').length;

  const lineData = { labels: trendData.map(d => d.month), datasets: [
    { label: 'Issues Reported', data: trendData.map(d => d.issues), borderColor: RED, backgroundColor: `${RED}15`, fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: RED },
    { label: 'Issues Resolved', data: trendData.map(d => d.resolved), borderColor: BLUE, backgroundColor: `${BLUE}10`, fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: BLUE },
  ]};

  const trustBarData = { labels: trendData.map(d => d.month), datasets: [{ label: 'City Trust Score', data: trendData.map(d => d.trust), backgroundColor: trendData.map(d => d.trust >= 65 ? `${BLUE}CC` : d.trust >= 55 ? `${YELLOW}CC` : `${RED}CC`), borderRadius: 8, borderSkipped: false }] };

  const onTrack = projects.filter(p => p.status === 'on-track').length;
  const delayed = projects.filter(p => p.status === 'delayed').length;
  const critical = projects.filter(p => p.status === 'critical').length;
  const doughnutData = { labels: ['On Track', 'Delayed', 'Critical'], datasets: [{ data: [onTrack, delayed, critical], backgroundColor: [GREEN, YELLOW, RED], borderColor: '#0f1629', borderWidth: 4, hoverOffset: 8 }] };

  const catBudgets = { Roads: 113, Water: 18, Metro: 215, Sanitation: 51, Traffic: 12 };
  const budgetData = { labels: Object.keys(catBudgets), datasets: [{ label: 'Budget (₹ Cr)', data: Object.values(catBudgets), backgroundColor: [BLUE, BLUE2, BLUE3, '#1e40af', '#60a5fa'], borderRadius: 6 }] };

  const radarData = { labels: ['Timeliness', 'Transparency', 'Issue Resolve', 'Citizen Satis.', 'Budget Effic.', 'Contractor'], datasets: [
    { label: 'Current Score', data: [82, 91, 88, 79, 74, 68], backgroundColor: `${BLUE}25`, borderColor: BLUE, borderWidth: 2, pointBackgroundColor: BLUE, pointRadius: 4 },
    { label: 'Target', data: [90, 95, 90, 85, 85, 80], backgroundColor: `${GREEN}10`, borderColor: GREEN, borderWidth: 1.5, borderDash: [5, 5], pointBackgroundColor: GREEN, pointRadius: 3 },
  ]};

  const highIssues = issues.filter(i => i.severity === 'high').length;
  const medIssues = issues.filter(i => i.severity === 'medium').length;
  const lowIssues = issues.filter(i => i.severity === 'low').length;
  const polarData = { labels: ['High Severity', 'Medium', 'Low', 'Resolved'], datasets: [{ data: [highIssues, medIssues, lowIssues, resolved], backgroundColor: [`${RED}BB`, `${YELLOW}BB`, `${GREEN}BB`, `${BLUE}BB`], borderWidth: 0 }] };

  const commonOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { ...tooltipStyle } } };

  return (
    <AnimatedPage style={S.page}>
      <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} style={S.header}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: '1.75rem', color: theme.textPrimary }}>Analytics</h1>
          <p style={{ color: theme.textMuted, fontSize: '0.85rem', marginTop: 4 }}>Infrastructure performance — Chart.js visualization suite</p>
        </div>
        <div style={S.statsRow}>
          {[['Avg Trust', avgTrust, BLUE, '%'], ['Open Issues', openIssues, RED, ''], ['Resolved', resolved, GREEN, ''], ['Projects', projects.length, SLATE, '']].map(([l, v, c, s], idx) => (
            <motion.div key={l} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + idx * 0.1 }}>
              <FloatingCard style={{ ...S.statCard, borderTop: `2px solid ${c}` }} glowColor={`${c}15`}>
                <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '1.6rem', color: c, textShadow: `0 0 20px ${c}30` }}>
                  <CountUp target={v} suffix={s} duration={1.2} />
                </span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.6rem', color: SLATE }}>{l}</span>
              </FloatingCard>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <StaggerContainer style={S.row2}>
        <StaggerItem>
          <FloatingCard style={S.card}>
            <div style={S.cardHead}><h3 style={S.ct}>Issues vs Resolved (7 months)</h3>
              <div style={S.legend}><span style={{ ...S.lgDot, background: RED }} />Reported<span style={{ ...S.lgDot, background: BLUE, marginLeft: 8 }} />Resolved</div>
            </div>
            <div style={{ height: 220 }}><Line data={lineData} options={{ ...commonOpts, scales: { x: axisStyle, y: { ...axisStyle, beginAtZero: true } } }} /></div>
          </FloatingCard>
        </StaggerItem>
        <StaggerItem>
          <FloatingCard style={S.card}>
            <div style={S.cardHead}><h3 style={S.ct}>City Trust Score Trend</h3></div>
            <div style={{ height: 220 }}><Bar data={trustBarData} options={{ ...commonOpts, scales: { x: axisStyle, y: { ...axisStyle, min: 0, max: 100 } } }} /></div>
          </FloatingCard>
        </StaggerItem>
      </StaggerContainer>

      <StaggerContainer style={S.row3}>
        <StaggerItem>
          <FloatingCard style={S.card}>
            <div style={S.cardHead}><h3 style={S.ct}>Project Status</h3></div>
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 200, height: 200 }}>
                <Doughnut data={doughnutData} options={{ ...commonOpts, cutout: '65%', plugins: { ...commonOpts.plugins, legend: { display: true, position: 'bottom', labels: { color: '#94a3b8', font: { family: "'JetBrains Mono',monospace", size: 10 }, padding: 12 } } } }} />
              </div>
            </div>
          </FloatingCard>
        </StaggerItem>
        <StaggerItem>
          <FloatingCard style={S.card}>
            <div style={S.cardHead}><h3 style={S.ct}>Governance Radar</h3></div>
            <div style={{ height: 220 }}>
              <Radar data={radarData} options={{ ...commonOpts, scales: { r: { grid: { color: 'rgba(99,140,255,0.08)' }, ticks: { display: false }, pointLabels: { font: { family: "'JetBrains Mono',monospace", size: 9 }, color: SLATE }, min: 0, max: 100 } }, plugins: { ...commonOpts.plugins, legend: { display: true, position: 'bottom', labels: { color: '#94a3b8', font: { family: "'JetBrains Mono',monospace", size: 10 }, padding: 10 } } } }} />
            </div>
          </FloatingCard>
        </StaggerItem>
        <StaggerItem>
          <FloatingCard style={S.card}>
            <div style={S.cardHead}><h3 style={S.ct}>Issues by Severity</h3></div>
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 200, height: 200 }}>
                <PolarArea data={polarData} options={{ ...commonOpts, plugins: { ...commonOpts.plugins, legend: { display: true, position: 'bottom', labels: { color: '#94a3b8', font: { family: "'JetBrains Mono',monospace", size: 10 }, padding: 10 } } } }} />
              </div>
            </div>
          </FloatingCard>
        </StaggerItem>
      </StaggerContainer>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <FloatingCard style={S.card}>
          <div style={S.cardHead}><h3 style={S.ct}>Budget Allocation by Category (₹ Crore)</h3></div>
          <div style={{ height: 180 }}><Bar data={budgetData} options={{ ...commonOpts, indexAxis: 'y', scales: { x: { ...axisStyle, beginAtZero: true }, y: axisStyle } }} /></div>
        </FloatingCard>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
        <FloatingCard style={{ ...S.card, marginTop: '1rem', padding: '1.2rem 0' }}>
          <h3 style={{ ...S.ct, marginBottom: '1rem', padding: '0 1.2rem' }}>Project Performance Matrix</h3>
          <div style={{ overflowX: 'auto', padding: '0 1.2rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Project', 'Category', 'Progress', 'Budget', 'Trust Score', 'Issues', 'Efficiency'].map(h => (
                <th key={h} style={S.th}>{h}</th>
              ))}</tr></thead>
              <tbody>
                {projects.map(p => {
                  const projIssues = issues.filter(i => i.projectId === p.id).length;
                  const eff = Math.round((p.progress / 100) * (p.trustScore / 100) * 100);
                  const sc = p.status === 'on-track' ? GREEN : p.status === 'delayed' ? YELLOW : RED;
                  return (
                    <motion.tr key={p.id} whileHover={{ backgroundColor: 'rgba(59,130,246,0.05)' }} transition={{ duration: 0.2 }}>
                      <td style={S.td}><span style={{ fontWeight: 600, fontSize: '0.83rem', color: theme.textPrimary }}>{p.title}</span></td>
                      <td style={S.td}><span style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', padding: '2px 7px', borderRadius: 5, fontSize: '0.65rem', fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", border: '1px solid rgba(59,130,246,0.15)' }}>{p.category}</span></td>
                      <td style={S.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 60, height: 5, background: 'rgba(99,140,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                            <motion.div initial={{ width: 0 }} whileInView={{ width: `${p.progress}%` }} viewport={{ once: true }} transition={{ duration: 1 }} style={{ height: '100%', background: sc, borderRadius: 3, boxShadow: `0 0 6px ${sc}40` }} />
                          </div>
                          <span style={{ fontSize: '0.7rem', color: SLATE, fontFamily: "'JetBrains Mono',monospace" }}>{p.progress}%</span>
                        </div>
                      </td>
                      <td style={S.td}><span style={{ fontSize: '0.82rem', fontWeight: 600, color: theme.textPrimary }}>{p.budget}</span></td>
                      <td style={S.td}><span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, color: p.trustScore >= 70 ? GREEN : p.trustScore >= 50 ? YELLOW : RED }}>{p.trustScore}</span></td>
                      <td style={S.td}><span style={{ color: projIssues > 0 ? RED : GREEN, fontFamily: "'JetBrains Mono',monospace", fontSize: '0.75rem', fontWeight: 700 }}>{projIssues}</span></td>
                      <td style={S.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <div style={{ width: 50, height: 5, background: 'rgba(99,140,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                            <motion.div initial={{ width: 0 }} whileInView={{ width: `${eff}%` }} viewport={{ once: true }} transition={{ duration: 1 }} style={{ height: '100%', background: eff >= 60 ? GREEN : RED, borderRadius: 3, boxShadow: `0 0 6px ${eff >= 60 ? GREEN : RED}40` }} />
                          </div>
                          <span style={{ fontSize: '0.7rem', color: eff >= 60 ? GREEN : RED, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>{eff}%</span>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </FloatingCard>
      </motion.div>
    </AnimatedPage>
  );
}

const S = {
  page: { padding: '1.5rem', maxWidth: 1400, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  statsRow: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' },
  statCard: { padding: '0.8rem 1.1rem', display: 'flex', flexDirection: 'column', gap: 3, minWidth: 90 },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' },
  row3: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1rem' },
  card: { padding: '1.2rem' },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' },
  ct: { fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: '0.88rem', color: 'var(--text, #1a1b25)' },
  legend: { display: 'flex', alignItems: 'center', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.6rem', color: '#5a6d8a', gap: 4 },
  lgDot: { width: 8, height: 8, borderRadius: '50%', display: 'inline-block' },
  th: { fontFamily: "'JetBrains Mono',monospace", fontSize: '0.6rem', color: '#5a6d8a', padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid rgba(99,140,255,0.08)', textTransform: 'uppercase', letterSpacing: '0.06em' },
  td: { padding: '10px 12px', borderBottom: '1px solid rgba(99,140,255,0.04)', fontSize: '0.82rem', color: 'var(--text, #1a1b25)' },
};
