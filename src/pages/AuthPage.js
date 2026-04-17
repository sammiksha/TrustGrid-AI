// ============================================================
//  AuthPage v2 — Next-Gen Login UI
//  Features: holographic grid, 3D card tilt, cursor spotlight,
//  animated gradient text, enhanced portal selector, typing effects
// ============================================================
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { Shield, Eye, EyeOff, LogIn, UserPlus, Building2, User, ChevronLeft, CheckCircle, Zap, Globe, Lock } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import ParticleBackground from '../components/ParticleBackground';
import GlowButton from '../components/GlowButton';

// ─── 3D Tilt Card Hook ───────────────────────────────────────
function useTilt() {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [shine, setShine] = useState({ x: 50, y: 50 });

  const handleMouseMove = useCallback((e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -16;
    const sx = ((e.clientX - rect.left) / rect.width) * 100;
    const sy = ((e.clientY - rect.top) / rect.height) * 100;
    setTilt({ x, y });
    setShine({ x: sx, y: sy });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setShine({ x: 50, y: 50 });
  }, []);

  return { ref, tilt, shine, handleMouseMove, handleMouseLeave };
}

// ─── Holographic Portal Card ──────────────────────────────────
function PortalCard({ icon: Icon, title, sub, badge, badgeColor, onClick, accentColor }) {
  const { ref, tilt, shine, handleMouseMove, handleMouseLeave } = useTilt();
  const [hovered, setHovered] = useState(false);

  return (
    <button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { handleMouseLeave(); setHovered(false); }}
      onMouseEnter={() => setHovered(true)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '16px',
        background: hovered
          ? `rgba(${accentColor === 'blue' ? '59,130,246' : '16,185,129'},0.06)`
          : 'rgba(10,16,36,0.5)',
        border: `1px solid rgba(${accentColor === 'blue' ? '59,130,246' : '16,185,129'},${hovered ? 0.2 : 0.08})`,
        borderRadius: 16, cursor: 'pointer', width: '100%', marginBottom: '1rem',
        textAlign: 'left', fontFamily: "'Plus Jakarta Sans',sans-serif",
        transform: `perspective(700px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
        transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1), border-color 0.2s',
        boxShadow: hovered
          ? `0 16px 40px rgba(0,0,0,0.3), 0 0 30px rgba(${accentColor === 'blue' ? '59,130,246' : '16,185,129'},0.12)`
          : '0 4px 16px rgba(0,0,0,0.2)',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Shine overlay */}
      {hovered && (
        <span style={{
          position: 'absolute', inset: 0, borderRadius: 'inherit',
          background: `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(255,255,255,0.06) 0%, transparent 60%)`,
          pointerEvents: 'none', transition: 'none',
        }} />
      )}
      {/* Top gradient line */}
      {hovered && (
        <span style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
          background: `linear-gradient(90deg, transparent, rgba(${accentColor === 'blue' ? '59,130,246' : '16,185,129'},0.6), transparent)`,
          pointerEvents: 'none',
        }} />
      )}
      <div style={{
        width: 52, height: 52, borderRadius: 14, flexShrink: 0,
        background: accentColor === 'blue' ? 'rgba(59,130,246,0.08)' : 'rgba(16,185,129,0.08)',
        border: `2px solid rgba(${accentColor === 'blue' ? '59,130,246' : '16,185,129'},${hovered ? 0.3 : 0.15})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.3s',
        boxShadow: hovered ? `0 0 20px rgba(${accentColor === 'blue' ? '59,130,246' : '16,185,129'},0.2)` : 'none',
      }}>
        <Icon size={26} color={accentColor === 'blue' ? '#60a5fa' : '#34d399'} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#e2e8f0', marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: '0.72rem', color: '#5a6d8a' }}>{sub}</div>
      </div>
      <div style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.68rem', fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", background: accentColor === 'blue' ? 'rgba(59,130,246,0.12)' : 'rgba(16,185,129,0.12)', color: accentColor === 'blue' ? '#60a5fa' : '#34d399' }}>
        {badge}
      </div>
    </button>
  );
}

