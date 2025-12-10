
import React, { useState, useEffect } from 'react';
import { db } from '../services/database';
import { Appointment, Doctor, AppointmentStatus, AppointmentType } from '../types';
import { Calendar, User, CheckCircle, XCircle, Plus, Filter } from 'lucide-react';

export const AppointmentScheduler: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filterDoctor, setFilterDoctor] = useState<string>('ALL');
  const [showModal, setShowModal] = useState(false);

  // Helper to refresh data
  const refreshData = () => {
    setAppointments(db.getAppointments());
    setDoctors(db.getDoctors());
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Filter appointments
  const filteredAppointments = appointments.filter(appt => {
    const matchesDate = appt.date === selectedDate;
    const matchesDoctor = filterDoctor === 'ALL' || appt.doctorId === filterDoctor;
    return matchesDate && matchesDoctor;
  }).sort((a, b) => a.time.localeCompare(b.time));

  const stats = {
    total: filteredAppointments.length,
    confirmed: filteredAppointments.filter(a => a.status === 'CONFIRMED').length,
    pending: filteredAppointments.filter(a => a.status === 'SCHEDULED').length,
    completed: filteredAppointments.filter(a => a.status === 'COMPLETED').length
  };

  const updateStatus = (appt: Appointment, status: AppointmentStatus) => {
    db.updateAppointment({ ...appt, status });
    refreshData();
  };

  return (
    <div className="space-y-6 h-full flex flex-col animate-fade-in">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Appointments</h2>
           <p className="text-slate-500 dark:text-slate-400">Manage patient consultations and schedules.</p>
        </div>
        <div className="flex gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="font-bold">{stats.total}</span> Total
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="font-bold">{stats.confirmed}</span> Confirmed
            </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 items-center justify-between z-10">
         <div className="flex items-center gap-4">
            {/* Date Picker */}
            <div className="flex items-center gap-2 bg-white text-slate-900 dark:bg-slate-700 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600">
               <Calendar size={18} className="text-slate-500 dark:text-slate-400" />
               <input 
                 type="date" 
                 className="bg-transparent text-sm font-medium text-slate-900 dark:text-slate-200 outline-none"
                 value={selectedDate}
                 onChange={(e) => setSelectedDate(e.target.value)}
               />
            </div>

            {/* Doctor Filter */}
            <div className="relative">
               <Filter className="absolute left-3 top-2.5 text-slate-400" size={16} />
               <select 
                 className="pl-9 pr-8 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white text-slate-900 dark:bg-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-600 focus:ring-2 focus:ring-primary-500 outline-none appearance-none"
                 value={filterDoctor}
                 onChange={(e) => setFilterDoctor(e.target.value)}
               >
                 <option value="ALL">All Doctors</option>
                 {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
               </select>
            </div>
         </div>

         <button 
           onClick={() => setShowModal(true)}
           className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
         >
           <Plus size={18} />
           New Appointment
         </button>
      </div>

      {/* Appointments List */}
      <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-1">
         {filteredAppointments.length > 0 ? (
           <div className="grid grid-cols-1 gap-3 p-3">
              {filteredAppointments.map(appt => (
                 <AppointmentCard 
                    key={appt.id} 
                    appointment={appt} 
                    doctors={doctors}
                    onStatusUpdate={updateStatus}
                 />
              ))}
           </div>
         ) : (
           <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
              <Calendar size={48} className="mb-4 opacity-50" />
              <p>No appointments found for this date.</p>
           </div>
         )}
      </div>

      {/* Booking Modal */}
      {showModal && (
        <AppointmentModal 
          onClose={() => setShowModal(false)} 
          onSave={() => { refreshData(); setShowModal(false); }} 
          doctors={doctors}
        />
      )}
    </div>
  );
};

const AppointmentCard: React.FC<{ 
  appointment: Appointment; 
  doctors: Doctor[];
  onStatusUpdate: (appt: Appointment, status: AppointmentStatus) => void;
}> = ({ appointment, doctors, onStatusUpdate }) => {
  const patient = db.getPatientById(appointment.patientId);
  const doctor = doctors.find(d => d.id === appointment.doctorId);
  
  const getStatusColor = (status: AppointmentStatus) => {
    switch(status) {
       case 'CONFIRMED': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
       case 'SCHEDULED': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
       case 'COMPLETED': return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600';
       case 'CANCELLED': return 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800';
       case 'NO_SHOW': return 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-800';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center hover:shadow-md transition-shadow">
       {/* Time Column */}
       <div className="flex flex-col items-center min-w-[80px] px-2 border-r border-slate-100 dark:border-slate-700">
          <span className="text-lg font-bold text-slate-800 dark:text-white">{appointment.time}</span>
          <span className="text-xs text-slate-400 dark:text-slate-500">{appointment.duration} min</span>
       </div>

       {/* Details */}
       <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
             <h4 className="font-bold text-slate-800 dark:text-white">{patient?.lastName}, {patient?.firstName}</h4>
             <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(appointment.status)}`}>
                {appointment.status}
             </span>
             <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-600">
                {appointment.type}
             </span>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-4">
             <span className="flex items-center gap-1"><User size={14}/> {doctor?.name}</span>
             {appointment.notes && <span className="italic text-slate-400 max-w-xs truncate">- {appointment.notes}</span>}
          </div>
       </div>

       {/* Actions */}
       <div className="flex gap-2">
          {appointment.status === 'SCHEDULED' && (
             <button onClick={() => onStatusUpdate(appointment, 'CONFIRMED')} className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-full" title="Confirm">
                <CheckCircle size={20} />
             </button>
          )}
          {['SCHEDULED', 'CONFIRMED'].includes(appointment.status) && (
             <>
               <button onClick={() => onStatusUpdate(appointment, 'COMPLETED')} className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full" title="Complete">
                  <CheckCircle size={20} className="fill-current bg-white dark:bg-slate-800 rounded-full" />
               </button>
               <button onClick={() => onStatusUpdate(appointment, 'CANCELLED')} className="p-2 text-red-400 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full" title="Cancel">
                  <XCircle size={20} />
               </button>
             </>
          )}
       </div>
    </div>
  );
};

const AppointmentModal: React.FC<{
  onClose: () => void;
  onSave: () => void;
  doctors: Doctor[];
}> = ({ onClose, onSave, doctors }) => {
  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00');
  const [type, setType] = useState<AppointmentType>('CONSULTATION');
  const [notes, setNotes] = useState('');

  const patients = db.getPatients();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !doctorId) return;

    const newAppt: Appointment = {
      id: `A-${Date.now()}`,
      patientId,
      doctorId,
      date,
      time,
      duration: 30, // Default for demo
      type,
      status: 'SCHEDULED',
      notes
    };

    db.addAppointment(newAppt);
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200 border dark:border-slate-700">
         <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Book Appointment</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><XCircle size={24} /></button>
         </div>

         <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                  <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 dark:bg-slate-700 dark:text-white" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Time</label>
                  <input required type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 dark:bg-slate-700 dark:text-white" />
               </div>
            </div>

            <div>
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Patient</label>
               <select required value={patientId} onChange={e => setPatientId(e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 dark:bg-slate-700 dark:text-white">
                  <option value="">Select Patient...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.lastName}, {p.firstName}</option>)}
               </select>
            </div>

            <div>
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Doctor</label>
               <select required value={doctorId} onChange={e => setDoctorId(e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 dark:bg-slate-700 dark:text-white">
                  <option value="">Select Doctor...</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>)}
               </select>
            </div>

            <div>
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
               <select value={type} onChange={e => setType(e.target.value as AppointmentType)} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 dark:bg-slate-700 dark:text-white">
                  <option value="CONSULTATION">Consultation</option>
                  <option value="CHECKUP">Checkup</option>
                  <option value="FOLLOW_UP">Follow Up</option>
                  <option value="SURGERY">Surgery</option>
               </select>
            </div>

            <div>
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes</label>
               <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none bg-white text-slate-900 dark:bg-slate-700 dark:text-white"></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700 mt-4">
               <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
               <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 shadow-sm">Book Appointment</button>
            </div>
         </form>
      </div>
    </div>
  );
};
