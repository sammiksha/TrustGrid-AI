import React from 'react';

const statusStyles = {
  'on-track': { bg: 'rgba(16,185,129,0.12)', color: '#34d399', border: 'rgba(16,185,129,0.2)', label: 'On Track' },
  'delayed': { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: 'rgba(245,158,11,0.2)', label: 'Delayed' },
  'critical': { bg: 'rgba(244,63,94,0.12)', color: '#fb7185', border: 'rgba(244,63,94,0.2)', label: 'Critical' },
  'open': { bg: 'rgba(244,63,94,0.12)', color: '#fb7185', border: 'rgba(244,63,94,0.2)', label: 'Open' },
  'in-review': { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: 'rgba(245,158,11,0.2)', label: 'In Review' },
  'resolved': { bg: 'rgba(16,185,129,0.12)', color: '#34d399', border: 'rgba(16,185,129,0.2)', label: 'Resolved' },
};

export default function StatusBadge({ status }) {
  const s = statusStyles[status] || statusStyles['open'];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      fontSize: '0.65rem', fontWeight: 700, whiteSpace: 'nowrap',
      fontFamily: "'JetBrains Mono',monospace",
      transition: 'all 0.2s',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, boxShadow: `0 0 6px ${s.color}` }} />
      {s.label}
    </span>
  );
}
