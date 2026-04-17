import React from 'react';
import { motion } from 'framer-motion';
import { projects } from '../data/mockData';
import { useIssues } from '../IssueContext';
import { useTheme } from '../ThemeContext';
import TrustScore from '../components/TrustScore';
import { Shield, TrendingUp, TrendingDown } from 'lucide-react';
import GovernanceShareCard from '../components/GovernanceShareCard';
import { AnimatedPage, FloatingCard, CountUp, StaggerContainer, StaggerItem } from '../components/AnimatedPage';

export default function TrustPage() {
  const { issues } = useIssues();
  const { theme, isDark } = useTheme();
  const avgTrust = Math.round(projects.reduce((a,p)=>a+p.trustScore,0)/projects.length);
  const sorted = [...projects].sort((a,b)=>b.trustScore-a.trustScore);

  return (
    <AnimatedPage style={S.page}>
      <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: '1.75rem', color: theme.textPrimary }}>Trust Scores</h1>
        <p style={{ color: theme.textMuted, fontSize: '0.85rem', marginTop: 4 }}>AI-computed trust metrics for all infrastructure projects</p>
      </motion.div>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div style={S.cityCard}>
          {/* Shimmer effect overlay for the dark gradient card */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0) 100%)', backgroundSize: '200% 200%', animation: 'shimmer 4s ease-out infinite', zIndex: 0, borderRadius: 'inherit' }} />
          
          <div style={{ ...S.cityLeft, position: 'relative', zIndex: 1 }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} style={S.cityIcon}>
              <Shield size={28} color="white"/>
            </motion.div>
            <div>
              <div style={S.cityLabel}>CITY TRUST SCORE</div>
              <div style={S.cityScore}><CountUp target={avgTrust} duration={1.5} /><span style={S.cityMax}>/100</span></div>
              <div style={S.cityNote}>Based on {projects.length} active projects · {issues.length} citizen reports</div>
            </div>
          </div>
          
          <div style={{ ...S.cityMetrics, position: 'relative', zIndex: 1 }}>
            {[['Timeliness', 82], ['Transparency', 91], ['Issue Resolve', 88], ['Citizen Satis.', 79]].map(([l, v], idx) => (
              <div key={l} style={S.cityMetric}>
                <div style={S.cmLabel}>{l}</div>
                <div style={S.cmVal}><CountUp target={v} suffix="%" duration={1.5} /></div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: '1.1rem', color: theme.textPrimary, marginBottom: '1rem' }}>
        Project Rankings
      </motion.h2>

      <StaggerContainer style={S.rankList}>
        {sorted.map((p,i)=>{
          const openCount = issues.filter(x=>x.projectId===p.id&&x.status==='open').length;
          const trustColor = p.trustScore>=75?'#34d399':p.trustScore>=50?'#fbbf24':'#fb7185';
          return (
            <StaggerItem key={p.id}>
              <FloatingCard style={S.rankCard} glowColor={`${trustColor}15`}>
                <div style={{...S.rank,color:i<3?['#fbbf24','#94a3b8','#cd7c2e'][i]:'#475569',fontFamily:"'Outfit',sans-serif",fontWeight:800}}>#{i+1}</div>
                <div style={S.rankInfo}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                    <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: '0.9rem', color: theme.textPrimary }}>{p.title}</span>
                    <TrustScore score={p.trustScore} size="md"/>
                  </div>
                  <div style={{display:'flex',gap:'1.5rem',marginBottom:6}}>
                    <span style={{fontSize:'0.72rem',color:'#64748b'}}>{p.category} · {p.location.split(',')[0]}</span>
                    <span style={{fontSize:'0.72rem',color:openCount>0?'#fb7185':'#34d399',fontFamily:"'JetBrains Mono',monospace"}}>{openCount>0?`⚠ ${openCount} issues`:'✓ Clear'}</span>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <div style={{flex:1,height:6,background:'rgba(99,140,255,0.08)',borderRadius:3,overflow:'hidden'}}>
                      <motion.div initial={{ width: 0 }} whileInView={{ width: `${p.trustScore}%` }} viewport={{ once: true }} transition={{ duration: 1 }} style={{height:'100%',background:trustColor,borderRadius:3,boxShadow:`0 0 8px ${trustColor}40`}}/>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:3,fontSize:'0.7rem',color:trustColor}}>
                      {p.trustScore>=75?<TrendingUp size={12}/>:<TrendingDown size={12}/>}
                      <span style={{fontWeight:700,fontFamily:"'JetBrains Mono',monospace"}}>{p.trustScore>=75?'Healthy':p.trustScore>=50?'At Risk':'Critical'}</span>
                    </div>
                  </div>
                </div>
              </FloatingCard>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} style={{marginTop:'1.5rem'}}>
        <GovernanceShareCard />
      </motion.div>
    </AnimatedPage>
  );
}

const S = {
  page:{padding:'1.5rem',maxWidth:1000,margin:'0 auto'},
  cityCard:{position: 'relative', background:'linear-gradient(135deg,#111d3a,#1e3a8a)',borderRadius:16,padding:'1.5rem',marginBottom:'2rem',display:'flex',justifyContent:'space-between',alignItems:'center',boxShadow:'0 8px 40px rgba(0,0,0,0.4), 0 0 30px rgba(59,130,246,0.1)',flexWrap:'wrap',gap:'1rem',border:'1px solid rgba(59,130,246,0.15)', overflow: 'hidden'},
  cityLeft:{display:'flex',alignItems:'center',gap:'1.2rem'},
  cityIcon:{width:60,height:60,background:'rgba(59,130,246,0.2)',borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid rgba(59,130,246,0.3)',boxShadow:'0 0 20px rgba(59,130,246,0.15)'},
  cityLabel:{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.62rem',color:'rgba(255,255,255,0.4)',letterSpacing:'0.1em',marginBottom:4},
  cityScore:{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:800,fontSize:'3rem',color:'white',lineHeight:1,textShadow:'0 0 30px rgba(59,130,246,0.4)'},
  cityMax:{fontSize:'1.2rem',opacity:0.4},
  cityNote:{fontSize:'0.75rem',color:'rgba(255,255,255,0.35)',marginTop:4},
  cityMetrics:{display:'flex',gap:'1.5rem',flexWrap:'wrap'},
  cityMetric:{textAlign:'center'},
  cmLabel:{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.58rem',color:'rgba(255,255,255,0.35)',marginBottom:3},
  cmVal:{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:700,fontSize:'1.2rem',color:'white'},
  rankList:{display:'flex',flexDirection:'column',gap:'0.75rem'},
  rankCard:{padding:'1rem 1.2rem',display:'flex',alignItems:'center',gap:'1rem'},
  rank:{fontSize:'1.2rem',width:36,textAlign:'center',flexShrink:0},
  rankInfo:{flex:1},
};
