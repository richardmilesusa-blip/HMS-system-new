
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { PatientModule } from './components/PatientModule';
import { BedManagement } from './components/BedManagement';
import { AppointmentScheduler } from './components/AppointmentScheduler';
import { PharmacyModule } from './components/PharmacyModule';
import { ClinicalSupport } from './components/ClinicalSupport';
import { SystemAdmin } from './components/SystemAdmin';
import { LoginPage } from './components/LoginPage';
import { ViewState, User } from './types';
import { Calendar, Pill, Settings } from 'lucide-react';
import { db } from './services/database';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [user, setUser] = useState<User | null>(null);

  // Initialize DB and Theme on mount
  useEffect(() => {
    console.log("System initialized with patients:", db.getPatients().length);
    
    // Check local storage for theme
    const theme = localStorage.getItem('theme');
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('DASHBOARD');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'DASHBOARD':
        return <Dashboard />;
      case 'PATIENTS':
        return <PatientModule />;
      case 'BEDS':
        return <BedManagement />;
      case 'APPOINTMENTS':
        return <AppointmentScheduler />;
      case 'PHARMACY':
        return <PharmacyModule />;
      case 'CLINICAL_AI':
        return (
          <div className="max-w-4xl mx-auto h-full flex flex-col">
             <div className="mb-6">
               <h2 className="text-2xl font-bold text-slate-800 dark:text-white">General Medical Consultant</h2>
               <p className="text-slate-500 dark:text-slate-400">Ask general medical questions or get administrative assistance.</p>
             </div>
             <ClinicalSupport />
          </div>
        );
      case 'SETTINGS':
        return <SystemAdmin />;
      default:
        return <Dashboard />;
    }
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView} onLogout={handleLogout} currentUser={user}>
       {renderContent()}
    </Layout>
  );
};

export default App;
