// src/App.tsx
import React from 'react';
import { useTwinStore } from './store/twinStore';
import { AuthGatewayScreen } from './screens/AuthGatewayScreen';
import { MainDashboard } from './screens/MainDashboard';

const App: React.FC = () => {
  const { activeRole } = useTwinStore();

  // If user has not authenticated, show the separate login gateway
  if (!activeRole) {
    return <AuthGatewayScreen />;
  }

  // Otherwise, render the dedicated dashboard (Clinician Workstation or Patient Twin Portal)
  return <MainDashboard />;
};

export default App;
