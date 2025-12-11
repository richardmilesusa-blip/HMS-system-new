
import React, { useState, useEffect } from 'react';
import { db } from '../services/database';
import { Shift, User, UserRole } from '../types';
import { hasPermission } from '../utils/permissions';
import { Calendar, Clock, Plus, Trash2, Filter, AlertCircle, XCircle } from 'lucide-react';

export const RosterModule: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showModal, setShowModal] = useState(false);
  
  const currentUser = db.getCurrentUser();
  const canManage = hasPermission(currentUser.role, 'MANAGE_ROSTER');

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setShifts(db.getShifts());
    setUsers(db.getUsers());
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this shift?')) {
      db.deleteShift(id);
      refreshData();
    }
  };

  const filteredShifts = shifts.filter(s => s.date === selectedDate).sort((a,b) => a.startTime.localeCompare(b.startTime));

  // Week view helper
  const getWeekDates = (dateStr: string) => {
    const curr = new Date(dateStr);
    const week = [];
    for (let i = 0; i < 7; i++) {
        let first = curr.getDate() - curr.getDay() + i;
        let day = new Date(curr.setDate(first)).toISOString().slice(0, 10);
        week.push(day);
        // Reset curr because setDate mutates it
        curr.setTime(new Date(dateStr).getTime());
    }
    return week;
  };
  
  const weekDates = getWeekDates(selectedDate);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6 h-full flex flex-col animate-fade-in">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Staff Roster</h2>
            <p className="text-slate-500 dark:text-slate-400">View and manage clinical staff shifts.</p>
          </div>
          <div className="flex gap-4 items-center">
             <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 flex">
                 <button className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded font-medium text-sm">Daily</button>
             </div>
             {canManage && (
               <button 
                 onClick={() => setShowModal(true)}
                 className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
               >
                 <Plus size={18} /> Add Shift
               </button>
             )}
          </div>
       </div>

       {/* Calendar Strip */}
       <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
          <div className="flex justify-between min-w-[600px]">
             {weekDates.map((date, index) => {
                const isSelected = date === selectedDate;
                const dateObj = new Date(date);
                const isToday = date === new Date().toISOString().split('T')[0];
                return (
                   <button 
                     key={date}
                     onClick={() => setSelectedDate(date)}
                     className={`flex flex-col items-center justify-center p-3 rounded-lg min-w-[80px] transition-all ${
                        isSelected 
                          ? 'bg-primary-600 text-white shadow-md' 
                          : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                     }`}
                   >
                      <span className={`text-xs uppercase font-bold mb-1 ${isSelected ? 'text-primary-200' : 'text-slate-400'}`}>{days[index]}</span>
                      <span className={`text-xl font-bold ${isSelected ? 'text-white' : 'text-slate-800 dark:text-white'}`}>{dateObj.getDate()}</span>
                      {isToday && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1"></span>}
                   </button>
                );
             })}
          </div>
       </div>

       {/* Shifts List */}
       <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 flex justify-between items-center">
             <h3 className="font-bold text-slate-800 dark:text-white">Schedule for {new Date(selectedDate).toDateString()}</h3>
             <span className="text-sm text-slate-500 dark:text-slate-400">{filteredShifts.length} Shifts</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
             {filteredShifts.length > 0 ? (
                <div className="space-y-3">
                   {filteredShifts.map(shift => (
                      <div key={shift.id} className="flex flex-col md:flex-row items-start md:items-center p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:border-primary-200 dark:hover:border-primary-800 transition-colors group">
                         {/* Time Column */}
                         <div className="flex md:flex-col items-center gap-2 md:gap-0 min-w-[120px] md:border-r md:border-slate-100 dark:border-slate-700 pr-4 mr-4">
                            <span className="font-bold text-lg text-slate-800 dark:text-white">{shift.startTime}</span>
                            <span className="text-xs text-slate-400">to</span>
                            <span className="font-medium text-slate-600 dark:text-slate-300">{shift.endTime}</span>
                         </div>
                         
                         {/* Details Column */}
                         <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                               <h4 className="font-bold text-slate-800 dark:text-white text-lg">{shift.userName}</h4>
                               <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                                  shift.userRole === UserRole.DOCTOR ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
                                  shift.userRole === UserRole.NURSE ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                                  'bg-slate-100 text-slate-700'
                               }`}>{shift.userRole}</span>
                            </div>
                            <div className="flex gap-4 text-sm text-slate-500 dark:text-slate-400">
                               <span className="flex items-center gap-1"><Clock size={14}/> {shift.type} Shift</span>
                               <span className="flex items-center gap-1">📍 {shift.location}</span>
                            </div>
                         </div>

                         {/* Actions */}
                         {canManage && (
                            <button 
                              onClick={() => handleDelete(shift.id)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                              title="Remove Shift"
                            >
                               <Trash2 size={18} />
                            </button>
                         )}
                      </div>
                   ))}
                </div>
             ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 opacity-60">
                   <Calendar size={48} className="mb-4" />
                   <p>No shifts scheduled for this date.</p>
                </div>
             )}
          </div>
       </div>

       {showModal && (
          <AddShiftModal 
             onClose={() => setShowModal(false)}
             onSave={() => { refreshData(); setShowModal(false); }}
             users={users}
             defaultDate={selectedDate}
          />
       )}
    </div>
  );
};

const AddShiftModal: React.FC<{ 
   onClose: () => void; 
   onSave: () => void; 
   users: User[];
   defaultDate: string;
}> = ({ onClose, onSave, users, defaultDate }) => {
   const [formData, setFormData] = useState({
      userId: '',
      date: defaultDate,
      startTime: '08:00',
      endTime: '16:00',
      type: 'DAY',
      location: 'General Ward'
   });
   
   // Filter only clinical staff
   const clinicalStaff = users.filter(u => u.role === UserRole.DOCTOR || u.role === UserRole.NURSE);

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const user = users.find(u => u.id === formData.userId);
      if (!user) return;

      const newShift: Shift = {
         id: `S-${Date.now()}`,
         userId: user.id,
         userName: user.name,
         userRole: user.role,
         date: formData.date,
         startTime: formData.startTime,
         endTime: formData.endTime,
         type: formData.type as any,
         location: formData.location
      };
      
      db.addShift(newShift);
      onSave();
   };

   return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
       <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200 border dark:border-slate-700">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-xl font-bold text-slate-800 dark:text-white">Add Staff Shift</h3>
             <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><XCircle size={24} /></button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Staff Member</label>
                <select 
                   required
                   value={formData.userId}
                   onChange={e => setFormData({...formData, userId: e.target.value})}
                   className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 dark:bg-slate-700 dark:text-white"
                >
                   <option value="">Select Staff...</option>
                   {clinicalStaff.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                   ))}
                </select>
             </div>

             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                <input 
                   required
                   type="date"
                   value={formData.date}
                   onChange={e => setFormData({...formData, date: e.target.value})}
                   className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 dark:bg-slate-700 dark:text-white"
                />
             </div>

             <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Time</label>
                  <input 
                     required
                     type="time"
                     value={formData.startTime}
                     onChange={e => setFormData({...formData, startTime: e.target.value})}
                     className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 dark:bg-slate-700 dark:text-white"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End Time</label>
                  <input 
                     required
                     type="time"
                     value={formData.endTime}
                     onChange={e => setFormData({...formData, endTime: e.target.value})}
                     className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 dark:bg-slate-700 dark:text-white"
                  />
               </div>
             </div>

             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Location</label>
                <select 
                   value={formData.location}
                   onChange={e => setFormData({...formData, location: e.target.value})}
                   className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 dark:bg-slate-700 dark:text-white"
                >
                   <option value="General Ward">General Ward</option>
                   <option value="ICU">ICU</option>
                   <option value="ER">Emergency Room</option>
                   <option value="Pediatrics">Pediatrics</option>
                   <option value="Surgery">Surgery</option>
                </select>
             </div>

             <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700 mt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 shadow-sm">Add Shift</button>
             </div>
          </form>
       </div>
    </div>
   );
};
