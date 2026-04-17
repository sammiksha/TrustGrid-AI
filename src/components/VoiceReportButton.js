// ============================================================
//  VoiceReportButton — English Voice Input
//  Simplified: English (India) only — clean UX
// ============================================================
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Loader, CheckCircle, Volume2, AlertCircle, Keyboard } from 'lucide-react';
import { FloatingCard } from './AnimatedPage';

// Error messages
const ERROR_MESSAGES = {
  'language-not-supported': 'Language not supported. Please use Chrome or type below.',
  'network': 'Network error. Check your internet connection.',
  'no-speech': 'No speech detected. Please speak again.',
  'not-allowed': 'Please allow microphone access.',
  default: 'Voice recognition failed. Please type below.',
};

function getErrorMessage(errorCode) {
  return ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.default;
}

const FALLBACK_PLACEHOLDER = 'Type your issue report here...';

function parseVoiceLocally(transcript) {
  const t = transcript.toLowerCase();
  const categories = [
    { keywords: ['pothole', 'road'], category: 'Pothole' },
    { keywords: ['pipe', 'burst', 'water', 'leak'], category: 'Pipeline Burst' },
    { keywords: ['delay', 'slow', 'late'], category: 'Construction Delay' },
    { keywords: ['danger', 'hazard', 'unsafe'], category: 'Safety Hazard' },
    { keywords: ['noise'], category: 'Noise Violation' },
    { keywords: ['fund', 'money', 'budget'], category: 'Fund Misuse' },
    { keywords: ['debris', 'garbage', 'block'], category: 'Debris Blocking' },
    { keywords: ['flood', 'water log'], category: 'Flooding' },
    { keywords: ['light', 'lamp', 'dark'], category: 'Street Light' },
  ];

  let category = 'Other';
  for (const cat of categories) {
    if (cat.keywords.some(kw => t.includes(kw))) { category = cat.category; break; }
  }

  const isUrgent = ['urgent', 'emergency', 'danger'].some(w => t.includes(w));
  const severity = isUrgent ? 'high' : 'medium';
  const title = transcript.slice(0, 60);

  return { title, category, severity, description: transcript, location: '' };
}

