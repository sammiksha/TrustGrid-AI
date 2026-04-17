import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';
import { statusColor } from '../data/mockData';
import { useProjects } from '../ProjectContext';
import { useIssues } from '../IssueContext';
import StatusBadge from '../components/StatusBadge';
import TrustScore from '../components/TrustScore';
import { AnimatedPage, FloatingCard, CountUp, StaggerContainer, StaggerItem } from '../components/AnimatedPage';
import GlowButton from '../components/GlowButton';
import { Lock, CheckCircle, Eye, RefreshCw, X } from 'lucide-react';
import BeforeAfterSlider from '../components/BeforeAfterSlider';

const fundItems = [
  {name:'NH-48 Road Widening',budget:42,used:28.5,progress:68},
  {name:'Shivajinagar Metro',budget:215,used:140,progress:19},
  {name:'Hadapsar Flyover',budget:63,used:34,progress:55},
  {name:'Kothrud STP',budget:29,used:23,progress:82},
  {name:'Katraj Road',budget:8,used:5.2,progress:22},
];

// Thin wrapper — delegates to BeforeAfterSlider with isAdmin=true
const BeforeAfterTimeline = ({ targetId, status }) => (
  <BeforeAfterSlider projectId={targetId} status={status} isAdmin={true} />
);

export default function AdminPage() {
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  const { issues, updateIssue } = useIssues();
  const { projects, updateProject } = useProjects();
  const [activeTab, setActiveTab] = useState('overview');
  const [toast, setToast] = useState('');
  const [viewProject, setViewProject] = useState(null);
  const [editProject, setEditProject] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editProgress, setEditProgress] = useState(0);
  const [editSpent, setEditSpent] = useState('');
  const [contractorScores, setContractorScores] = useState(() => {
    const saved = localStorage.getItem('civicsense_contractor_scores');
    if (saved) return JSON.parse(saved);
    const defaultScores = {};
    ['NHAI Division 3','PCMC Water Dept','Pune Metro Rail Corp','PMC Infrastructure','PMC Env Division','PMC Roads Dept','PMC Traffic Cell','PCMC Civil Dept'].forEach((c, i) => {
      defaultScores[c] = { score: [84, 51, 28, 79, 91, 44, 76, 39][i], notes: '' };
    });
    return defaultScores;
  });
  const [editingContractor, setEditingContractor] = useState(null);
  const [editContractorScore, setEditContractorScore] = useState(0);
  const [editContractorNotes, setEditContractorNotes] = useState('');

  const saveContractorScore = () => {
    const updated = { ...contractorScores, [editingContractor]: { score: Number(editContractorScore), notes: editContractorNotes } };
    setContractorScores(updated);
    localStorage.setItem('civicsense_contractor_scores', JSON.stringify(updated));
    showToast(`✓ Trust score for ${editingContractor} updated to ${editContractorScore}`);
    setEditingContractor(null);
  };

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(''),3500); };
  const isAdmin = user?.role === 'gov-admin';
  const openIssues = issues.filter(i=>i.status==='open');
  const inReview = issues.filter(i=>i.status==='in-review');
  const resolved = issues.filter(i=>i.status==='resolved');

  const handleResolve = (id) => { updateIssue(id, { status: 'resolved' }); showToast('✓ Issue marked as resolved — citizen notified'); };
  const handleReview = (id) => { updateIssue(id, { status: 'in-review' }); showToast('✓ Issue moved to In Review'); };

  const openUpdate = (p) => { setEditProject(p); setEditStatus(p.status); setEditProgress(p.progress); setEditSpent(p.spent || ''); };
  const saveUpdate = () => {
    const updates = { status: editStatus, progress: Number(editProgress) };
    if (editSpent.trim()) updates.spent = editSpent.trim();
    updateProject(editProject.id, updates);
    showToast(`✓ "${editProject.title}" updated to ${editStatus} · ${editProgress}% · Spent: ${editSpent || 'unchanged'}`);
    setEditProject(null);
  };

  if (!isAdmin) return (
    <AnimatedPage style={S.locked}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} style={{ width: 80, height: 80, background: isDark ? 'rgba(15,22,41,0.6)' : 'rgba(99,102,241,0.07)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${isDark ? 'rgba(99,140,255,0.1)' : 'rgba(99,102,241,0.15)'}` }}>
        <Lock size={36} color={theme.textMuted}/>
      </motion.div>
      <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: '1.3rem', color: theme.textPrimary }}>Government Admin Only</h2>
      <p style={{ color: theme.textMuted, fontSize: '0.85rem', textAlign: 'center', lineHeight: 1.6 }}>
        This portal is restricted to verified government officials.<br/>Please log in with a government admin account.
      </p>
    </AnimatedPage>
  );

  return (
    <AnimatedPage style={S.page}>
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={S.toast}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} style={S.header}>
        <div>
          <h1 style={S.h1}>Government Portal</h1>
          <p style={S.sub}>Manage projects, review citizen issues & track fund utilization</p>
        </div>
        <div style={S.adminBadge}>🏛 PMC Admin · Pune</div>
      </motion.div>
      
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ display: 'flex', gap: 4, marginBottom: '1.5rem', background: isDark ? 'rgba(15,22,41,0.4)' : '#f2f3f7', padding: 4, borderRadius: 12, border: `1px solid ${theme.border}` }}>
        {[['overview','Overview'],['issues','Issue Review'],['funds','Fund Tracking'],['projects','Manage Projects'],['contractors','Contractor Scores']].map(([id,label])=>(
          <button key={id} onClick={()=>setActiveTab(id)}
            style={{ padding: '8px 14px', borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: activeTab===id ? 700 : 500, fontSize: '0.82rem', position: 'relative', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
              background: activeTab===id ? isDark ? 'rgba(59,130,246,0.15)' : 'white' : 'transparent',
              color: activeTab===id ? isDark ? '#60a5fa' : '#6366f1' : theme.textMuted,
              boxShadow: activeTab===id ? isDark ? '0 0 15px rgba(59,130,246,0.08)' : '0 1px 8px rgba(0,0,0,0.08)' : 'none',
            }}>
            {id==='issues' && openIssues.length>0 && (<span style={{ background: '#f43f5e', color: 'white', fontSize: '0.6rem', fontWeight: 700, padding: '1px 5px', borderRadius: 10 }}>{openIssues.length}</span>)}
            {label}
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
          {activeTab==='overview' && (
            <div>
              <div style={S.kpiGrid}>
                {[['Total Projects',projects.length,'#3b82f6'],['Open Issues',openIssues.length,'#f43f5e'],['In Review',inReview.length,'#f59e0b'],['Resolved',resolved.length,'#10b981']].map(([l,v,c],idx)=>(
                  <motion.div key={l} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + idx * 0.1 }}>
                    <FloatingCard style={{...S.kpiCard,borderTop:`2px solid ${c}`}} glowColor={`${c}20`}>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.6rem',color:'#64748b'}}>{l}</span>
                      <span style={{fontFamily:"'Outfit',sans-serif",fontWeight:800,fontSize:'2rem',color:c,textShadow:`0 0 20px ${c}30`}}>
                        <CountUp target={v} duration={1} />
                      </span>
                    </FloatingCard>
                  </motion.div>
                ))}
              </div>
              <div style={S.sectionTitle}>Recent Citizen Reports</div>
              <StaggerContainer style={S.activityList}>
                {issues.slice(0,6).map((issue,i)=>(
                  <StaggerItem key={i}>
                    <motion.div whileHover={{ backgroundColor: 'rgba(99,140,255,0.05)' }} style={S.activityItem}>
                      <div style={{...S.actDot,background:issue.severity==='high'?'#f43f5e':issue.severity==='medium'?'#f59e0b':'#10b981',boxShadow:`0 0 6px ${issue.severity==='high'?'#f43f5e':issue.severity==='medium'?'#f59e0b':'#10b981'}40`}}/>
                      <span style={{ fontSize: '0.7rem', color: theme.textMuted, minWidth: 90, fontFamily: "'JetBrains Mono',monospace" }}>{issue.date}</span>
                      <span style={{ fontSize: '0.82rem', color: theme.textPrimary, flex: 1 }}>{issue.title}</span>
                      <StatusBadge status={issue.status}/>
                      <span style={{fontSize:'0.7rem',color:'#64748b',fontFamily:"'JetBrains Mono',monospace"}}>▲{issue.reports}</span>
                    </motion.div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          )}

          {activeTab==='issues' && (
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
                <h2 style={S.sectionTitle}>All Citizen Reports ({issues.length})</h2>
                <div style={{display:'flex',gap:8}}>
                  {[`🔴 Open: ${openIssues.length}`,`🟡 Review: ${inReview.length}`,`🟢 Resolved: ${resolved.length}`].map(t=>(
                    <span key={t} style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.65rem',color:'#64748b',background:'rgba(15,22,41,0.4)',border:'1px solid rgba(99,140,255,0.08)',padding:'4px 9px',borderRadius:6}}>{t}</span>
                  ))}
                </div>
              </div>
              <StaggerContainer style={S.issueGrid}>
                {issues.map((issue)=>{
                  const proj = projects.find(p=>p.id===issue.projectId);
                  const sevColor = issue.severity==='high'?'#f43f5e':issue.severity==='medium'?'#f59e0b':'#10b981';
                  return (
                    <StaggerItem key={issue.id}>
                      <FloatingCard style={S.issueCard} glowColor={`${sevColor}15`}>
                        <div style={S.issueCardTop}>
                          <div style={{...S.sevBadge,background:`${sevColor}15`,color:sevColor,border:`1px solid ${sevColor}25`}}>{issue.severity.toUpperCase()}</div>
                          <StatusBadge status={issue.status}/>
                          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.65rem',color:'#60a5fa',marginLeft:'auto'}}>▲{issue.reports}</span>
                        </div>
                        <h4 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: '0.88rem', color: theme.textPrimary, marginBottom: 4 }}>{issue.title}</h4>
                        <p style={S.issueDesc}>{issue.description}</p>
                        <div style={S.issueMeta}>
                          <span>📍 {proj?.location}</span>
                          <span>👤 {issue.reporter}</span>
                          <span>📅 {issue.date}</span>
                        </div>
                        {issue.status !== 'resolved' && (
                          <div style={{display:'flex',gap:8,marginTop:10}}>
                            {issue.status === 'open' && (
                              <GlowButton onClick={()=>handleReview(issue.id)} variant="secondary" size="sm" icon={<Eye size={12}/>} style={{ flex: 1 }}>Review</GlowButton>
                            )}
                            <GlowButton onClick={()=>handleResolve(issue.id)} variant="success" size="sm" icon={<CheckCircle size={12}/>} style={{ flex: 1 }}>Resolve</GlowButton>
                          </div>
                        )}
                        {issue.status === 'resolved' && (
                          <div style={{marginTop:10,fontSize:'0.72rem',color:'#34d399',display:'flex',alignItems:'center',gap:4}}>
                            <CheckCircle size={12}/> Resolved · Citizen notified
                          </div>
                        )}
                        <BeforeAfterTimeline targetId={issue.id} type="issue" theme={theme} isDark={isDark} status={issue.status} />
                      </FloatingCard>
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>
            </div>
          )}

          {activeTab==='funds' && (
            <div>
              <h2 style={{...S.sectionTitle,marginBottom:'1rem'}}>Fund Utilization Tracker</h2>
              <StaggerContainer style={S.fundList}>
                {fundItems.map((f,i)=>{
                  const pct = Math.round(f.used/f.budget*100);
                  const efficient = pct <= f.progress + 10;
                  return (
                    <StaggerItem key={i}>
                      <FloatingCard style={S.fundCard}>
                        <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                          <span style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:'0.9rem',color:'#e2e8f0'}}>{f.name}</span>
                          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.68rem',color:efficient?'#34d399':'#fb7185',background:efficient?'rgba(16,185,129,0.1)':'rgba(244,63,94,0.1)',padding:'2px 8px',borderRadius:5,border:`1px solid ${efficient?'rgba(16,185,129,0.2)':'rgba(244,63,94,0.2)'}`}}>
                            {efficient?'✓ On Budget':'⚠ Over Budget'}
                          </span>
                        </div>
                        <div style={{display:'flex',gap:'2rem',marginBottom:10}}>
                          <div><div style={{fontSize:'0.62rem',color:'#64748b',fontFamily:"'JetBrains Mono',monospace"}}>BUDGET</div><div style={{fontWeight:700,fontSize:'0.9rem',color:'#e2e8f0'}}>₹{f.budget} Cr</div></div>
                          <div><div style={{fontSize:'0.62rem',color:'#64748b',fontFamily:"'JetBrains Mono',monospace"}}>SPENT</div><div style={{fontWeight:700,fontSize:'0.9rem',color:'#60a5fa'}}>₹{f.used} Cr</div></div>
                          <div><div style={{fontSize:'0.62rem',color:'#64748b',fontFamily:"'JetBrains Mono',monospace"}}>COMPLETION</div><div style={{fontWeight:700,fontSize:'0.9rem',color:'#94a3b8'}}><CountUp target={f.progress} suffix="%" /></div></div>
                          <div><div style={{fontSize:'0.62rem',color:'#64748b',fontFamily:"'JetBrains Mono',monospace"}}>UTILIZED</div><div style={{fontWeight:700,fontSize:'0.9rem',color:efficient?'#34d399':'#fb7185'}}><CountUp target={pct} suffix="%" /></div></div>
                        </div>
                        <div style={{height:8,background:'rgba(99,140,255,0.08)',borderRadius:4,overflow:'hidden',position:'relative'}}>
                          <motion.div initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }} transition={{ duration: 1 }} style={{height:'100%',background:efficient?'#3b82f6':'#f43f5e',borderRadius:4,boxShadow:`0 0 8px ${efficient?'rgba(59,130,246,0.4)':'rgba(244,63,94,0.4)'}`}}/>
                          <motion.div initial={{ left: 0 }} whileInView={{ left: `${f.progress}%` }} viewport={{ once: true }} transition={{ duration: 1 }} style={{position:'absolute',top:0,height:'100%',width:2,background:'#34d399',boxShadow:'0 0 4px rgba(52,211,153,0.5)'}}/>
                        </div>
                        <div style={{display:'flex',justifyContent:'space-between',marginTop:3}}>
                          <span style={{fontSize:'0.62rem',color:'#64748b',fontFamily:"'JetBrains Mono',monospace"}}>Fund: {pct}%</span>
                          <span style={{fontSize:'0.62rem',color:'#34d399',fontFamily:"'JetBrains Mono',monospace"}}>Work: {f.progress}%</span>
                        </div>
                      </FloatingCard>
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>
            </div>
          )}

          {activeTab==='projects' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: '1.1rem', color: theme.textPrimary, margin: 0 }}>
                  🏗️ Manage Projects
                </h2>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.62rem', color: theme.textMuted }}>
                  Click any card to view full details
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1rem' }}>
                {projects.map(p => {
                  const openCount = issues.filter(i => i.projectId === p.id && i.status === 'open').length;
                  const tc = p.trustScore >= 75 ? '#34d399' : p.trustScore >= 50 ? '#fbbf24' : '#fb7185';
                  const sc = statusColor[p.status];
                  const budgetNum = parseFloat((p.budget || '0').replace(/[^\d.]/g,''));
                  const spentNum = parseFloat((p.spent || '0').replace(/[^\d.]/g,''));
                  const spentPct = budgetNum > 0 ? Math.round((spentNum / budgetNum) * 100) : 0;
                  return (
                    <motion.div key={p.id}
                      whileHover={{ y: -3, boxShadow: isDark ? `0 12px 40px rgba(0,0,0,0.4), 0 0 20px ${tc}15` : `0 8px 30px rgba(0,0,0,0.12)` }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      style={{ background: isDark ? 'rgba(15,22,41,0.8)' : '#fff', borderRadius: 16, border: `1px solid ${isDark ? 'rgba(99,140,255,0.12)' : 'rgba(0,0,0,0.07)'}`, overflow: 'hidden', cursor: 'pointer' }}
                      onClick={() => setViewProject(p)}
                    >
                      {/* Top accent bar */}
                      <div style={{ height: 3, background: `linear-gradient(90deg, ${sc}, ${tc})` }} />
                      <div style={{ padding: '1.1rem' }}>
                        {/* Header row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.56rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{p.category}</div>
                            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: '0.95rem', color: theme.textPrimary, lineHeight: 1.3 }}>{p.title}</div>
                            <div style={{ fontSize: '0.72rem', color: theme.textMuted, marginTop: 3 }}>👷 {p.contractor}</div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 10 }}>
                            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '1.5rem', color: tc, lineHeight: 1 }}>{p.trustScore}</div>
                            <div style={{ fontSize: '0.54rem', color: tc, fontFamily: "'JetBrains Mono',monospace" }}>TRUST</div>
                          </div>
                        </div>

                        {/* Clickable stat chips */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 12 }}>
                          {[
                            { label: 'Budget', value: p.budget || '—', color: '#6366f1', icon: '💰' },
                            { label: 'Spent', value: p.spent || '—', color: '#3b82f6', icon: '💸' },
                            { label: 'Progress', value: `${p.progress}%`, color: sc, icon: '📊' },
                          ].map(({ label, value, color, icon }) => (
                            <div key={label}
                              onClick={e => { e.stopPropagation(); setViewProject(p); }}
                              style={{ padding: '7px 8px', borderRadius: 9, background: isDark ? `${color}12` : `${color}0a`, border: `1px solid ${color}22`, cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center' }}
                              onMouseEnter={e => { e.currentTarget.style.background = `${color}20`; e.currentTarget.style.borderColor = `${color}44`; }}
                              onMouseLeave={e => { e.currentTarget.style.background = isDark ? `${color}12` : `${color}0a`; e.currentTarget.style.borderColor = `${color}22`; }}
                            >
                              <div style={{ fontSize: '0.62rem', fontFamily: "'JetBrains Mono',monospace", color: theme.textMuted, marginBottom: 2 }}>{icon} {label}</div>
                              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: '0.85rem', color: theme.textPrimary }}>{value}</div>
                            </div>
                          ))}
                        </div>

                        {/* Progress bar */}
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                            <span style={{ fontSize: '0.65rem', color: theme.textMuted, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>COMPLETION</span>
                            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: sc, fontFamily: "'JetBrains Mono',monospace" }}>{p.progress}%</span>
                          </div>
                          <div style={{ height: 7, background: isDark ? 'rgba(99,140,255,0.08)' : 'rgba(0,0,0,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                            <motion.div initial={{ width: 0 }} animate={{ width: `${p.progress}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                              style={{ height: '100%', background: `linear-gradient(90deg, ${sc}, ${tc})`, borderRadius: 4, boxShadow: `0 0 8px ${sc}40` }} />
                          </div>
                        </div>

                        {/* Budget utilization bar */}
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                            <span style={{ fontSize: '0.65rem', color: theme.textMuted, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>BUDGET UTILIZED</span>
                            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: spentPct > p.progress + 10 ? '#fb7185' : '#34d399', fontFamily: "'JetBrains Mono',monospace" }}>
                              {spentPct}% {spentPct > p.progress + 10 ? '⚠' : '✓'}
                            </span>
                          </div>
                          <div style={{ height: 5, background: isDark ? 'rgba(99,140,255,0.08)' : 'rgba(0,0,0,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(spentPct, 100)}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                              style={{ height: '100%', background: spentPct > p.progress + 10 ? '#f43f5e' : '#3b82f6', borderRadius: 3 }} />
                          </div>
                        </div>

                        {/* Footer */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <StatusBadge status={p.status} />
                          <div style={{ display: 'flex', gap: 6 }}>
                            {openCount > 0 && (
                              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.62rem', color: '#fb7185', fontWeight: 700, background: 'rgba(244,63,94,0.1)', padding: '3px 7px', borderRadius: 6, border: '1px solid rgba(244,63,94,0.2)' }}>
                                ⚠ {openCount} issues
                              </span>
                            )}
                            <button onClick={e => { e.stopPropagation(); openUpdate(p); }}
                              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 7, background: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399', cursor: 'pointer', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.62rem', fontWeight: 600 }}>
                              <RefreshCw size={11} /> Update
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab==='contractors' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={S.sectionTitle}>👷 Contractor Trust Score Management</h2>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.62rem', color: theme.textMuted, background: isDark ? 'rgba(99,140,255,0.07)' : 'rgba(0,0,0,0.04)', padding: '4px 10px', borderRadius: 6, border: `1px solid ${theme.border}` }}>
                  Admin-controlled · Scores update platform-wide
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                {projects.map((p) => {
                  const cData = contractorScores[p.contractor] || { score: p.trustScore, notes: '' };
                  const scoreColor = cData.score >= 75 ? '#34d399' : cData.score >= 50 ? '#fbbf24' : '#fb7185';
                  const isEditing = editingContractor === p.contractor;
                  return (
                    <FloatingCard key={p.id} style={{ padding: '1.1rem' }} glowColor={`${scoreColor}12`}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.56rem', color: theme.textMuted, marginBottom: 2, textTransform: 'uppercase' }}>{p.category}</div>
                          <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: '0.85rem', color: theme.textPrimary }}>{p.contractor}</div>
                          <div style={{ fontSize: '0.7rem', color: theme.textMuted, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 10 }}>
                          <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '1.8rem', color: scoreColor, lineHeight: 1 }}>{cData.score}</div>
                          <div style={{ fontSize: '0.56rem', color: scoreColor, fontFamily: "'JetBrains Mono',monospace" }}>{cData.score >= 75 ? 'TRUSTED' : cData.score >= 50 ? 'AT RISK' : 'CRITICAL'}</div>
                        </div>
                      </div>
                      <div style={{ height: 5, background: isDark ? 'rgba(99,140,255,0.08)' : 'rgba(0,0,0,0.06)', borderRadius: 3, overflow: 'hidden', marginBottom: 10 }}>
                        <div style={{ height: '100%', width: `${cData.score}%`, background: scoreColor, borderRadius: 3, transition: 'width 0.4s' }} />
                      </div>
                      {cData.notes && (
                        <div style={{ fontSize: '0.7rem', color: theme.textMuted, fontStyle: 'italic', marginBottom: 8, padding: '5px 8px', background: isDark ? 'rgba(99,140,255,0.05)' : 'rgba(0,0,0,0.03)', borderRadius: 6, borderLeft: `2px solid ${scoreColor}` }}>
                          "{cData.notes}"
                        </div>
                      )}
                      {isEditing ? (
                        <div style={{ marginTop: 8, padding: '10px', background: isDark ? 'rgba(99,140,255,0.07)' : 'rgba(99,102,241,0.05)', borderRadius: 10, border: `1px solid ${isDark ? 'rgba(99,140,255,0.15)' : 'rgba(99,102,241,0.12)'}` }}>
                          <label style={{ display: 'block', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.58rem', color: theme.textMuted, marginBottom: 4, textTransform: 'uppercase' }}>
                            Trust Score: {editContractorScore}
                          </label>
                          <input type="range" min={0} max={100} value={editContractorScore}
                            onChange={e => setEditContractorScore(e.target.value)}
                            style={{ width: '100%', accentColor: editContractorScore >= 75 ? '#34d399' : editContractorScore >= 50 ? '#fbbf24' : '#fb7185', cursor: 'pointer', marginBottom: 6 }} />
                          <div style={{ height: 4, background: isDark ? 'rgba(99,140,255,0.08)' : 'rgba(0,0,0,0.06)', borderRadius: 2, overflow: 'hidden', marginBottom: 10 }}>
                            <div style={{ height: '100%', width: `${editContractorScore}%`, background: editContractorScore >= 75 ? '#34d399' : editContractorScore >= 50 ? '#fbbf24' : '#fb7185', borderRadius: 2, transition: 'width 0.2s' }} />
                          </div>
                          <label style={{ display: 'block', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.58rem', color: theme.textMuted, marginBottom: 4, textTransform: 'uppercase' }}>Admin Notes</label>
                          <input type="text" value={editContractorNotes} onChange={e => setEditContractorNotes(e.target.value)}
                            placeholder="Reason for score adjustment..."
                            style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: `1px solid ${isDark ? 'rgba(99,140,255,0.15)' : 'rgba(0,0,0,0.1)'}`, background: isDark ? 'rgba(15,22,41,0.8)' : '#f8f9fb', color: theme.textPrimary, fontSize: '0.78rem', fontFamily: "'Plus Jakarta Sans',sans-serif", outline: 'none', boxSizing: 'border-box', marginBottom: 10 }} />
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => setEditingContractor(null)}
                              style={{ flex: 1, padding: '7px', borderRadius: 7, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textMuted, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, fontSize: '0.75rem' }}>
                              Cancel
                            </button>
                            <button onClick={saveContractorScore}
                              style={{ flex: 2, padding: '7px', borderRadius: 7, border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: '0.75rem', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
                              ✓ Save Score
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingContractor(p.contractor); setEditContractorScore(cData.score); setEditContractorNotes(cData.notes || ''); }}
                          style={{ width: '100%', padding: '7px', borderRadius: 8, border: `1px solid ${isDark ? 'rgba(99,140,255,0.15)' : 'rgba(99,102,241,0.15)'}`, background: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.06)', color: '#6366f1', cursor: 'pointer', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.65rem', fontWeight: 600, transition: 'all 0.2s' }}>
                          ✏️ Edit Trust Score
                        </button>
                      )}
                    </FloatingCard>
                  );
                })}
              </div>
            </div>
          )}


          <AnimatePresence>
            {viewProject && (() => {
              const vp = viewProject;
              const tc = vp.trustScore >= 75 ? '#34d399' : vp.trustScore >= 50 ? '#fbbf24' : '#fb7185';
              const sc = statusColor[vp.status];
              const budgetNum = parseFloat((vp.budget || '0').replace(/[^\d.]/g,''));
              const spentNum = parseFloat((vp.spent || '0').replace(/[^\d.]/g,''));
              const spentPct = budgetNum > 0 ? Math.round((spentNum / budgetNum) * 100) : 0;
              const remaining = budgetNum > spentNum ? (budgetNum - spentNum).toFixed(1) : '0';
              const isResolved = vp.status === 'resolved';
              return (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                  onClick={() => setViewProject(null)}
                  style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.65)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem',overflowY:'auto'}}>
                  <motion.div initial={{scale:0.93,y:24}} animate={{scale:1,y:0}} exit={{scale:0.93,y:24}}
                    onClick={e => e.stopPropagation()}
                    style={{width:'100%',maxWidth:560,background: isDark ? 'rgba(10,16,36,0.99)' : '#fff',border:`1px solid ${isDark ? 'rgba(99,140,255,0.15)' : 'rgba(0,0,0,0.1)'}`,borderRadius:20,overflow:'hidden',boxShadow:'0 32px 80px rgba(0,0,0,0.45)'}}>

                    {/* Gradient top bar */}
                    <div style={{height:4,background:`linear-gradient(90deg,${sc},${tc})`}} />

                    <div style={{padding:'1.4rem',overflowY:'auto',maxHeight:'88vh'}}>
                      {/* Header */}
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1.2rem'}}>
                        <div>
                          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.58rem',color:'#6366f1',marginBottom:4,textTransform:'uppercase',letterSpacing:'0.1em'}}>{vp.category}</div>
                          <h2 style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:800,fontSize:'1.15rem',color:theme.textPrimary,margin:0,lineHeight:1.3}}>{vp.title}</h2>
                          <div style={{fontSize:'0.75rem',color:theme.textMuted,marginTop:4}}>📍 {vp.location}</div>
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <div style={{textAlign:'right'}}>
                            <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:800,fontSize:'2rem',color:tc,lineHeight:1}}>{vp.trustScore}</div>
                            <div style={{fontSize:'0.55rem',color:tc,fontFamily:"'JetBrains Mono',monospace"}}>TRUST SCORE</div>
                          </div>
                          <button onClick={() => setViewProject(null)} style={{background:'none',border:'none',cursor:'pointer',color:theme.textMuted,padding:4}}><X size={18}/></button>
                        </div>
                      </div>

                      <p style={{fontSize:'0.8rem',color:theme.textMuted,lineHeight:1.65,marginBottom:'1.2rem',padding:'10px 12px',background: isDark ? 'rgba(99,140,255,0.04)' : 'rgba(0,0,0,0.03)',borderRadius:10,borderLeft:`3px solid ${sc}`}}>{vp.description}</p>

                      {/* ── Budget Breakdown ── */}
                      <div style={{background: isDark ? 'rgba(99,102,241,0.07)' : 'rgba(99,102,241,0.05)',borderRadius:14,padding:'1rem',marginBottom:'1rem',border:`1px solid ${isDark ? 'rgba(99,140,255,0.12)' : 'rgba(99,102,241,0.1)'}`}}>
                        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.62rem',color:'#6366f1',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:10}}>💰 Budget Breakdown</div>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:12}}>
                          {[
                            {label:'Total Budget',value:`₹${vp.budget}`,color:'#6366f1',sub:'Sanctioned'},
                            {label:'Amount Spent',value:`₹${vp.spent || '—'}`,color:'#3b82f6',sub:`${spentPct}% utilized`},
                            {label:'Remaining',value:`₹${remaining} Cr`,color: remaining === '0' ? '#fb7185' : '#34d399',sub: remaining === '0' ? 'Overrun' : 'Available'},
                          ].map(({label,value,color,sub}) => (
                            <div key={label} style={{padding:'10px 10px',borderRadius:10,background: isDark ? `${color}12` : `${color}08`,border:`1px solid ${color}25`,textAlign:'center'}}>
                              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.54rem',color:theme.textMuted,marginBottom:4,textTransform:'uppercase'}}>{label}</div>
                              <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:800,fontSize:'0.95rem',color:theme.textPrimary}}>{value}</div>
                              <div style={{fontSize:'0.56rem',color,fontFamily:"'JetBrains Mono',monospace",marginTop:2}}>{sub}</div>
                            </div>
                          ))}
                        </div>
                        {/* Spend vs Work bars */}
                        <div style={{marginBottom:8}}>
                          <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                            <span style={{fontSize:'0.62rem',color:theme.textMuted,fontFamily:"'JetBrains Mono',monospace",fontWeight:600}}>WORK COMPLETION</span>
                            <span style={{fontSize:'0.62rem',fontWeight:800,color:sc}}>{vp.progress}%</span>
                          </div>
                          <div style={{height:8,background: isDark ? 'rgba(99,140,255,0.08)' : 'rgba(0,0,0,0.06)',borderRadius:4,overflow:'hidden',marginBottom:6}}>
                            <motion.div initial={{width:0}} animate={{width:`${vp.progress}%`}} transition={{duration:0.8}}
                              style={{height:'100%',background:`linear-gradient(90deg,${sc},${tc})`,borderRadius:4}} />
                          </div>
                          <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                            <span style={{fontSize:'0.62rem',color:theme.textMuted,fontFamily:"'JetBrains Mono',monospace",fontWeight:600}}>BUDGET UTILIZED</span>
                            <span style={{fontSize:'0.62rem',fontWeight:800,color: spentPct > vp.progress + 10 ? '#fb7185' : '#34d399'}}>{spentPct}% {spentPct > vp.progress + 10 ? '⚠ Over' : '✓ OK'}</span>
                          </div>
                          <div style={{height:6,background: isDark ? 'rgba(99,140,255,0.08)' : 'rgba(0,0,0,0.06)',borderRadius:3,overflow:'hidden'}}>
                            <motion.div initial={{width:0}} animate={{width:`${Math.min(spentPct,100)}%`}} transition={{duration:1}}
                              style={{height:'100%',background: spentPct > vp.progress + 10 ? '#f43f5e' : '#3b82f6',borderRadius:3}} />
                          </div>
                        </div>
                      </div>

                      {/* ── Timeline ── */}
                      <div style={{background: isDark ? 'rgba(52,211,153,0.05)' : 'rgba(16,185,129,0.04)',borderRadius:14,padding:'1rem',marginBottom:'1rem',border:`1px solid ${isDark ? 'rgba(52,211,153,0.1)' : 'rgba(16,185,129,0.1)'}`}}>
                        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.62rem',color:'#34d399',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:10}}>📅 Timeline</div>
                        <div style={{display:'flex',alignItems:'center',gap:0}}>
                          <div style={{textAlign:'center',flex:1}}>
                            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.58rem',color:theme.textMuted}}>START DATE</div>
                            <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:700,fontSize:'0.85rem',color:theme.textPrimary,marginTop:2}}>{vp.startDate || 'Jan 2024'}</div>
                          </div>
                          <div style={{flex:2,padding:'0 8px'}}>
                            <div style={{position:'relative',height:20,display:'flex',alignItems:'center'}}>
                              <div style={{height:3,background: isDark ? 'rgba(99,140,255,0.15)' : 'rgba(0,0,0,0.1)',borderRadius:2,flex:1}} />
                              <div style={{position:'absolute',left:0,height:3,width:`${vp.progress}%`,background:`linear-gradient(90deg,#34d399,${tc})`,borderRadius:2,maxWidth:'100%'}} />
                              <div style={{position:'absolute',left:`${vp.progress}%`,top:'50%',transform:'translate(-50%,-50%)',width:14,height:14,borderRadius:'50%',background:tc,boxShadow:`0 0 8px ${tc}60`,border:'2px solid white'}} />
                            </div>
                            <div style={{textAlign:'center',marginTop:4,fontFamily:"'JetBrains Mono',monospace",fontSize:'0.56rem',color:sc,fontWeight:700}}>{vp.progress}% COMPLETE</div>
                          </div>
                          <div style={{textAlign:'center',flex:1}}>
                            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.58rem',color:theme.textMuted}}>END DATE</div>
                            <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:700,fontSize:'0.85rem',color:theme.textPrimary,marginTop:2}}>{vp.endDate || 'Dec 2025'}</div>
                          </div>
                        </div>
                      </div>

                      {/* ── Contractor Details ── */}
                      <div style={{background: isDark ? 'rgba(59,130,246,0.06)' : 'rgba(59,130,246,0.04)',borderRadius:14,padding:'1rem',marginBottom:'1rem',border:`1px solid ${isDark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.1)'}`}}>
                        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.62rem',color:'#3b82f6',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:10}}>👷 Contractor Details</div>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                          {[['Name',vp.contractor],['Category',vp.category],['Location',vp.location||'Pune'],['Status',vp.status?.replace('-',' ').toUpperCase()]].map(([l,v])=>(
                            <div key={l} style={{padding:'8px 10px',borderRadius:8,background: isDark ? 'rgba(59,130,246,0.07)' : 'rgba(59,130,246,0.05)',border:'1px solid rgba(59,130,246,0.1)'}}>
                              <div style={{fontSize:'0.58rem',color:theme.textMuted,fontFamily:"'JetBrains Mono',monospace",marginBottom:3}}>{l}</div>
                              <div style={{fontSize:'0.82rem',fontWeight:700,color:theme.textPrimary}}>{v}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* ── Progress History ── */}
                      <div style={{background: isDark ? 'rgba(139,92,246,0.06)' : 'rgba(139,92,246,0.04)',borderRadius:14,padding:'1rem',marginBottom:'1rem',border:`1px solid ${isDark ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.1)'}`}}>
                        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.62rem',color:'#8b5cf6',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:10}}>📊 Progress History</div>
                        <div style={{display:'flex',gap:4,alignItems:'flex-end',height:48}}>
                          {[10,22,35,45,52,60,vp.progress].map((val,i)=>(
                            <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
                              <motion.div initial={{height:0}} animate={{height:`${(val/100)*44}px`}} transition={{duration:0.6,delay:i*0.07}}
                                style={{width:'100%',borderRadius:'3px 3px 0 0',background:i===6 ? tc : isDark ? 'rgba(139,92,246,0.3)' : 'rgba(139,92,246,0.2)'}} />
                              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.5rem',color:theme.textMuted}}>M{i+1}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
                        <StatusBadge status={vp.status}/>
                        <div style={{display:'flex',gap:8,alignItems:'center'}}>
                          <TrustScore score={vp.trustScore} size="md"/>
                          <button onClick={() => { setViewProject(null); openUpdate(vp); }}
                            style={{display:'flex',alignItems:'center',gap:5,padding:'6px 14px',borderRadius:8,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',border:'none',color:'white',cursor:'pointer',fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:700,fontSize:'0.75rem',boxShadow:'0 4px 14px rgba(99,102,241,0.3)'}}>
                            <RefreshCw size={12}/> Update Project
                          </button>
                        </div>
                      </div>

                      {/* Before/After — status-gated (upload only when Resolved) */}
                      <BeforeAfterTimeline targetId={vp.id} status={vp.status} />

                    </div>
                  </motion.div>
                </motion.div>
              );
            })()}
          </AnimatePresence>


          {/* ── Project Update Modal ── */}
          <AnimatePresence>
            {editProject && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                onClick={()=>setEditProject(null)}
                style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',backdropFilter:'blur(6px)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}>
                <motion.div initial={{scale:0.93,y:20}} animate={{scale:1,y:0}} exit={{scale:0.93,y:20}}
                  onClick={e=>e.stopPropagation()}
                  style={{width:'100%',maxWidth:420,background: isDark ? 'rgba(10,16,36,0.98)' : '#fff',border:`1px solid ${theme.border}`,borderRadius:18,padding:'1.5rem',boxShadow:'0 24px 64px rgba(0,0,0,0.35)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.2rem'}}>
                    <h2 style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:800,fontSize:'1rem',color:theme.textPrimary,margin:0}}>Update Project</h2>
                    <button onClick={()=>setEditProject(null)} style={{background:'none',border:'none',cursor:'pointer',color:theme.textMuted,padding:4}}><X size={18}/></button>
                  </div>
                  <p style={{fontSize:'0.8rem',color:'#6366f1',fontFamily:"'JetBrains Mono',monospace",marginBottom:'1.2rem'}}>{editProject.title}</p>

                  <div style={{marginBottom:'1rem'}}>
                    <label style={{display:'block',fontFamily:"'JetBrains Mono',monospace",fontSize:'0.62rem',color:theme.textMuted,marginBottom:6,textTransform:'uppercase',letterSpacing:'0.06em'}}>Status</label>
                    <div style={{display:'flex',gap:6}}>
                      {['on-track','delayed','critical'].map(s=>(
                        <button key={s} onClick={()=>setEditStatus(s)}
                          style={{flex:1,padding:'8px 4px',borderRadius:8,border:`1.5px solid ${editStatus===s ? statusColor[s] : theme.border}`,background: editStatus===s ? `${statusColor[s]}15` : 'transparent',
                            color: editStatus===s ? statusColor[s] : theme.textMuted,cursor:'pointer',fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:600,fontSize:'0.72rem',transition:'all 0.2s'}}>
                          {s==='on-track'?'On Track':s.charAt(0).toUpperCase()+s.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{marginBottom:'1.2rem'}}>
                    <label style={{display:'block',fontFamily:"'JetBrains Mono',monospace",fontSize:'0.62rem',color:theme.textMuted,marginBottom:6,textTransform:'uppercase',letterSpacing:'0.06em'}}>Progress: {editProgress}%</label>
                    <input type="range" min={0} max={100} value={editProgress} onChange={e=>setEditProgress(e.target.value)}
                      style={{width:'100%',accentColor:'#6366f1',cursor:'pointer'}}/>
                    <div style={{height:6,background: isDark ? 'rgba(99,140,255,0.08)' : 'rgba(0,0,0,0.06)',borderRadius:3,overflow:'hidden',marginTop:8}}>
                      <div style={{height:'100%',width:`${editProgress}%`,background:statusColor[editStatus]||'#6366f1',borderRadius:3,transition:'width 0.2s'}}/>
                    </div>
                  </div>

                  <div style={{marginBottom:'1.5rem'}}>
                    <label style={{display:'block',fontFamily:"'JetBrains Mono',monospace",fontSize:'0.62rem',color:theme.textMuted,marginBottom:6,textTransform:'uppercase',letterSpacing:'0.06em'}}>Amount Spent</label>
                    <div style={{display:'flex',gap:8,alignItems:'center'}}>
                      <input
                        type="text"
                        value={editSpent}
                        onChange={e=>setEditSpent(e.target.value)}
                        placeholder="e.g. ₹28.5 Cr"
                        style={{flex:1,padding:'10px 13px',borderRadius:9,border:`1.5px solid ${isDark ? 'rgba(99,140,255,0.12)' : 'rgba(0,0,0,0.08)'}`,background: isDark ? 'rgba(15,22,41,0.6)' : '#f2f3f7',color:theme.textPrimary,fontSize:'0.85rem',fontFamily:"'Plus Jakarta Sans',sans-serif",outline:'none',transition:'all 0.3s'}}
                      />
                      <div style={{padding:'8px 12px',borderRadius:8,background: isDark ? 'rgba(59,130,246,0.08)' : 'rgba(99,102,241,0.06)',border:`1px solid ${isDark ? 'rgba(59,130,246,0.15)' : 'rgba(99,102,241,0.12)'}`,fontSize:'0.7rem',fontFamily:"'JetBrains Mono',monospace",color:theme.textMuted,whiteSpace:'nowrap'}}>
                        Budget: {editProject?.budget || '—'}
                      </div>
                    </div>
                    {editProject?.budget && editSpent && (() => {
                      const budgetNum = parseFloat(editProject.budget.replace(/[^\d.]/g, ''));
                      const spentNum = parseFloat(editSpent.replace(/[^\d.]/g, ''));
                      if (!isNaN(budgetNum) && !isNaN(spentNum) && budgetNum > 0) {
                        const pct = Math.round((spentNum / budgetNum) * 100);
                        const over = pct > Number(editProgress) + 10;
                        return (
                          <div style={{marginTop:8,display:'flex',alignItems:'center',gap:8}}>
                            <div style={{flex:1,height:5,background: isDark ? 'rgba(99,140,255,0.08)' : 'rgba(0,0,0,0.06)',borderRadius:3,overflow:'hidden'}}>
                              <div style={{height:'100%',width:`${Math.min(pct,100)}%`,background:over?'#f43f5e':'#3b82f6',borderRadius:3,transition:'width 0.3s'}}/>
                            </div>
                            <span style={{fontSize:'0.65rem',fontFamily:"'JetBrains Mono',monospace",color:over?'#fb7185':'#34d399',fontWeight:600}}>
                              {pct}% utilized {over ? '⚠ Over' : '✓ OK'}
                            </span>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  <div style={{display:'flex',gap:8}}>
                    <button onClick={()=>setEditProject(null)}
                      style={{flex:1,padding:'10px',borderRadius:10,border:`1px solid ${theme.border}`,background:'transparent',color:theme.textMuted,cursor:'pointer',fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:600,fontSize:'0.82rem'}}>Cancel</button>
                    <button onClick={saveUpdate}
                      style={{flex:2,padding:'10px',borderRadius:10,border:'none',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'white',cursor:'pointer',fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:700,fontSize:'0.82rem',boxShadow:'0 4px 16px rgba(99,102,241,0.3)'}}>Save Changes</button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </AnimatedPage>
  );
}

const S = {
  page:{padding:'1.5rem',maxWidth:1300,margin:'0 auto'},
  locked:{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'60vh',gap:'1rem'},
  header:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1.5rem'},
  h1:{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:800,fontSize:'1.75rem',margin:0},
  sub:{color:'#64748b',fontSize:'0.85rem',marginTop:4},
  adminBadge:{padding:'6px 14px',borderRadius:8,background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.2)',color:'#6366f1',fontFamily:"'JetBrains Mono',monospace",fontSize:'0.7rem',fontWeight:600},
  sectionTitle:{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:700,fontSize:'1rem',margin:'0 0 1rem'},
  kpiGrid:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginBottom:'1.5rem'},
  kpiCard:{padding:'1.2rem',display:'flex',flexDirection:'column'},
  activityList:{borderRadius:14,overflow:'hidden',border:'1px solid rgba(99,140,255,0.06)'},
  activityItem:{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',borderBottom:'1px solid rgba(99,140,255,0.05)',transition:'background 0.2s'},
  actDot:{width:10,height:10,borderRadius:'50%',flexShrink:0},
  issueGrid:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:'1rem'},
  issueCard:{padding:'1rem'},
  issueCardTop:{display:'flex',alignItems:'center',gap:8,marginBottom:8,flexWrap:'wrap'},
  sevBadge:{padding:'3px 8px',borderRadius:6,fontSize:'0.62rem',fontWeight:700,fontFamily:"'JetBrains Mono',monospace"},
  issueDesc:{fontSize:'0.78rem',color:'var(--muted,#6b7280)',lineHeight:1.5,marginBottom:8},
  issueMeta:{display:'flex',flexDirection:'column',gap:3,fontSize:'0.7rem',color:'var(--muted,#6b7280)'},
  fundList:{display:'flex',flexDirection:'column',gap:'1rem'},
  fundCard:{padding:'1.2rem'},
  th:{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.62rem',color:'#64748b',padding:'8px 16px',textAlign:'left',borderBottom:'1px solid rgba(99,140,255,0.08)',textTransform:'uppercase',letterSpacing:'0.06em'},
  td:{padding:'12px 16px',borderBottom:'1px solid rgba(99,140,255,0.05)'},
  actionBtn:{display:'flex',alignItems:'center',gap:4,padding:'5px 10px',borderRadius:7,background:'rgba(99,102,241,0.08)',border:'1px solid rgba(99,102,241,0.15)',color:'#6366f1',cursor:'pointer',fontFamily:"'JetBrains Mono',monospace",fontSize:'0.65rem',transition:'background 0.2s'},
  toast:{position:'fixed',top:24,right:24,background:'rgba(15,23,42,0.9)',backdropFilter:'blur(20px)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:12,padding:'12px 20px',boxShadow:'0 8px 32px rgba(0,0,0,0.3)',zIndex:9999,color:'#34d399',fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:600,fontSize:'0.85rem'},
};
