// ============================================================
//  AIChatbot — Compact floating widget (English only)
//  For full experience, go to the AI Chat page (/ai-chat)
// ============================================================
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Mic, MicOff, Volume2, VolumeX, Bot, User, Loader, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ─── Upgraded Knowledge Base ───────────────────────────────
const KNOWLEDGE = {
  greeting: "Hi! 👋 I'm CivicBot — your civic intelligence assistant for Pune. I can guide you step-by-step on reporting issues, tracking complaints, understanding trust scores, and more. What do you need help with?",
  thanks: "You're welcome! 🙏 Keep reporting civic issues — every report makes Pune more transparent and accountable! 💙",
  help: "Here's what I can help you with:\n📝 **Report an Issue** — step-by-step guidance\n🗺 **Map View** — find issues near you\n📊 **Analytics** — city-wide data\n🏆 **Trust Scores** — rate governance\n🔄 **Track Status** — follow your complaints\n🏛 **Admin Portal** — government tools\n\n👉 Open the **AI Assistant** page for full experience!",
  entries: [
    {
      patterns: ['how do i report', 'how to report', 'report issue', 'file complaint', 'submit complaint', 'pothole', 'report a'],
      response: "📝 **Step-by-step to Report an Issue:**\n1. Click **Report Issue** in the sidebar\n2. Enter a clear title (e.g. 'Pothole on MG Road')\n3. Select the related project from the dropdown\n4. Choose severity: Low / Medium / High\n5. Describe the issue in detail\n6. Attach a photo — our AI will auto-classify it!\n7. Click **Submit** — your report goes live instantly on the map and notifies admins. ✅"
    },
    {
      patterns: ['details required', 'what information', 'what to fill', 'fields', 'form'],
      response: "📋 **Required Details for a Complaint:**\n• **Title** — Short description of the problem\n• **Project** — Which project is affected?\n• **Severity** — Low, Medium, or High\n• **Description** — What happened, where exactly?\n• **Photo** (optional but recommended) — AI analyzes it!\n\nAll fields help officials prioritize and resolve faster. 🚀"
    },
    {
      patterns: ['near me', 'nearby', 'my location', 'my area', 'show issues'],
      response: "🗺 **Issues Near You:**\n1. Go to **Map View** from the sidebar\n2. Allow location access when prompted\n3. The map auto-centers to your area\n4. Color-coded pins: 🔴 Critical · 🟡 Delayed · 🟢 On Track\n5. Click any pin for full issue details!\n\nYou can also use **Filter** to show only open or high-severity issues nearby. 📍"
    },
    {
      patterns: ['track', 'status', 'progress of my', 'where is my complaint', 'complaint status'],
      response: "🔄 **Tracking Your Complaint:**\n1. Go to **Issues** page from the sidebar\n2. Find your report in the list\n3. Status shown: 🔴 Open → 🟡 In Review → 🟢 Resolved\n4. Resolved issues show: ✓ Citizen notified\n\nYou can also open **Map View** — your reported issue appears as a pin. Click it to see live updates! 📌"
    },
    {
      patterns: ['still in progress', 'why not resolved', 'pending', 'no action', 'escalate', 'escalation'],
      response: "⚠️ **Issue Still Pending? Here's what to do:**\n1. Check the **status** — if 'open' for >7 days, it needs escalation\n2. Go to **Issues** page → upvote the report (▲) to increase priority\n3. More upvotes = faster admin response\n4. Share the **Ward Report Card** from Trust Scores page to create public pressure\n5. If critical: contact PMC helpline 020-25506800\n\nPatience + pressure = resolution! 💪"
    },
    {
      patterns: ['most complaints', 'which area', 'worst area', 'problem area', 'highest issues'],
      response: "📊 **Areas with Most Complaints:**\nBased on current data:\n🔴 **Shivajinagar Metro** — 24 open issues\n🔴 **Katraj-Kondhwa Road** — 18 issues\n🔴 **Wakad Drainage** — 15 issues\n\nFor live data:\n→ Go to **Analytics** page for the severity breakdown chart\n→ Go to **Map View** to see geographic distribution\n→ Check **Trust Scores** for project rankings! 📈"
    },
    {
      patterns: ['road construction', 'road repair', 'road progress', 'construction progress', 'road widening'],
      response: "🏗 **Road Construction Progress:**\n• **NH-48 Road Widening** — 68% complete, On Track ✅\n• **Hadapsar Flyover** — 55% complete, On Track ✅\n• **Katraj-Kondhwa Road Repair** — 22% complete, Delayed ⚠️\n\n→ Click any project in **Projects** page for full details\n→ Check **Before/After images** in project view\n→ Admin panel shows fund utilization per project 💰"
    },
    {
      patterns: ['pune', 'civic problems', 'pune issues', 'insights', 'city overview'],
      response: "🏙 **Civic Insights — Pune:**\n📊 8 active infrastructure projects tracked\n🔴 Critical: Shivajinagar Metro (28 trust score)\n🟡 Delayed: Pimpri Water, Katraj Road, Wakad Drainage\n🟢 Healthy: Kothrud STP (91 trust score)\n\n**Top Issues:** Pipeline bursts, potholes, construction noise, flooding\n**Overall City Trust Score:** 85/100\n\n→ Full analytics in **Analytics** page 📊"
    },
    {
      patterns: ['street light', 'streetlight', 'light not working', 'no lighting', 'dark road'],
      response: "💡 **Street Light Not Working — How to Escalate:**\n1. **Report it**: Report Issue → Title: 'Street light out at [location]' → Severity: Medium/High\n2. **Photo it**: Attach a photo for evidence\n3. **Tag location**: Use the map pin to mark exact spot\n4. **Escalate**: If not resolved in 3 days, upvote the report or share via Trust Scores page\n5. **Direct contact**: PMC Electrical Dept: 020-25506800\n\nStreet light issues are typically resolved within 48-72 hours. ⚡"
    },
    {
      patterns: ['platform', 'how does this work', 'improve governance', 'transparency', 'civicsense'],
      response: "🌐 **How TrustGrid AI Improves Governance:**\n1. **Citizen Reports** → Real-time issue tracking on map\n2. **AI Classification** → Auto-detects issue type from photos\n3. **Trust Scores** → AI rates government transparency (0-100)\n4. **Admin Portal** → Officials review, act, and close issues\n5. **Before/After Images** → Visual proof of work done\n6. **Analytics** → Data-driven insights for better decisions\n\n→ Every report creates accountability. Every resolved issue builds trust! 🏆"
    },
    {
      patterns: ['trust', 'score', 'rating', 'trustscore', 'what is trust'],
      response: "🏆 **Trust Score Explained:**\nScores (0-100) are AI-computed from 4 factors:\n⏱ **Timeliness** (82%) — Are deadlines met?\n🔍 **Transparency** (91%) — Are updates shared?\n📊 **Issue Resolution** (88%) — Are complaints closed?\n👥 **Citizen Satisfaction** (79%) — Are people happy?\n\n**Current Rankings:**\n🥇 Kothrud STP — 91\n🥈 NH-48 Road — 84\n🥉 Hadapsar Flyover — 79\n⚠️ Shivajinagar Metro — 28 (Critical)\n\nCheck **Trust Scores** page for full rankings! 📊"
    },
    {
      patterns: ['map', 'location', 'gps', 'where', 'navigate', 'find project'],
      response: "🗺 **Map View Guide:**\n• 🟢 Green pins = On Track projects\n• 🟡 Yellow pins = Delayed projects\n• 🔴 Red pins = Critical projects\n• 📍 Small pins = Citizen reported issues\n\nClick any pin → see full details, status, and trust score!\nNew issues you report appear as pins immediately.\n\n→ Go to **Map** from sidebar to explore! 🌍"
    },
    {
      patterns: ['admin', 'government', 'portal', 'official', 'pmc'],
      response: "🏛 **Government Portal Features:**\n• **Overview** — KPI dashboard with live counts\n• **Issue Review** — Review, approve, resolve citizen complaints\n• **Fund Tracking** — Budget vs spent visualization\n• **Manage Projects** — Update status, progress, spent amount\n• **Before/After Images** — Upload evidence of completed work\n• **Contractor Trust Scores** — Edit contractor ratings manually\n\n→ Switch to Gov Admin role from sidebar to access! 🔐"
    },
    {
      patterns: ['analytics', 'chart', 'stats', 'data', 'graph'],
      response: "📊 **Analytics Dashboard has 6 charts:**\n1. 📈 Issues vs Resolved Timeline (monthly trends)\n2. 🏆 Trust Score Trends (over 7 months)\n3. 🍩 Project Status Doughnut (on-track vs delayed vs critical)\n4. 🕸 Governance Radar (5-axis performance)\n5. 🔵 Severity Breakdown (PolarArea chart)\n6. 💰 Budget Allocation (by project category)\n\nAll charts are interactive — hover for tooltips! 📱"
    },
    {
      patterns: ['save', 'persist', 'data', 'logout', 'session', 'refresh'],
      response: "💾 **Your Data is Always Safe:**\n✅ All projects saved locally\n✅ Issues persist across login/logout\n✅ Profile data remembered\n✅ Settings saved automatically\n✅ Chat history preserved\n\nEverything survives page refresh and logout! Your civic contributions are never lost. 🔒"
    },
  ],
  fallbacks: [
    "I can help you with civic issues in Pune! Try asking:\n• 'How do I report a pothole?'\n• 'How do I track my complaint?'\n• 'Which areas have most issues?'\n• 'What is a trust score?' 💙",
    "Great question! For detailed answers, open the **AI Assistant** page from the sidebar — I have full knowledge there. Or try asking about: reporting, tracking issues, trust scores, or the map! 🤖",
    "I specialize in CivicSense platform guidance. Ask me step-by-step instructions for any civic task in Pune! 🏙",
  ],
};

