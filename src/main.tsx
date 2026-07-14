import React from 'react';
import ReactDOM from 'react-dom/client';
import { ensureFreshDataStore } from './lib/storage';
import App from './App';
import { AuthProvider } from './auth/AuthContext';
import { TeamProvider } from './context/TeamContext';
import { ProjectProvider } from './context/ProjectContext';
import { WorkRateSync } from './components/WorkRateSync';
import './styles/tokens.css';
import './styles/global.css';
import './styles/macos.css';

ensureFreshDataStore();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <TeamProvider>
        <ProjectProvider>
          <WorkRateSync />
          <App />
        </ProjectProvider>
      </TeamProvider>
    </AuthProvider>
  </React.StrictMode>
);
