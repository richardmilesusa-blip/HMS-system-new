
import React, { useState } from 'react';
import { ViewState } from '../types';
import { 
  LayoutDashboard, Users, Calendar, Pill, 
  Stethoscope, Settings, Bell, Search, Menu, LogOut,
  Hexagon, BedDouble
} from 'lucide-react';

interface LayoutProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  children: React.ReactNode;
}

const NavItem = ({ view, label, icon: Icon, active, onClick }: any) => (
  <button
    onClick={() => onClick(view)}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
      active 
        ? 'bg-primary-50 text-primary-700' 
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    <Icon size={20} className={active ? 'text-primary-600' : 'text-slate-400'} />
    <span>{label}</span>
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ currentView, onNavigate, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-slate-200 flex flex-col transition-all duration-300 z-20`}
      >
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 h-16">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
             <Hexagon size={20} fill="currentColor" className="text-primary-600" />
             <span className="absolute text-white font-bold text-xs">N</span>
          </div>
          {sidebarOpen && (
             <span className="font-bold text-lg text-slate-800 tracking-tight">Nexus<span className="text-primary-600">Health</span></span>
          )}
        </div>

        <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
           <NavItem view="DASHBOARD" label="Dashboard" icon={LayoutDashboard} active={currentView === 'DASHBOARD'} onClick={onNavigate} />
           <NavItem view="PATIENTS" label="Patients & EMR" icon={Users} active={currentView === 'PATIENTS'} onClick={onNavigate} />
           <NavItem view="BEDS" label="Bed Management" icon={BedDouble} active={currentView === 'BEDS'} onClick={onNavigate} />
           <NavItem view="APPOINTMENTS" label="Appointments" icon={Calendar} active={currentView === 'APPOINTMENTS'} onClick={onNavigate} />
           <NavItem view="PHARMACY" label="Pharmacy" icon={Pill} active={currentView === 'PHARMACY'} onClick={onNavigate} />
           <NavItem view="CLINICAL_AI" label="Clinical AI" icon={Stethoscope} active={currentView === 'CLINICAL_AI'} onClick={onNavigate} />
           
           <div className="pt-6 mt-6 border-t border-slate-100">
             <NavItem view="SETTINGS" label="Settings" icon={Settings} active={currentView === 'SETTINGS'} onClick={onNavigate} />
           </div>
        </div>

        <div className="p-4 border-t border-slate-100">
           <button className="flex items-center gap-3 text-slate-500 hover:text-red-600 transition-colors w-full px-2">
              <LogOut size={20} />
              {sidebarOpen && <span className="text-sm font-medium">Sign Out</span>}
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
         {/* Top Header */}
         <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg">
               <Menu size={20} />
            </button>

            <div className="flex items-center gap-4">
                <div className="relative hidden md:block">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                   <input type="text" placeholder="Global search..." className="pl-9 pr-4 py-2 bg-slate-50 border border-transparent focus:bg-white focus:border-primary-200 rounded-full text-sm w-64 transition-all outline-none" />
                </div>
                <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full">
                   <Bell size={20} />
                   <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>
                <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                   DA
                </div>
            </div>
         </header>

         {/* Viewport */}
         <main className="flex-1 overflow-auto p-6 bg-slate-50 relative">
            {children}
         </main>
      </div>
    </div>
  );
};