const GREET = ['hello', 'hi', 'hey', 'namaste', 'good morning', 'good evening'];
const THANKS = ['thank', 'thanks', 'appreciate', 'cheers', 'great'];
const HELP = ['help', 'what can you do', 'features', 'how to use'];

function generateResponse(msg) {
  const m = msg.toLowerCase().trim();
  if (GREET.some(p => m.includes(p))) return KNOWLEDGE.greeting;
  if (THANKS.some(p => m.includes(p))) return KNOWLEDGE.thanks;
  if (HELP.some(p => m.includes(p))) return KNOWLEDGE.help;
  let best = null, bestScore = 0;
  for (const e of KNOWLEDGE.entries) {
    let score = 0;
    for (const p of e.patterns) { if (m.includes(p)) score += p.length; }
    if (score > bestScore) { bestScore = score; best = e; }
  }
  if (best && bestScore > 0) return best.response;
  return KNOWLEDGE.fallbacks[Math.floor(Math.random() * KNOWLEDGE.fallbacks.length)];
}

const QUICK = [
  '📝 How do I report an issue?',
  '🔄 How do I track my complaint?',
  '🗺️ Show issues near my location',
  '⚠️ Why is my issue still pending?',
  '🏆 What is a trust score?',
  '💡 Street light not working — escalate?',
];

