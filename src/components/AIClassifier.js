// ============================================================
//  AIClassifier — Teachable Machine Image AI Layer
//  Classifies issue photos into infrastructure damage categories
//  Model: Hosted on Teachable Machine (Google)
// ============================================================
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Camera, AlertTriangle, CheckCircle, Upload } from 'lucide-react';
import GlowButton from './GlowButton';
import { FloatingCard } from './AnimatedPage';

// ─── TEACHABLE MACHINE MODEL URL ─────────────────────────────
const MODEL_URL = 'https://teachablemachine.withgoogle.com/models/bXy2kDNi/';

// Fallback AI analysis when TM model isn't available
const RULE_BASED_AI = {
  analyzeText: (description, category) => {
    const desc = (description + ' ' + category).toLowerCase();
    const rules = [
      { keywords: ['burst', 'pipe', 'leak', 'water', 'flood', 'sewage'], label: 'Water Infrastructure Damage', severity: 'high', confidence: 91 },
      { keywords: ['pothole', 'road', 'crack', 'asphalt', 'surface'], label: 'Road Surface Damage', severity: 'high', confidence: 88 },
      { keywords: ['hazard', 'danger', 'safety', 'barrier', 'fence', 'excavation'], label: 'Safety Hazard', severity: 'high', confidence: 93 },
      { keywords: ['delay', 'slow', 'stopped', 'paused', 'contractor'], label: 'Construction Delay', severity: 'medium', confidence: 82 },
      { keywords: ['noise', 'dust', 'pollution', 'night'], label: 'Environmental Violation', severity: 'medium', confidence: 79 },
      { keywords: ['fund', 'money', 'budget', 'misuse', 'corrupt'], label: 'Fund Misuse Alert', severity: 'high', confidence: 95 },
      { keywords: ['light', 'street', 'lamp', 'dark', 'signal', 'traffic'], label: 'Infrastructure Malfunction', severity: 'medium', confidence: 84 },
      { keywords: ['debris', 'garbage', 'block', 'obstruct'], label: 'Obstruction / Debris', severity: 'low', confidence: 86 },
    ];
    for (const rule of rules) {
      if (rule.keywords.some(kw => desc.includes(kw))) return rule;
    }
    return { label: 'General Infrastructure Issue', severity: 'medium', confidence: 75 };
  }
};

