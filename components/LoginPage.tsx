
import React, { useState } from 'react';
import { db } from '../services/database';
import { User } from '../types';
import { Hexagon, Lock, Mail, ArrowRight, User as UserIcon, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const users = db.getUsers();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = db.validateUser(email, password);
    if (user) {
      onLogin(user);
    } else {
      setError('Invalid email or password');
    }
  };

  const fillCredentials = (u: User) => {
    setEmail(u.email);
    setPassword(u.password || '');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="flex w-full max-w-4xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
        
        {/* Left: Login Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
           <div className="mb-10 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                 <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white relative shadow-lg shadow-primary-500/30">
                    <Hexagon size={24} fill="currentColor" className="text-primary-600" />
                    <span className="absolute text-white font-bold text-sm">N</span>
                 </div>
                 <span className="font-bold text-2xl text-slate-800 dark:text-white tracking-tight">
                    Nexus<span className="text-primary-600 dark:text-primary-400">Health</span>
                 </span>
              </div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Welcome Back</h1>
              <p className="text-slate-500 dark:text-slate-400">Enter your credentials to access the system.</p>
           </div>

           <form onSubmit={handleLogin} className="space-y-5">
              <div>
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                 <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-800 outline-none text-slate-900 dark:text-white transition-all"
                      placeholder="name@nexus.hms"
                    />
                 </div>
              </div>

              <div>
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                 <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-800 outline-none text-slate-900 dark:text-white transition-all"
                      placeholder="••••••••"
                    />
                 </div>
              </div>

              {error && (
                 <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-lg flex items-center gap-2 text-sm text-red-600 dark:text-red-300">
                    <AlertCircle size={16} /> {error}
                 </div>
              )}

              <button 
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2 transition-all transform active:scale-95"
              >
                 Sign In <ArrowRight size={18} />
              </button>
           </form>

           <div className="mt-8 text-center">
              <p className="text-xs text-slate-400 dark:text-slate-500">Protected by Nexus Security Protocol v2.5</p>
           </div>
        </div>

        {/* Right: Demo Credentials */}
        <div className="hidden md:flex w-1/2 bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 p-8 flex-col">
           <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Demo Access</h3>
           <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Click any user below to auto-fill credentials.</p>

           <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
              {users.map(u => (
                 <button 
                    key={u.id}
                    onClick={() => fillCredentials(u)}
                    className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary-400 dark:hover:border-primary-500 hover:shadow-md transition-all group"
                 >
                    <div className="flex items-center gap-3">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                          u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                          u.role === 'DOCTOR' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                          u.role === 'NURSE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                          'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                       }`}>
                          {u.name.charAt(0)}
                       </div>
                       <div className="flex-1">
                          <p className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{u.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">{u.role}</p>
                       </div>
                       <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight size={16} className="text-primary-500" />
                       </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/50 flex justify-between text-xs font-mono text-slate-400">
                       <span>{u.email}</span>
                       <span>{u.password}</span>
                    </div>
                 </button>
              ))}
           </div>
           
           <div className="mt-auto pt-6 text-[10px] text-slate-400 leading-relaxed">
              <strong>Notice:</strong> This is a simulation environment. All data is stored locally in your browser. Do not enter real patient data.
           </div>
        </div>
      </div>
    </div>
  );
};
