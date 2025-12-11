
import React, { useState, useEffect, useRef } from 'react';
import { ViewState, User } from '../types';
import { hasAccess } from '../utils/permissions';
import { db } from '../services/database';
import { 
  LayoutDashboard, Users, Calendar, Pill, 
  Stethoscope, Settings, Bell, Search, Menu, LogOut,
  Hexagon, BedDouble, X, Info, AlertTriangle, CheckCircle, Trash2, Clock
} from 'lucide-react';

interface LayoutProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  onLogout: () => void;
  currentUser?: User | null;
  children: React.ReactNode;
}

const NavItem = ({ view, label, icon: Icon, active, onClick, collapsed }: any) => (
  <button
    onClick={() => onClick(view)}
    title={collapsed ? label : undefined}
    className={`group relative w-full flex items-center py-3 rounded-lg text-sm font-medium transition-all duration-200 overflow-hidden whitespace-nowrap ${
      active 
        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' 
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
    } ${collapsed ? 'justify-center px-2' : 'px-4 gap-3'}`}
  >
    <Icon size={20} className={`flex-shrink-0 transition-colors duration-200 ${active ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500'}`} />
    
    <span className={`transition-all duration-300 origin-left ${collapsed ? 'w-0 opacity-0 scale-0' : 'w-auto opacity-100 scale-100'}`}>
      {label}
    </span>

    {/* Hover tooltip for collapsed state */}
    {collapsed && (
       <div className="fixed left-20 ml-2 px-2 py-1 bg-slate-900 text-slate-50 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-md">
          {label}
       </div>
    )}
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ currentView, onNavigate, onLogout, currentUser, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Array<{id: string, message: string, type: 'info'|'warning'|'error', read: boolean}>>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
       const mobile = window.innerWidth < 768;
       setIsMobile(mobile);
       if (mobile) setSidebarOpen(false); // Auto close on mobile
    };
    
    handleResize(); // Init
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Click outside to close notifications
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Poll for notifications
  useEffect(() => {
    const fetchNotifs = () => setNotifications(db.getNotifications());
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    db.dismissNotification(id);
    setNotifications(db.getNotifications());
  };

  const handleClearAll = () => {
    db.clearAllNotifications();
    setNotifications([]);
  };

  // Helper to render nav item only if user has access
  const RenderNavItem = (props: { view: ViewState, label: string, icon: any }) => {
    if (!currentUser || !hasAccess(currentUser.role, props.view)) return null;
    
    return (
      <NavItem 
        view={props.view} 
        label={props.label} 
        icon={props.icon} 
        active={currentView === props.view} 
        onClick={onNavigate} 
        collapsed={!sidebarOpen && !isMobile} 
      />
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
      
      {/* Mobile Backdrop */}
      {isMobile && sidebarOpen && (
        <div 
          className="absolute inset-0 bg-black/50 z-20 backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
           ${isMobile ? 'absolute inset-y-0 left-0 shadow-xl' : 'relative border-r border-slate-200 dark:border-slate-700'} 
           ${sidebarOpen ? 'w-64' : (isMobile ? 'w-0 -translate-x-full' : 'w-20')} 
           bg-white dark:bg-slate-800 flex flex-col transition-all duration-300 ease-in-out z-30
           overflow-hidden
        `}
      >
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3 h-16 justify-between flex-shrink-0">
          <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
             <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white flex-shrink-0 relative">
                <Hexagon size={20} fill="currentColor" className="text-primary-600" />
                <span className="absolute text-white font-bold text-xs">N</span>
             </div>
             <span className={`font-bold text-lg text-slate-800 dark:text-white tracking-tight transition-all duration-300 ${(!sidebarOpen && !isMobile) ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>
                Nexus<span className="text-primary-600 dark:text-primary-400">Health</span>
             </span>
          </div>
          {isMobile && (
             <button onClick={() => setSidebarOpen(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
               <X size={20} />
             </button>
          )}
        </div>

        <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
           <RenderNavItem view="DASHBOARD" label="Dashboard" icon={LayoutDashboard} />
           <RenderNavItem view="PATIENTS" label="Patients & EMR" icon={Users} />
           <RenderNavItem view="BEDS" label="Bed Management" icon={BedDouble} />
           <RenderNavItem view="APPOINTMENTS" label="Appointments" icon={Calendar} />
           <RenderNavItem view="ROSTER" label="Staff Roster" icon={Clock} />
           <RenderNavItem view="PHARMACY" label="Pharmacy" icon={Pill} />
           <RenderNavItem view="CLINICAL_AI" label="Clinical AI" icon={Stethoscope} />
           
           {/* Settings is special, handled by permission check inside RenderNavItem */}
           <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-700">
             <RenderNavItem view="SETTINGS" label="Settings" icon={Settings} />
           </div>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-700 whitespace-nowrap overflow-hidden flex-shrink-0">
           <button 
             onClick={onLogout}
             className={`flex items-center gap-3 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors w-full rounded-lg py-2 ${(!sidebarOpen && !isMobile) ? 'justify-center' : 'px-2'}`}
             title={(!sidebarOpen && !isMobile) ? "Sign Out" : undefined}
           >
              <LogOut size={20} className="flex-shrink-0" />
              <span className={`transition-all duration-300 ${(!sidebarOpen && !isMobile) ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>Sign Out</span>
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
         {/* Top Header */}
         <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 z-10 sticky top-0">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
               <Menu size={20} />
            </button>

            <div className="flex items-center gap-4">
                <div className="relative hidden md:block">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                   <input type="text" placeholder="Global search..." className="pl-9 pr-4 py-2 bg-white text-slate-900 dark:bg-slate-700 border border-slate-200 dark:border-transparent focus:bg-white dark:focus:bg-slate-600 focus:border-primary-200 rounded-full text-sm w-64 transition-all outline-none dark:text-slate-200 placeholder-slate-400" />
                </div>
                
                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`relative p-2 rounded-full transition-colors ${showNotifications ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                  >
                    <Bell size={20} />
                    {notifications.length > 0 && (
                      <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-800 animate-pulse"></span>
                    )}
                  </button>

                  {/* Dropdown */}
                  {showNotifications && (
                     <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-700/50">
                           <h4 className="font-bold text-slate-800 dark:text-white text-sm">Notifications ({notifications.length})</h4>
                           {notifications.length > 0 && (
                              <button onClick={handleClearAll} className="text-xs text-slate-500 hover:text-red-500 flex items-center gap-1">
                                 <Trash2 size={12} /> Clear all
                              </button>
                           )}
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                           {notifications.length === 0 ? (
                              <div className="p-8 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center">
                                 <Bell size={32} className="mb-2 opacity-50" />
                                 <p className="text-sm">No new notifications</p>
                              </div>
                           ) : (
                              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                 {notifications.map(n => (
                                    <div key={n.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex gap-3 relative group">
                                       <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                                          n.type === 'error' ? 'bg-red-500' : 
                                          n.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                                       }`}></div>
                                       <div className="flex-1">
                                          <p className={`text-sm ${n.type === 'error' ? 'text-red-600 dark:text-red-400 font-medium' : 'text-slate-700 dark:text-slate-300'}`}>
                                             {n.message}
                                          </p>
                                          <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">{n.type}</p>
                                       </div>
                                       <button 
                                          onClick={(e) => handleDismiss(n.id, e)}
                                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                       >
                                          <X size={14} />
                                       </button>
                                    </div>
                                 ))}
                              </div>
                           )}
                        </div>
                     </div>
                  )}
                </div>

                <div 
                   className="flex items-center gap-3 pl-3 border-l border-slate-100 dark:border-slate-700"
                >
                   <div className="text-right hidden md:block">
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{currentUser?.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">{currentUser?.role}</p>
                   </div>
                   <div 
                      className="h-8 w-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-700"
                   >
                      {currentUser ? currentUser.name.charAt(0) : 'U'}
                   </div>
                </div>
            </div>
         </header>

         {/* Viewport */}
         <main className="flex-1 overflow-auto p-6 bg-slate-50 dark:bg-slate-900 relative">
            {children}
         </main>
      </div>
    </div>
  );
};
