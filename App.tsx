
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { PatientModule } from './components/PatientModule';
import { BedManagement } from './components/BedManagement';
import { AppointmentScheduler } from './components/AppointmentScheduler';
import { PharmacyModule } from './components/PharmacyModule';
import { ClinicalSupport } from './components/ClinicalSupport';
import { SystemAdmin } from './components/SystemAdmin';
import { ViewState } from './types';
import { Calendar, Pill, Settings } from 'lucide-react';
import { db } from './services/database';

// Placeholder components for views not fully implemented in this demo
const PlaceholderView: React.FC<{ title: string; icon: any; desc: string }> = ({ title, icon: Icon, desc }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-12 bg-white rounded-xl border border-slate-200 border-dashed animate-fade-in">
    <div className="p-6 bg-slate-50 rounded-full mb-6">
      <Icon size={48} className="text-slate-300" />
    </div>
    <h2 className="text-2xl font-bold text-slate-800 mb-2">{title}</h2>
    <p className="text-slate-500 max-w-md">{desc}</p>
    <button className="mt-6 px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">
      Initialize Module
    </button>
  </div>
);

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');

  // Initialize DB on mount
  React.useEffect(() => {
    // Accessing db property triggers initialization
    console.log("System initialized with patients:", db.getPatients().length);
  }, []);

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
               <h2 className="text-2xl font-bold text-slate-800">General Medical Consultant</h2>
               <p className="text-slate-500">Ask general medical questions or get administrative assistance.</p>
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

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
       {renderContent()}
    </Layout>
  );
};

export default App;
