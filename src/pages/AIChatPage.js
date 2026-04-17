// ============================================================
//  AIChatPage — Full-page CivicBot AI Assistant
//  English-only, persistent chat history via localStorage
//  Like TrustPage — its own dedicated route /ai-chat
// ============================================================
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Mic, MicOff, Volume2, VolumeX, User, Loader, Trash2, Download } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../AuthContext';
import { FloatingCard } from '../components/AnimatedPage';
import GlowButton from '../components/GlowButton';

const CHAT_KEY = 'civicsense_chat_history';

// ── English Knowledge Base ──────────────────────────────────
const KB = {
  greeting: "Namaste! 🙏 Welcome to CivicSense AI — TrustGrid Intelligence. I'm CivicBot, your smart civic assistant for Pune. I can guide you step-by-step on:\n📝 Reporting issues · 🔄 Tracking complaints · 🗺 Map navigation\n🏆 Trust scores · 📊 Analytics · 🏛 Admin portal\n\nWhat would you like help with today?",
  thanks: "You're welcome! 🙏 Remember — every citizen report makes Pune more transparent and accountable. Keep reporting, keep tracking! 💙",
  help: "Here's everything I can help you with:\n\n📝 **Reporting Issues** — Step-by-step complaint filing\n🔄 **Track Complaints** — Follow your issue status\n🗺 **Map View** — Find projects & issues near you\n📊 **Analytics** — City-wide insights & charts\n🏆 **Trust Scores** — Government performance ratings\n🏛 **Admin Portal** — Government management tools\n📸 **Before/After Images** — Visual project evidence\n💰 **Fund Tracking** — Budget utilization data\n💡 **Escalation Help** — What to do when issues are stuck\n\nJust ask about any of these!",
  entries: [
    {
      patterns: ['how do i report', 'how to report', 'report issue', 'file complaint', 'submit complaint', 'guide me step', 'step by step'],
      response: "📝 **Step-by-Step: How to Report a Civic Issue**\n\n**Step 1** → Click **'Report Issue'** in the left sidebar\n**Step 2** → Enter a clear title (e.g. 'Pothole on FC Road')\n**Step 3** → Select the related infrastructure project\n**Step 4** → Choose severity: 🔴 High · 🟡 Medium · 🟢 Low\n**Step 5** → Write a detailed description (what, where, since when)\n**Step 6** → Upload a photo — AI auto-classifies the issue type\n**Step 7** → Click **Submit Report** ✅\n\nYour report goes live on the map instantly and triggers an admin notification. Average response time: 24-72 hours."
    },
    {
      patterns: ['details required', 'what information', 'what details', 'what to fill', 'fields required', 'complaint fields'],
      response: "📋 **Required Details for Submitting a Complaint:**\n\n✅ **Title** — Clear, short description (e.g. 'Street light out near Baner circle')\n✅ **Project** — Select which infrastructure project it relates to\n✅ **Severity** — High (danger/urgent), Medium (affecting daily life), Low (minor)\n✅ **Description** — Explain what happened, exact location, and impact\n📸 **Photo** (optional but highly recommended) — AI analyzes it for classification\n\n💡 **Pro tip:** The more details you provide, the faster officials can respond and resolve!"
    },
    {
      patterns: ['show issues near', 'near me', 'nearby issues', 'my location', 'my area', 'issues around'],
      response: "🗺 **How to See Issues Near Your Location:**\n\n1. Click **Map** from the left sidebar\n2. Grant browser location permission when asked\n3. The map auto-centers to your GPS position\n4. You'll see:\n   • 🔴 Red markers = Critical projects\n   • 🟡 Yellow markers = Delayed projects\n   • 🟢 Green markers = On-track projects\n   • 📍 Small pins = Citizen reported issues\n5. Click any marker/pin for full details!\n6. Use the **Filter** button to show only Open or High-severity issues\n\nYour newly submitted issues appear as pins immediately! 📍"
    },
    {
      patterns: ['track complaint', 'track status', 'complaint status', 'where is my', 'check progress', 'my complaint', 'follow up'],
      response: "🔄 **How to Track Your Complaint Status:**\n\n1. Go to **Issues** page from the sidebar\n2. Your reports are listed — look for your title\n3. Each issue shows a status badge:\n   • 🔴 **Open** — Submitted, awaiting admin review\n   • 🟡 **In Review** — Official has picked it up\n   • 🟢 **Resolved** — Problem fixed, citizen notified\n4. Go to **Map** — your issue pin is visible with current status\n5. Resolved issues show: ✓ Citizen notified + Before/After images\n\n📌 Bookmark the Issues page to check daily updates!"
    },
    {
      patterns: ['why still in progress', 'why not resolved', 'pending too long', 'no action', 'escalate', 'escalation', 'still open', 'ignored'],
      response: "⚠️ **Issue Still Open? Here's Your Escalation Path:**\n\n**Step 1 — Verify status:** Is it 'Open', 'In Review' or stuck?\n**Step 2 — Upvote it:** Go to Issues page → click ▲ on your report. More votes = higher admin priority!\n**Step 3 — Share publicly:** Trust Scores page → Generate **Ward Report Card** → Share on WhatsApp/Twitter to create pressure\n**Step 4 — Re-report:** If 7+ days with no review, submit a new report referencing the original\n**Step 5 — Direct escalation:**\n  • PMC Helpline: 020-25506800\n  • PMC Twitter: @PMCPune\n  • Ward Office: Visit your local PMC ward office\n\n💡 Issues with 50+ upvotes get escalated automatically to senior officials!"
    },
    {
      patterns: ['most complaints', 'which area', 'worst area', 'problem areas', 'highest issues', 'most problems'],
      response: "📊 **Areas/Projects with Most Complaints — Pune:**\n\n🔴 **Shivajinagar Metro Station** — 24 open issues\n  (Construction noise, safety barriers, fund concerns)\n🔴 **Katraj-Kondhwa Road** — 18 issues\n  (Potholes unfilled despite payment release)\n🔴 **Wakad Drainage** — 15 issues\n  (Flooding, drainage failures)\n🟡 **Pimpri Water Supply** — 11 issues\n  (Muddy water, pipeline bursts)\n\n→ **Analytics** page: Severity breakdown chart (PolarArea)\n→ **Map** page: Geographic heatmap view\n→ **Trust Scores**: Rankings with health indicators 📈"
    },
    {
      patterns: ['road construction', 'road progress', 'construction status', 'road widening', 'road repair', 'road incomplete'],
      response: "🏗 **Road Construction Progress — Pune:**\n\n✅ **NH-48 Road Widening** — 68% · On Track\n  Budget: ₹42 Cr · Spent: ₹28.5 Cr · Trust: 84\n\n✅ **Hadapsar Flyover** — 55% · On Track\n  Budget: ₹63 Cr · Spent: ₹34 Cr · Trust: 79\n\n⚠️ **Katraj-Kondhwa Road** — 22% · Delayed\n  Budget: ₹8 Cr · Spent: ₹5.2 Cr · Trust: 44\n  🔴 18 open complaints — possible fund misuse\n\n**How to check progress:**\n→ Projects page → click any project for full details\n→ Admin panel → Fund Tracking tab\n→ Before/After images in project view 📸"
    },
    {
      patterns: ['civic problems pune', 'pune insights', 'city overview', 'governance pune', 'civic issues pune', 'give insights'],
      response: "🏙 **Civic Governance Insights — Pune:**\n\n📊 **8 active infrastructure projects** across Pune\n\n🟢 **Performing Well:**\n• Kothrud STP — 91 trust score · 82% complete\n• NH-48 Road — 84 trust score · 68% complete\n• Baner Smart Junction — 76 trust score\n\n🔴 **Critical Attention Needed:**\n• Shivajinagar Metro — 28 trust score · 24 issues\n• Katraj Road — 44 trust score · delayed\n• Wakad Drainage — 39 trust score · delayed\n\n📈 **City Trend:** Issues rising (62 in March) but resolution improving\n🏆 **Overall City Trust Score:** 85/100\n\n→ Full analysis in **Analytics** page!"
    },
    {
      patterns: ['street light', 'streetlight', 'light not working', 'no lighting', 'dark road', 'light issue'],
      response: "💡 **Street Light Not Working — Complete Escalation Guide:**\n\n**Immediate Steps:**\n1. Go to **Report Issue** in sidebar\n2. Title: 'Street light out — [Your Location]'\n3. Severity: **Medium** (or High if on busy road)\n4. Description: 'Street light at [exact location] not working since [date]. Safety risk for pedestrians.'\n5. Attach a **night-time photo** showing the dark area\n\n**Escalation if unresolved after 3 days:**\n• Upvote your report (▲) on Issues page\n• Share Ward Report Card on social media\n• Call: PMC Electrical Dept 020-25506800\n\n⚡ Street light issues average 48-72 hour resolution time!"
    },
    {
      patterns: ['governance', 'improve governance', 'how platform helps', 'platform work', 'how civicsense', 'what does this platform'],
      response: "🌐 **How TrustGrid AI Transforms Governance:**\n\n1. 📝 **Citizen Reports** → Real-time issue tracking on public map\n2. 🤖 **AI Classification** → Photos auto-analyzed to detect issue type\n3. 🏆 **Trust Score AI** → Computes transparency score 0-100 from 4 factors\n4. 🏛 **Admin Portal** → Officials review, assign, and close complaints\n5. 📸 **Before/After Evidence** → Visual proof of completed work (only on resolved issues)\n6. 📊 **Analytics Dashboard** → Data-driven city governance insights\n7. 📤 **Ward Report Cards** → Shareable transparency reports for public pressure\n8. 👷 **Contractor Scores** → Admin can manually adjust contractor trust ratings\n\n→ Result: Accountability, transparency, and citizen empowerment! 🚀"
    },
    {
      patterns: ['trust', 'score', 'rating', 'trustscore', 'what is trust score', 'trust score explained'],
      response: "🏆 **Trust Score — Complete Explanation:**\n\nTrust Scores (0-100) measure government project transparency using AI:\n\n⏱ **Timeliness** (82%) — Are projects on schedule?\n🔍 **Transparency** (91%) — Are updates publicly shared?\n📊 **Issue Resolution** (88%) — Are citizen complaints closed?\n👥 **Citizen Satisfaction** (79%) — Community feedback score\n\n**Current Project Rankings:**\n🥇 Kothrud STP — 91 (Excellent)\n🥈 NH-48 Road — 84 (Good)\n🥉 Hadapsar Flyover — 79 (Good)\n🟡 Pimpri Water — 51 (At Risk)\n🔴 Shivajinagar Metro — 28 (Critical)\n\n→ Check **Trust Scores** page for full rankings + Ward Report Cards!"
    },
    {
      patterns: ['report', 'pothole', 'issue', 'complaint', 'problem', 'broken', 'damage', 'not working'],
      response: "📝 **Quick Reporting Guide:**\nTo report any civic issue:\n1. Sidebar → **Report Issue**\n2. Fill: Title, Project, Severity, Description\n3. Add a photo for AI analysis\n4. Submit — appears on map instantly!\n\nFor step-by-step guidance, ask: 'Guide me step by step' 👆"
    },
    {
      patterns: ['admin', 'government', 'portal', 'official', 'manage', 'pmc', 'authority'],
      response: "🏛 **Government Admin Portal:**\n\n**Access:** Switch role from sidebar (Gov Admin)\n**Tabs available:**\n• **Overview** — KPIs, recent citizen reports\n• **Issue Review** — Review/resolve complaints\n• **Fund Tracking** — Budget utilization\n• **Manage Projects** — Update status & progress\n\n**Exclusive Features (Gov Admin only):**\n• Upload Before/After images (only for resolved issues)\n• Edit Contractor Trust Scores\n• Access all citizen complaint details\n\n⚠️ Requires gov-admin credentials to access!"
    },
    {
      patterns: ['map', 'location', 'gps', 'where', 'navigate', 'find', 'nearby'],
      response: "🗺 **Map View — Complete Guide:**\n\n**Map Markers:**\n• 🟢 Green = On Track projects\n• 🟡 Yellow = Delayed projects\n• 🔴 Red = Critical projects\n• 📍 Small pins = Citizen reports\n\n**How to use:**\n1. Sidebar → Map\n2. Allow location → auto-centers to you\n3. Click any marker → full details popup\n4. Use filters for issue type/status\n5. Newly reported issues appear immediately!\n\n→ Perfect for seeing civic activity near your home! 🏠"
    },
    {
      patterns: ['photo', 'image', 'camera', 'picture', 'before', 'after', 'evidence'],
      response: "📸 **Photo Evidence & Before/After System:**\n\n**When Reporting:**\n• Attach a photo → AI auto-classifies issue type\n• Photo becomes permanent record of the problem\n\n**Before/After Images:**\n• Available ONLY when issue/project status = ✅ Resolved\n• Government uploads 'after' photo as proof of work done\n• Visible to both citizens (User Panel) and admins\n• Creates visual accountability trail\n\n→ Check resolved issues in Issues page for before/after evidence! 📷"
    },
    {
      patterns: ['fund', 'budget', 'money', 'spending', 'crore', 'financial'],
      response: "💰 **Fund Utilization Tracking:**\n\nCivicSense tracks budget vs spending for every project:\n\n• **NH-48 Road** — ₹28.5Cr / ₹42Cr (68% utilized) ✅\n• **Shivajinagar Metro** — ₹140Cr / ₹215Cr (65%) 🟡\n• **Hadapsar Flyover** — ₹34Cr / ₹63Cr (54%) ✅\n• **Katraj Road** — ₹5.2Cr / ₹8Cr (65%) — only 22% work done ⚠️\n\n⚠️ If money spent >> work done → flagged as 'Over Budget'\n→ Admin Portal → **Fund Tracking** tab for full details 📊"
    },
    {
      patterns: ['save', 'persist', 'data', 'storage', 'refresh', 'reload', 'logout'],
      response: "💾 **Data Persistence:**\n✅ All projects saved locally\n✅ Issues & reports persist across sessions\n✅ Profile data remembered\n✅ Settings saved automatically\n✅ Chat history preserved (last 80 messages)\n\nEverything survives page refresh and logout! Your civic contributions are permanently recorded. 🔒"
    },
    {
      patterns: ['analytics', 'chart', 'graph', 'data', 'trend', 'statistics'],
      response: "📊 **Analytics Page — 6 Interactive Charts:**\n\n1. 📈 **Issues vs Resolved** — Monthly timeline trend\n2. 🏆 **Trust Score Trends** — 7-month governance history\n3. 🍩 **Project Status** — On-track/Delayed/Critical breakdown\n4. 🕸 **Governance Radar** — 5-axis performance radar\n5. 🔵 **Severity Distribution** — PolarArea breakdown by severity\n6. 💰 **Budget Allocation** — Spending by project category\n\n→ All powered by Chart.js · Hover for tooltips!\n→ Sidebar → **Analytics** to explore 📱"
    },
    {
      patterns: ['profile', 'settings', 'account', 'preferences'],
      response: "👤 **Profile & Settings:**\n\n**Profile page** (sidebar):\n• Update name, email, phone, ward, bio\n• Manage notification preferences\n• All changes persist across sessions!\n\n**Settings page** (sidebar):\n• 🎨 Theme: Dark / Light mode\n• 🔔 Notification toggles\n• 🗺 Default map style\n• 💾 Export or clear your data\n\nAll settings are saved automatically! ⚙️"
    },
  ],
  fallbacks: [
    "I specialize in civic governance assistance for Pune! Try asking me:\n• 'How do I report a pothole?'\n• 'Guide me step by step'\n• 'Track my complaint status'\n• 'Why is my issue still pending?'\n• 'Give insights about civic problems in Pune' 💙",
    "Great question! I'm CivicBot — your civic intelligence assistant. I can give you step-by-step guidance on any platform feature. Try asking about reporting, tracking issues, escalating complaints, or understanding trust scores! 🤖",
    "I can help you navigate the TrustGrid AI platform! Ask me about:\n📝 Filing complaints · 🔄 Tracking progress · ⚠️ Escalating issues\n🗺 Map navigation · 🏆 Trust scores · 📊 City analytics 🏙",
  ],
};

