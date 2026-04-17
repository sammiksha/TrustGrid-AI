// ============================================================
//  ProjectContext — Persistent Project State
//  Projects survive login/logout via localStorage
//  New projects created here are available everywhere (map, admin, etc.)
// ============================================================
import React, { createContext, useContext, useState, useEffect } from 'react';
import { projects as initialProjects } from './data/mockData';

const PROJECTS_KEY = 'civicsense_projects';

function loadProjects() {
  try {
    const stored = localStorage.getItem(PROJECTS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return initialProjects;
}

function saveProjects(projects) {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch {}
}

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState(loadProjects);

  // Persist to localStorage on every change
  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  // Sync across tabs
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === PROJECTS_KEY && e.newValue) {
        setProjects(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const addProject = (projectData) => {
    const newProject = {
      id: Date.now(),
      ...projectData,
      progress: Number(projectData.progress) || 0,
      trustScore: 70,
      lat: 18.5204 + (Math.random() - 0.5) * 0.1,
      lng: 73.8567 + (Math.random() - 0.5) * 0.1,
      issues: 0,
      spent: '₹0 Cr',
    };
    setProjects(prev => [newProject, ...prev]);
    return newProject;
  };

  const updateProject = (id, updates) => {
    setProjects(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const resetToDefaults = () => {
    setProjects(initialProjects);
    saveProjects(initialProjects);
  };

  return (
    <ProjectContext.Provider value={{ projects, addProject, updateProject, resetToDefaults }}>
      {children}
    </ProjectContext.Provider>
  );
}

export const useProjects = () => useContext(ProjectContext);
