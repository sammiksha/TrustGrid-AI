// ============================================================
//  MapPage — Google Maps Integration
// ============================================================
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { statusColor } from '../data/mockData';
import { useProjects } from '../ProjectContext';
import { useIssues } from '../IssueContext';
import { useTheme } from '../ThemeContext';
import StatusBadge from '../components/StatusBadge';
import TrustScore from '../components/TrustScore';
import { MapPin, Filter, Layers } from 'lucide-react';

const SEV_COLOR = { high: '#f43f5e', medium: '#f59e0b', low: '#10b981' };

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 18.5204,
  lng: 73.8567
};

function createSvgIcon(color, size = 32) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 8}" viewBox="0 0 32 40">
    <filter id="s"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.35"/></filter>
    <path d="M16 0C7.163 0 0 7.163 0 16c0 10.5 16 24 16 24S32 26.5 32 16C32 7.163 24.837 0 16 0z" fill="${color}" filter="url(#s)"/>
    <circle cx="16" cy="16" r="7" fill="white" opacity="0.95"/>
    <circle cx="16" cy="16" r="4" fill="${color}"/>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function createIssueSvg(color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
    <circle cx="11" cy="11" r="10" fill="${color}" opacity="0.92"/>
    <text x="11" y="16" text-anchor="middle" fill="white" font-size="14" font-weight="bold">!</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export default function MapPage() {
  const { issues } = useIssues();
  const { theme, isDark } = useTheme();
  const { projects } = useProjects();
  const [filter, setFilter] = useState('all');
  const [showIssues, setShowIssues] = useState(true);
  const [selected, setSelected] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_KEY || "AIzaSyDFDD0BjZpS4YV0FNQjmM3VgxDqVP3XQpU"
  });

  const [map, setMap] = useState(null);

  const onLoad = useCallback(function callback(mapInstance) {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  const filtered = filter === 'all' ? projects : projects.filter(p => p.status === filter);

  const flyTo = (lat, lng, zoom = 14) => {
    if (map) {
      map.panTo({ lat, lng });
      map.setZoom(zoom);
    }
  };

  const darkModeStyles = [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#38414e' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#212a37' }]
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#9ca5b3' }]
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#17263c' }]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#515c6d' }]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#17263c' }]
    }
  ];

  const sb = {
    width: 290, minWidth: 290,
    background: isDark ? 'rgba(10,16,36,0.95)' : 'rgba(255,255,255,0.97)',
    backdropFilter: 'blur(20px)',
    borderRight: `1px solid ${theme.border}`,
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
  };

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={sb}>
        <div style={{ padding: '1rem', borderBottom: `1px solid ${theme.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: '0.9rem', color: theme.textPrimary, marginBottom: 10 }}>
            <Filter size={14} color="#6366f1" /> Active Projects
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
            {['all', 'on-track', 'delayed', 'critical'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`filter-btn ${filter === f ? 'active' : ''}`}>
                {f === 'all' ? 'All' : f === 'on-track' ? 'On Track' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.75rem', color: theme.textMuted }}>
            <input type="checkbox" checked={showIssues} onChange={e => setShowIssues(e.target.checked)} style={{ accentColor: '#6366f1' }} />
            Show citizen issues
          </label>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0.6rem' }}>
          {filtered.map(p => (
            <div key={p.id}
              onClick={() => { setSelected({ type: 'project', data: p }); flyTo(p.lat, p.lng); }}
              style={{
                padding: '10px 12px', borderRadius: 10, marginBottom: 8, cursor: 'pointer',
                border: `1px solid ${selected?.data?.id === p.id ? 'rgba(99,102,241,0.3)' : theme.border}`,
                background: selected?.data?.id === p.id ? (isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.06)') : 'transparent',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { if (selected?.data?.id !== p.id) e.currentTarget.style.background = isDark ? 'rgba(99,102,241,0.05)' : 'rgba(99,102,241,0.03)'; }}
              onMouseLeave={e => { if (selected?.data?.id !== p.id) e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, fontSize: '0.8rem', color: theme.textPrimary, lineHeight: 1.3, flex: 1 }}>{p.title}</span>
                <TrustScore score={p.trustScore} size="sm" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                <StatusBadge status={p.status} />
                <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.62rem', color: theme.textMuted }}>
                  <MapPin size={9} />{p.location.split(',')[0]}
                </span>
              </div>
              <div style={{ height: 3, background: isDark ? 'rgba(99,140,255,0.08)' : 'rgba(0,0,0,0.06)', borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${p.progress}%`, background: statusColor[p.status], borderRadius: 2, transition: 'width 1s ease' }} />
              </div>
            </div>
          ))}

          {showIssues && (
            <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: '0.5rem', marginTop: '0.5rem' }}>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.6rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                Recent Reports ({issues.filter(i => i.status === 'open').length} open)
              </div>
              {issues.slice(0, 5).map(issue => (
                <div key={issue.id}
                  onClick={() => { setSelected({ type: 'issue', data: issue }); flyTo(issue.lat, issue.lng, 15); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, border: `1px solid ${theme.border}`, marginBottom: 5, cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(99,140,255,0.05)' : 'rgba(99,102,241,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: SEV_COLOR[issue.severity], boxShadow: `0 0 6px ${SEV_COLOR[issue.severity]}60` }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: theme.textPrimary, lineHeight: 1.2 }}>{issue.title}</div>
                    <div style={{ fontSize: '0.62rem', color: theme.textMuted }}>▲ {issue.reports} reports</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={defaultCenter}
            zoom={12}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              styles: isDark ? darkModeStyles : [],
              disableDefaultUI: false,
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
            }}
          >
            {/* Project Markers */}
            {filtered.map(p => (
              <MarkerF
                key={`project-${p.id}`}
                position={{ lat: p.lat, lng: p.lng }}
                icon={{
                  url: createSvgIcon(statusColor[p.status]),
                  scaledSize: new window.google.maps.Size(32, 40),
                  anchor: new window.google.maps.Point(16, 40),
                }}
                onClick={() => { setSelected({ type: 'project', data: p }); flyTo(p.lat, p.lng); }}
              />
            ))}

            {/* Issue Markers */}
            {showIssues && issues.map(issue => (
              <MarkerF
                key={`issue-${issue.id}`}
                position={{ lat: issue.lat, lng: issue.lng }}
                icon={{
                  url: createIssueSvg(SEV_COLOR[issue.severity] || '#f43f5e'),
                  scaledSize: new window.google.maps.Size(22, 22),
                  anchor: new window.google.maps.Point(11, 11),
                }}
                onClick={() => { setSelected({ type: 'issue', data: issue }); flyTo(issue.lat, issue.lng, 15); }}
              />
            ))}
          </GoogleMap>
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDark ? '#0f172a' : '#f8fafc', color: theme.textMuted }}>
            Loading Google Maps...
          </div>
        )}

        {/* Info panel when selected */}
        {selected && (
          <div style={{
            position: 'absolute', top: 16, right: 16, width: 260, zIndex: 1000,
            background: isDark ? 'rgba(10,16,36,0.97)' : 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(20px)', border: `1px solid ${theme.border}`,
            borderRadius: 14, padding: '14px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}>
            <button onClick={() => setSelected(null)}
              style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', cursor: 'pointer', color: theme.textMuted, fontSize: '1rem', lineHeight: 1 }}>✕</button>

            {selected.type === 'project' && (() => {
              const p = selected.data;
              return (
                <>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.58rem', color: '#6366f1', marginBottom: 4 }}>{p.category}</div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: '0.92rem', color: theme.textPrimary, marginBottom: 6 }}>{p.title}</div>
                  <StatusBadge status={p.status} />
                  <div style={{ margin: '10px 0 4px', height: 5, background: isDark ? 'rgba(99,140,255,0.1)' : 'rgba(0,0,0,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${p.progress}%`, background: statusColor[p.status], borderRadius: 3 }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 10 }}>
                    {[['Budget', p.budget], ['Spent', p.spent], ['Progress', `${p.progress}%`], ['Issues', p.issues]].map(([l, v]) => (
                      <div key={l} style={{ background: isDark ? 'rgba(99,140,255,0.05)' : 'rgba(99,102,241,0.04)', borderRadius: 8, padding: '6px 8px' }}>
                        <div style={{ fontSize: '0.55rem', color: theme.textMuted, fontFamily: "'JetBrains Mono',monospace" }}>{l}</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: theme.textPrimary }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 10, fontSize: '0.7rem', color: theme.textMuted, lineHeight: 1.5 }}>{p.description?.slice(0, 90)}…</div>
                </>
              );
            })()}

            {selected.type === 'issue' && (() => {
              const issue = selected.data;
              const sevColor = SEV_COLOR[issue.severity];
              return (
                <>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.58rem', color: sevColor, marginBottom: 4 }}>⚠ CITIZEN REPORT · {issue.severity.toUpperCase()}</div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: '0.9rem', color: theme.textPrimary, marginBottom: 6 }}>{issue.title}</div>
                  <StatusBadge status={issue.status} />
                  <div style={{ marginTop: 8, fontSize: '0.72rem', color: theme.textMuted, lineHeight: 1.5 }}>{issue.description?.slice(0, 100)}…</div>
                  <div style={{ marginTop: 8, display: 'flex', gap: 10, fontSize: '0.67rem', color: theme.textMuted, fontFamily: "'JetBrains Mono',monospace" }}>
                    <span>👤 {issue.reporter}</span>
                    <span>▲ {issue.reports}</span>
                    <span>📅 {issue.date}</span>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Legend */}
        <div style={{
          position: 'absolute', bottom: 20, left: 16, zIndex: 1000,
          background: isDark ? 'rgba(10,16,36,0.9)' : 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(16px)', border: `1px solid ${theme.border}`,
          borderRadius: 10, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 5,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.58rem', color: theme.textMuted, display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
            <Layers size={11} />Legend
          </div>
          {[['#10b981', 'On Track'], ['#f59e0b', 'Delayed'], ['#ef4444', 'Critical']].map(([c, l]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: c, boxShadow: `0 0 5px ${c}60` }} />
              <span style={{ fontSize: '0.63rem', color: theme.textMuted, fontFamily: "'JetBrains Mono',monospace" }}>{l}</span>
            </div>
          ))}
          <div style={{ height: 1, background: theme.border, margin: '3px 0' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 7, fontWeight: 700 }}>!</div>
            <span style={{ fontSize: '0.63rem', color: theme.textMuted, fontFamily: "'JetBrains Mono',monospace" }}>Citizen Report</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const S = {};