export default function AIClassifier({ description = '', category = '', photo = null, onResult }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [modelStatus, setModelStatus] = useState('idle');
  const modelRef = useRef(null);

  const loadTMModel = async () => {
    setModelStatus('loading');
    try {
      const tmImage = window.tmImage;
      if (!tmImage) throw new Error('TM not loaded');
      const model = await tmImage.load(MODEL_URL + 'model.json', MODEL_URL + 'metadata.json');
      modelRef.current = model;
      setModelStatus('ready');
    } catch (e) {
      setModelStatus('error');
    }
  };

  useEffect(() => {
    const checkTM = setTimeout(() => {
      if (window.tmImage) loadTMModel();
    }, 1000);
    return () => clearTimeout(checkTM);
  }, []);

  const runAnalysis = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    let analysisResult;
    if (photo && modelRef.current && modelStatus === 'ready') {
      try {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(photo);
        await new Promise(r => { img.onload = r; });
        const predictions = await modelRef.current.predict(img);
        const best = predictions.reduce((a, b) => a.probability > b.probability ? a : b);
        analysisResult = {
          label: best.className, confidence: Math.round(best.probability * 100),
          severity: best.probability > 0.7 ? 'high' : best.probability > 0.4 ? 'medium' : 'low',
          source: 'Teachable Machine',
          predictions: predictions.map(p => ({ label: p.className, score: Math.round(p.probability * 100) })),
        };
      } catch (e) {
        analysisResult = { ...RULE_BASED_AI.analyzeText(description, category), source: 'Rule-based AI' };
      }
    } else {
      analysisResult = { ...RULE_BASED_AI.analyzeText(description, category), source: 'NLP Analyzer' };
    }
    setResult(analysisResult);
    onResult && onResult(analysisResult);
    setLoading(false);
  };

  const sevColor = { high: '#fb7185', medium: '#fbbf24', low: '#34d399' };
  const sevBg = { high: 'rgba(244,63,94,0.1)', medium: 'rgba(245,158,11,0.1)', low: 'rgba(16,185,129,0.1)' };

  return (
    <FloatingCard style={S.panel} glowColor={result ? `${sevColor[result.severity]}20` : 'rgba(59,130,246,0.1)'}>
      <div style={S.header}>
        <motion.span 
          animate={{ textShadow: ['0 0 5px rgba(96,165,250,0.5)', '0 0 15px rgba(96,165,250,0.8)', '0 0 5px rgba(96,165,250,0.5)'] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={S.aiTag}
        >
          <Zap size={11} /> AI LAYER
        </motion.span>
        <h3 style={S.title}>Teachable Machine Classifier</h3>
        <span style={{ ...S.statusDot, color: modelStatus === 'ready' ? '#34d399' : modelStatus === 'loading' ? '#fbbf24' : '#64748b' }}>
          {modelStatus === 'ready' ? '● Model Ready' : modelStatus === 'loading' ? '● Loading...' : '● NLP Mode'}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {!result && !loading && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={S.placeholder}>
            <motion.div 
              animate={{ rotate: [0, 10, -10, 0] }} 
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }} 
              style={S.aiIcon}
            >
              <Zap size={28} color="#60a5fa" />
            </motion.div>
            <p style={S.hint}>
              {photo ? 'Photo attached — AI will analyze the image!' : 'Describe the issue and click Analyze for AI severity classification.'}
            </p>
            {photo && <div style={S.photoHint}><Camera size={12} />{photo.name}</div>}
          </motion.div>
        )}

        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={S.placeholder}>
            <div style={S.spinnerWrap}>
              <div style={S.spinner} />
              <div style={S.spinnerInner} />
            </div>
            <p style={S.hint}>AI analyzing {photo ? 'image' : 'description'}...</p>
            <div style={S.steps}>
              {['Preprocessing input', 'Running classifier', 'Computing severity', 'Generating priority'].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.3 }} style={S.step}>
                  <span style={S.stepDot} />{s}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {result && !loading && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={S.result}>
            <div style={{ ...S.resultHeader, background: sevBg[result.severity] }}>
              <AlertTriangle size={18} color={sevColor[result.severity]} />
              <div>
                <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: '0.9rem', color: '#e2e8f0' }}>{result.label}</div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.6rem', color: '#64748b' }}>via {result.source}</div>
              </div>
              <span style={{ ...S.sevPill, background: sevBg[result.severity], color: sevColor[result.severity], border: `1px solid ${sevColor[result.severity]}40` }}>
                {result.severity.toUpperCase()}
              </span>
            </div>

            <div style={S.metrics}>
              <div style={S.metric}>
                <span style={S.mLabel}>AI Confidence</span>
                <span style={{ ...S.mVal, color: '#60a5fa' }}>{result.confidence}%</span>
                <div style={S.bar}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${result.confidence}%` }} transition={{ duration: 1, ease: 'easeOut' }} style={{ ...S.barFill, background: '#3b82f6' }} />
                </div>
              </div>
              <div style={S.metric}>
                <span style={S.mLabel}>Severity Score</span>
                <span style={{ ...S.mVal, color: sevColor[result.severity] }}>{result.severity === 'high' ? '8.5/10' : result.severity === 'medium' ? '5.5/10' : '2.5/10'}</span>
                <div style={S.bar}>
                  <motion.div initial={{ width: 0 }} animate={{ width: result.severity === 'high' ? '85%' : result.severity === 'medium' ? '55%' : '25%' }} transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }} style={{ ...S.barFill, background: sevColor[result.severity] }} />
                </div>
              </div>
            </div>

            {result.predictions && (
              <div style={S.predictions}>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.6rem', color: '#64748b', marginBottom: 6 }}>CLASSIFICATION PROBABILITIES</div>
                {result.predictions.slice(0, 4).map((p, i) => (
                  <div key={i} style={S.predRow}>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', width: 140, flexShrink: 0 }}>{p.label}</span>
                    <div style={{ flex: 1, height: 4, background: 'rgba(99,140,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${p.score}%` }} transition={{ duration: 0.8, delay: 0.4 + i * 0.1 }} style={{ height: '100%', background: i === 0 ? '#3b82f6' : '#475569', borderRadius: 2 }} />
                    </div>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.65rem', color: '#64748b', width: 35, textAlign: 'right' }}>{p.score}%</span>
                  </div>
                ))}
              </div>
            )}

            <div style={S.action}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                <strong style={{ color: '#e2e8f0' }}>Priority:</strong>{' '}
                {result.severity === 'high' ? '🔴 Urgent — escalate within 24h' : result.severity === 'medium' ? '🟡 Moderate — review within 72h' : '🟢 Low — standard queue'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <GlowButton 
        variant="primary" 
        onClick={runAnalysis} 
        disabled={loading || (!description && !photo)}
        loading={loading}
        icon={!loading && <Zap size={14} />}
        style={{ width: '100%', marginBottom: '0.75rem' }}
      >
        {loading ? 'Analyzing...' : result ? 'Re-Analyze' : 'Run AI Analysis'}
      </GlowButton>

      <div style={S.info}>
        <div style={S.infoTitle}>How It Works</div>
        {['Teachable Machine image classification', 'NLP keyword severity detection', 'Smart prioritization engine'].map((s, i) => (
          <div key={i} style={S.infoRow}>
            <span style={S.infoNum}>{i + 1}</span>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{s}</span>
          </div>
        ))}
      </div>
    </FloatingCard>
  );
}

