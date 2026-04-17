import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjects } from '../ProjectContext';
import { useIssues } from '../IssueContext';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';
import AIClassifier from '../components/AIClassifier';
import VoiceReportButton from '../components/VoiceReportButton';
import { AnimatedPage, FloatingCard } from '../components/AnimatedPage';
import GlowButton from '../components/GlowButton';
import { 
  Camera, MapPin, Send, CheckCircle, 
  AlertTriangle, Droplet, Clock, ShieldAlert, 
  Volume2, DollarSign, Trash2, CloudRain, 
  Lightbulb, HelpCircle, ArrowRight, ArrowLeft 
} from 'lucide-react';

const categories = ['Pothole', 'Pipeline Burst', 'Construction Delay', 'Safety Hazard', 'Noise Violation', 'Fund Misuse', 'Debris Blocking', 'Flooding', 'Street Light', 'Other'];
const severities = ['low', 'medium', 'high'];
const sevColors = { low: '#10b981', medium: '#f59e0b', high: '#f43f5e' };

const categoryIcons = {
  'Pothole': AlertTriangle,
  'Pipeline Burst': Droplet,
  'Construction Delay': Clock,
  'Safety Hazard': ShieldAlert,
  'Noise Violation': Volume2,
  'Fund Misuse': DollarSign,
  'Debris Blocking': Trash2,
  'Flooding': CloudRain,
  'Street Light': Lightbulb,
  'Other': HelpCircle
};

const categoryDesc = {
  'Pothole': 'Road damage or craters',
  'Pipeline Burst': 'Water leakage or burst',
  'Construction Delay': 'Stalled civic projects',
  'Safety Hazard': 'Dangerous public areas',
  'Noise Violation': 'Loud noise beyond limits',
  'Fund Misuse': 'Suspected corruption',
  'Debris Blocking': 'Waste blocking paths',
  'Flooding': 'Water logging issues',
  'Street Light': 'Broken or off lights',
  'Other': 'Any other civic issue'
};

const steps = ['Category', 'Details', 'Priority', 'Submit'];