export default function VoiceReportButton({ onResult }) {
  const lang = 'en-US';
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsing, setParsing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [volume, setVolume] = useState(0);
  const [showFallback, setShowFallback] = useState(false);
  const [fallbackText, setFallbackText] = useState('');
  const [voiceSupport, setVoiceSupport] = useState(null); // null = untested
  const recogRef = useRef(null);
  const volIntervalRef = useRef(null);

  const supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  const stopVolume = () => {
    clearInterval(volIntervalRef.current);
    setVolume(0);
  };

  const startListening = () => {
    if (!supported) {
      setError(getErrorMessage('default'));
      setShowFallback(true);
      return;
    }
    setError(''); setTranscript(''); setResult(null); setVolume(0); setShowFallback(false);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recog = new SpeechRecognition();
    recog.lang = lang;
    recog.continuous = true;
    recog.interimResults = true;
    recog.maxAlternatives = 3;

    // Simulate volume changes for animation
    volIntervalRef.current = setInterval(() => {
      setVolume(Math.random() * 0.5 + 0.5);
    }, 100);

    recog.onresult = (e) => {
      const fullTranscript = Array.from(e.results).map(r => r[0].transcript).join('');
      setTranscript(fullTranscript);
      setVoiceSupport('supported');
    };

    recog.onend = () => {
      setListening(false);
      stopVolume();
    };

    recog.onerror = (e) => {
      setListening(false);
      stopVolume();
      const errMsg = getErrorMessage(e.error);
      setError(errMsg);
      setVoiceSupport('failed');
      if (e.error === 'language-not-supported') {
        setShowFallback(true);
      }
    };

    recogRef.current = recog;

    try {
      recog.start();
      setListening(true);
    } catch (e) {
      stopVolume();
      setError(getErrorMessage('default'));
      setShowFallback(true);
    }
  };

  const stopAndParse = async () => {
    recogRef.current?.stop();
    setListening(false);
    stopVolume();
    const textToParse = transcript || fallbackText;
    if (!textToParse) return;
    setParsing(true);
    await new Promise(r => setTimeout(r, 700));
    const parsed = parseVoiceLocally(textToParse);
    setResult(parsed);
    setParsing(false);
    if (onResult) onResult(parsed);
  };

  const handleFallbackSubmit = () => {
    if (!fallbackText.trim()) return;
    setTranscript(fallbackText);
    stopAndParse();
  };

  const resetAll = () => {
    setTranscript(''); setResult(null); setError('');
    setShowFallback(false); setFallbackText(''); setVoiceSupport(null);
  };

  return (
    <FloatingCard style={S.panel} glowColor={listening ? 'rgba(244,63,94,0.2)' : 'rgba(16,185,129,0.1)'}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
        <div style={S.iconWrap}><Volume2 size={16} color="#34d399" /></div>
        <div>
          <h3 style={S.title}>Voice Report</h3>
          <span style={S.subtitle}>Speak in English to report an issue</span>
        </div>
      </div>

      {/* English Language Indicator */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', padding: '4px 12px', borderRadius: 20, fontSize: '0.72rem', color: '#60a5fa', fontFamily: "'JetBrains Mono',monospace", letterSpacing: '0.05em' }}>
          Language: English
        </div>
      </div>

      {/* Mic button area */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, position: 'relative', height: 110, justifyContent: 'center' }}>
        {listening && (
          <>
            {[1, 1.4, 1.8].map((scale, i) => (
              <motion.div
                key={i}
                animate={{ scale: [scale, scale + volume * 0.3, scale], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 0.3 + i * 0.1, repeat: Infinity }}
                style={{ position: 'absolute', width: 72, height: 72, borderRadius: '50%', background: 'rgba(244,63,94,0.15)', zIndex: 0 }}
              />
            ))}
          </>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={listening ? stopAndParse : startListening}
          style={{ ...S.micBtn, ...(listening ? S.micBtnActive : {}), position: 'relative', zIndex: 1 }}
        >
          {listening ? <MicOff size={28} color="#fb7185" /> : <Mic size={28} color="#60a5fa" />}
        </motion.button>
        <span style={{ fontSize: '0.72rem', fontFamily: "'JetBrains Mono',monospace", color: listening ? '#fb7185' : '#64748b' }}>
          {listening ? '● Recording — tap to stop' : 'Tap to speak'}
        </span>
      </div>

      {/* Fallback keyboard input */}
      <AnimatePresence>
        {showFallback && !result && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ marginTop: 10, padding: '10px 12px', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.12)', borderRadius: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 7 }}>
                <Keyboard size={12} color="#60a5fa" />
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.6rem', color: '#60a5fa' }}>TYPE YOUR REPORT</span>
              </div>
              <textarea
                value={fallbackText}
                onChange={e => setFallbackText(e.target.value)}
                placeholder={FALLBACK_PLACEHOLDER}
                rows={3}
                className="dark-input"
                style={{
                  width: '100%', background: 'rgba(10,16,36,0.6)', border: '1.5px solid rgba(99,140,255,0.12)',
                  borderRadius: 8, padding: '8px 10px', color: '#e2e8f0', fontSize: '0.82rem',
                  fontFamily: "'Plus Jakarta Sans',sans-serif", resize: 'none', outline: 'none', boxSizing: 'border-box',
                }}
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleFallbackSubmit}
                disabled={!fallbackText.trim()}
                style={{
                  marginTop: 8, width: '100%', padding: '9px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  border: 'none', borderRadius: 8, color: 'white', fontFamily: "'Outfit',sans-serif",
                  fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', opacity: fallbackText.trim() ? 1 : 0.5,
                }}
              >
                Parse Report →
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {transcript && !parsing && !result && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={S.transcriptBox}>
            <div style={S.transcriptLabel}>TRANSCRIPT</div>
            <p style={{ fontSize: '0.82rem', color: '#e2e8f0', lineHeight: 1.5, margin: 0 }}>{transcript}</p>
          </motion.div>
        )}

        {parsing && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={S.parsingBox}>
            <Loader size={14} color="#3b82f6" style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '0.75rem', color: '#60a5fa', fontFamily: "'JetBrains Mono',monospace" }}>Parsing your report...</span>
          </motion.div>
        )}

        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={S.resultBox}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle size={13} color="#34d399" />
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.6rem', color: '#34d399' }}>VOICE REPORT PARSED</span>
              </div>
              <button onClick={resetAll} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.65rem', fontFamily: "'JetBrains Mono',monospace" }}>Reset</button>
            </div>
            {[['Title', result.title], ['Category', result.category], ['Severity', result.severity?.toUpperCase()], ['Description', result.description]].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.62rem', color: '#64748b', minWidth: 72, paddingTop: 1 }}>{k}</span>
                <span style={{ fontSize: '0.78rem', color: '#e2e8f0', lineHeight: 1.4 }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop: 10, fontSize: '0.68rem', color: '#60a5fa', fontFamily: "'JetBrains Mono',monospace" }}>Fields auto-filled in form below ↓</div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ marginTop: 8, background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.15)', borderRadius: 8, padding: '8px 10px' }}>
            <div style={{ display: 'flex', gap: 7, alignItems: 'flex-start' }}>
              <AlertCircle size={13} color="#fb7185" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ color: '#fb7185', fontSize: '0.72rem', fontFamily: "'Plus Jakarta Sans',sans-serif", lineHeight: 1.5, margin: 0 }}>{error}</p>
            </div>
            <button onClick={() => { setError(''); setShowFallback(true); }}
              style={{ marginTop: 6, background: 'none', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 6, color: '#fb7185', fontSize: '0.65rem', cursor: 'pointer', padding: '3px 8px', fontFamily: "'JetBrains Mono',monospace" }}>
              Type instead →
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!supported && (
        <div style={{ textAlign: 'center', color: '#fbbf24', fontSize: '0.72rem', fontFamily: "'JetBrains Mono',monospace", marginTop: 8 }}>
          Use Chrome for voice input
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </FloatingCard>
  );
}

