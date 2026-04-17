// ============================================================
//  InfraCard — Sovereign Infrastructure Component Library
//  Implements "Aetheric Grid" design tokens from Stitch MCP
//  Components: InfraCard, InfraMetricCard, InfraStatusBar,
//              InfraBlueprintPanel, NeonProgress, InfraChip
// ============================================================
import React, { useState } from 'react';
import { motion } from 'framer-motion';

// ─── HUD Corner Brackets (CSS-in-JS) ─────────────────────
const hudBrackets = (color = 'rgba(6,182,212,0.45)', hovered = false) => ({
  topLeft: {
    position: 'absolute', top: 6, left: 6,
    width: 14, height: 14,
    borderTop: `2px solid ${hovered ? color.replace('0.45', '0.9') : color}`,
    borderLeft: `2px solid ${hovered ? color.replace('0.45', '0.9') : color}`,
    borderRadius: '2px 0 0 0',
    pointerEvents: 'none',
    transition: 'border-color 0.3s',
  },
  bottomRight: {
    position: 'absolute', bottom: 6, right: 6,
    width: 14, height: 14,
    borderBottom: `2px solid ${hovered ? color.replace('0.45', '0.9') : color}`,
    borderRight: `2px solid ${hovered ? color.replace('0.45', '0.9') : color}`,
    borderRadius: '0 0 2px 0',
    pointerEvents: 'none',
    transition: 'border-color 0.3s',
  },
});

// ─── InfraCard — Base glassmorphic infrastructure card ───────
export function InfraCard({
  children,
  style,
  className,
  accentColor = '#3b82f6',
  showBrackets = true,
  showAccentLine = true,
  glowOnHover = true,
  animate = true,
}) {
  const [hovered, setHovered] = useState(false);
  const brackets = hudBrackets('rgba(6,182,212,0.4)', hovered);

  const card = (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--card-bg, #ffffff)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: `1px solid ${hovered && glowOnHover ? 'rgba(99,102,241,0.2)' : 'var(--border, rgba(0,0,0,0.06))'}`,
        borderRadius: 18,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1), background 0.3s ease',
        transform: hovered && glowOnHover ? 'translateY(-3px)' : 'none',
        boxShadow: hovered && glowOnHover
          ? `0 16px 50px rgba(0,0,0,0.10), 0 0 30px ${accentColor}18, 0 0 0 1px ${accentColor}14`
          : 'var(--card-shadow, 0 2px 16px rgba(0,0,0,0.06))',
        ...style,
      }}
      className={className}
    >
      {/* Top accent line */}
      {showAccentLine && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, transparent, ${accentColor}BB, ${accentColor}60, transparent)`,
          backgroundSize: '200% 100%',
          animation: 'gradientShift 4s ease infinite',
          borderRadius: '16px 16px 0 0',
        }} />
      )}

      {/* Bottom radial glow */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%',
        background: `radial-gradient(ellipse at 50% 100%, ${accentColor}06 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* HUD corner brackets */}
      {showBrackets && (
        <>
          <span style={brackets.topLeft} />
          <span style={brackets.bottomRight} />
        </>
      )}

      {children}
    </div>
  );

  if (!animate) return card;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
    >
      {card}
    </motion.div>
  );
}

