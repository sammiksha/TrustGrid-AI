import React from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { statusColor } from '../data/mockData';
import { useProjects } from '../ProjectContext';
import { useIssues } from '../IssueContext';
import StatusBadge from '../components/StatusBadge';
import TrustScore from '../components/TrustScore';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import { AnimatedPage, FloatingCard, CountUp, StaggerContainer, StaggerItem } from '../components/AnimatedPage';
import { useTheme } from '../ThemeContext';
import GlowButton from '../components/GlowButton';
import { ArrowLeft, MapPin, Calendar, User, IndianRupee, AlertTriangle } from 'lucide-react';

export default function ProjectDetail() {
  const { id } = useParams();
  const { issues } = useIssues();
  const { projects } = useProjects();
  const { theme, isDark } = useTheme();
  
  const p = projects.find(x => x.id === parseInt(id) || x.id === id);
  if (!p) return <AnimatedPage style={{padding:'2rem',color:theme.textMuted}}>Project not found.</AnimatedPage>;
  const projIssues = issues.filter(i => i.projectId === p.id);
  const S = getStyles(theme, isDark);

  return (
    <AnimatedPage style={S.page}>
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
        <Link to="/projects" style={S.back}><ArrowLeft size={15}/>Back to Projects</Link>
      </motion.div>
      <div style={S.grid}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <FloatingCard style={S.main} glowColor={`${statusColor[p.status]}20`}>
            <div style={{...S.statusBar,background:statusColor[p.status],boxShadow:`0 0 10px ${statusColor[p.status]}30`}}/>
            <div style={S.mainInner}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1.2rem'}}>
                <div>
                  <div style={S.catTag}>{p.category}</div>
                  <h1 style={S.h1}>{p.title}</h1>
                  <div style={{display:'flex',alignItems:'center',gap:5,marginTop:4}}>
                    <MapPin size={13} color={theme.textMuted}/>
                    <span style={{fontSize:'0.85rem',color:theme.textMuted,fontWeight:500}}>{p.location}</span>
                  </div>
                </div>
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.6rem',color:theme.textMuted,fontWeight:600}}>TRUST SCORE</span>
                  <TrustScore score={p.trustScore} size="lg"/>
                </div>
              </div>
              <StatusBadge status={p.status}/>
              <p style={S.desc}>{p.description}</p>
              
              <StaggerContainer style={S.infoGrid}>
                {[['Budget',p.budget,IndianRupee],['Spent',p.spent,IndianRupee],['Contractor',p.contractor,User],['End Date',p.endDate,Calendar]].map(([l,v,Icon])=>(
                  <StaggerItem key={l}>
                    <div style={S.infoCard}>
                      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
                        <Icon size={14} color={theme.primary}/>
                        <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.65rem',color:theme.textMuted,fontWeight:600,textTransform:'uppercase'}}>{l}</span>
                      </div>
                      <span style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:'1rem',color:theme.textPrimary}}>{v}</span>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
              
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={S.progressSection}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                  <span style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:'0.95rem',color:theme.textPrimary}}>Progress</span>
                  <span style={{fontFamily:"'Outfit',sans-serif",fontWeight:800,color:statusColor[p.status],fontSize:'1.1rem'}}><CountUp target={p.progress} suffix="%" /></span>
                </div>
                <div style={{height:12,background:isDark?'rgba(0,0,0,0.2)':'rgba(0,0,0,0.05)',borderRadius:6,overflow:'hidden'}}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${p.progress}%` }} transition={{ duration: 1.5, ease: "easeOut" }} style={{height:'100%',background:statusColor[p.status],borderRadius:6,boxShadow:`0 0 12px ${statusColor[p.status]}50`}}/>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',marginTop:6}}>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.65rem',color:theme.textMuted,fontWeight:600}}>START: {p.startDate}</span>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.65rem',color:theme.textMuted,fontWeight:600}}>END: {p.endDate}</span>
                </div>
              </motion.div>
              <div style={{ marginTop: '1.2rem' }}>
                <BeforeAfterSlider projectId={p.id} status={p.status} />
              </div>
            </div>
          </FloatingCard>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <FloatingCard style={{ ...S.sideCard, marginBottom: '1rem' }}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:'1rem'}}>
              <AlertTriangle size={16} color={projIssues.length>0?'#fb7185':'#34d399'}/>
              <h3 style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:'1rem',color:theme.textPrimary}}>Issues ({projIssues.length})</h3>
            </div>
            {projIssues.length === 0 ? (
              <div style={{textAlign:'center',padding:'1.5rem',color:theme.textMuted,fontSize:'0.85rem',fontWeight:500,background:isDark?'rgba(0,0,0,0.1)':'rgba(0,0,0,0.02)',borderRadius:10}}>✓ No reported issues</div>
            ) : (
              <StaggerContainer>
                {projIssues.map(issue=>(
                  <StaggerItem key={issue.id}>
                    <div style={S.issueCard}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4}}>
                        <span style={{fontSize:'0.85rem',fontWeight:700,color:theme.textPrimary}}>{issue.title}</span>
                        <StatusBadge status={issue.status}/>
                      </div>
                      <p style={{fontSize:'0.75rem',color:theme.textSecondary,lineHeight:1.5,marginBottom:6}}>{issue.description}</p>
                      <div style={{display:'flex',gap:8,fontSize:'0.65rem',color:theme.textMuted,fontFamily:"'JetBrains Mono',monospace",fontWeight:600}}>
                        <span>▲{issue.reports}</span>
                        <span>{issue.date}</span>
                        <span style={{color:issue.severity==='high'?'#fb7185':issue.severity==='medium'?'#fbbf24':'#10b981',fontWeight:800}}>{issue.severity.toUpperCase()}</span>
                      </div>
                      {issue.status === 'resolved' && (
                        <div style={{ marginTop: '0.75rem' }}>
                          <BeforeAfterSlider projectId={issue.id} status={issue.status} isAdmin={false} />
                        </div>
                      )}
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </FloatingCard>
          
          <FloatingCard style={S.sideCard}>
            <h3 style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:'1rem',color:theme.textPrimary,marginBottom:'1rem'}}>Trust Breakdown</h3>
            {[['Timeliness',p.progress],['Transparency',Math.min(100,p.trustScore+10)],['Budget Discipline',Math.round(100-Math.abs(p.progress-p.trustScore)*0.5)]].map(([l,v], idx)=>{
              const barColor = v>=70?'#10b981':v>=50?'#f59e0b':'#f43f5e';
              return (
                <motion.div key={l} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + idx * 0.1 }} style={{marginBottom:12}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                    <span style={{fontSize:'0.8rem',fontWeight:600,color:theme.textSecondary}}>{l}</span>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.75rem',fontWeight:800,color:barColor}}><CountUp target={v} suffix="%" /></span>
                  </div>
                  <div style={{height:6,background:isDark?'rgba(0,0,0,0.2)':'rgba(0,0,0,0.05)',borderRadius:3,overflow:'hidden'}}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${v}%` }} transition={{ duration: 1, delay: 0.5 }} style={{height:'100%',background:barColor,borderRadius:3,boxShadow:`0 0 8px ${barColor}50`}}/>
                  </div>
                </motion.div>
              );
            })}
          </FloatingCard>
        </motion.div>
      </div>
    </AnimatedPage>
  );
}