const GREET_PATTERNS = ['hello', 'hi', 'hey', 'namaste', 'namaskar', 'good morning', 'good evening', 'good afternoon', 'good night', 'hiya', 'howdy'];
const THANKS_PATTERNS = ['thank', 'thanks', 'thank you', 'appreciate', 'cheers', 'great', 'awesome', 'perfect'];
const HELP_PATTERNS = ['help', 'what can you do', 'features', 'how to use', 'guide', 'tutorial', 'what do you know'];

const QUICK = [
  '📝 Guide me step by step to report an issue',
  '🔄 How do I track my complaint status?',
  '🗺️ Show issues near my location',
  '⚠️ My issue is still pending — how to escalate?',
  '🏆 Explain trust scores',
  '🏙️ Give insights about civic problems in Pune',
  '💡 Street light not working — how to escalate?',
  '🏗️ What is the progress of road construction?',
];

function respond(msg) {
  const m = msg.toLowerCase().trim();
  if (GREET_PATTERNS.some(p => m.includes(p))) return KB.greeting;
  if (THANKS_PATTERNS.some(p => m.includes(p))) return KB.thanks;
  if (HELP_PATTERNS.some(p => m.includes(p))) return KB.help;
  let best = null, bestScore = 0;
  for (const entry of KB.entries) {
    let score = 0;
    for (const p of entry.patterns) { if (m.includes(p)) score += p.length; }
    if (score > bestScore) { bestScore = score; best = entry; }
  }
  if (best && bestScore > 0) return best.response;
  return KB.fallbacks[Math.floor(Math.random() * KB.fallbacks.length)];
}



