
import React, { useState, useEffect } from 'react';
import { db } from '../services/database';
import { Patient, PatientStatus, Bed, Ward } from '../types';
import { Search, Plus, FileText, Activity, AlertTriangle, User, Thermometer, Heart, Wind, BedDouble, ArrowRight, XCircle, Save } from 'lucide-react';
import { ClinicalSupport } from './ClinicalSupport';

export const PatientModule: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAdmitModal, setShowAdmitModal] = useState<Patient | null>(null);

  // Load patients on mount and when coming back to list
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
      case PatientStatus.ADMITTED: return 'bg-blue-100 text-blue-800';
      case PatientStatus.EMERGENCY: return 'bg-red-100 text-red-800';
      case PatientStatus.DISCHARGED: return 'bg-gray-100 text-gray-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  if (selectedPatient) {
    return (
      <PatientDetailView patient={selectedPatient} onBack={handleBackToList} />
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Patient Registry</h2>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Register Patient
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or ID..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {['All', 'Admitted', 'Emergency', 'Outpatient'].map(filter => (
               <button key={filter} className="px-3 py-1 text-sm rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600">
                 {filter}
               </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="p-4 font-semibold text-slate-600 border-b border-slate-200">Patient ID</th>
                <th className="p-4 font-semibold text-slate-600 border-b border-slate-200">Name</th>
                <th className="p-4 font-semibold text-slate-600 border-b border-slate-200">Status</th>
                <th className="p-4 font-semibold text-slate-600 border-b border-slate-200">Gender</th>
                <th className="p-4 font-semibold text-slate-600 border-b border-slate-200">Room</th>
                <th className="p-4 font-semibold text-slate-600 border-b border-slate-200">Condition</th>
                <th className="p-4 font-semibold text-slate-600 border-b border-slate-200">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => handlePatientClick(patient)}>
                  <td className="p-4 text-slate-500 font-mono text-sm">{patient.id}</td>
                  <td className="p-4 font-medium text-slate-900">
                    {patient.lastName}, {patient.firstName}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{patient.gender}</td>
                  <td className="p-4 text-slate-600">
                    {patient.roomNumber ? (
                      <span className="font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded">{patient.roomNumber}</span>
                    ) : '-'}
                  </td>
                  <td className="p-4 text-slate-600">
                    {patient.diagnosis.length > 0 ? patient.diagnosis[0] : 'Undiagnosed'}
                  </td>
                  <td className="p-4">
                     <div className="flex gap-2">
                       {(!patient.bedId && patient.status !== PatientStatus.DISCHARGED) && (
                         <button 
                            onClick={(e) => handleAdmitClick(e, patient)}
                            className="flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-medium text-xs bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded transition-colors"
                          >
                            <BedDouble size={14} /> Assign Bed
                          </button>
                       )}
                       <button className="text-primary-600 hover:text-primary-800 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
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
      
      {/* Add Patient Modal */}
      {showAddForm && (
          <AddPatientModal 
            onClose={() => setShowAddForm(false)}
            onSave={() => {
              refreshPatients();
              setShowAddForm(false);
            }}
          />
      )}

      {/* Admission / Bed Assignment Modal */}
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

// --- Sub-component: Add Patient Modal ---
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
    
    // Simple validation
    if (!formData.firstName || !formData.lastName || !formData.dob) return;

    const newPatient: Patient = {
      id: `P-${Math.floor(Math.random() * 10000) + 1000}`, // Simple ID generation
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
      admissionDate: formData.status === 'ADMITTED' || formData.status === 'EMERGENCY' ? new Date().toISOString() : undefined
    };

    db.addPatient(newPatient);
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800">Register New Patient</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><XCircle size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
              <input required name="firstName" value={formData.firstName} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Last Name *</label>
              <input required name="lastName" value={formData.lastName} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth *</label>
              <input required type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Gender *</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Blood Type</label>
              <select name="bloodType" value={formData.bloodType} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Initial Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                <option value="OUTPATIENT">Outpatient</option>
                <option value="EMERGENCY">Emergency</option>
                <option value="ADMITTED">Admitted</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Known Allergies</label>
              <input name="allergies" placeholder="e.g. Penicillin, Peanuts (comma separated)" value={formData.allergies} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Preliminary Diagnosis / Chief Complaint</label>
              <textarea name="diagnosis" rows={2} placeholder="e.g. Fever, Cough (comma separated)" value={formData.diagnosis} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"></textarea>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 shadow-sm flex items-center gap-2">
              <Save size={18} /> Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Sub-component: Admit Patient Modal ---
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
       <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
          <div className="flex justify-between items-start mb-6">
             <div>
                <h3 className="text-xl font-bold text-slate-800">Admit Patient</h3>
                <p className="text-sm text-slate-500">Assign a bed to start admission.</p>
             </div>
             <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><XCircle size={24} /></button>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg mb-6 border border-slate-100">
             <p className="font-bold text-slate-800">{patient.lastName}, {patient.firstName}</p>
             <div className="flex gap-4 text-xs text-slate-500 mt-1">
                <span>ID: {patient.id}</span>
                <span>Diagnosis: {patient.diagnosis[0] || 'N/A'}</span>
             </div>
          </div>

          <div className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ward / Department</label>
                <select 
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                  value={selectedWardId}
                  onChange={(e) => { setSelectedWardId(e.target.value); setSelectedBedId(''); }}
                >
                  <option value="">Select Ward...</option>
                  {wards.map(w => <option key={w.id} value={w.id}>{w.name} ({w.specialty})</option>)}
                </select>
             </div>

             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Available Bed</label>
                <select 
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white disabled:bg-slate-100 disabled:text-slate-400"
                  value={selectedBedId}
                  onChange={(e) => setSelectedBedId(e.target.value)}
                  disabled={!selectedWardId}
                >
                  <option value="">-- Choose Bed --</option>
                  {filteredBeds.map(b => (
                    <option key={b.id} value={b.id}>{b.roomNumber} - Bed {b.bedNumber} ({b.type})</option>
                  ))}
                </select>
                {selectedWardId && filteredBeds.length === 0 && (
                   <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertTriangle size={12}/> No beds available in this ward.</p>
                )}
             </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
             <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Cancel</button>
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

// --- Sub-component: Patient Detail EMR View ---

const PatientDetailView: React.FC<{ patient: Patient; onBack: () => void }> = ({ patient, onBack }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'VITALS' | 'LABS' | 'AI_ASSIST'>('OVERVIEW');
  const latestVitals = patient.vitalsHistory[0];

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-white rounded-full transition-colors text-slate-500 hover:text-slate-900">
          ← Back
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{patient.firstName} {patient.lastName}</h2>
          <div className="flex gap-4 text-sm text-slate-500">
             <span>ID: {patient.id}</span>
             <span>DOB: {patient.dob}</span>
             <span>Blood: {patient.bloodType}</span>
          </div>
        </div>
        <div className="ml-auto flex gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium text-sm">{patient.status}</span>
            {patient.roomNumber && <span className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full font-medium text-sm">Room {patient.roomNumber}</span>}
        </div>
      </div>

      <div className="flex gap-6 flex-1 overflow-hidden">
        {/* Left Panel: Menu */}
        <div className="w-64 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col p-2">
           {[
             { id: 'OVERVIEW', label: 'Clinical Overview', icon: User },
             { id: 'VITALS', label: 'Vitals History', icon: Activity },
             { id: 'LABS', label: 'Lab Results', icon: FileText },
             { id: 'AI_ASSIST', label: 'Dr. AI Consult', icon: AlertTriangle, special: true },
           ].map(tab => (
             <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors mb-1 ${
                  activeTab === tab.id 
                    ? tab.special ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'bg-primary-50 text-primary-700 border border-primary-100'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
             >
               <tab.icon size={18} />
               <span className="font-medium">{tab.label}</span>
             </button>
           ))}
        </div>

        {/* Right Panel: Content */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-y-auto">
           {activeTab === 'OVERVIEW' && (
             <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                   <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                      <h4 className="text-red-800 font-semibold mb-2">Allergies</h4>
                      <ul className="list-disc list-inside text-red-700 text-sm">
                        {patient.allergies.length ? patient.allergies.map(a => <li key={a}>{a}</li>) : <li>No known allergies</li>}
                      </ul>
                   </div>
                   <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <h4 className="text-blue-800 font-semibold mb-2">Diagnosis</h4>
                      <ul className="list-disc list-inside text-blue-700 text-sm">
                        {patient.diagnosis.length ? patient.diagnosis.map(d => <li key={d}>{d}</li>) : <li>Pending diagnosis</li>}
                      </ul>
                   </div>
                   <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <h4 className="text-slate-800 font-semibold mb-2">Assigned Team</h4>
                      <p className="text-slate-600 text-sm">Dr. Gregory House</p>
                      <p className="text-slate-500 text-xs">Primary Care</p>
                   </div>
                </div>

                <div className="border-t border-slate-100 pt-6">
                    <h3 className="font-bold text-lg mb-4 text-slate-800">Latest Vitals</h3>
                    <div className="grid grid-cols-4 gap-4">
                        {[
                           { label: 'Heart Rate', value: `${latestVitals?.heartRate || '--'} bpm`, icon: Heart, color: 'text-rose-500' },
                           { label: 'Blood Pressure', value: `${latestVitals?.bpSystolic}/${latestVitals?.bpDiastolic}`, icon: Activity, color: 'text-blue-500' },
                           { label: 'Temperature', value: `${latestVitals?.temperature || '--'} °C`, icon: Thermometer, color: 'text-orange-500' },
                           { label: 'SpO2', value: `${latestVitals?.spo2 || '--'}%`, icon: Wind, color: 'text-cyan-500' },
                        ].map((v, i) => (
                           <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                               <v.icon className={v.color} size={24} />
                               <div>
                                  <p className="text-xs text-slate-500 uppercase font-bold">{v.label}</p>
                                  <p className="text-xl font-mono font-semibold text-slate-800">{v.value}</p>
                               </div>
                           </div>
                        ))}
                    </div>
                </div>
             </div>
           )}

           {activeTab === 'VITALS' && (
             <div>
                <h3 className="font-bold text-lg mb-4">Vitals History</h3>
                <table className="w-full text-sm text-left">
                   <thead className="bg-slate-50">
                     <tr>
                       <th className="p-3">Timestamp</th>
                       <th className="p-3">HR (bpm)</th>
                       <th className="p-3">BP (mmHg)</th>
                       <th className="p-3">Temp (°C)</th>
                       <th className="p-3">SpO2 (%)</th>
                     </tr>
                   </thead>
                   <tbody>
                      {patient.vitalsHistory.map((v, i) => (
                        <tr key={i} className="border-b border-slate-50">
                           <td className="p-3 font-mono">{new Date(v.date).toLocaleString()}</td>
                           <td className="p-3">{v.heartRate}</td>
                           <td className="p-3">{v.bpSystolic}/{v.bpDiastolic}</td>
                           <td className="p-3">{v.temperature}</td>
                           <td className="p-3">{v.spo2}</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
           )}

           {activeTab === 'LABS' && (
             <div>
               <h3 className="font-bold text-lg mb-4">Laboratory Results</h3>
               <div className="space-y-3">
                 {patient.labResults.length > 0 ? patient.labResults.map(lab => (
                   <div key={lab.id} className="border border-slate-200 p-4 rounded-lg flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-slate-800">{lab.testName}</h4>
                        <p className="text-sm text-slate-500">{new Date(lab.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                         <span className={`inline-block px-2 py-1 text-xs rounded-full font-bold mb-1 ${lab.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                           {lab.status}
                         </span>
                         {lab.result && <p className="font-mono text-sm">{lab.result}</p>}
                      </div>
                   </div>
                 )) : <p className="text-slate-400 italic">No lab results found.</p>}
               </div>
             </div>
           )}

           {activeTab === 'AI_ASSIST' && (
              <ClinicalSupport patient={patient} />
           )}
        </div>
      </div>
    </div>
  );
};
