
import React, { useState, useEffect } from 'react';
import { db } from '../services/database';
import { Bed, Ward, BedStatus, Patient } from '../types';
import { BedDouble, CheckCircle, XCircle, Clock, Filter, AlertTriangle, User, Search, ArrowRight } from 'lucide-react';

export const BedManagement: React.FC = () => {
  const [wards, setWards] = useState<Ward[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [selectedWard, setSelectedWard] = useState<string>('ALL');
  const [showAssignModal, setShowAssignModal] = useState<Bed | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [availablePatients, setAvailablePatients] = useState<Patient[]>([]);

  // Refresh data helper
  const refreshData = () => {
    setWards(db.getWards());
    setBeds(db.getBeds());
    
    // Load patients eligible for assignment (not currently assigned a bed)
    const allPatients = db.getPatients();
    setAvailablePatients(allPatients.filter(p => !p.bedId));
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleStatusChange = (bed: Bed, newStatus: BedStatus) => {
    if (newStatus === 'AVAILABLE' && bed.status === 'OCCUPIED') {
       // Should use discharge flow instead
       db.dischargePatientFromBed(bed.id);
    } else {
       db.updateBed({ ...bed, status: newStatus });
    }
    refreshData();
  };

  const handleAssignPatient = () => {
    if (showAssignModal && selectedPatientId) {
      db.assignPatientToBed(selectedPatientId, showAssignModal.id);
      setShowAssignModal(null);
      setSelectedPatientId('');
      refreshData();
    }
  };

  const filteredBeds = selectedWard === 'ALL' ? beds : beds.filter(b => b.wardId === selectedWard);

  // Quick stats
  const totalBeds = beds.length;
  const occupied = beds.filter(b => b.status === 'OCCUPIED').length;
  const available = beds.filter(b => b.status === 'AVAILABLE').length;
  const cleaning = beds.filter(b => b.status === 'CLEANING').length;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Bed Management</h2>
           <p className="text-slate-500">Real-time tracking of ward occupancy and patient assignment.</p>
        </div>
        <div className="flex gap-2">
           <select 
             className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
             value={selectedWard}
             onChange={(e) => setSelectedWard(e.target.value)}
           >
             <option value="ALL">All Wards</option>
             {wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
           </select>
           <button 
             onClick={refreshData} 
             className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"
           >
             Refresh
           </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
               <p className="text-slate-500 text-xs font-bold uppercase">Total Capacity</p>
               <p className="text-2xl font-bold text-slate-800">{totalBeds}</p>
            </div>
            <div className="bg-slate-100 p-2 rounded-lg text-slate-600"><BedDouble size={20} /></div>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
               <p className="text-emerald-600 text-xs font-bold uppercase">Available</p>
               <p className="text-2xl font-bold text-emerald-700">{available}</p>
            </div>
            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><CheckCircle size={20} /></div>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
               <p className="text-blue-600 text-xs font-bold uppercase">Occupied</p>
               <p className="text-2xl font-bold text-blue-700">{occupied}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><User size={20} /></div>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
               <p className="text-yellow-600 text-xs font-bold uppercase">To Clean</p>
               <p className="text-2xl font-bold text-yellow-700">{cleaning}</p>
            </div>
            <div className="bg-yellow-100 p-2 rounded-lg text-yellow-600"><Clock size={20} /></div>
         </div>
      </div>

      {/* Ward Sections */}
      {(selectedWard === 'ALL' ? wards : wards.filter(w => w.id === selectedWard)).map(ward => {
        const wardBeds = filteredBeds.filter(b => b.wardId === ward.id);
        if (wardBeds.length === 0) return null;

        return (
          <div key={ward.id} className="space-y-4">
             <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-slate-800">{ward.name}</h3>
                <span className="text-xs bg-slate-200 px-2 py-1 rounded text-slate-600">Floor {ward.floor}</span>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {wardBeds.map(bed => (
                   <BedCard 
                      key={bed.id} 
                      bed={bed} 
                      onAction={() => handleStatusChange(bed, 'CLEANING')} // Simplified action
                      onAssign={() => setShowAssignModal(bed)}
                      onDischarge={() => { db.dischargePatientFromBed(bed.id); refreshData(); }}
                      onClean={() => handleStatusChange(bed, 'AVAILABLE')}
                      onMaintenance={() => handleStatusChange(bed, 'MAINTENANCE')}
                   />
                ))}
             </div>
          </div>
        );
      })}

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
             <h3 className="text-xl font-bold mb-4">Assign Patient to {showAssignModal.roomNumber}</h3>
             
             <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Patient</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <select 
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none appearance-none bg-white"
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                  >
                    <option value="">-- Choose a patient --</option>
                    {availablePatients.map(p => (
                      <option key={p.id} value={p.id}>{p.lastName}, {p.firstName} (ID: {p.id})</option>
                    ))}
                  </select>
                </div>
                {availablePatients.length === 0 && (
                  <p className="text-xs text-orange-500 mt-2">No unassigned patients found. Register a new patient first.</p>
                )}
             </div>

             <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={() => setShowAssignModal(null)} 
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAssignPatient}
                  disabled={!selectedPatientId}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Assignment
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component for individual bed card
const BedCard: React.FC<{ 
  bed: Bed; 
  onAction: () => void;
  onAssign: () => void;
  onDischarge: () => void;
  onClean: () => void;
  onMaintenance: () => void;
}> = ({ bed, onAssign, onDischarge, onClean, onMaintenance }) => {
  
  const getStatusStyles = (status: BedStatus) => {
     switch(status) {
       case 'AVAILABLE': return 'bg-white border-slate-200 border-t-4 border-t-emerald-500';
       case 'OCCUPIED': return 'bg-white border-slate-200 border-t-4 border-t-blue-500';
       case 'CLEANING': return 'bg-white border-slate-200 border-t-4 border-t-yellow-500';
       case 'MAINTENANCE': return 'bg-slate-50 border-slate-200 border-t-4 border-t-slate-400 opacity-80';
       default: return 'bg-white';
     }
  };

  const getStatusBadge = (status: BedStatus) => {
    switch(status) {
      case 'AVAILABLE': return <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Available</span>;
      case 'OCCUPIED': return <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Occupied</span>;
      case 'CLEANING': return <span className="text-xs font-bold text-yellow-700 bg-yellow-50 px-2 py-1 rounded-full flex items-center gap-1"><Clock size={12}/> Cleaning</span>;
      case 'MAINTENANCE': return <span className="text-xs font-bold text-slate-600 bg-slate-200 px-2 py-1 rounded-full">Maintenance</span>;
    }
  };

  const patient = bed.patientId ? db.getPatientById(bed.patientId) : null;

  return (
    <div className={`rounded-xl shadow-sm border p-4 flex flex-col justify-between h-48 transition-all hover:shadow-md ${getStatusStyles(bed.status)}`}>
       <div>
         <div className="flex justify-between items-start mb-2">
            <div>
               <h4 className="font-bold text-lg text-slate-800">{bed.roomNumber}</h4>
               <p className="text-xs text-slate-500">{bed.type} Bed</p>
            </div>
            {getStatusBadge(bed.status)}
         </div>
         
         {bed.status === 'OCCUPIED' && patient ? (
           <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
              <p className="font-bold text-sm text-blue-900 truncate">{patient.lastName}, {patient.firstName}</p>
              <p className="text-xs text-blue-700 font-mono">{patient.id}</p>
              {patient.vitalsHistory[0]?.flag === 'CRITICAL' && (
                 <div className="mt-1 flex items-center gap-1 text-[10px] text-red-600 font-bold uppercase animate-pulse">
                    <AlertTriangle size={10} /> Critical
                 </div>
              )}
           </div>
         ) : bed.status === 'AVAILABLE' ? (
            <div className="mt-4 text-center text-slate-400 text-sm">
               Empty
            </div>
         ) : (
            <div className="mt-4 text-center text-slate-400 text-sm italic">
               {bed.status === 'CLEANING' ? 'Housekeeping notified' : 'Out of service'}
            </div>
         )}
       </div>

       <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2 justify-end">
          {bed.status === 'AVAILABLE' && (
             <>
               <button onClick={onMaintenance} className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1">Maintain</button>
               <button onClick={onAssign} className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-md hover:bg-emerald-700 font-medium">Assign</button>
             </>
          )}
          {bed.status === 'OCCUPIED' && (
             <button onClick={onDischarge} className="text-xs bg-white border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 px-3 py-1.5 rounded-md font-medium transition-colors">
               Discharge
             </button>
          )}
          {bed.status === 'CLEANING' && (
             <button onClick={onClean} className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-md hover:bg-emerald-700 font-medium w-full flex items-center justify-center gap-1">
               <CheckCircle size={12} /> Mark Clean
             </button>
          )}
          {bed.status === 'MAINTENANCE' && (
             <button onClick={onClean} className="text-xs bg-slate-600 text-white px-3 py-1.5 rounded-md hover:bg-slate-700 font-medium">
               Reopen
             </button>
          )}
       </div>
    </div>
  );
};