const S = {
  panel: { padding: '1.25rem' },
  iconWrap: { width: 32, height: 32, background: 'rgba(16,185,129,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16,185,129,0.2)' },
  title: { fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: '0.92rem', color: '#e2e8f0', margin: 0 },
  subtitle: { fontFamily: "'JetBrains Mono',monospace", fontSize: '0.6rem', color: '#64748b' },
  micBtn: { width: 72, height: 72, borderRadius: '50%', border: '3px solid rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', outline: 'none', boxShadow: '0 0 20px rgba(59,130,246,0.15)' },
  micBtnActive: { border: '3px solid rgba(244,63,94,0.5)', background: 'rgba(244,63,94,0.1)', boxShadow: '0 0 25px rgba(244,63,94,0.3)' },
  transcriptBox: { margin: '12px 0 0 0', background: 'rgba(15,22,41,0.5)', border: '1px solid rgba(99,140,255,0.08)', borderRadius: 10, padding: '10px 12px', overflow: 'hidden' },
  transcriptLabel: { fontFamily: "'JetBrains Mono',monospace", fontSize: '0.6rem', color: '#64748b', marginBottom: 4 },
  parsingBox: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'rgba(59,130,246,0.08)', borderRadius: 10, marginTop: 12, border: '1px solid rgba(59,130,246,0.15)', overflow: 'hidden' },
  resultBox: { marginTop: 12, background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 12, padding: '12px 14px', overflow: 'hidden' },
};
