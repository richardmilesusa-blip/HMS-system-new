
import React, { useState, useEffect } from 'react';
import { db } from '../services/database';
import { Patient, PatientStatus, Bed, Ward, ProgressNote, TreatmentPlan, Prescription, UserRole, Vitals } from '../types';
import { hasPermission } from '../utils/permissions';
import { Search, Plus, FileText, Activity, AlertTriangle, User, Thermometer, Heart, Wind, BedDouble, ArrowRight, XCircle, Save, Lock, Edit2, CreditCard, Stethoscope, Pill, Clipboard, Microscope, Image, Clock, History } from 'lucide-react';
import { ClinicalSupport } from './ClinicalSupport';

export const PatientModule: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAdmitModal, setShowAdmitModal] = useState<Patient | null>(null);

  const currentUser = db.getCurrentUser();
  const canRegister = hasPermission(currentUser.role, 'REGISTER_PATIENT');

  useEffect(() => {
    refreshPatients();
  }, [selectedPatient]);

  const refreshPatients = () => {
    setPatients(db.getPatients());
  };

  const filteredPatients = patients.filter(p => 
    p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePatientClick = (p: Patient) => {
    setSelectedPatient(p);
  };

  const handleBackToList = () => {
    setSelectedPatient(null);
  };

  const handleAdmitClick = (e: React.MouseEvent, p: Patient) => {
    e.stopPropagation();
    setShowAdmitModal(p);
  };

  const getStatusColor = (status: PatientStatus) => {
    switch (status) {
      case PatientStatus.ADMITTED: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200';
      case PatientStatus.EMERGENCY: return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200';
      case PatientStatus.DISCHARGED: return 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300';
      default: return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200';
    }
  };

  if (selectedPatient) {
    return (
      <PatientDetailView patient={selectedPatient} onBack={handleBackToList} />
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Patient Registry</h2>
        {canRegister && (
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus size={18} />
            Register Patient
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or ID..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {['All', 'Admitted', 'Emergency', 'Outpatient'].map(filter => (
               <button key={filter} className="px-3 py-1 text-sm rounded-full border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors">
                 {filter}
               </button>
            ))}
          </div>
        </div>

        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-700 sticky top-0 z-10">
              <tr>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600">Patient ID</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600">Name</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600">Status</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600">Gender</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600">Room</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600">Condition</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group" onClick={() => handlePatientClick(patient)}>
                  <td className="p-4 text-slate-500 dark:text-slate-400 font-mono text-sm">{patient.id}</td>
                  <td className="p-4 font-medium text-slate-900 dark:text-slate-100">
                    {patient.lastName}, {patient.firstName}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">{patient.gender}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">
                    {patient.roomNumber ? (
                      <span className="font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-600 px-2 py-1 rounded">{patient.roomNumber}</span>
                    ) : '-'}
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">
                    {patient.diagnosis.length > 0 ? patient.diagnosis[0] : 'Undiagnosed'}
                  </td>
                  <td className="p-4">
                     <div className="flex gap-2">
                       {(!patient.bedId && patient.status !== PatientStatus.DISCHARGED) && hasPermission(currentUser.role, 'MANAGE_BEDS') && (
                         <button 
                            onClick={(e) => handleAdmitClick(e, patient)}
                            className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200 font-medium text-xs bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 px-2 py-1 rounded transition-colors"
                          >
                            <BedDouble size={14} /> Assign Bed
                          </button>
                       )}
                       <button className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                         View
                       </button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {showAddForm && (
          <AddPatientModal 
            onClose={() => setShowAddForm(false)}
            onSave={() => {
              refreshPatients();
              setShowAddForm(false);
            }}
          />
      )}

      {showAdmitModal && (
        <AdmitPatientModal 
          patient={showAdmitModal} 
          onClose={() => setShowAdmitModal(null)} 
          onConfirm={() => {
            refreshPatients();
            setShowAdmitModal(null);
          }}
        />
      )}
    </div>
  );
};

const AddPatientModal: React.FC<{ onClose: () => void; onSave: () => void }> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: 'Male',
    bloodType: '',
    status: 'OUTPATIENT',
    allergies: '',
    diagnosis: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.dob) return;

    const newPatient: Patient = {
      id: `P-${Math.floor(Math.random() * 10000) + 1000}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      dob: formData.dob,
      gender: formData.gender as any,
      status: formData.status as PatientStatus,
      bloodType: formData.bloodType || 'Unknown',
      allergies: formData.allergies ? formData.allergies.split(',').map(s => s.trim()) : [],
      diagnosis: formData.diagnosis ? formData.diagnosis.split(',').map(s => s.trim()) : [],
      vitalsHistory: [],
      labResults: [],
      progressNotes: [],
      admissionDate: formData.status === 'ADMITTED' || formData.status === 'EMERGENCY' ? new Date().toISOString() : undefined
    };

    db.addPatient(newPatient);
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full p-6 animate-in fade-in zoom-in duration-200 border dark:border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Register New Patient</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><XCircle size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">First Name *</label>
              <input required name="firstName" value={formData.firstName} onChange={handleChange} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 dark:bg-slate-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name *</label>
              <input required name="lastName" value={formData.lastName} onChange={handleChange} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 dark:bg-slate-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date of Birth *</label>
              <input required type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 dark:bg-slate-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Gender *</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 dark:bg-slate-700 dark:text-white">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Blood Type</label>
              <select name="bloodType" value={formData.bloodType} onChange={handleChange} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 dark:bg-slate-700 dark:text-white">
                <option value="">Unknown</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Initial Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 dark:bg-slate-700 dark:text-white">
                <option value="OUTPATIENT">Outpatient</option>
                <option value="EMERGENCY">Emergency</option>
                <option value="ADMITTED">Admitted</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Known Allergies</label>
              <input name="allergies" placeholder="e.g. Penicillin, Peanuts (comma separated)" value={formData.allergies} onChange={handleChange} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 dark:bg-slate-700 dark:text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Preliminary Diagnosis / Chief Complaint</label>
              <textarea name="diagnosis" rows={2} placeholder="e.g. Fever, Cough (comma separated)" value={formData.diagnosis} onChange={handleChange} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none bg-white text-slate-900 dark:bg-slate-700 dark:text-white"></textarea>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 shadow-sm flex items-center gap-2">
              <Save size={18} /> Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdmitPatientModal: React.FC<{ patient: Patient; onClose: () => void; onConfirm: () => void }> = ({ patient, onClose, onConfirm }) => {
  const [availableBeds, setAvailableBeds] = useState<Bed[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedWardId, setSelectedWardId] = useState<string>('');
  const [selectedBedId, setSelectedBedId] = useState<string>('');

  useEffect(() => {
    setAvailableBeds(db.getAvailableBeds());
    setWards(db.getWards());
  }, []);

  const handleConfirm = () => {
    if (selectedBedId) {
      db.assignPatientToBed(patient.id, selectedBedId);
      onConfirm();
    }
  };

  const filteredBeds = selectedWardId 
    ? availableBeds.filter(b => b.wardId === selectedWardId)
    : availableBeds;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
       <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200 border dark:border-slate-700">
          <div className="flex justify-between items-start mb-6">
             <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Admit Patient</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Assign a bed to start admission.</p>
             </div>
             <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><XCircle size={24} /></button>
          </div>

          <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg mb-6 border border-slate-100 dark:border-slate-600">
             <p className="font-bold text-slate-800 dark:text-slate-100">{patient.lastName}, {patient.firstName}</p>
             <div className="flex gap-4 text-xs text-slate-500 dark:text-slate-300 mt-1">
                <span>ID: {patient.id}</span>
                <span>Diagnosis: {patient.diagnosis[0] || 'N/A'}</span>
             </div>
          </div>

          <div className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ward / Department</label>
                <select 
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 dark:bg-slate-700 dark:text-white"
                  value={selectedWardId}
                  onChange={(e) => { setSelectedWardId(e.target.value); setSelectedBedId(''); }}
                >
                  <option value="">Select Ward...</option>
                  {wards.map(w => <option key={w.id} value={w.id}>{w.name} ({w.specialty})</option>)}
                </select>
             </div>

             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Available Bed</label>
                <select 
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 dark:bg-slate-700 dark:text-white disabled:bg-slate-100 dark:disabled:bg-slate-600 disabled:text-slate-400"
                  value={selectedBedId}
                  onChange={(e) => setSelectedBedId(e.target.value)}
                  disabled={!selectedWardId}
                >
                  <option value="">-- Choose Bed --</option>
                  {filteredBeds.map(b => (
                    <option key={b.id} value={b.id}>{b.roomNumber} - Bed {b.bedNumber} ({b.type})</option>
                  ))}
                </select>
             </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
             <button onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium">Cancel</button>
             <button 
                onClick={handleConfirm}
                disabled={!selectedBedId}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
             >
                <BedDouble size={18} />
                Confirm Admission
             </button>
          </div>
       </div>
    </div>
  );
};

const RecordVitalsModal: React.FC<{ initialData?: Vitals; onClose: () => void; onSave: (vitals: Vitals) => void }> = ({ initialData, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    date: initialData ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0],
    time: initialData ? initialData.date.split('T')[1]?.substring(0, 5) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    heartRate: initialData ? String(initialData.heartRate) : '',
    bpSystolic: initialData ? String(initialData.bpSystolic) : '',
    bpDiastolic: initialData ? String(initialData.bpDiastolic) : '',
    temperature: initialData ? String(initialData.temperature) : '',
    spo2: initialData ? String(initialData.spo2) : '',
    respRate: initialData ? String(initialData.respRate) : ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const vitals: Vitals = {
        id: initialData?.id, // Preserve ID if editing
        date: `${formData.date}T${formData.time}`,
        heartRate: Number(formData.heartRate),
        bpSystolic: Number(formData.bpSystolic),
        bpDiastolic: Number(formData.bpDiastolic),
        temperature: Number(formData.temperature),
        spo2: Number(formData.spo2),
        respRate: Number(formData.respRate),
        recordedBy: initialData?.recordedBy || db.getCurrentUser().name,
        flag: (Number(formData.spo2) < 95 || Number(formData.heartRate) > 100 || Number(formData.temperature) > 38) ? 'ABNORMAL' : 'NORMAL'
    };
    if (vitals.spo2 < 90 || vitals.heartRate > 120 || vitals.heartRate < 50) vitals.flag = 'CRITICAL';
    
    onSave(vitals);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in duration-200 border dark:border-slate-700">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">{initialData ? 'Edit Vitals' : 'Record Vitals'}</h3>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><XCircle size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div>
                       <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                       <input required type="date" name="date" value={formData.date} onChange={handleChange} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 dark:bg-slate-700 dark:text-white" />
                   </div>
                   <div>
                       <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Time</label>
                       <input required type="time" name="time" value={formData.time} onChange={handleChange} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 dark:bg-slate-700 dark:text-white" />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                       <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Heart Rate (bpm)</label>
                       <input required type="number" name="heartRate" placeholder="e.g. 72" value={formData.heartRate} onChange={handleChange} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 dark:bg-slate-700 dark:text-white" />
                   </div>
                   <div>
                       <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Temp (°C)</label>
                       <input required type="number" step="0.1" name="temperature" placeholder="e.g. 36.5" value={formData.temperature} onChange={handleChange} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 dark:bg-slate-700 dark:text-white" />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                       <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">BP Systolic</label>
                       <input required type="number" name="bpSystolic" placeholder="e.g. 120" value={formData.bpSystolic} onChange={handleChange} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 dark:bg-slate-700 dark:text-white" />
                   </div>
                   <div>
                       <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">BP Diastolic</label>
                       <input required type="number" name="bpDiastolic" placeholder="e.g. 80" value={formData.bpDiastolic} onChange={handleChange} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 dark:bg-slate-700 dark:text-white" />
                   </div>
                </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div>
                       <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">SpO2 (%)</label>
                       <input required type="number" name="spo2" placeholder="e.g. 98" value={formData.spo2} onChange={handleChange} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 dark:bg-slate-700 dark:text-white" />
                   </div>
                   <div>
                       <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Resp. Rate</label>
                       <input required type="number" name="respRate" placeholder="e.g. 16" value={formData.respRate} onChange={handleChange} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 dark:bg-slate-700 dark:text-white" />
                   </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700 mt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
                    <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 shadow-sm flex items-center gap-2">
                      <Save size={18} /> {initialData ? 'Update Vitals' : 'Save Vitals'}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};

const VitalsHistoryModal: React.FC<{ patient: Patient; onClose: () => void; onEdit: (vitals: Vitals) => void }> = ({ patient, onClose, onEdit }) => {
    const currentUser = db.getCurrentUser();
    const canEdit = hasPermission(currentUser.role, 'ADD_VITALS');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-4xl w-full p-6 animate-in fade-in zoom-in duration-200 border dark:border-slate-700 h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Vitals History</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Past recordings for {patient.lastName}, {patient.firstName}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><XCircle size={24} /></button>
                </div>

                <div className="flex-1 overflow-auto border rounded-lg border-slate-200 dark:border-slate-700">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-700 sticky top-0">
                            <tr>
                                <th className="p-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Date/Time</th>
                                <th className="p-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">HR</th>
                                <th className="p-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">BP</th>
                                <th className="p-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Temp</th>
                                <th className="p-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">SpO2</th>
                                <th className="p-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">RR</th>
                                <th className="p-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Recorded By</th>
                                <th className="p-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {patient.vitalsHistory.map((v) => (
                                <tr key={v.id || v.date} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <td className="p-3 text-sm text-slate-700 dark:text-slate-300 font-mono">
                                        {new Date(v.date).toLocaleDateString()} <span className="text-slate-400">|</span> {new Date(v.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </td>
                                    <td className="p-3 text-sm font-medium text-slate-800 dark:text-white">{v.heartRate}</td>
                                    <td className="p-3 text-sm font-medium text-slate-800 dark:text-white">{v.bpSystolic}/{v.bpDiastolic}</td>
                                    <td className="p-3 text-sm font-medium text-slate-800 dark:text-white">{v.temperature}</td>
                                    <td className="p-3 text-sm font-medium text-slate-800 dark:text-white">{v.spo2}%</td>
                                    <td className="p-3 text-sm font-medium text-slate-800 dark:text-white">{v.respRate}</td>
                                    <td className="p-3 text-sm text-slate-500 dark:text-slate-400">{v.recordedBy || 'Unknown'}</td>
                                    <td className="p-3 text-right">
                                        {canEdit && (
                                            <button 
                                                onClick={() => onEdit(v)}
                                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                                title="Edit Entry"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const PatientDetailView: React.FC<{ patient: Patient; onBack: () => void }> = ({ patient, onBack }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'NOTES' | 'ORDERS' | 'PLAN' | 'IMAGING' | 'AI_ASSIST'>('OVERVIEW');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingId, setIsEditingId] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [showPrescribeModal, setShowPrescribeModal] = useState(false);
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [showVitalsHistory, setShowVitalsHistory] = useState(false);
  const [editingVital, setEditingVital] = useState<Vitals | undefined>(undefined);

  const currentUser = db.getCurrentUser();
  const canEditDemographics = hasPermission(currentUser.role, 'EDIT_PATIENT_DEMOGRAPHICS');
  const canManageId = hasPermission(currentUser.role, 'MANAGE_PATIENT_ID');
  const canViewEMR = hasPermission(currentUser.role, 'VIEW_EMR_CLINICAL_DETAILS');
  const canAddNote = hasPermission(currentUser.role, 'ADD_PROGRESS_NOTE');
  const canAddVitals = hasPermission(currentUser.role, 'ADD_VITALS');
  const canPrescribe = hasPermission(currentUser.role, 'PRESCRIBE_MEDICATION');
  const canEditPlan = hasPermission(currentUser.role, 'EDIT_TREATMENT_PLAN');

  const [editForm, setEditForm] = useState({
      firstName: patient.firstName,
      lastName: patient.lastName,
      dob: patient.dob,
      bloodType: patient.bloodType
  });
  const [newId, setNewId] = useState(patient.id);

  const latestVitals = patient.vitalsHistory[0];

  const handleSaveDemographics = () => {
      const updated = { ...patient, ...editForm };
      db.updatePatient(updated);
      setIsEditing(false);
  };
  
  const handleSaveId = () => {
     if (newId !== patient.id) {
         const updated = { ...patient, id: newId };
         db.updatePatient(updated);
         setIsEditingId(false);
     }
  };

  const handleAddNote = () => {
    if (!noteContent.trim()) return;
    const newNote: ProgressNote = {
      id: `N-${Date.now()}`,
      date: new Date().toISOString(),
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      content: noteContent,
      type: currentUser.role === 'DOCTOR' ? 'PHYSICIAN' : 'NURSING'
    };
    db.addProgressNote(patient.id, newNote);
    setNoteContent('');
  };

  const handleSaveVitals = (vitals: Vitals) => {
     if (vitals.id) {
        db.updateVitals(patient.id, vitals);
     } else {
        db.addVitals(patient.id, vitals);
     }
     setShowVitalsModal(false);
     setEditingVital(undefined);
  };

  const openEditVital = (vitals: Vitals) => {
      setEditingVital(vitals);
      setShowVitalsHistory(false);
      setShowVitalsModal(true);
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
          ← Back
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
             <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{patient.firstName} {patient.lastName}</h2>
             {canEditDemographics && !isEditing && (
                 <button onClick={() => setIsEditing(true)} className="p-1 text-slate-400 hover:text-primary-600 transition-colors" title="Edit Demographics">
                    <Edit2 size={16} />
                 </button>
             )}
          </div>
          
          <div className="flex gap-4 text-sm text-slate-500 dark:text-slate-400 items-center mt-1">
             {isEditingId ? (
                 <div className="flex items-center gap-2">
                    <input value={newId} onChange={(e) => setNewId(e.target.value)} className="border rounded px-2 py-0.5 text-xs text-black" />
                    <button onClick={handleSaveId} className="text-xs bg-green-600 text-white px-2 py-0.5 rounded">Save</button>
                    <button onClick={() => setIsEditingId(false)} className="text-xs bg-slate-400 text-white px-2 py-0.5 rounded">Cancel</button>
                 </div>
             ) : (
                <div className="flex items-center gap-2 group">
                    <CreditCard size={14} />
                    <span className="font-mono">ID: {patient.id}</span>
                    {canManageId && (
                        <button onClick={() => setIsEditingId(true)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 transition-opacity">
                            <Edit2 size={12} />
                        </button>
                    )}
                </div>
             )}
             <span>DOB: {patient.dob}</span>
             <span>Blood: {patient.bloodType}</span>
          </div>
        </div>
        <div className="ml-auto flex gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 rounded-full font-medium text-sm">{patient.status}</span>
            {patient.roomNumber && <span className="px-3 py-1 bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 rounded-full font-medium text-sm">Room {patient.roomNumber}</span>}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
        {/* Left Panel: Menu */}
        <div className="w-full lg:w-64 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-row lg:flex-col p-2 overflow-x-auto lg:overflow-visible">
           <button onClick={() => setActiveTab('OVERVIEW')} className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors whitespace-nowrap lg:whitespace-normal mb-0 lg:mb-1 mr-2 lg:mr-0 ${activeTab === 'OVERVIEW' ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
              <User size={18} /><span className="font-medium">Overview</span>
           </button>
           
           {canViewEMR && (
             <>
               <button onClick={() => setActiveTab('NOTES')} className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors whitespace-nowrap lg:whitespace-normal mb-0 lg:mb-1 mr-2 lg:mr-0 ${activeTab === 'NOTES' ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                  <Clipboard size={18} /><span className="font-medium">Progress Notes</span>
               </button>
               <button onClick={() => setActiveTab('ORDERS')} className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors whitespace-nowrap lg:whitespace-normal mb-0 lg:mb-1 mr-2 lg:mr-0 ${activeTab === 'ORDERS' ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                  <Pill size={18} /><span className="font-medium">Orders & Meds</span>
               </button>
               <button onClick={() => setActiveTab('PLAN')} className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors whitespace-nowrap lg:whitespace-normal mb-0 lg:mb-1 mr-2 lg:mr-0 ${activeTab === 'PLAN' ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                  <Stethoscope size={18} /><span className="font-medium">Treatment Plan</span>
               </button>
               <button onClick={() => setActiveTab('IMAGING')} className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors whitespace-nowrap lg:whitespace-normal mb-0 lg:mb-1 mr-2 lg:mr-0 ${activeTab === 'IMAGING' ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                  <Image size={18} /><span className="font-medium">Imaging</span>
               </button>
               <button onClick={() => setActiveTab('AI_ASSIST')} className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors whitespace-nowrap lg:whitespace-normal mb-0 lg:mb-1 mr-2 lg:mr-0 ${activeTab === 'AI_ASSIST' ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                  <AlertTriangle size={18} /><span className="font-medium">Dr. AI Consult</span>
               </button>
             </>
           )}
        </div>

        {/* Right Panel: Content */}
        <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 overflow-y-auto">
           {activeTab === 'OVERVIEW' && (
             <div className="space-y-6">
                {isEditing ? (
                    <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-lg border border-slate-200 dark:border-slate-600 mb-4">
                        <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-white">Edit Demographics</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">First Name</label>
                                <input value={editForm.firstName} onChange={e => setEditForm({...editForm, firstName: e.target.value})} className="w-full p-2 rounded border" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Last Name</label>
                                <input value={editForm.lastName} onChange={e => setEditForm({...editForm, lastName: e.target.value})} className="w-full p-2 rounded border" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Date of Birth</label>
                                <input type="date" value={editForm.dob} onChange={e => setEditForm({...editForm, dob: e.target.value})} className="w-full p-2 rounded border" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Blood Type</label>
                                <input value={editForm.bloodType} onChange={e => setEditForm({...editForm, bloodType: e.target.value})} className="w-full p-2 rounded border" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setIsEditing(false)} className="px-3 py-1 bg-slate-200 text-slate-700 rounded">Cancel</button>
                            <button onClick={handleSaveDemographics} className="px-3 py-1 bg-primary-600 text-white rounded">Save Changes</button>
                        </div>
                    </div>
                ) : null}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/50">
                      <h4 className="text-red-800 dark:text-red-300 font-semibold mb-2">Allergies</h4>
                      <ul className="list-disc list-inside text-red-700 dark:text-red-200 text-sm">
                        {patient.allergies.length ? patient.allergies.map(a => <li key={a}>{a}</li>) : <li>No known allergies</li>}
                      </ul>
                   </div>
                   <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/50">
                      <h4 className="text-blue-800 dark:text-blue-300 font-semibold mb-2">Diagnosis</h4>
                      <ul className="list-disc list-inside text-blue-700 dark:text-blue-200 text-sm">
                        {patient.diagnosis.length ? patient.diagnosis.map(d => <li key={d}>{d}</li>) : <li>Pending diagnosis</li>}
                      </ul>
                   </div>
                   <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-100 dark:border-slate-700">
                      <h4 className="text-slate-800 dark:text-white font-semibold mb-2">Assigned Team</h4>
                      <p className="text-slate-600 dark:text-slate-300 text-sm">Dr. Gregory House</p>
                      <p className="text-slate-500 dark:text-slate-400 text-xs">Primary Care</p>
                   </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-700 pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white">Latest Vitals</h3>
                        <div className="flex gap-2">
                             <button 
                                onClick={() => setShowVitalsHistory(true)}
                                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center gap-1 transition-colors"
                             >
                                <History size={16} /> History
                             </button>
                             {canAddVitals && (
                                <button 
                                    onClick={() => { setEditingVital(undefined); setShowVitalsModal(true); }}
                                    className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-600 flex items-center gap-1 transition-colors shadow-sm"
                                >
                                    <Plus size={16} /> Record Vitals
                                </button>
                             )}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                           { label: 'Heart Rate', value: `${latestVitals?.heartRate || '--'} bpm`, icon: Heart, color: 'text-rose-500' },
                           { label: 'Blood Pressure', value: `${latestVitals?.bpSystolic ? latestVitals.bpSystolic + '/' + latestVitals.bpDiastolic : '--/--'}`, icon: Activity, color: 'text-blue-500' },
                           { label: 'Temperature', value: `${latestVitals?.temperature || '--'} °C`, icon: Thermometer, color: 'text-orange-500' },
                           { label: 'SpO2', value: `${latestVitals?.spo2 || '--'}%`, icon: Wind, color: 'text-cyan-500' },
                        ].map((v, i) => (
                           <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                               <v.icon className={v.color} size={24} />
                               <div>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">{v.label}</p>
                                  <p className="text-xl font-mono font-semibold text-slate-800 dark:text-white">{v.value}</p>
                               </div>
                           </div>
                        ))}
                    </div>
                </div>
             </div>
           )}

           {activeTab === 'NOTES' && (
             <div className="space-y-6">
               <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white">Clinical Progress Notes</h3>
               </div>
               
               {canAddNote && (
                  <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Add New Note</label>
                      <textarea 
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        placeholder="Type clinical observations here..." 
                        className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 h-24 resize-none bg-white dark:bg-slate-700 dark:text-white mb-2"
                      />
                      <div className="flex justify-end">
                        <button onClick={handleAddNote} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">
                           Sign & Save Note
                        </button>
                      </div>
                  </div>
               )}

               <div className="space-y-4">
                  {patient.progressNotes && patient.progressNotes.length > 0 ? patient.progressNotes.map(note => (
                     <div key={note.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-white dark:bg-slate-800">
                        <div className="flex justify-between items-start mb-2">
                           <div className="flex items-center gap-2">
                              <div className={`p-1.5 rounded-full ${note.type === 'PHYSICIAN' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                 <User size={14} />
                              </div>
                              <div>
                                 <p className="font-bold text-sm text-slate-800 dark:text-white">{note.authorName}</p>
                                 <p className="text-xs text-slate-500 dark:text-slate-400">{note.authorRole} • {new Date(note.date).toLocaleString()}</p>
                              </div>
                           </div>
                           <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full font-mono text-slate-500 dark:text-slate-400">
                              {note.type}
                           </span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap pl-9">
                           {note.content}
                        </p>
                     </div>
                  )) : (
                     <div className="text-center py-8 text-slate-400 dark:text-slate-500 italic">No progress notes recorded.</div>
                  )}
               </div>
             </div>
           )}

           {activeTab === 'ORDERS' && (
             <div className="space-y-6">
                <div className="flex justify-between items-center">
                   <h3 className="font-bold text-lg text-slate-800 dark:text-white">Active Orders & Medications</h3>
                   {canPrescribe && (
                      <button 
                        onClick={() => setShowPrescribeModal(true)}
                        className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm font-medium flex items-center gap-1 hover:bg-primary-700"
                      >
                         <Plus size={16} /> New Prescription
                      </button>
                   )}
                </div>

                <div className="space-y-4">
                   <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-2">Prescriptions</h4>
                   {db.getPrescriptions().filter(p => p.patientId === patient.id).map(rx => (
                      <div key={rx.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-100 dark:border-slate-700">
                         <div>
                            <p className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                               <Pill size={16} className="text-primary-500" />
                               {db.getMedications().find(m => m.id === rx.medicationId)?.name} 
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-300">{rx.dosage}</p>
                         </div>
                         <div className="text-right">
                            <span className={`text-xs px-2 py-1 rounded-full font-bold ${rx.status === 'DISPENSED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{rx.status}</span>
                            <p className="text-xs text-slate-400 mt-1">{new Date(rx.date).toLocaleDateString()}</p>
                         </div>
                      </div>
                   ))}
                </div>

                <div className="space-y-4 mt-6">
                   <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-2">Lab Orders</h4>
                   {patient.labResults.length > 0 ? patient.labResults.map(lab => (
                      <div key={lab.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-100 dark:border-slate-700">
                         <div className="flex items-center gap-3">
                            <Microscope size={20} className="text-indigo-500" />
                            <div>
                               <p className="font-bold text-slate-800 dark:text-white">{lab.testName}</p>
                               <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(lab.date).toLocaleDateString()}</p>
                            </div>
                         </div>
                         <div className="text-right">
                             <span className={`px-2 py-1 text-xs rounded-full font-bold ${lab.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                               {lab.status}
                             </span>
                             {lab.result && <p className="font-mono text-sm text-slate-700 dark:text-slate-300 mt-1">{lab.result}</p>}
                         </div>
                      </div>
                   )) : <p className="text-sm text-slate-400 italic">No recent lab orders.</p>}
                </div>
             </div>
           )}

           {activeTab === 'PLAN' && (
              <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">Treatment Plan</h3>
                    {canEditPlan && (
                       <button className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1">
                          <Edit2 size={14} /> Edit Plan
                       </button>
                    )}
                 </div>

                 {patient.treatmentPlan ? (
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
                       <div className="mb-6">
                          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Primary Diagnosis</h4>
                          <p className="text-xl font-medium text-slate-800 dark:text-white">{patient.treatmentPlan.diagnosis}</p>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div>
                             <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Clinical Goals</h4>
                             <ul className="space-y-2">
                                {patient.treatmentPlan.goals.map((g, i) => (
                                   <li key={i} className="flex items-start gap-2">
                                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"></div>
                                      <span className="text-slate-700 dark:text-slate-300">{g}</span>
                                   </li>
                                ))}
                             </ul>
                          </div>
                          <div>
                             <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Instructions</h4>
                             <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{patient.treatmentPlan.instructions}</p>
                          </div>
                       </div>
                       
                       <div className="text-xs text-slate-400 border-t border-slate-100 dark:border-slate-700 pt-4 flex justify-between">
                          <span>Start Date: {patient.treatmentPlan.startDate}</span>
                          <span>Last Updated: {patient.treatmentPlan.lastUpdated}</span>
                       </div>
                    </div>
                 ) : (
                    <div className="text-center py-12 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-dashed border-slate-300 dark:border-slate-600">
                       <Clipboard size={48} className="mx-auto text-slate-300 dark:text-slate-500 mb-4" />
                       <h4 className="text-lg font-medium text-slate-600 dark:text-slate-300">No Active Treatment Plan</h4>
                       <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mt-2">There is no active treatment plan recorded for this patient. Physicians can create a plan to track clinical goals.</p>
                       {canEditPlan && (
                          <button className="mt-6 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Create Plan</button>
                       )}
                    </div>
                 )}
              </div>
           )}

           {activeTab === 'IMAGING' && (
              <div className="space-y-6">
                 <h3 className="font-bold text-lg text-slate-800 dark:text-white">Imaging Reports (PACS)</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {[1, 2].map((i) => (
                        <div key={i} className="group relative aspect-video bg-black rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                           <div className="absolute inset-0 flex items-center justify-center">
                              <Image size={48} className="text-slate-700" />
                           </div>
                           <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                              <p className="text-white font-bold">Chest X-Ray (PA/Lat)</p>
                              <p className="text-slate-300 text-xs">2023-10-25 • Dr. Radiologist</p>
                           </div>
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                              <button className="px-4 py-2 bg-white text-black rounded-full text-sm font-bold">View Image</button>
                           </div>
                        </div>
                     ))}
                 </div>
                 <p className="text-xs text-slate-400 italic mt-4 text-center">Imaging data is simulated for demonstration purposes.</p>
              </div>
           )}

           {activeTab === 'AI_ASSIST' && (
              <ClinicalSupport patient={patient} />
           )}
        </div>
      </div>
      
      {showVitalsModal && (
         <RecordVitalsModal 
            initialData={editingVital}
            onClose={() => { setShowVitalsModal(false); setEditingVital(undefined); }}
            onSave={handleSaveVitals}
         />
      )}

      {showVitalsHistory && (
          <VitalsHistoryModal 
            patient={patient}
            onClose={() => setShowVitalsHistory(false)}
            onEdit={openEditVital}
          />
      )}
    </div>
  );
};
