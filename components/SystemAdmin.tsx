
import React, { useState, useEffect } from 'react';
import { db } from '../services/database';
import { User, AuditLog, UserRole } from '../types';
import { hasPermission } from '../utils/permissions';
import { Users, Shield, Activity, Settings, Plus, Search, Lock, UserCheck, UserX, FileText, Key, Moon, Sun, Monitor, AlertCircle, Bell } from 'lucide-react';

export const SystemAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'USERS' | 'AUDIT' | 'CONFIG'>('USERS');

  return (
    <div className="space-y-6 h-full flex flex-col animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 dark:text-white">System Administration</h2>
           <p className="text-slate-500 dark:text-slate-400">Manage users, view audit logs, and configure system settings.</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
           <button onClick={() => setActiveTab('USERS')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'USERS' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
              <span className="flex items-center gap-2"><Users size={16}/> Users</span>
           </button>
           <button onClick={() => setActiveTab('AUDIT')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'AUDIT' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
              <span className="flex items-center gap-2"><Shield size={16}/> Audit Logs</span>
           </button>
           <button onClick={() => setActiveTab('CONFIG')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'CONFIG' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
              <span className="flex items-center gap-2"><Settings size={16}/> Settings</span>
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
         {activeTab === 'USERS' && <UserManagement />}
         {activeTab === 'AUDIT' && <AuditLogViewer />}
         {activeTab === 'CONFIG' && <SystemConfig />}
      </div>
    </div>
  );
};

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [passwordModalUser, setPasswordModalUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // RBAC Check
  const currentUser = db.getCurrentUser();
  const canManageUsers = hasPermission(currentUser.role, 'MANAGE_USERS');

  const refreshUsers = () => {
    setUsers(db.getUsers());
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  const toggleStatus = (user: User) => {
    if (!canManageUsers) return;
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    db.updateUserStatus(user.id, newStatus);
    refreshUsers();
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
       {!canManageUsers && (
         <div className="bg-yellow-50 dark:bg-yellow-900/20 px-4 py-2 border-b border-yellow-100 dark:border-yellow-900/50 text-xs text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
            <Lock size={12} />
            You are viewing this module in Read-Only mode. Administrative actions are restricted.
         </div>
       )}

       <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center gap-4">
          <div className="relative flex-1 max-w-md">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
               type="text" 
               placeholder="Search users..." 
               className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          {canManageUsers && (
            <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium shadow-sm transition-colors"
            >
                <Plus size={16} /> Add User
            </button>
          )}
       </div>

       <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
             <thead className="bg-slate-50 dark:bg-slate-700 sticky top-0 z-10">
               <tr>
                 <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600">User</th>
                 <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600">Role</th>
                 <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600">Status</th>
                 <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600">Last Login</th>
                 <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600 text-right">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
               {filteredUsers.map(user => (
                 <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <td className="p-4">
                       <div className="font-bold text-slate-800 dark:text-white">{user.name}</div>
                       <div className="text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
                    </td>
                    <td className="p-4">
                       <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' :
                          user.role === UserRole.DOCTOR ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
                          user.role === UserRole.NURSE ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                          'bg-slate-100 text-slate-700 dark:bg-slate-600 dark:text-slate-300'
                       }`}>
                          {user.role}
                       </span>
                    </td>
                    <td className="p-4">
                       {user.status === 'ACTIVE' ? (
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium text-sm"><CheckCircleMini/> Active</span>
                       ) : (
                          <span className="flex items-center gap-1 text-slate-400 font-medium text-sm"><XCircleMini/> Inactive</span>
                       )}
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 text-sm">
                       {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                    </td>
                    <td className="p-4 text-right">
                       {canManageUsers ? (
                           <div className="flex justify-end gap-2">
                                <button 
                                    onClick={() => setPasswordModalUser(user)}
                                    className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-colors"
                                    title="Change Password"
                                >
                                    <Key size={18} />
                                </button>
                                <button 
                                    onClick={() => toggleStatus(user)}
                                    className={`p-2 rounded-lg transition-colors ${
                                        user.status === 'ACTIVE' ? 'text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 dark:hover:text-red-400' : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400'
                                    }`}
                                    title={user.status === 'ACTIVE' ? 'Deactivate User' : 'Activate User'}
                                >
                                    {user.status === 'ACTIVE' ? <UserX size={18} /> : <UserCheck size={18} />}
                                </button>
                            </div>
                       ) : (
                           <div className="flex items-center justify-end gap-1 text-slate-400 cursor-not-allowed opacity-60">
                               <Lock size={14} />
                           </div>
                       )}
                    </td>
                 </tr>
               ))}
             </tbody>
          </table>
       </div>

       {showAddModal && <AddUserModal onClose={() => setShowAddModal(false)} onSave={() => { refreshUsers(); setShowAddModal(false); }} />}
       {passwordModalUser && <ChangePasswordModal user={passwordModalUser} onClose={() => setPasswordModalUser(null)} />}
    </div>
  );
};

const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    setLogs(db.getAuditLogs());
  }, []);

  return (
    <div className="h-full flex flex-col">
       <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
          <p className="text-sm text-slate-500 dark:text-slate-400">Showing last {logs.length} system events.</p>
       </div>
       <div className="flex-1 overflow-auto p-0">
          <table className="w-full text-left text-sm">
             <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 sticky top-0 z-10">
                <tr>
                   <th className="p-3 font-medium">Timestamp</th>
                   <th className="p-3 font-medium">User</th>
                   <th className="p-3 font-medium">Action</th>
                   <th className="p-3 font-medium">Module</th>
                   <th className="p-3 font-medium">Details</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {logs.map(log => (
                   <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 font-mono text-xs">
                      <td className="p-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="p-3 font-medium text-slate-700 dark:text-slate-300">{log.userName}</td>
                      <td className="p-3 text-blue-600 dark:text-blue-400 font-bold">{log.action}</td>
                      <td className="p-3">
                         <span className="bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded text-[10px]">{log.module}</span>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{log.details}</td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );
};

const SystemConfig: React.FC = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    if (isDark) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        setIsDark(false);
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        setIsDark(true);
    }
  };

  return (
    <div className="p-6 overflow-y-auto h-full space-y-8 max-w-5xl mx-auto">
      {/* Header with Demo Banner */}
      <div className="space-y-4">
          <div className="flex flex-col gap-1">
             <h3 className="text-xl font-bold text-slate-800 dark:text-white">Settings</h3>
             <p className="text-sm text-slate-500 dark:text-slate-400">Configure application preferences and system defaults.</p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4 flex items-start gap-3">
             <Lock className="text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" size={18} />
             <div>
                <h4 className="text-amber-800 dark:text-amber-400 font-bold text-sm">Read-Only Configuration</h4>
                <p className="text-amber-700 dark:text-amber-500 text-xs mt-1">System settings are locked in demo mode to preserve integrity for all users.</p>
             </div>
          </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
            {/* Appearance Section */}
            <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2 bg-slate-50 dark:bg-slate-700/50">
                    <Monitor size={18} className="text-slate-500 dark:text-slate-400" />
                    <h4 className="font-bold text-slate-800 dark:text-white">Appearance</h4>
                </div>
                <div className="p-6">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className={`p-3 rounded-full ${isDark ? 'bg-indigo-900/50 text-indigo-300' : 'bg-orange-100 text-orange-500'}`}>
                              {isDark ? <Moon size={24} /> : <Sun size={24} />}
                           </div>
                           <div>
                              <p className="font-bold text-slate-700 dark:text-slate-200 text-lg">Dark Mode</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">Adjust the interface for low-light environments.</p>
                           </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={isDark} onChange={toggleTheme} className="sr-only peer" />
                          <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                        </label>
                     </div>
                </div>
            </section>

            {/* System Info Section */}
             <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2 bg-slate-50 dark:bg-slate-700/50">
                    <Activity size={18} className="text-slate-500 dark:text-slate-400" />
                    <h4 className="font-bold text-slate-800 dark:text-white">System Information</h4>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Hospital Name</label>
                        <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium">
                             Nexus Health OS
                        </div>
                    </div>
                     <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Support Email</label>
                        <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-mono text-sm">
                             admin@nexus.hms
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Server Timezone</label>
                        <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 opacity-75">
                             UTC (GMT+00:00)
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Version</label>
                        <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 opacity-75">
                             v2.5.0 (Build 2023.10.27)
                        </div>
                    </div>
                </div>
            </section>

            {/* Notifications Section */}
            <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2 bg-slate-50 dark:bg-slate-700/50">
                    <Bell size={18} className="text-slate-500 dark:text-slate-400" />
                    <h4 className="font-bold text-slate-800 dark:text-white">Notification Preferences</h4>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-slate-700 dark:text-slate-300">Critical Lab Alerts</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Receive emails when lab results are flagged as Critical.</p>
                        </div>
                        <input type="checkbox" checked disabled className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50" />
                    </div>
                    <hr className="border-slate-100 dark:border-slate-700" />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-slate-700 dark:text-slate-300">Shift Updates</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">SMS notifications for roster changes.</p>
                        </div>
                         <input type="checkbox" checked disabled className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50" />
                    </div>
                    <hr className="border-slate-100 dark:border-slate-700" />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-slate-700 dark:text-slate-300">System Maintenance</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">In-app banners for scheduled downtime.</p>
                        </div>
                         <input type="checkbox" checked disabled className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50" />
                    </div>
                </div>
            </section>
      </div>
    </div>
  );
};

// --- Modals & Icons ---

const AddUserModal: React.FC<{ onClose: () => void; onSave: () => void }> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({ name: '', email: '', role: UserRole.DOCTOR, password: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
       id: `U-${Date.now()}`,
       name: formData.name,
       email: formData.email,
       role: formData.role,
       status: 'ACTIVE',
       password: formData.password || 'password123'
    };
    db.addUser(newUser);
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
       <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200 border dark:border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Add System User</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><XCircleMini /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 dark:bg-slate-700 dark:text-white" />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 dark:bg-slate-700 dark:text-white" />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Initial Password</label>
                <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 dark:bg-slate-700 dark:text-white" placeholder="Default: password123" />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 dark:bg-slate-700 dark:text-white">
                   {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                </select>
             </div>
             <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700 mt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 shadow-sm">Create User</button>
             </div>
          </form>
       </div>
    </div>
  );
};

const ChangePasswordModal: React.FC<{ user: User; onClose: () => void }> = ({ user, onClose }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    db.updateUserPassword(user.id, newPassword);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
       <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200 border dark:border-slate-700">
          <div className="flex justify-between items-center mb-1">
             <h3 className="text-xl font-bold text-slate-800 dark:text-white">Change Password</h3>
             <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><XCircleMini /></button>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Resetting password for <span className="font-semibold text-slate-800 dark:text-white">{user.name}</span></p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                <input required type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 dark:bg-slate-700 dark:text-white" />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
                <input required type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 dark:bg-slate-700 dark:text-white" />
             </div>
             
             {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12}/> {error}</p>}

             <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700 mt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm">Update Password</button>
             </div>
          </form>
       </div>
    </div>
  );
};

const CheckCircleMini = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>;
const XCircleMini = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>;