// ─── InfraMetricCard — KPI card with animated count ──────────
export function InfraMetricCard({
  label, value, suffix = '', prefix = '',
  trend, trendUp = true, icon: Icon,
  color = '#3b82f6', delay = 0,
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--card-bg, #ffffff)',
        backdropFilter: 'blur(24px)',
        border: `1px solid ${hovered ? `${color}30` : 'var(--border, rgba(0,0,0,0.06))'}`,
        borderRadius: 18,
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered
          ? `0 16px 50px rgba(0,0,0,0.10), 0 0 30px ${color}18, 0 0 0 1px ${color}12`
          : 'var(--card-shadow, 0 2px 16px rgba(0,0,0,0.06))',
      }}
    >
      {/* Top gradient line */}
      <div style={{
        height: 2,
        background: `linear-gradient(90deg, transparent, ${color}, ${color}80, transparent)`,
        backgroundSize: '200% 100%',
        animation: 'gradientShift 4s ease infinite',
      }} />

      {/* Left accent edge */}
      <div style={{
        position: 'absolute', left: 0, top: '20%', bottom: '20%',
        width: 3, borderRadius: '0 2px 2px 0',
        background: `linear-gradient(180deg, ${color}, ${color}40)`,
        boxShadow: `0 0 8px ${color}60`,
        opacity: hovered ? 1 : 0.4,
        transition: 'opacity 0.3s',
      }} />

      {/* HUD top-left bracket */}
      <span style={{
        position: 'absolute', top: 8, left: 8, width: 10, height: 10,
        borderTop: `1.5px solid ${color}60`, borderLeft: `1.5px solid ${color}60`,
        pointerEvents: 'none', transition: 'border-color 0.3s',
        borderColor: hovered ? `${color}CC` : `${color}60`,
      }} />
      <span style={{
        position: 'absolute', bottom: 8, right: 8, width: 10, height: 10,
        borderBottom: `1.5px solid ${color}60`, borderRight: `1.5px solid ${color}60`,
        pointerEvents: 'none', transition: 'border-color 0.3s',
        borderColor: hovered ? `${color}CC` : `${color}60`,
      }} />

      {/* Bottom ambient glow */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
        background: `radial-gradient(ellipse at 50% 100%, ${color}05 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ padding: '1.1rem 1.3rem 1.2rem', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.52rem', color: 'var(--muted, #6b7280)',
            textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>
            {label}
          </span>
          {Icon && (
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: `${color}12`, border: `1px solid ${color}28`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: hovered ? `0 0 16px ${color}30` : 'none',
              transition: 'box-shadow 0.3s',
            }}>
              <Icon size={13} color={color} />
            </div>
          )}
        </div>

        <div style={{
          fontFamily: "'Outfit', sans-serif", fontWeight: 800,
          fontSize: '2.4rem', lineHeight: 1,
          color: color,
          textShadow: `0 0 25px ${color}40`,
          letterSpacing: '-0.02em',
          marginBottom: 10,
        }}>
          {prefix}{value}{suffix}
        </div>

        {trend && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 2,
              background: trendUp ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
              border: `1px solid ${trendUp ? 'rgba(16,185,129,0.22)' : 'rgba(245,158,11,0.22)'}`,
              color: trendUp ? '#059669' : '#d97706',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.58rem', fontWeight: 700,
              borderRadius: 4, padding: '1px 5px',
            }}>
              {trendUp ? '▲' : '▼'} {trend}
            </span>
            <span style={{
              color: 'var(--muted2, #9ca3af)',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.5rem',
            }}>
              vs last month
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── NeonProgress — Infrastructure progress bar ───────────────
export function NeonProgress({ value = 0, max = 100, color = '#3b82f6', label, showValue = true, height = 5 }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div>
      {(label || showValue) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          {label && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.58rem', color: '#5a6d8a' }}>{label}</span>}
          {showValue && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.58rem', color, fontWeight: 700 }}>{pct.toFixed(0)}%</span>}
        </div>
      )}
      <div style={{
        height, background: 'rgba(99,140,255,0.07)',
        borderRadius: height / 2, overflow: 'hidden', position: 'relative',
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            height: '100%', borderRadius: height / 2,
            background: `linear-gradient(90deg, ${color}90, ${color})`,
            boxShadow: `0 0 8px ${color}60`,
            position: 'relative',
          }}
        >
          {/* Glowing tip */}
          <div style={{
            position: 'absolute', top: 0, right: 0,
            width: 20, height: '100%',
            background: 'rgba(255,255,255,0.5)',
            filter: 'blur(5px)',
          }} />
        </motion.div>
      </div>
    </div>
  );
}

// ─── InfraChip — Status / category chip ──────────────────────
export function InfraChip({ label, color = '#3b82f6', dot = false, icon: Icon }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 8px', borderRadius: 4,
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '0.55rem', fontWeight: 700,
      letterSpacing: '0.08em', textTransform: 'uppercase',
      background: `${color}10`,
      border: `1px solid ${color}30`,
      color,
      backdropFilter: 'blur(8px)',
    }}>
      {dot && (
        <span style={{
          width: 5, height: 5, borderRadius: '50%',
          background: color, boxShadow: `0 0 4px ${color}`,
          animation: 'pulse 2s ease infinite', flexShrink: 0,
        }} />
      )}
      {Icon && <Icon size={9} />}
      {label}
    </span>
  );
}

// ─── InfraBlueprintPanel — Section wrapper with grid overlay ─
export function InfraBlueprintPanel({ children, style, className, title, subtitle, accentColor = '#06b6d4' }) {
  return (
    <div
      style={{
        position: 'relative',
        background: 'rgba(6, 10, 22, 0.95)',
        borderRadius: 20,
        overflow: 'hidden',
        ...style,
      }}
      className={className}
    >
      {/* Blueprint grid overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(${accentColor}08 1px, transparent 1px),
          linear-gradient(90deg, ${accentColor}08 1px, transparent 1px),
          linear-gradient(${accentColor}03 1px, transparent 1px),
          linear-gradient(90deg, ${accentColor}03 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px, 80px 80px, 20px 20px, 20px 20px',
        pointerEvents: 'none',
      }} />

      {/* Scan line */}
      <div style={{
        position: 'absolute', left: 0, right: 0,
        height: 2,
        background: `linear-gradient(90deg, transparent, ${accentColor}18, transparent)`,
        animation: 'infraScan 8s linear infinite',
        pointerEvents: 'none', zIndex: 2,
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 3 }}>
        {(title || subtitle) && (
          <div style={{ padding: '1.2rem 1.5rem 0' }}>
            {title && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: subtitle ? 3 : 0 }}>
                <span style={{
                  width: 3, height: 16, borderRadius: 2,
                  background: `linear-gradient(180deg, ${accentColor}, ${accentColor}40)`,
                  boxShadow: `0 0 6px ${accentColor}`,
                  flexShrink: 0,
                }} />
                <span style={{
                  fontFamily: "'Outfit', sans-serif", fontWeight: 700,
                  fontSize: '0.9rem', color: '#e2e8f0',
                }}>{title}</span>
              </div>
            )}
            {subtitle && (
              <p style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.58rem', color: '#3e4f6b',
                paddingLeft: 11, marginTop: 2,
              }}>{subtitle}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

// ─── InfraTelemetry — Live data readout row ──────────────────
export function InfraTelemetry({ items = [] }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 18,
      flexWrap: 'wrap',
    }}>
      {items.map(({ label, value, color = '#06b6d4' }, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{
            width: 5, height: 5, borderRadius: '50%',
            background: color, boxShadow: `0 0 5px ${color}`,
            animation: 'pulse 2s ease infinite',
            animationDelay: `${i * 0.3}s`,
            flexShrink: 0,
          }} />
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.58rem', color: '#5a6d8a',
          }}>
            {label} <span style={{ color, fontWeight: 700 }}>{value}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
