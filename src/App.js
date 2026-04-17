import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './AuthContext';
import { ThemeProvider, useTheme } from './ThemeContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import AIChatbot from './components/AIChatbot';
import AuthPage from './pages/AuthPage';
import MapPage from './pages/MapPage';
import Dashboard from './pages/Dashboard';
import ProjectsPage from './pages/ProjectsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import IssuesPage from './pages/IssuesPage';
import ReportPage from './pages/ReportPage';
import TrustPage from './pages/TrustPage';
import AdminPage from './pages/AdminPage';
import ProjectDetail from './pages/ProjectDetail';
import AIChatPage from './pages/AIChatPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Root shows Dashboard, Map is /map */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/project/:id" element={<ProjectDetail />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/issues" element={<IssuesPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/trust" element={<TrustPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/ai-chat" element={<AIChatPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
}

function AppLayout() {
  const { user, logout, switchRole } = useAuth();
  const location = useLocation();
  const { theme, isDark } = useTheme();

  return (
    <div style={{
      display: 'flex', height: '100vh', overflow: 'hidden',
      background: theme.bg,
      transition: 'background 0.4s ease',
    }}>
      <Sidebar user={user} onLogout={logout} onRoleSwitch={switchRole} />

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        overflow: 'hidden', minWidth: 0,
        background: theme.bg,
        transition: 'background 0.4s ease',
      }}>
        <Topbar pathname={location.pathname} user={user} />
        <div
          className="smooth-scroll"
          style={{
            flex: 1, overflow: 'auto',
            background: theme.bg,
            position: 'relative',
            transition: 'background 0.4s ease',
          }}
        >
          {/* ── Adaptive Parallax Background Layer ── */}
          <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
            {isDark ? (
              /* Dark: Blueprint dot grid + animating neon orbs */
              <>
                <div className="dot-grid" style={{ position: 'absolute', inset: 0 }} />
                <div style={{
                  position: 'absolute', inset: 0,
                  backgroundImage: `
                    linear-gradient(rgba(14,165,233,0.02) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(14,165,233,0.02) 1px, transparent 1px)
                  `,
                  backgroundSize: '80px 80px',
                }} />
                {/* Top-right: sky blue orb */}
                <div style={{
                  position: 'absolute', top: -200, right: -100,
                  width: 700, height: 700, borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(14,165,233,0.09) 0%, transparent 65%)',
                  filter: 'blur(70px)', animation: 'floatOrb 14s ease-in-out infinite',
                }} />
                {/* Bottom-left: teal orb */}
                <div style={{
                  position: 'absolute', bottom: -150, left: -100,
                  width: 550, height: 550, borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 65%)',
                  filter: 'blur(65px)', animation: 'floatOrb2 19s ease-in-out infinite',
                }} />
                {/* Center: indigo accent orb */}
                <div style={{
                  position: 'absolute', top: '40%', right: '30%',
                  width: 300, height: 300, borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 65%)',
                  filter: 'blur(55px)', animation: 'floatOrb 22s ease-in-out infinite reverse',
                }} />
              </>
            ) : (
              /* Light: Premium soft-mesh parallax background */
              <>
                {/* Subtle dot grid */}
                <div className="dot-grid" style={{ position: 'absolute', inset: 0 }} />

                {/* Very faint grid lines */}
                <div style={{
                  position: 'absolute', inset: 0,
                  backgroundImage: `
                    linear-gradient(rgba(99,102,241,0.035) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(99,102,241,0.035) 1px, transparent 1px)
                  `,
                  backgroundSize: '80px 80px',
                }} />

                {/* Top-right: indigo orb */}
                <div style={{
                  position: 'absolute', top: -120, right: -80,
                  width: 640, height: 640, borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(99,102,241,0.09) 0%, transparent 65%)',
                  filter: 'blur(72px)', animation: 'floatOrb 18s ease-in-out infinite',
                }} />

                {/* Bottom-left: violet orb */}
                <div style={{
                  position: 'absolute', bottom: -100, left: -80,
                  width: 520, height: 520, borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 65%)',
                  filter: 'blur(68px)', animation: 'floatOrb2 23s ease-in-out infinite',
                }} />

                {/* Center: cyan accent orb */}
                <div style={{
                  position: 'absolute', top: '35%', right: '22%',
                  width: 360, height: 360, borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(6,182,212,0.055) 0%, transparent 65%)',
                  filter: 'blur(58px)', animation: 'floatOrb 27s ease-in-out infinite reverse',
                }} />

                {/* Top-left: warm rose accent */}
                <div style={{
                  position: 'absolute', top: '5%', left: '15%',
                  width: 280, height: 280, borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(217,70,239,0.04) 0%, transparent 65%)',
                  filter: 'blur(50px)', animation: 'floatOrb2 31s ease-in-out infinite',
                }} />
              </>
            )}
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <AnimatedRoutes />
          </div>
        </div>
      </div>
      {/* AI Chatbot - only visible to citizen users, NOT gov-admin */}
      {user?.role !== 'gov-admin' && <AIChatbot />}

    </div>
  );
}

export default function App() {
  const { user } = useAuth();
  return (
    <ThemeProvider>
      {!user ? (
        <AuthPage />
      ) : (
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      )}
    </ThemeProvider>
  );
}