// ─── Portal Selector ─────────────────────────────────────────
function PortalSelector({ onSelect }) {
  const [hoverImage, setHoverImage] = useState(false);
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 500], [0, 50]);

  return (
    <div className="auth-page-container" style={S.page}>
      <div className="hero-left">
        <div style={S.orb1} />
        <div style={S.orb2} />
        
        <div style={S.liveBadge}>
          <div style={S.liveDot} />
          LIVE · System Online
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16,1,0.3,1] }}
          style={S.heroInner}
        >
          <div style={S.logoRow}>
            <div style={S.logoIcon}>
              <Shield size={28} color="#0ea5e9" />
            </div>
            <span style={S.logoText}>TrustGrid<span style={S.logoHighlight}>AI</span></span>
          </div>

          <h1 style={S.headline}>Digital Transparency for Bharat's Infrastructure</h1>
          <p style={S.tagline}>Real-time tracking · AI-powered trust scores · Citizen-driven governance</p>

          <div style={S.statsRow}>
            <div style={S.stat}>
              <span style={S.statVal}>42</span>
              <span style={S.statLabel}>Active Projects</span>
            </div>
            <div style={S.stat}>
              <span style={S.statVal}>87%</span>
              <span style={S.statLabel}>Avg Trust Score</span>
            </div>
            <div style={S.stat}>
              <span style={S.statVal}>284+</span>
              <span style={S.statLabel}>Issues Tracked</span>
            </div>
          </div>
          
          <div style={S.ctaRow}>
            <button style={S.btnPrimary} onClick={() => onSelect('user')}>Citizen Portal</button>
            <button style={S.btnSecondary} onClick={() => onSelect('admin')}>Gov Portal</button>
          </div>
        </motion.div>
      </div>

      <div className="hero-right">
        <motion.div 
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16,1,0.3,1] }}
          style={{ width: '100%', height: '100%' }}
        >
          <motion.div 
            style={{...S.rightImageContainer, y: parallaxY}}
            onMouseEnter={() => setHoverImage(true)}
            onMouseLeave={() => setHoverImage(false)}
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <motion.div 
              style={S.rightImage}
              animate={{ scale: hoverImage ? 1.05 : 1.0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── User Login / Signup ─────────────────────────────────────
function UserAuth({ onBack }) {
  const { login, signup } = useAuth();
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleLogin = async () => {
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true); setError('');
    const res = await login(form.email, form.password, 'user');
    if (!res.ok) setError(res.error);
    setLoading(false);
  };

  const handleSignup = async () => {
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true); setError(''); setSuccess('');
    const res = await signup(form.name, form.email, form.password);
    if (!res.ok) setError(res.error);
    else setSuccess('Account created! Logging you in…');
    setLoading(false);
  };

  const fillDemo = (e, p) => { setForm(f => ({ ...f, email: e, password: p })); };

  return (
    <div className="auth-page-container" style={S.page}>
      <div className="hero-left" style={{ background: 'linear-gradient(135deg, #060a16 0%, #0c1530 50%, #1e3a8a 100%)' }}>
        <ParticleBackground />
        <div className="holographic-grid" />
        <div style={S.heroInner}>
          <div style={S.logoRow}>
            <div style={S.logoIcon}><User size={24} color="white" /></div>
            <span style={S.logoText}>Citizen<span style={{ color: '#60a5fa' }}>Portal</span></span>
          </div>
          <h1 style={{ ...S.headline, fontSize: '2.2rem' }}>Your Voice,<br />Your City,<br />Your Data</h1>
          <p style={S.tagline}>Report civic issues · Track government projects · Hold officials accountable</p>
          <div style={S.featureList}>
            {['GPS-tagged issue reporting', 'Voice reports in English', 'Real-time project tracking', 'Community trust scores', 'Before/After photo proofs', 'Share ward report cards'].map(f => (
              <div key={f} style={S.featureItem}>
                <CheckCircle size={16} color="#60a5fa" style={{ flexShrink: 0 }} />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={S.orb1} /><div style={S.orb2} /><div style={S.orb3} />
      </div>
      <div className="hero-right" style={{
        backgroundImage: 'linear-gradient(to bottom right, rgba(15,23,42,0.85), rgba(15,23,42,0.4)), url("https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&q=80&w=1200")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div style={S.card}>
          <button onClick={onBack} style={S.backBtn}><ChevronLeft size={14} /> All Portals</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
            <div style={{ ...S.logoIcon, width: 36, height: 36, background: 'rgba(59,130,246,0.08)', border: '2px solid rgba(59,130,246,0.18)' }}><User size={16} color="#60a5fa" /></div>
            <div>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '1rem', color: '#f1f5f9' }}>Citizen Portal</div>
              <div style={{ fontSize: '0.68rem', color: '#5a6d8a', fontFamily: "'JetBrains Mono',monospace" }}>CivicSense · Pune</div>
            </div>
          </div>

          <div style={S.tabRow}>
            {[['login', 'Sign In'], ['register', 'Sign Up']].map(([id, label]) => (
              <button key={id} onClick={() => { setTab(id); setError(''); setSuccess(''); }}
                style={{ ...S.tabBtn, ...(tab === id ? S.tabBtnActive : {}) }}>{label}</button>
            ))}
          </div>

          {tab === 'login' && <>
            <div style={S.field}>
              <label style={S.label}>Email Address</label>
              <input style={S.input} type="email" placeholder="you@example.com" value={form.email}
                onChange={e => set('email', e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            </div>
            <div style={S.field}>
              <label style={S.label}>Password</label>
              <div style={{ position: 'relative' }}>
                <input style={{ ...S.input, paddingRight: 40 }} type={show ? 'text' : 'password'} placeholder="••••••••"
                  value={form.password} onChange={e => set('password', e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                <button onClick={() => setShow(s => !s)} style={S.eyeBtn}>
                  {show ? <EyeOff size={15} color="#5a6d8a" /> : <Eye size={15} color="#5a6d8a" />}
                </button>
              </div>
            </div>
            {error && <div style={S.error}>{error}</div>}
            <GlowButton variant="primary" size="lg" loading={loading} onClick={handleLogin}
              icon={<LogIn size={16} />} style={{ width: '100%', marginBottom: '1.25rem' }}>
              Sign In
            </GlowButton>
            <div style={S.divider}><span style={S.divTxt}>Demo Accounts</span></div>
            <div style={S.demoGrid}>
              {[
                { label: 'Ananya Kumar', e: 'ananya@civicsense.in', p: 'citizen123', color: '#60a5fa' },
                { label: 'Arjun Sharma', e: 'arjun@civicsense.in', p: 'arjun123', color: '#34d399' },
              ].map(d => (
                <button key={d.label} onClick={() => fillDemo(d.e, d.p)}
                  style={{ ...S.demoBtn, borderColor: `${d.color}20`, color: d.color }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                    <User size={12} color={d.color} /> {d.label}
                  </div>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.58rem', opacity: 0.7 }}>{d.e}</span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.58rem', opacity: 0.5 }}>{d.p}</span>
                </button>
              ))}
            </div>
          </>}

          {tab === 'register' && <>
            <div style={S.field}>
              <label style={S.label}>Full Name</label>
              <input style={S.input} placeholder="e.g. Priya Sharma" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div style={S.field}>
              <label style={S.label}>Email Address</label>
              <input style={S.input} type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div style={S.field}>
              <label style={S.label}>Password</label>
              <div style={{ position: 'relative' }}>
                <input style={{ ...S.input, paddingRight: 40 }} type={show ? 'text' : 'password'} placeholder="Min 6 characters"
                  value={form.password} onChange={e => set('password', e.target.value)} />
                <button onClick={() => setShow(s => !s)} style={S.eyeBtn}>
                  {show ? <EyeOff size={15} color="#5a6d8a" /> : <Eye size={15} color="#5a6d8a" />}
                </button>
              </div>
            </div>
            <div style={S.field}>
              <label style={S.label}>Confirm Password</label>
              <input style={S.input} type="password" placeholder="Re-enter password"
                value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
            </div>
            {error && <div style={S.error}>{error}</div>}
            {success && <div style={S.successMsg}><CheckCircle size={14} /> {success}</div>}
            <GlowButton variant="success" size="lg" loading={loading} onClick={handleSignup}
              icon={<UserPlus size={16} />} style={{ width: '100%', marginBottom: '1rem' }}>
              Create Account
            </GlowButton>
            <p style={{ fontSize: '0.72rem', color: '#5a6d8a', textAlign: 'center', marginTop: 8 }}>
              Already have an account? <button onClick={() => setTab('login')} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontWeight: 600, fontSize: '0.72rem' }}>Sign In</button>
            </p>
          </>}
        </div>
      </div>
    </div>
  );
}

// ─── Admin Login ─────────────────────────────────────────────
function AdminAuth({ onBack }) {
  const { login, ADMIN_USERS } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleLogin = async () => {
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true); setError('');
    const res = await login(form.email, form.password, 'admin');
    if (!res.ok) setError(res.error);
    setLoading(false);
  };

  const fillAdmin = (a) => setForm({ email: a.email, password: a.password });

  return (
    <div className="auth-page-container" style={S.page}>
      <div className="hero-left" style={{ background: 'linear-gradient(135deg, #060a16 0%, #052e16 50%, #14532d 100%)' }}>
        <ParticleBackground />
        <div className="holographic-grid" />
        <div style={S.heroInner}>
          <div style={S.logoRow}>
            <div style={{ ...S.logoIcon, background: 'rgba(16,185,129,0.12)' }}><Building2 size={24} color="white" /></div>
            <span style={S.logoText}>Gov<span style={{ color: '#34d399' }}>Portal</span></span>
          </div>
          <h1 style={{ ...S.headline, fontSize: '2.2rem' }}>Pune Municipal<br />Corporation<br />Admin Panel</h1>
          <p style={S.tagline}>Restricted access · Government officials only · Authorized personnel</p>
          <div style={S.featureList}>
            {['Project management & approvals', 'Citizen complaint review', 'City-wide analytics dashboard', 'Issue resolution tracking', 'Official announcement tools', 'System configuration'].map(f => (
              <div key={f} style={S.featureItem}>
                <CheckCircle size={16} color="#34d399" style={{ flexShrink: 0 }} />
                <span>{f}</span>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 16px', marginTop: '1.5rem' }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>🔒 SECURE ACCESS</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem' }}>This portal is for authorized PMC officials only.</div>
          </div>
        </div>
        <div style={S.orb1} /><div style={S.orb2} /><div style={S.orb3} />
      </div>
      <div className="hero-right" style={{
        backgroundImage: 'linear-gradient(to bottom right, rgba(15,23,42,0.85), rgba(15,23,42,0.4)), url("https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div style={S.card}>
          <button onClick={onBack} style={S.backBtn}><ChevronLeft size={14} /> All Portals</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
            <div style={{ ...S.logoIcon, width: 36, height: 36, background: 'rgba(16,185,129,0.08)', border: '2px solid rgba(16,185,129,0.18)' }}><Building2 size={16} color="#34d399" /></div>
            <div>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '1rem', color: '#f1f5f9' }}>Government Portal</div>
              <div style={{ fontSize: '0.68rem', color: '#5a6d8a', fontFamily: "'JetBrains Mono',monospace" }}>Pune Municipal Corporation</div>
            </div>
          </div>

          <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)', borderRadius: 10, padding: '10px 14px', fontSize: '0.75rem', color: '#fbbf24', marginBottom: '1.25rem', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <Lock size={14} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>Restricted access. Only authorized PMC officials may log in here.</span>
          </div>

          <div style={S.field}>
            <label style={S.label}>Official Email</label>
            <input style={S.input} type="email" placeholder="name@pmc.gov.in" value={form.email}
              onChange={e => set('email', e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>
          <div style={S.field}>
            <label style={S.label}>Password</label>
            <div style={{ position: 'relative' }}>
              <input style={{ ...S.input, paddingRight: 40 }} type={show ? 'text' : 'password'} placeholder="••••••••"
                value={form.password} onChange={e => set('password', e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              <button onClick={() => setShow(s => !s)} style={S.eyeBtn}>
                {show ? <EyeOff size={15} color="#5a6d8a" /> : <Eye size={15} color="#5a6d8a" />}
              </button>
            </div>
          </div>
          {error && <div style={S.error}>{error}</div>}
          <GlowButton variant="success" size="lg" loading={loading} onClick={handleLogin}
            icon={<LogIn size={16} />} style={{ width: '100%', marginBottom: '1.25rem' }}>
            Admin Sign In
          </GlowButton>

          <div style={S.divider}><span style={S.divTxt}>Demo Admin Accounts</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {ADMIN_USERS.map(a => (
              <button key={a.uid} onClick={() => fillAdmin(a)}
                style={{ ...S.demoBtn, borderColor: 'rgba(16,185,129,0.15)', color: '#34d399', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.8rem' }}>
                    <Building2 size={12} color="#34d399" /> {a.name}
                  </div>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.58rem', opacity: 0.6 }}>{a.email}</span>
                </div>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.6rem', opacity: 0.5 }}>{a.password}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────
export default function AuthPage() {
  const [portal, setPortal] = useState(null);

  return (
    <>
      <style>{`
        .auth-page-container {
          display: flex;
          height: 100vh;
          overflow-y: auto;
          overflow-x: hidden;
          background: #1e293b;
        }
        .hero-left {
          flex: 1.2;
          padding: 4rem;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .hero-right {
          flex: 1;
          padding: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 5;
        }
        @media (max-width: 900px) {
          .auth-page-container {
            flex-direction: column;
            height: auto;
            min-height: 100vh;
          }
          .hero-left {
            padding: 3rem 1.5rem;
            flex: none;
          }
          .hero-right {
            padding: 1.5rem;
            min-height: 400px;
            flex: none;
          }
        }
      `}</style>
      {portal === 'user' ? <UserAuth onBack={() => setPortal(null)} /> : 
       portal === 'admin' ? <AdminAuth onBack={() => setPortal(null)} /> : 
       <PortalSelector onSelect={setPortal} />}
    </>
  );
}

const S = {
  page: { fontFamily: "'Plus Jakarta Sans',sans-serif" },
  heroInner: { maxWidth: 600, position: 'relative', zIndex: 2 },
  featureList: { display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1.5rem' },
  featureItem: { display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', fontWeight: 500 },
  logoRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: '2rem' },
  logoIcon: { width: 48, height: 48, background: 'linear-gradient(135deg, rgba(14,165,233,0.2), rgba(6,182,212,0.1))', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(14,165,233,0.3)', boxShadow: '0 0 30px rgba(14,165,233,0.2)', animation: 'ctaGlow 3s ease infinite' },
  logoText: { fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: '1.5rem', color: 'white' },
  logoHighlight: { color: '#0ea5e9' },
  liveBadge: { position: 'absolute', top: '2rem', right: '2rem', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(30,41,59,0.8)', backdropFilter: 'blur(12px)', padding: '8px 14px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.75rem', fontWeight: 600, zIndex: 10 },
  liveDot: { width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', animation: 'liveFlicker 2s infinite' },
  headline: { fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: '3.8rem', color: '#f8fafc', lineHeight: 1.1, marginBottom: '1.2rem', textShadow: '0 4px 20px rgba(0,0,0,0.2)', letterSpacing: '-0.02em' },
  tagline: { color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2.5rem' },
  statsRow: { display: 'flex', gap: '1.2rem', marginBottom: '2.5rem', flexWrap: 'wrap' },
  stat: { display: 'flex', flexDirection: 'column', gap: 4, background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)', padding: '14px 22px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.08)' },
  statVal: { fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: '1.8rem', color: '#38bdf8' },
  statLabel: { fontFamily: "'JetBrains Mono',monospace", fontSize: '0.65rem', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.05em' },
  ctaRow: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
  btnPrimary: { background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: 'white', padding: '16px 32px', borderRadius: '50px', border: 'none', fontWeight: 700, fontSize: '1.05rem', cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 8px 24px rgba(14,165,233,0.3)' },
  btnSecondary: { background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', color: 'white', padding: '16px 32px', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: 700, fontSize: '1.05rem', cursor: 'pointer', transition: 'all 0.3s' },
  orb1: { position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%)', top: -200, right: -200, zIndex: 1, filter: 'blur(60px)', animation: 'floatOrb 12s ease-in-out infinite' },
  orb2: { position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', bottom: -100, left: -100, zIndex: 1, filter: 'blur(55px)', animation: 'floatOrb2 16s ease-in-out infinite' },
  rightImageContainer: { width: '100%', height: '100%', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.4)', position: 'relative' },
  rightImage: { width: '100%', height: '100%', background: 'linear-gradient(135deg, rgba(30,41,59,0.2) 0%, rgba(30,41,59,0.5) 100%), url("/bharat_hero.png") center/cover no-repeat', transformOrigin: 'center center' },
  card: { width: '100%', maxWidth: 440, background: 'rgba(23,31,51,0.7)', backdropFilter: 'blur(32px)', borderRadius: '24px', border: '1px solid rgba(137,206,255,0.15)', padding: '2.5rem', animation: 'heroTextFadeUp 0.4s cubic-bezier(0.16,1,0.3,1)', boxShadow: '0 8px 40px rgba(0,0,0,0.4)' },
  welcomeHeading: { fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '1.8rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' },
  systemOnline: { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid rgba(16,185,129,0.2)', marginBottom: '2rem' },
  portalCard: { display: 'flex', alignItems: 'center', gap: 16, padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.3s', marginBottom: '1rem' },
  portalIcon: { width: 48, height: 48, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  portalText: { flex: 1 },
  portalTitle: { color: 'white', fontWeight: 700, fontSize: '1.1rem', marginBottom: '2px' },
  portalDesc: { color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' },
  footer: { marginTop: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', fontFamily: "'JetBrains Mono',monospace" },
  backBtn: { display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#5a6d8a', cursor: 'pointer', fontSize: '0.78rem', fontFamily: "'Plus Jakarta Sans',sans-serif", padding: '0 0 1rem', marginBottom: '0.5rem', transition: 'color 0.2s' },
  tabRow: { display: 'flex', background: 'rgba(10,16,36,0.5)', borderRadius: 11, padding: 3, marginBottom: '1.5rem', border: '1px solid rgba(99,140,255,0.06)' },
  tabBtn: { flex: 1, padding: '9px', borderRadius: 9, border: 'none', background: 'none', color: '#5a6d8a', cursor: 'pointer', fontFamily: "'Outfit',sans-serif", fontWeight: 600, fontSize: '0.88rem', transition: 'all 0.25s' },
  tabBtnActive: { background: 'rgba(59,130,246,0.1)', color: '#60a5fa', boxShadow: '0 0 20px rgba(59,130,246,0.08)' },
  field: { marginBottom: '1rem' },
  label: { display: 'block', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.62rem', color: '#5a6d8a', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' },
  input: { width: '100%', padding: '11px 14px', border: '1.5px solid rgba(99,140,255,0.1)', borderRadius: 10, fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '0.88rem', color: '#e2e8f0', outline: 'none', background: 'rgba(10,16,36,0.6)', boxSizing: 'border-box', transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)' },
  eyeBtn: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 2 },
  error: { background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.15)', borderRadius: 8, padding: '9px 12px', fontSize: '0.78rem', color: '#fb7185', marginBottom: '1rem' },
  successMsg: { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 8, padding: '9px 12px', fontSize: '0.78rem', color: '#34d399', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 6 },
  divider: { textAlign: 'center', borderTop: '1px solid rgba(99,140,255,0.06)', marginBottom: '1rem' },
  divTxt: { background: '#070c1a', padding: '0 10px', position: 'relative', top: -9, fontFamily: "'JetBrains Mono',monospace", fontSize: '0.62rem', color: '#3e4f6b' },
  demoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: '1.5rem' },
  demoBtn: { padding: '10px 12px', borderRadius: 10, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '0.8rem', background: 'rgba(10,16,36,0.5)', border: '1px solid rgba(99,140,255,0.08)', transition: 'all 0.25s' },
  poweredBy: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center', paddingTop: '1.5rem', borderTop: '1px solid rgba(99,140,255,0.05)', marginTop: '1.5rem' },
};