function loadHistory() {
  try {
    const s = localStorage.getItem(CHAT_KEY);
    if (s) { const p = JSON.parse(s); if (Array.isArray(p) && p.length > 0) return p; }
  } catch {}
  return [{ role: 'assistant', text: KB.greeting, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }];
}

function saveHistory(msgs) {
  try { localStorage.setItem(CHAT_KEY, JSON.stringify(msgs.slice(-80))); } catch {}
}

export default function AIChatPage() {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const [messages, setMessages] = useState(loadHistory);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const recogRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    saveHistory(messages);
  }, [messages]);

  const now = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const send = async (text) => {
    if (!text?.trim() || loading) return;
    const userMsg = { role: 'user', text: text.trim(), time: now() };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 500 + Math.random() * 700));
    const reply = respond(text);
    const botMsg = { role: 'assistant', text: reply, time: now() };
    setMessages(m => [...m, botMsg]);
    setLoading(false);
    if (voiceOn) {
      try {
        synthRef.current?.cancel();
        const u = new SpeechSynthesisUtterance(reply.replace(/[*#_\[\]🗺📝🏆💾🔍📊🏛💰🤖📸📤🏗🏙💙🙏⏱🔍👥]/g, ''));
        u.lang = 'en-IN'; u.rate = 0.92; u.pitch = 1;
        synthRef.current?.speak(u);
      } catch {}
    }
  };

  const handleVoice = () => {
    if (listening) { try { recogRef.current?.stop(); } catch {} setListening(false); return; }
    try {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) { alert('Voice input needs Chrome browser'); return; }
      const r = new SR();
      r.lang = 'en-IN'; r.continuous = false; r.interimResults = false;
      r.onresult = e => { const t = Array.from(e.results).map(x => x[0].transcript).join(''); send(t); setListening(false); };
      r.onerror = () => setListening(false);
      r.onend = () => setListening(false);
      recogRef.current = r;
      r.start();
      setListening(true);
    } catch { alert('Voice not available. Please type your message.'); }
  };

  const clearChat = () => {
    const fresh = [{ role: 'assistant', text: KB.greeting, time: now() }];
    setMessages(fresh);
    saveHistory(fresh);
  };

  const exportChat = () => {
    const text = messages.map(m => `[${m.time}] ${m.role === 'user' ? (user?.name || 'You') : 'CivicBot'}: ${m.text}`).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'civicbot_chat.txt'; a.click();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '1.5rem', maxWidth: 900, margin: '0 auto', height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(59,130,246,0.35)' }}>
            <Bot size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: '1.4rem', color: theme.textPrimary, margin: 0 }}>CivicBot AI</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 6px #34d399', animation: 'pulse 2s infinite', display: 'inline-block' }} />
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.6rem', color: theme.textMuted }}>Online · English · {messages.length - 1} messages</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => { setVoiceOn(v => !v); try { synthRef.current?.cancel(); } catch {} }}
            style={{ padding: '7px 10px', borderRadius: 9, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, color: voiceOn ? '#6366f1' : theme.textMuted, fontFamily: "'JetBrains Mono',monospace", fontSize: '0.62rem', fontWeight: 600 }}>
            {voiceOn ? <Volume2 size={13} /> : <VolumeX size={13} />}
            {voiceOn ? 'Voice On' : 'Voice Off'}
          </button>
          <GlowButton variant="glass" size="sm" icon={<Download size={13} />} onClick={exportChat}>Export</GlowButton>
          <GlowButton variant="glass" size="sm" icon={<Trash2 size={13} />} onClick={clearChat}>Clear</GlowButton>
        </div>
      </motion.div>

      {/* Main chat area */}
      <div style={{ flex: 1, display: 'flex', gap: '1rem', overflow: 'hidden', minHeight: 0 }}>
        {/* Chat panel */}
        <FloatingCard style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 12, background: isDark ? 'rgba(6,10,22,0.5)' : 'rgba(248,249,253,0.8)' }}>
            {messages.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-end' }}>
                {m.role === 'assistant' && (
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot size={13} color="white" />
                  </div>
                )}
                <div style={{ maxWidth: '72%' }}>
                  <div style={{
                    padding: '10px 14px', borderRadius: m.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                    background: m.role === 'user' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : (isDark ? 'rgba(20,30,55,0.9)' : 'rgba(255,255,255,0.95)'),
                    color: m.role === 'user' ? 'white' : theme.textPrimary,
                    fontSize: '0.84rem', lineHeight: 1.6, fontFamily: "'Plus Jakarta Sans',sans-serif",
                    border: m.role === 'user' ? 'none' : `1px solid ${theme.border}`,
                    boxShadow: m.role === 'user' ? '0 4px 20px rgba(99,102,241,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {m.text}
                  </div>
                  <div style={{ fontSize: '0.58rem', color: theme.textMuted, fontFamily: "'JetBrains Mono',monospace", marginTop: 3, textAlign: m.role === 'user' ? 'right' : 'left', padding: '0 4px' }}>{m.time}</div>
                </div>
                {m.role === 'user' && (
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={13} color="white" />
                  </div>
                )}
              </motion.div>
            ))}
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={13} color="white" />
                </div>
                <div style={{ padding: '12px 16px', borderRadius: '4px 16px 16px 16px', background: isDark ? 'rgba(20,30,55,0.9)' : 'rgba(255,255,255,0.95)', border: `1px solid ${theme.border}`, display: 'flex', gap: 5, alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#6366f1', display: 'inline-block', animation: `typingBounce 1.2s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts — show only when ≤ 1 exchange */}
          {messages.length <= 1 && (
            <div style={{ padding: '10px 14px', borderTop: `1px solid ${theme.border}`, background: isDark ? 'rgba(10,16,36,0.6)' : 'rgba(248,249,253,0.9)' }}>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.58rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Quick questions</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {QUICK.map(q => (
                  <button key={q} onClick={() => send(q)}
                    style={{ padding: '5px 10px', background: isDark ? 'rgba(59,130,246,0.08)' : 'rgba(99,102,241,0.06)', border: `1px solid ${isDark ? 'rgba(59,130,246,0.18)' : 'rgba(99,102,241,0.15)'}`, borderRadius: 20, color: isDark ? '#60a5fa' : '#6366f1', fontSize: '0.72rem', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '12px 14px', borderTop: `1px solid ${theme.border}`, background: isDark ? 'rgba(10,16,36,0.8)' : 'rgba(255,255,255,0.95)', display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={handleVoice}
              style={{ width: 38, height: 38, borderRadius: '50%', background: listening ? 'linear-gradient(135deg, #f43f5e, #dc2626)' : 'rgba(99,102,241,0.1)', border: `2px solid ${listening ? 'rgba(244,63,94,0.4)' : 'rgba(99,102,241,0.2)'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
              {listening ? <MicOff size={15} color="white" /> : <Mic size={15} color="#6366f1" />}
            </button>
            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
              disabled={loading} placeholder="Ask CivicBot anything (press Enter to send)..."
              style={{ flex: 1, padding: '10px 14px', borderRadius: 12, fontSize: '0.83rem', fontFamily: "'Plus Jakarta Sans',sans-serif", outline: 'none', background: isDark ? 'rgba(15,22,41,0.8)' : '#f2f3f7', border: `1.5px solid ${theme.border}`, color: theme.textPrimary, transition: 'all 0.2s' }} />
            <button onClick={() => send(input)} disabled={!input.trim() || loading}
              style={{ width: 38, height: 38, borderRadius: '50%', background: input.trim() ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(99,140,255,0.1)', border: 'none', cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
              {loading ? <Loader size={15} color="white" style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={15} color={input.trim() ? 'white' : '#5a6d8a'} />}
            </button>
          </div>
        </FloatingCard>

        {/* Right: Info panel */}
        <div style={{ width: 220, display: 'flex', flexDirection: 'column', gap: '0.75rem', flexShrink: 0 }}>
          <FloatingCard style={{ padding: '1rem' }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.58rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>CivicBot Features</div>
            {[
              ['🇬🇧', 'English only'],
              ['💾', 'Chat history saved'],
              ['🎤', 'Voice input (Chrome)'],
              ['🔊', 'Voice responses'],
              ['📤', 'Export chat'],
              ['🔄', 'Persists on refresh'],
            ].map(([icon, label]) => (
              <div key={label} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '5px 0', fontSize: '0.75rem', color: theme.textMuted, fontFamily: "'Inter',sans-serif" }}>
                <span>{icon}</span><span>{label}</span>
              </div>
            ))}
          </FloatingCard>
          <FloatingCard style={{ padding: '1rem' }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.58rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Topics I Know</div>
            {['📝 Reporting issues', '🗺 Map navigation', '🏆 Trust scores', '📊 Analytics', '🏛 Admin portal', '💰 Budget tracking', '📸 Photo evidence', '⚙️ Settings & Profile', '💾 Data persistence', '🔍 Search & Filter'].map(t => (
              <div key={t} style={{ fontSize: '0.72rem', color: theme.textMuted, padding: '3px 0', fontFamily: "'Inter',sans-serif" }}>{t}</div>
            ))}
          </FloatingCard>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes typingBounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </motion.div>
  );
}
