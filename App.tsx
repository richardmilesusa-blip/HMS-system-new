
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
import { db } from './services/database';
import { hasAccess } from './utils/permissions';
import { Lock } from 'lucide-react';

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
    db.setCurrentUser(u); // Sync with DB state for RBAC
    setCurrentView('DASHBOARD'); // Reset to dashboard on login
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('DASHBOARD');
  };

  // Secure content rendering
  const renderContent = () => {
    if (!user) return null;

    // Security Check: If user doesn't have access to this view, show unauthorized
    if (!hasAccess(user.role, currentView)) {
       return (
         <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-full mb-4">
               <Lock size={48} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Access Denied</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md">
               You do not have permission to view this module. Please contact your system administrator if you believe this is an error.
            </p>
            <button 
               onClick={() => setCurrentView('DASHBOARD')}
               className="mt-6 px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
            >
               Return to Dashboard
            </button>
         </div>
       );
    }

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
          <div className="max-w-4xl mx-auto h-full flex flex-col animate-fade-in">
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