// Web Speech API (English only)
function useSpeech() {
  const recogRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const [listening, setListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const startListening = (onResult) => {
    try {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) return false;
      const r = new SR();
      r.lang = 'en-IN'; r.continuous = false; r.interimResults = false;
      r.onresult = e => { onResult(Array.from(e.results).map(x => x[0].transcript).join('')); setListening(false); };
      r.onerror = () => setListening(false);
      r.onend = () => setListening(false);
      recogRef.current = r;
      r.start();
      setListening(true);
      return true;
    } catch { return false; }
  };

  const stopListening = () => { try { recogRef.current?.stop(); } catch {} setListening(false); };

  const speak = (text) => {
    if (!voiceEnabled) return;
    try {
      synthRef.current?.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/[*#_\[\]]/g, ''));
      u.lang = 'en-IN'; u.rate = 0.92; u.pitch = 1;
      synthRef.current?.speak(u);
    } catch {}
  };

  const stopSpeaking = () => { try { synthRef.current?.cancel(); } catch {} };

  return { listening, voiceEnabled, setVoiceEnabled, startListening, stopListening, speak, stopSpeaking };
}

// ── 3D Robot Avatar Component ──────────────────────────────
function RobotAvatar({ state = 'idle', size = 'sm' }) {
  // state: 'idle' | 'listening' | 'speaking'
  const isLg = size === 'lg';
  const dim = isLg ? 80 : 38;
  const eyeSize = isLg ? 9 : 5;
  const mouthW = isLg ? 28 : 14;

  const bodyBg = state === 'listening'
    ? 'linear-gradient(180deg,#1d4ed8,#3b82f6)'
    : state === 'speaking'
    ? 'linear-gradient(180deg,#6d28d9,#8b5cf6)'
    : 'linear-gradient(180deg,#1e3a8a,#2563eb)';

  const glowColor = state === 'listening'
    ? 'rgba(59,130,246,0.8)' : state === 'speaking'
    ? 'rgba(139,92,246,0.8)' : 'rgba(37,99,235,0.4)';

  const eyeGlow = state === 'listening' ? '#34d399'
    : state === 'speaking' ? '#f59e0b' : '#60a5fa';

  return (
    <div style={{ position: 'relative', width: dim, height: dim, flexShrink: 0 }}>
      {/* Glow ring */}
      <div style={{
        position: 'absolute', inset: isLg ? -8 : -4, borderRadius: '50%',
        background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
        animation: state !== 'idle' ? 'robotGlow 1.2s ease-in-out infinite alternate' : 'robotBreath 3s ease-in-out infinite',
        zIndex: 0
      }} />
      {/* Head */}
      <div style={{
        position: 'relative', zIndex: 1, width: dim, height: dim, borderRadius: isLg ? 22 : 12,
        background: bodyBg,
        boxShadow: `0 0 ${isLg ? 24 : 10}px ${glowColor}, inset 0 2px 0 rgba(255,255,255,0.15)`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: isLg ? 7 : 3,
        transform: 'perspective(200px) rotateX(5deg)',
        animation: state === 'idle' ? 'robotBob 3s ease-in-out infinite' : state === 'listening' ? 'robotPulseBody 0.8s ease-in-out infinite alternate' : 'robotTalkShake 0.25s ease-in-out infinite alternate',
        border: `1px solid rgba(255,255,255,0.15)`,
        transition: 'background 0.4s ease, box-shadow 0.4s ease',
      }}>
        {/* Antenna */}
        {isLg && (
          <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: eyeGlow, boxShadow: `0 0 8px ${eyeGlow}`, animation: 'antennaGlow 1s ease-in-out infinite alternate' }} />
            <div style={{ width: 2, height: 10, background: 'rgba(255,255,255,0.3)' }} />
          </div>
        )}
        {/* Eyes */}
        <div style={{ display: 'flex', gap: isLg ? 14 : 6, alignItems: 'center' }}>
          {[0, 1].map(i => (
            <div key={i} style={{
              width: eyeSize + (isLg ? 2 : 0), height: eyeSize,
              borderRadius: state === 'speaking' ? '2px' : '50%',
              background: eyeGlow,
              boxShadow: `0 0 ${isLg ? 10 : 5}px ${eyeGlow}`,
              animation: state === 'listening'
                ? `eyeScan 1s ease-in-out ${i * 0.15}s infinite alternate`
                : state === 'speaking'
                ? `eyeBlink 0.4s ease-in-out ${i * 0.1}s infinite alternate`
                : `eyeIdle 4s ease-in-out ${i * 0.5}s infinite`,
              transition: 'border-radius 0.3s ease',
            }} />
          ))}
        </div>
        {/* Mouth */}
        <div style={{
          width: mouthW, height: isLg ? 7 : 4, borderRadius: 4,
          background: state === 'speaking' ? `linear-gradient(90deg,${eyeGlow},rgba(255,255,255,0.6),${eyeGlow})` : 'rgba(255,255,255,0.2)',
          animation: state === 'speaking' ? 'mouthTalk 0.3s ease-in-out infinite alternate' : 'none',
          backgroundSize: state === 'speaking' ? '200% 100%' : '100%',
          transition: 'background 0.3s ease',
          overflow: 'hidden', position: 'relative'
        }}>
          {state === 'speaking' && (
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)', animation: 'mouthShine 0.6s linear infinite' }} />
          )}
        </div>
        {/* Listening mic indicator */}
        {state === 'listening' && (
          <div style={{ position: 'absolute', bottom: isLg ? -18 : -12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 3, alignItems: 'flex-end' }}>
            {[5,9,6,11,7].map((h,i) => (
              <div key={i} style={{ width: isLg ? 3 : 2, height: isLg ? h : Math.round(h/2), background: '#34d399', borderRadius: 1, animation: `soundBar 0.6s ease-in-out ${i*0.1}s infinite alternate` }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const QUICK_PROMPTS = QUICK;

export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'assistant', text: KNOWLEDGE.greeting }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const [robotState, setRobotState] = useState('idle'); // idle | listening | speaking
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { listening, voiceEnabled, setVoiceEnabled, startListening, stopListening, speak, stopSpeaking } = useSpeech();

  useEffect(() => {
    if (open) { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); setUnread(0); }
  }, [messages, open]);

  useEffect(() => {
    setRobotState(listening ? 'listening' : loading ? 'speaking' : 'idle');
  }, [listening, loading]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    setMessages(m => [...m, { role: 'user', text }]);
    setInput('');
    setLoading(true);
    setRobotState('speaking');
    await new Promise(r => setTimeout(r, 500 + Math.random() * 700));
    const reply = generateResponse(text);
    setMessages(m => [...m, { role: 'assistant', text: reply }]);
    setLoading(false);
    setRobotState('idle');
    if (!open) setUnread(n => n + 1);
    speak(reply);
  };

  const handleVoice = () => {
    if (listening) { stopListening(); setRobotState('idle'); return; }
    const ok = startListening(transcript => { setInput(transcript); sendMessage(transcript); });
    if (ok) setRobotState('listening');
    else alert('Voice input needs Chrome browser');
  };

  return (
    <>
      {/* ── FAB Button ── */}
      {!open && (
        <button onClick={() => setOpen(true)} style={S.fab} title="Open CivicBot AI Assistant">
          <RobotAvatar state="idle" size="sm" />
          {unread > 0 && <span style={S.badge}>{unread}</span>}
          <span style={S.fabPulse} />
        </button>
      )}

      {/* ── Chat Window ── */}
      {open && (
        <div style={S.window}>
          {/* Header with large robot */}
          <div style={S.header}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <RobotAvatar state={robotState} size="sm" />
              <div>
                <div style={S.botName}>CivicBot AI</div>
                <div style={S.botStatus}>
                  <span style={{
                    ...S.onlineDot,
                    background: robotState === 'listening' ? '#34d399' : robotState === 'speaking' ? '#f59e0b' : '#34d399',
                    boxShadow: robotState === 'listening' ? '0 0 6px #34d399' : robotState === 'speaking' ? '0 0 6px #f59e0b' : '0 0 4px #34d399',
                  }} />
                  {robotState === 'listening' ? '🎤 Listening...' : loading ? '🤔 Thinking...' : 'Online · English Assistant'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button onClick={() => { navigate('/ai-chat'); setOpen(false); }}
                style={{ ...S.langBtn, ...S.langBtnActive, fontSize: '0.6rem', padding: '3px 9px' }}>
                🚀 Full Page
              </button>
              <button onClick={() => { setVoiceEnabled(v => !v); stopSpeaking(); }} style={S.iconBtn}>
                {voiceEnabled ? <Volume2 size={15} color="rgba(255,255,255,0.7)" /> : <VolumeX size={15} color="rgba(255,255,255,0.4)" />}
              </button>
              <button onClick={() => setOpen(false)} style={S.iconBtn}><X size={16} color="rgba(255,255,255,0.7)" /></button>
            </div>
          </div>

          {/* Speaking state banner */}
          {(robotState === 'listening' || robotState === 'speaking') && (
            <div style={{
              background: robotState === 'listening' ? 'rgba(52,211,153,0.1)' : 'rgba(245,158,11,0.1)',
              borderBottom: `1px solid ${robotState === 'listening' ? 'rgba(52,211,153,0.2)' : 'rgba(245,158,11,0.2)'}`,
              padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              {robotState === 'listening' ? (
                <>
                  <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                    {[4,7,5,9,6].map((h,i)=><div key={i} style={{ width:2,height:h,background:'#34d399',borderRadius:1,animation:`soundBar 0.6s ease ${i*0.1}s infinite alternate` }}/>)}
                  </div>
                  <span style={{ fontSize:'0.7rem',color:'#34d399',fontFamily:"'JetBrains Mono',monospace",fontWeight:600 }}>Listening to your voice...</span>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {[0,1,2].map(i=><span key={i} style={{ width:5,height:5,background:'#f59e0b',borderRadius:'50%',display:'inline-block',animation:`typingBounce 0.8s ${i*0.15}s ease-in-out infinite` }} />)}
                  </div>
                  <span style={{ fontSize:'0.7rem',color:'#f59e0b',fontFamily:"'JetBrains Mono',monospace",fontWeight:600 }}>CivicBot is thinking...</span>
                </>
              )}
            </div>
          )}

          {/* Messages */}
          <div style={S.messages}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 10, animation: 'fadeInUp 0.3s ease forwards' }}>
                {m.role === 'assistant' && (
                  <div style={{ ...S.msgAvatar, background: 'linear-gradient(135deg,#1e3a8a,#4f46e5)' }}>
                    <span style={{ fontSize: '0.6rem' }}>🤖</span>
                  </div>
                )}
                <div style={{ ...S.bubble, ...(m.role === 'user' ? S.userBubble : S.botBubble) }}>
                  {m.text.split('\n').map((line, li) => (
                    <span key={li}>{line.replace(/\*\*(.*?)\*\*/g, '$1')}<br /></span>
                  ))}
                </div>
                {m.role === 'user' && <div style={{ ...S.msgAvatar, background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', marginLeft: 6, marginRight: 0 }}><User size={12} color="white" /></div>}
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                <div style={{ ...S.msgAvatar, background: 'linear-gradient(135deg,#1e3a8a,#4f46e5)' }}><span style={{ fontSize: '0.6rem' }}>🤖</span></div>
                <div style={{ ...S.bubble, ...S.botBubble, display: 'flex', gap: 4, padding: '10px 14px' }}>
                  {[0,1,2].map(i => <span key={i} style={{ ...S.typingDot, animationDelay: `${i*0.2}s` }} />)}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          {messages.length <= 1 && (
            <div style={S.quickSection}>
              <div style={S.quickLabel}>Quick questions:</div>
              <div style={S.quickGrid}>
                {QUICK_PROMPTS.map(q => (
                  <button key={q} onClick={() => sendMessage(q)} style={S.quickBtn}>{q}</button>
                ))}
              </div>
            </div>
          )}

          {/* Input area */}
          <div style={S.inputArea}>
            <button onClick={handleVoice}
              style={{ ...S.voiceBtn, ...(listening ? S.voiceBtnActive : {}) }}
              title="Voice input (English)">
              {listening ? <MicOff size={16} color="white" /> : <Mic size={16} color="#3b82f6" />}
            </button>
            <input ref={inputRef} style={S.input} placeholder="Ask CivicBot anything..."
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage(input)} disabled={loading} />
            <button onClick={() => sendMessage(input)} style={S.sendBtn} disabled={!input.trim() || loading}>
              {loading ? <Loader size={16} color="white" style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} color="white" />}
            </button>
          </div>
          <div style={{ ...S.footer, display: 'flex', justifyContent: 'space-between', padding: '4px 10px 8px' }}>
            <span>CivicBot · English only</span>
            <span onClick={() => { navigate('/ai-chat'); setOpen(false); }} style={{ color: '#60a5fa', cursor: 'pointer' }}>Open full page →</span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.5)} }
        @keyframes fabPulse { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(2.5);opacity:0} }
        @keyframes typingBounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes chatOpen { from{opacity:0;transform:translateY(20px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes robotBreath { 0%,100%{transform:perspective(200px) rotateX(5deg) scale(1)} 50%{transform:perspective(200px) rotateX(5deg) scale(1.03)} }
        @keyframes robotBob { 0%,100%{transform:perspective(200px) rotateX(5deg) translateY(0)} 50%{transform:perspective(200px) rotateX(5deg) translateY(-3px)} }
        @keyframes robotPulseBody { 0%{transform:perspective(200px) rotateX(5deg) scale(1)} 100%{transform:perspective(200px) rotateX(5deg) scale(1.06)} }
        @keyframes robotTalkShake { 0%{transform:perspective(200px) rotateX(5deg) rotateZ(-1deg)} 100%{transform:perspective(200px) rotateX(5deg) rotateZ(1deg)} }
        @keyframes robotGlow { 0%{opacity:0.6;transform:scale(1)} 100%{opacity:1;transform:scale(1.3)} }
        @keyframes eyeIdle { 0%,90%,100%{transform:scaleY(1)} 95%{transform:scaleY(0.1)} }
        @keyframes eyeScan { 0%{transform:translateX(-2px)} 100%{transform:translateX(2px)} }
        @keyframes eyeBlink { 0%{transform:scaleY(1)} 100%{transform:scaleY(0.3)} }
        @keyframes mouthTalk { 0%{height:3px;border-radius:4px} 100%{height:7px;border-radius:2px} }
        @keyframes mouthShine { from{transform:translateX(-100%)} to{transform:translateX(200%)} }
        @keyframes antennaGlow { 0%{opacity:0.5;transform:scale(0.8)} 100%{opacity:1;transform:scale(1.2)} }
        @keyframes soundBar { 0%{transform:scaleY(0.3)} 100%{transform:scaleY(1)} }
      `}</style>
    </>
  );
}

const S = {
  fab: { position: 'fixed', bottom: 28, right: 28, width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, #1e3a8a, #4f46e5)', border: '2px solid rgba(99,140,255,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(59,130,246,0.4), 0 0 20px rgba(139,92,246,0.3)', zIndex: 1000, padding: 0 },
  fabPulse: { position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: 'rgba(59,130,246,0.3)', animation: 'fabPulse 2s ease-out infinite' },
  badge: { position: 'absolute', top: -4, right: -4, width: 20, height: 20, background: '#f43f5e', borderRadius: '50%', fontSize: '0.65rem', color: 'white', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #0a0e1a', zIndex: 1 },
  window: { position: 'fixed', bottom: 28, right: 28, width: 390, height: 610, background: '#0a0e1a', borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(59,130,246,0.12)', zIndex: 1000, display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid rgba(99,140,255,0.15)', animation: 'chatOpen 0.4s cubic-bezier(0.16,1,0.3,1)' },
  header: { background: 'linear-gradient(135deg, #0f1f5c, #1e1b4b)', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(99,140,255,0.15)' },
  botName: { fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '0.95rem', color: 'white' },
  botStatus: { fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'JetBrains Mono',monospace", marginTop: 2 },
  onlineDot: { width: 6, height: 6, borderRadius: '50%', flexShrink: 0, transition: 'background 0.3s ease, box-shadow 0.3s ease' },
  langBtn: { padding: '3px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.65rem', fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600 },
  langBtnActive: { background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.25)' },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' },
  messages: { flex: 1, padding: '14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2, background: '#070b14' },
  msgAvatar: { width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: 6, alignSelf: 'flex-end' },
  bubble: { maxWidth: '78%', padding: '10px 13px', borderRadius: 16, fontSize: '0.82rem', lineHeight: 1.6, fontFamily: "'Plus Jakarta Sans',sans-serif", whiteSpace: 'pre-wrap' },
  botBubble: { background: 'rgba(30,41,59,0.9)', color: '#e2e8f0', borderRadius: '4px 16px 16px 16px', border: '1px solid rgba(99,140,255,0.12)' },
  userBubble: { background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', color: 'white', borderRadius: '16px 4px 16px 16px' },
  typingDot: { width: 7, height: 7, background: '#64748b', borderRadius: '50%', display: 'inline-block', animation: 'typingBounce 1.2s ease-in-out infinite' },
  quickSection: { padding: '10px 14px 0', background: '#0a0e1a', borderTop: '1px solid rgba(99,140,255,0.1)' },
  quickLabel: { fontSize: '0.6rem', color: '#475569', fontFamily: "'JetBrains Mono',monospace", marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' },
  quickGrid: { display: 'flex', flexWrap: 'wrap', gap: 5, paddingBottom: 8 },
  quickBtn: { padding: '4px 10px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.18)', borderRadius: 20, color: '#60a5fa', fontSize: '0.7rem', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", whiteSpace: 'nowrap', transition: 'all 0.2s' },
  inputArea: { padding: '10px 12px', background: '#0a0e1a', borderTop: '1px solid rgba(99,140,255,0.1)', display: 'flex', gap: 8, alignItems: 'center' },
  voiceBtn: { width: 36, height: 36, borderRadius: '50%', background: 'rgba(59,130,246,0.1)', border: '2px solid rgba(59,130,246,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' },
  voiceBtnActive: { background: 'linear-gradient(135deg, #f43f5e, #dc2626)', border: '2px solid rgba(244,63,94,0.4)', animation: 'pulse 1.5s ease-in-out infinite' },
  input: { flex: 1, padding: '9px 12px', border: '1.5px solid rgba(99,140,255,0.15)', borderRadius: 12, fontSize: '0.82rem', color: '#e2e8f0', outline: 'none', background: 'rgba(7,11,20,0.9)', fontFamily: "'Plus Jakarta Sans',sans-serif" },
  sendBtn: { width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(99,102,241,0.4)' },
  footer: { textAlign: 'center', fontSize: '0.58rem', color: '#334155', padding: '4px 0 8px', fontFamily: "'JetBrains Mono',monospace" },
};