const getStyles = (theme, isDark) => ({
  page:{padding:'1.5rem',maxWidth:1200,margin:'0 auto'},
  back:{display:'inline-flex',alignItems:'center',gap:6,fontFamily:"'JetBrains Mono',monospace",fontSize:'0.75rem',color:theme.primary,fontWeight:600,textDecoration:'none',marginBottom:'1.2rem', padding: '6px 12px', background: isDark?'rgba(14,165,233,0.1)':'rgba(99,102,241,0.08)', borderRadius: '8px', transition: 'all 0.2s', border:`1px solid ${theme.borderHover}`},
  grid:{display:'grid',gridTemplateColumns:'1fr 340px',gap:'1.5rem',alignItems:'start'},
  main:{overflow:'hidden'},
  statusBar:{height:5},
  mainInner:{padding:'1.8rem'},
  catTag:{display:'inline-block',background:isDark?'rgba(14,165,233,0.15)':'rgba(99,102,241,0.1)',color:theme.primary,padding:'4px 10px',borderRadius:7,fontSize:'0.7rem',fontWeight:800,fontFamily:"'JetBrains Mono',monospace",marginBottom:8,border:`1px solid ${isDark?'rgba(14,165,233,0.25)':'rgba(99,102,241,0.2)'}`},
  h1:{fontFamily:"'Outfit',sans-serif",fontWeight:800,fontSize:'1.8rem',color:theme.textPrimary,margin:0},
  desc:{fontSize:'0.9rem',color:theme.textSecondary,lineHeight:1.6,margin:'1.2rem 0',fontWeight:400},
  infoGrid:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1.5rem'},
  infoCard:{background:isDark?'rgba(0,0,0,0.15)':theme.surfaceMid,borderRadius:12,padding:'1rem',border:`1px solid ${theme.border}`,boxShadow:'0 2px 8px rgba(0,0,0,0.02)'},
  progressSection:{background:isDark?'rgba(0,0,0,0.15)':theme.surfaceMid,borderRadius:12,padding:'1.2rem',border:`1px solid ${theme.border}`,boxShadow:'0 2px 8px rgba(0,0,0,0.02)'},
  sideCard:{padding:'1.5rem'},
  issueCard:{background:isDark?'rgba(0,0,0,0.15)':theme.surfaceMid,borderRadius:12,padding:'12px 14px',border:`1px solid ${theme.border}`,marginBottom:10,boxShadow:'0 2px 8px rgba(0,0,0,0.02)'},
});