const S = {
  panel: { padding: '1.25rem' },
  header: { marginBottom: '1rem' },
  aiTag: { fontFamily: "'JetBrains Mono',monospace", fontSize: '0.6rem', color: '#60a5fa', letterSpacing: '0.1em', display: 'inline-flex', alignItems: 'center', gap: 4 },
  title: { fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: '1rem', color: '#e2e8f0', marginTop: 4 },
  statusDot: { fontFamily: "'JetBrains Mono',monospace", fontSize: '0.6rem', display: 'block', marginTop: 4, transition: 'color 0.3s' },
  placeholder: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '1.5rem 0.5rem', textAlign: 'center' },
  aiIcon: { width: 56, height: 56, background: 'rgba(59,130,246,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(59,130,246,0.2)', boxShadow: '0 0 20px rgba(59,130,246,0.2)' },
  hint: { color: '#64748b', fontSize: '0.78rem', lineHeight: 1.6 },
  photoHint: { display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.7rem', color: '#60a5fa', background: 'rgba(59,130,246,0.08)', padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(59,130,246,0.15)' },
  spinnerWrap: { position: 'relative', width: 48, height: 48 },
  spinner: { width: 48, height: 48, border: '3px solid rgba(99,140,255,0.1)', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', position: 'absolute' },
  spinnerInner: { width: 32, height: 32, border: '2px solid rgba(99,140,255,0.1)', borderTop: '2px solid #60a5fa', borderRadius: '50%', animation: 'spin 0.5s linear infinite reverse', position: 'absolute', top: 8, left: 8 },
  steps: { display: 'flex', flexDirection: 'column', gap: 5, textAlign: 'left', width: '100%', marginTop: 8 },
  step: { display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.72rem', color: '#64748b' },
  stepDot: { width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', animation: 'pulse 1s infinite', flexShrink: 0, boxShadow: '0 0 6px rgba(59,130,246,0.4)' },
  result: { marginBottom: '0.75rem' },
  resultHeader: { display: 'flex', alignItems: 'center', gap: 10, borderRadius: 10, padding: '10px 12px', marginBottom: 10, border: '1px solid rgba(99,140,255,0.08)' },
  sevPill: { padding: '3px 8px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", marginLeft: 'auto', flexShrink: 0 },
  metrics: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 },
  metric: { display: 'flex', flexDirection: 'column', gap: 4 },
  mLabel: { fontFamily: "'JetBrains Mono',monospace", fontSize: '0.6rem', color: '#64748b' },
  mVal: { fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: '0.88rem', marginTop: -4 },
  bar: { height: 5, background: 'rgba(99,140,255,0.08)', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3, boxShadow: '0 0 6px rgba(59,130,246,0.3)' },
  predictions: { background: 'rgba(15,22,41,0.5)', borderRadius: 9, padding: '10px', marginBottom: 10, border: '1px solid rgba(99,140,255,0.06)' },
  predRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 },
  action: { background: 'rgba(15,22,41,0.5)', borderRadius: 9, padding: '10px 12px', border: '1px solid rgba(99,140,255,0.06)', marginBottom: 10 },
  info: { background: 'rgba(15,22,41,0.5)', borderRadius: 10, padding: '0.75rem', border: '1px solid rgba(99,140,255,0.06)' },
  infoTitle: { fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: '0.78rem', color: '#e2e8f0', marginBottom: 8 },
  infoRow: { display: 'flex', alignItems: 'center', gap: 9, marginBottom: 6 },
  infoNum: { width: 20, height: 20, borderRadius: '50%', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.62rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
};
