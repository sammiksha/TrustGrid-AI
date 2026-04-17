// ============================================================
//  GlowButton — Next-Gen Interactive Button System v2
//  Features: neon glow, ripple, magnetic cursor, 3D lift,
//  shimmer, rotating gradient border, loading, disabled,
//  NEW: neon variant, rotating conic border, perspective tilt
// ============================================================
import React, { useState, useRef, useCallback } from 'react';
import { Loader } from 'lucide-react';

// ─── Ripple Effect Hook ─────────────────────────────────────
function useRipple() {
  const [ripples, setRipples] = useState([]);

  const addRipple = useCallback((e, ref) => {
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples(prev => [...prev, { x, y, id }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 800);
  }, []);

  return { ripples, addRipple };
}

// ─── Main GlowButton Component ──────────────────────────────
export default function GlowButton({
  children,
  variant = 'primary',      // 'primary' | 'secondary' | 'glass' | 'icon' | 'fab' | 'danger' | 'success' | 'neon' | 'cyber'
  size = 'md',               // 'sm' | 'md' | 'lg'
  loading = false,
  disabled = false,
  icon = null,
  magnetic = true,
  onClick,
  style: customStyle = {},
  ...props
}) {
  const btnRef = useRef(null);
  const { ripples, addRipple } = useRipple();
  const [hover, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [magneticOffset, setMagneticOffset] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e) => {
    // Subtle magnetic effect only - no 3D tilt
    if (!magnetic || disabled) return;
    const rect = btnRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left - rect.width / 2) * 0.06;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.06;
    setMagneticOffset({ x, y });
  }, [magnetic, disabled]);

  const handleMouseLeave = useCallback(() => {
    setHover(false);
    setMagneticOffset({ x: 0, y: 0 });
    setTilt({ x: 0, y: 0 });
  }, []);

  const handleClick = useCallback((e) => {
    if (disabled || loading) return;
    addRipple(e, btnRef);
    onClick?.(e);
  }, [disabled, loading, onClick, addRipple]);

  // ─── Size configs ──────────────────────
  const sizes = {
    sm: { padding: '7px 14px', fontSize: '0.75rem', borderRadius: '9px', minHeight: '32px', gap: '6px' },
    md: { padding: '11px 22px', fontSize: '0.88rem', borderRadius: '12px', minHeight: '42px', gap: '8px' },
    lg: { padding: '14px 32px', fontSize: '1rem', borderRadius: '14px', minHeight: '52px', gap: '10px' },
  };

  // ─── Variant configs ───────────────────
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
      backgroundSize: '200% 200%',
      color: 'white',
      border: 'none',
      boxShadow: hover
        ? '0 8px 32px rgba(99,102,241,0.42), 0 0 50px rgba(139,92,246,0.28), inset 0 1px 0 rgba(255,255,255,0.2)'
        : '0 4px 16px rgba(99,102,241,0.28), inset 0 1px 0 rgba(255,255,255,0.12)',
    },
    secondary: {
      background: 'var(--surface, rgba(255,255,255,0.8))',
      backdropFilter: 'blur(20px)',
      color: 'var(--blue, #6366f1)',
      border: '1px solid var(--border2, rgba(99,102,241,0.2))',
      boxShadow: hover
        ? '0 6px 24px rgba(99,102,241,0.14), 0 0 0 1px rgba(99,102,241,0.2)'
        : '0 2px 10px rgba(0,0,0,0.06)',
    },
    glass: {
      background: 'var(--surface, rgba(255,255,255,0.7))',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      color: 'var(--text, #1a1b25)',
      border: '1px solid var(--border, rgba(0,0,0,0.08))',
      boxShadow: hover
        ? '0 6px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(99,102,241,0.12)'
        : '0 2px 8px rgba(0,0,0,0.05)',
    },
    danger: {
      background: 'linear-gradient(135deg, #f43f5e, #dc2626)',
      color: 'white',
      border: 'none',
      backgroundSize: '200% 200%',
      boxShadow: hover
        ? '0 8px 32px rgba(244,63,94,0.45), 0 0 35px rgba(244,63,94,0.25)'
        : '0 4px 16px rgba(244,63,94,0.22)',
    },
    success: {
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white',
      border: 'none',
      backgroundSize: '200% 200%',
      boxShadow: hover
        ? '0 8px 32px rgba(16,185,129,0.4), 0 0 30px rgba(16,185,129,0.2)'
        : '0 4px 16px rgba(16,185,129,0.2)',
    },
    icon: {
      background: 'rgba(59,130,246,0.08)',
      color: '#60a5fa',
      border: '1px solid rgba(59,130,246,0.15)',
      boxShadow: hover ? '0 0 20px rgba(59,130,246,0.2)' : 'none',
      padding: '10px',
      borderRadius: '12px',
    },
    fab: {
      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '56px',
      height: '56px',
      padding: '0',
      backgroundSize: '200% 200%',
      boxShadow: hover
        ? '0 8px 32px rgba(59,130,246,0.55), 0 0 50px rgba(139,92,246,0.35)'
        : '0 4px 20px rgba(59,130,246,0.32)',
    },
    // NEW: Electric neon border style
    neon: {
      background: 'rgba(8, 14, 32, 0.7)',
      backdropFilter: 'blur(20px)',
      color: '#60a5fa',
      border: 'none',
      backgroundSize: '200% 200%',
      boxShadow: hover
        ? '0 0 20px rgba(59,130,246,0.4), 0 0 40px rgba(139,92,246,0.2), inset 0 0 20px rgba(59,130,246,0.05)'
        : '0 0 10px rgba(59,130,246,0.15), inset 0 0 10px rgba(59,130,246,0.03)',
    },
    // NEW: Cyber/terminal aesthetic
    cyber: {
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(20px)',
      color: '#06b6d4',
      border: 'none',
      fontFamily: "'JetBrains Mono', monospace",
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      boxShadow: hover
        ? '0 0 20px rgba(6,182,212,0.4), 0 0 40px rgba(6,182,212,0.15)'
        : '0 0 10px rgba(6,182,212,0.1)',
    },
  };

  const variantStyle = variants[variant] || variants.primary;
  const sizeStyle = variant === 'icon' || variant === 'fab' ? {} : sizes[size];

  const finalStyle = {
    ...sizeStyle,
    ...variantStyle,
    position: 'relative',
    overflow: 'hidden',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: variant === 'cyber' ? "'JetBrains Mono', monospace" : "'Outfit', sans-serif",
    fontWeight: 700,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sizeStyle.gap || '8px',
    transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: pressed && !disabled
      ? 'scale(0.96)'
      : hover && !disabled
        ? `translate(${magneticOffset.x}px, ${magneticOffset.y}px) scale(1.02) translateY(-1px)`
        : 'translate(0,0) scale(1)',
    opacity: disabled ? 0.45 : 1,
    filter: disabled ? 'blur(0.4px) grayscale(0.4)' : hover && !disabled ? 'brightness(1.05)' : 'none',
    animation: (variant === 'primary' || variant === 'fab') && !disabled ? 'gradientShift 4s ease infinite' : undefined,
    letterSpacing: variant === 'cyber' ? '0.1em' : '-0.01em',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
    border: disabled ? '1px dashed rgba(99,140,255,0.15)' : undefined,
    ...customStyle,
  };

  const showBorderAnimation = (variant === 'secondary' || variant === 'glass' || variant === 'neon');

  return (
    <button
      ref={btnRef}
      onClick={handleClick}
      onMouseEnter={() => !disabled && setHover(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      disabled={disabled || loading}
      style={finalStyle}
      {...props}
    >
      {/* Animated gradient border (for secondary, glass, neon) */}
      {showBorderAnimation && (
        <span style={{
          position: 'absolute', inset: 0,
          borderRadius: 'inherit',
          padding: hover ? '1.5px' : '1px',
          background: hover
            ? 'linear-gradient(135deg, #3b82f6, #8b5cf6, #06b6d4, #3b82f6)'
            : variant === 'neon'
              ? 'linear-gradient(135deg, rgba(59,130,246,0.5), rgba(139,92,246,0.4))'
              : 'linear-gradient(135deg, rgba(99,140,255,0.25), rgba(139,92,246,0.2), rgba(6,182,212,0.15))',
          backgroundSize: '300% 300%',
          animation: hover ? 'gradientShift 2.5s ease infinite' : 'none',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          pointerEvents: 'none',
          transition: 'all 0.3s',
        }} />
      )}

      {/* Cyber border (for cyber variant) */}
      {variant === 'cyber' && (
        <>
          <span style={{
            position: 'absolute', inset: 0,
            borderRadius: 'inherit',
            padding: '1px',
            background: hover
              ? 'linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6)'
              : 'linear-gradient(135deg, rgba(6,182,212,0.4), rgba(59,130,246,0.2))',
            backgroundSize: '200% 200%',
            animation: 'gradientShift 3s ease infinite',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            pointerEvents: 'none',
          }} />
          {/* Corner accents */}
          <span style={{ position: 'absolute', top: 3, left: 3, width: 8, height: 8, borderTop: '2px solid rgba(6,182,212,0.8)', borderLeft: '2px solid rgba(6,182,212,0.8)', pointerEvents: 'none' }} />
          <span style={{ position: 'absolute', top: 3, right: 3, width: 8, height: 8, borderTop: '2px solid rgba(6,182,212,0.8)', borderRight: '2px solid rgba(6,182,212,0.8)', pointerEvents: 'none' }} />
          <span style={{ position: 'absolute', bottom: 3, left: 3, width: 8, height: 8, borderBottom: '2px solid rgba(6,182,212,0.8)', borderLeft: '2px solid rgba(6,182,212,0.8)', pointerEvents: 'none' }} />
          <span style={{ position: 'absolute', bottom: 3, right: 3, width: 8, height: 8, borderBottom: '2px solid rgba(6,182,212,0.8)', borderRight: '2px solid rgba(6,182,212,0.8)', pointerEvents: 'none' }} />
        </>
      )}

      {/* Shimmer effect when loading */}
      {loading && (
        <span style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s ease infinite',
          pointerEvents: 'none',
        }} />
      )}

      {/* Neon sweep on hover (primary) */}
      {hover && !disabled && (variant === 'primary' || variant === 'fab') && (
        <span style={{
          position: 'absolute',
          top: 0, bottom: 0, left: '-20%',
          width: '60%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
          animation: 'neonSweep 1.5s ease infinite',
          pointerEvents: 'none',
          transform: 'skewX(-20deg)',
        }} />
      )}

      {/* Neon glow overlay on hover (primary) */}
      {hover && !disabled && variant === 'primary' && (
        <span style={{
          position: 'absolute', inset: '-3px',
          borderRadius: 'inherit',
          background: 'linear-gradient(135deg, rgba(59,130,246,0.35), rgba(139,92,246,0.32), rgba(6,182,212,0.28))',
          filter: 'blur(14px)',
          opacity: 0.65,
          pointerEvents: 'none',
          animation: 'glowPulse 2s ease infinite',
        }} />
      )}

      {/* Aura pulse ring on hover (danger / success) */}
      {hover && !disabled && (variant === 'danger' || variant === 'success') && (
        <span style={{
          position: 'absolute', inset: '-4px',
          borderRadius: 'inherit',
          background: variant === 'danger'
            ? 'rgba(244,63,94,0.2)'
            : 'rgba(16,185,129,0.2)',
          filter: 'blur(10px)',
          animation: 'auraPulse 1.5s ease infinite',
          pointerEvents: 'none',
        }} />
      )}

      {/* FAB pulse ring */}
      {variant === 'fab' && (
        <>
          <span style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'rgba(59,130,246,0.3)',
            animation: 'fabPulse 2s ease-out infinite',
            pointerEvents: 'none',
          }} />
          <span style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '2px solid rgba(139,92,246,0.4)',
            animation: 'fabPulse 2s ease-out infinite 0.7s',
            pointerEvents: 'none',
          }} />
        </>
      )}

      {/* Disabled overlay */}
      {disabled && (
        <span style={{
          position: 'absolute', inset: 0,
          borderRadius: 'inherit',
          background: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(2px)',
          pointerEvents: 'none',
        }} />
      )}

      {/* Ripple effects */}
      {ripples.map(ripple => (
        <span key={ripple.id} style={{
          position: 'absolute',
          left: ripple.x, top: ripple.y,
          width: 10, height: 10,
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(255,255,255,0.4)',
          animation: 'ripple 0.8s ease-out forwards',
          pointerEvents: 'none',
        }} />
      ))}

      {/* Content */}
      <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: sizeStyle.gap || 8 }}>
        {loading ? (
          <>
            <Loader size={size === 'sm' ? 13 : size === 'lg' ? 18 : 16} style={{ animation: 'spin 0.8s linear infinite' }} />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {icon && <span style={{ display: 'flex', alignItems: 'center', transition: 'transform 0.3s', transform: hover ? 'scale(1.15)' : 'scale(1)' }}>{icon}</span>}
            {children}
          </>
        )}
      </span>

      <style>{`
        @keyframes ripple { 0% { transform: translate(-50%,-50%) scale(0); opacity: 0.6; } 100% { transform: translate(-50%,-50%) scale(28); opacity: 0; } }
        @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes fabPulse { 0% { transform: scale(1); opacity: 0.5; } 100% { transform: scale(2.8); opacity: 0; } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes glowPulse { 0%,100% { opacity: 0.45; } 50% { opacity: 0.75; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes neonSweep { 0% { left: -60%; } 100% { left: 140%; } }
        @keyframes auraPulse { 0% { opacity: 0; transform: scale(0.85); } 50% { opacity: 0.65; transform: scale(1.3); } 100% { opacity: 0; transform: scale(1.6); } }
      `}</style>
    </button>
  );
}
