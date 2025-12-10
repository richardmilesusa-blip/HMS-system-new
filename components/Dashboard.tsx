import React, { useMemo } from 'react';
import { db } from '../services/database';
import { 
  Users, Activity, BedDouble, AlertCircle, 
  TrendingUp, DollarSign, Calendar, Clock 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const StatCard = ({ title, value, subtext, icon: Icon, colorClass }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      {subtext && <p className={`text-xs mt-2 ${colorClass}`}>{subtext}</p>}
    </div>
    <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10`}>
      <Icon className={`w-6 h-6 ${colorClass.replace('text-', 'stroke-')}`} />
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const stats = useMemo(() => db.getStats(), []);
  
  // Mock data for charts
  const occupancyData = [
    { name: 'Mon', admitted: 45, emergency: 12 },
    { name: 'Tue', admitted: 48, emergency: 15 },
    { name: 'Wed', admitted: 52, emergency: 10 },
    { name: 'Thu', admitted: 50, emergency: 18 },
    { name: 'Fri', admitted: 58, emergency: 22 },
    { name: 'Sat', admitted: 65, emergency: 30 },
    { name: 'Sun', admitted: 60, emergency: 25 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Hospital Overview</h2>
        <div className="text-sm text-slate-500">Last updated: {new Date().toLocaleTimeString()}</div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Admissions" 
          value={stats.admitted} 
          subtext="+12% from last week" 
          icon={BedDouble} 
          colorClass="text-blue-600" 
        />
        <StatCard 
          title="Emergency Cases" 
          value={stats.emergency} 
          subtext="High volume today" 
          icon={AlertCircle} 
          colorClass="text-red-500" 
        />
        <StatCard 
          title="Active Doctors" 
          value="14/22" 
          subtext="Shift A" 
          icon={Users} 
          colorClass="text-emerald-600" 
        />
        <StatCard 
          title="Avg Wait Time" 
          value="18 min" 
          subtext="-2 min improvement" 
          icon={Clock} 
          colorClass="text-orange-500" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Patient Flow Analytics</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={occupancyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="admitted" name="Inpatient" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="emergency" name="Emergency" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Department Status</h3>
          <div className="space-y-4">
            {[
              { name: 'ICU', cap: '95%', color: 'bg-red-500' },
              { name: 'General Ward', cap: '78%', color: 'bg-blue-500' },
              { name: 'Maternity', cap: '45%', color: 'bg-green-500' },
              { name: 'Pediatrics', cap: '60%', color: 'bg-yellow-500' },
              { name: 'Radiology', cap: '30%', color: 'bg-purple-500' },
            ].map((dept) => (
              <div key={dept.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">{dept.name}</span>
                  <span className="text-slate-500">{dept.cap}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${dept.color}`} style={{ width: dept.cap }}></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100">
             <div className="flex items-center justify-between">
                <h4 className="font-medium text-slate-700">Financial Revenue</h4>
                <span className="text-emerald-600 font-bold text-lg">$124.5k</span>
             </div>
             <p className="text-xs text-slate-500 mt-1">Daily estimate based on billing</p>
          </div>
        </div>
      </div>
    </div>
  );
};