export default function ReportPage() {
  const { addIssue } = useIssues();
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  const { projects } = useProjects();
  
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ title: '', projectId: '', category: '', severity: 'medium', description: '', location: '', photo: null, otherProject: '' });
  const [submitted, setSubmitted] = useState(false);
  const [refId, setRefId] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Automatically advance step if AI populates data and we are in step 1/2? No, let user advance.

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  
  const handleAIResult = (result) => { 
    setAiResult(result); 
    if (result.severity) set('severity', result.severity); 
  };
  
  const handleVoiceResult = (parsed) => {
    if (parsed.title) set('title', parsed.title);
    if (parsed.category) set('category', parsed.category);
    if (parsed.severity) set('severity', parsed.severity);
    if (parsed.description) set('description', parsed.description);
    if (parsed.location) set('location', parsed.location);
  };

  const handleGPS = () => { 
    navigator.geolocation?.getCurrentPosition(
      pos => set('location', `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`), 
      () => set('location', 'Pune, Maharashtra')
    ); 
  };

  const handleSubmit = async () => {
    if (!form.title || !form.projectId || !form.description) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    const isOther = form.projectId === 'other';
    const proj = isOther ? null : projects.find(p => p.id === parseInt(form.projectId));
    const id = `TG-${Date.now().toString().slice(-6)}`;
    
    await addIssue({
      projectId: isOther ? 0 : parseInt(form.projectId),
      title: form.title,
      severity: form.severity,
      lat: proj?.lat || 18.5204,
      lng: proj?.lng || 73.8567,
      description: form.description,
      reporter: user?.name || 'Citizen',
      reporterEmail: user?.email || '',
      category: form.category,
      location: form.location || proj?.location || form.otherProject || 'Pune',
      aiLabel: aiResult?.label || null,
      aiConfidence: aiResult?.confidence || null,
      otherProject: isOther ? form.otherProject : null,
    });
    
    setRefId(id);
    setLoading(false);
    setSubmitted(true);
  };

  const inputStyle = {
    background: isDark ? 'rgba(15,22,41,0.6)' : '#f2f3f7',
    border: `1.5px solid ${isDark ? 'rgba(99,140,255,0.12)' : 'rgba(0,0,0,0.08)'}`,
    borderRadius: 9, padding: '12px 16px',
    color: theme.textPrimary,
    fontSize: '0.85rem', fontFamily: "'Plus Jakarta Sans',sans-serif",
    outline: 'none', width: '100%', boxSizing: 'border-box',
    transition: 'all 0.3s',
  };

  if (submitted) return (
    <AnimatedPage style={{ padding: '1.5rem', maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '75vh' }}>
      <FloatingCard style={{ padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', maxWidth: 420, width: '100%' }} glowColor="rgba(52,211,153,0.15)">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }}
          style={{ width: 80, height: 80, background: 'rgba(16,185,129,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(16,185,129,0.2)', boxShadow: '0 0 30px rgba(52,211,153,0.15)' }}>
          <CheckCircle size={48} color="#34d399" />
        </motion.div>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: '1.4rem', color: theme.textPrimary, textAlign: 'center' }}>Issue Reported Successfully!</h2>
        <p style={{ color: theme.textMuted, fontSize: '0.83rem', textAlign: 'center', lineHeight: 1.6 }}>Your report is now live on the map and visible to government admins.</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isDark ? 'rgba(15,22,41,0.6)' : '#f2f3f7', borderRadius: 10, padding: '10px 14px', width: '100%', border: `1px solid ${theme.border}` }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.7rem', color: theme.textMuted }}>Reference ID</span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.95rem', color: '#6366f1', fontWeight: 700 }}>{refId}</span>
        </div>
        {aiResult && <div style={{ background: isDark ? 'rgba(59,130,246,0.08)' : 'rgba(99,102,241,0.06)', border: `1px solid rgba(99,102,241,0.15)`, borderRadius: 9, padding: '9px 14px', width: '100%', textAlign: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: theme.textMuted }}>AI classified as: <strong style={{ color: theme.textPrimary }}>{aiResult.label}</strong> ({aiResult.confidence}% confidence)</span>
        </div>}
        <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 8, padding: '8px 14px', fontSize: '0.75rem', color: '#10b981', width: '100%', textAlign: 'center' }}>
          ✓ Visible on live map · admin panel · issue feed
        </div>
        <GlowButton variant="primary" onClick={() => { setSubmitted(false); setStep(1); setForm({ title: '', projectId: '', category: '', severity: 'medium', description: '', location: '', photo: null, otherProject: '' }); setAiResult(null); }}>
          Report Another Issue
        </GlowButton>
      </FloatingCard>
    </AnimatedPage>
  );

  return (
    <AnimatedPage style={{ padding: '1.5rem', maxWidth: 1100, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: '1.75rem', color: theme.textPrimary }}>Report an Issue</h1>
        <p style={{ color: theme.textMuted, fontSize: '0.82rem', marginTop: 4 }}>Geo-tagged · Firebase-stored · AI-analyzed · Real-time visibility</p>
      </motion.div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'start' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ flex: '1 1 500px' }}>
          <FloatingCard style={{ padding: '2rem' }}>
            
            {/* Progress indicator */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '16px', left: '10%', right: '10%', height: 2, background: isDark ? 'rgba(99,140,255,0.1)' : 'rgba(0,0,0,0.05)', zIndex: 0 }} />
              {steps.map((s, i) => (
                <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 1, flex: 1 }}>
                  <div style={{ 
                    width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: step > i + 1 ? '#10b981' : step === i + 1 ? '#6366f1' : (isDark ? '#1e293b' : '#e2e8f0'),
                    color: step >= i + 1 ? '#fff' : theme.textMuted,
                    fontWeight: 'bold', fontSize: '0.9rem',
                    transition: 'all 0.3s',
                    boxShadow: step === i + 1 ? '0 0 15px rgba(99,102,241,0.4)' : 'none',
                  }}>
                    {step > i + 1 ? <CheckCircle size={16} /> : i + 1}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: step >= i + 1 ? theme.textPrimary : theme.textMuted, fontWeight: step >= i + 1 ? 600 : 400 }}>{s}</span>
                </div>
              ))}
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                  <h2 style={{ fontSize: '1.1rem', color: theme.textPrimary, marginBottom: '1.5rem', fontWeight: 600 }}>Select Issue Category</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem' }}>
                    {categories.map(c => {
                      const Icon = categoryIcons[c] || HelpCircle;
                      const isSelected = form.category === c;
                      return (
                        <div 
                          key={c} 
                          onClick={() => set('category', c)}
                          style={{
                            border: `1.5px solid ${isSelected ? '#6366f1' : (isDark ? 'rgba(99,140,255,0.1)' : 'rgba(0,0,0,0.08)')}`,
                            background: isSelected ? (isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.05)') : 'transparent',
                            borderRadius: 12, padding: '1rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                            transition: 'all 0.2s',
                            boxShadow: isSelected ? '0 0 15px rgba(99,102,241,0.2)' : 'none'
                          }}
                        >
                          <Icon size={24} color={isSelected ? '#6366f1' : theme.textMuted} />
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: isSelected ? '#6366f1' : theme.textPrimary }}>{c}</div>
                            <div style={{ fontSize: '0.65rem', color: theme.textMuted, marginTop: 4 }}>{categoryDesc[c]}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.1rem', color: theme.textPrimary, marginBottom: '0.5rem', fontWeight: 600 }}>Provide Details</h2>
                  <div>
                    <label style={{ display: 'block', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.62rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Issue Title *</label>
                    <input style={inputStyle} placeholder="e.g. Large pothole near main junction" value={form.title} onChange={e => set('title', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.62rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Related Project *</label>
                    <select style={{ ...inputStyle }} value={form.projectId} onChange={e => set('projectId', e.target.value)}>
                      <option value="">— Select project —</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                      <option value="other">📌 Other (Not Listed)</option>
                    </select>
                    {form.projectId === 'other' && (
                      <input
                        style={{ ...inputStyle, marginTop: 8, borderColor: isDark ? 'rgba(245,158,11,0.25)' : 'rgba(245,158,11,0.35)' }}
                        placeholder="Describe the project or area (e.g. Unnamed road near Baner)"
                        value={form.otherProject}
                        onChange={e => set('otherProject', e.target.value)}
                      />
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.62rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Description * (used by AI for classification)</label>
                    <textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }} placeholder="Describe in detail — AI will auto-classify severity..." value={form.description} onChange={e => set('description', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.62rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Location</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input style={{ ...inputStyle, flex: 1 }} placeholder="e.g. Near Hadapsar Junction" value={form.location} onChange={e => set('location', e.target.value)} />
                      <GlowButton variant="secondary" size="md" icon={<MapPin size={13} />} onClick={handleGPS}>GPS</GlowButton>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.62rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Photo Evidence</label>
                    <div style={{
                      position: 'relative', border: `2px dashed ${isDark ? 'rgba(99,140,255,0.15)' : 'rgba(99,102,241,0.2)'}`,
                      borderRadius: 10, padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center',
                      gap: 8, cursor: 'pointer',
                      background: isDark ? 'rgba(15,22,41,0.4)' : 'rgba(99,102,241,0.03)',
                      transition: 'border-color 0.2s',
                    }}>
                      <Camera size={28} color={theme.textMuted} />
                      <span style={{ color: theme.textPrimary, fontSize: '0.9rem', fontWeight: 500 }}>Drag & drop or click to upload</span>
                      <span style={{ color: theme.textMuted, fontSize: '0.75rem' }}>JPEG, PNG up to 5MB</span>
                      <input type="file" accept="image/*" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} onChange={e => set('photo', e.target.files[0])} />
                    </div>
                    {form.photo && <span style={{ color: '#10b981', fontSize: '0.75rem', marginTop: 8, display: 'block', fontWeight: 500 }}>✓ {form.photo.name}</span>}
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.1rem', color: theme.textPrimary, marginBottom: '0.5rem', fontWeight: 600 }}>Set Priority Level</h2>
                  <p style={{ color: theme.textMuted, fontSize: '0.85rem' }}>Select the priority level for this issue. This helps officials triage tasks efficiently.</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                    {severities.map(s => {
                      const isSelected = form.severity === s;
                      return (
                        <div key={s} onClick={() => set('severity', s)}
                          style={{
                            padding: '1.5rem', borderRadius: 12,
                            border: `1.5px solid ${isSelected ? `${sevColors[s]}80` : (isDark ? 'rgba(99,140,255,0.1)' : 'rgba(0,0,0,0.08)')}`,
                            background: isSelected ? `${sevColors[s]}15` : (isDark ? 'rgba(15,22,41,0.4)' : '#f8f9fa'),
                            color: isSelected ? sevColors[s] : theme.textPrimary,
                            cursor: 'pointer', textAlign: 'center',
                            boxShadow: isSelected ? `0 0 15px ${sevColors[s]}30` : 'none',
                            transition: 'all 0.2s',
                          }}>
                          <div style={{ fontSize: '1.2rem', fontWeight: 700, textTransform: 'capitalize', marginBottom: 4 }}>{s}</div>
                          <div style={{ fontSize: '0.75rem', color: isSelected ? sevColors[s] : theme.textMuted }}>Priority Level</div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {aiResult && (
                    <div style={{ marginTop: '1rem', background: isDark ? 'rgba(59,130,246,0.08)' : 'rgba(99,102,241,0.06)', border: `1px solid rgba(99,102,241,0.15)`, borderRadius: 9, padding: '12px 16px' }}>
                      <span style={{ fontSize: '0.85rem', color: '#6366f1' }}>⚡ AI Analysis: Auto-classified severity as <strong style={{ textTransform: 'capitalize' }}>{aiResult.severity}</strong> based on description.</span>
                    </div>
                  )}
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                  <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                      <Send size={32} color="#6366f1" />
                    </div>
                    <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '1.4rem', color: theme.textPrimary, marginBottom: '0.5rem' }}>Ready to Submit</h2>
                    <p style={{ color: theme.textMuted, fontSize: '0.9rem', marginBottom: '2rem', maxWidth: 400, margin: '0 auto 2rem' }}>Please review your details in the summary panel. Once submitted, the issue will be logged securely in our system.</p>
                    
                    <div style={{
                      background: isDark ? 'rgba(15,22,41,0.4)' : 'rgba(99,102,241,0.04)',
                      border: `1px solid ${theme.border}`,
                      borderRadius: 8, padding: '12px', margin: '0 auto 2rem', maxWidth: 300,
                      fontSize: '0.8rem', color: theme.textMuted
                    }}>
                      📦 Firebase Storage · 🗺 Live Map Sync
                    </div>

                    <GlowButton
                      variant="primary"
                      size="lg"
                      icon={<Send size={18} />}
                      loading={loading}
                      disabled={!form.title || !form.projectId || !form.description}
                      onClick={handleSubmit}
                      style={{ width: '100%', maxWidth: 300 }}
                    >
                      Submit Report Now
                    </GlowButton>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: `1px solid ${theme.border}` }}>
              {step > 1 ? (
                <GlowButton variant="secondary" onClick={() => setStep(step - 1)} icon={<ArrowLeft size={16} />}>
                  Back
                </GlowButton>
              ) : <div />}
              
              {step < 4 && (
                <GlowButton variant="primary" onClick={() => setStep(step + 1)} disabled={(step === 1 && !form.category) || (step === 2 && (!form.title || !form.projectId || !form.description))} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{display: 'flex', alignItems: 'center', gap: 6}}>Next <ArrowRight size={16} /></span>
                </GlowButton>
              )}
            </div>

          </FloatingCard>
        </motion.div>

        {/* Right Side Panel */}
        <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} style={{ flex: '0 1 320px', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
          
          <FloatingCard style={{ padding: '1.5rem', position: 'sticky', top: '1.5rem' }}>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '1rem', color: theme.textPrimary, marginBottom: '1.25rem', fontWeight: 700 }}>Live Summary</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: theme.textMuted }}>Category</span>
                <span style={{ color: theme.textPrimary, fontWeight: 600 }}>{form.category || 'Not selected'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: theme.textMuted }}>Priority</span>
                <span style={{ color: sevColors[form.severity], fontWeight: 600, textTransform: 'capitalize' }}>{form.severity}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: theme.textMuted }}>Location</span>
                <span style={{ color: theme.textPrimary, fontWeight: 600 }}>{form.location ? 'Set' : 'Pending'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: theme.textMuted }}>Department</span>
                <span style={{ color: theme.textPrimary, fontWeight: 600 }}>Civic Works</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: theme.textMuted }}>Project</span>
                <span style={{ color: theme.textPrimary, fontWeight: 600, textAlign: 'right', maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {form.projectId ? (form.projectId === 'other' ? 'Other' : projects.find(p => p.id === parseInt(form.projectId))?.title) : 'Not selected'}
                </span>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: `1px solid ${theme.border}` }}>
              <p style={{ fontSize: '0.75rem', color: theme.textMuted, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Progress Checklist</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: form.category ? '#10b981' : theme.textMuted, fontWeight: form.category ? 500 : 400 }}>
                <CheckCircle size={16} /> Category Selected
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: (form.title && form.projectId && form.description) ? '#10b981' : theme.textMuted, marginTop: 8, fontWeight: (form.title && form.projectId && form.description) ? 500 : 400 }}>
                <CheckCircle size={16} /> Details Filled
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: step >= 3 ? '#10b981' : theme.textMuted, marginTop: 8, fontWeight: step >= 3 ? 500 : 400 }}>
                <CheckCircle size={16} /> Priority Reviewed
              </div>
            </div>
          </FloatingCard>

          <VoiceReportButton onResult={handleVoiceResult} />
          <AIClassifier description={form.description} category={form.category} photo={form.photo} onResult={handleAIResult} />
        </motion.div>

      </div>
    </AnimatedPage>
  );
}
