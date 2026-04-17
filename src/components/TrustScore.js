import React from 'react';

export default function TrustScore({ score, size = 'md' }) {
  const s = size === 'lg' ? 42 : size === 'sm' ? 22 : 30;
  const fs = size === 'lg' ? '1.1rem' : size === 'sm' ? '0.62rem' : '0.78rem';
  const color = score >= 75 ? '#34d399' : score >= 50 ? '#fbbf24' : '#fb7185';
  const glow = score >= 75 ? 'rgba(52,211,153,0.3)' : score >= 50 ? 'rgba(251,191,36,0.3)' : 'rgba(251,113,133,0.3)';
  return (
    <div style={{
      width: s, height: s, borderRadius: '50%',
      background: `rgba(${score >= 75 ? '16,185,129' : score >= 50 ? '245,158,11' : '244,63,94'},0.1)`,
      border: `2px solid ${color}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Outfit',sans-serif", fontWeight: 800,
      fontSize: fs, color: color,
      boxShadow: `0 0 12px ${glow}`,
      transition: 'all 0.3s',
    }}>
      {score}
    </div>
  );
}
