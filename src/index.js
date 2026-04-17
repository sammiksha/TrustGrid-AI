import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { IssueProvider } from './IssueContext';
import { AuthProvider } from './AuthContext';
import { ProjectProvider } from './ProjectContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AuthProvider>
    <ProjectProvider>
      <IssueProvider>
        <App />
      </IssueProvider>
    </ProjectProvider>
  </AuthProvider>
);
