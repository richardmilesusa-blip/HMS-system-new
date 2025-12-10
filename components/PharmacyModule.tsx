
import React, { useState, useEffect } from 'react';
import { db } from '../services/database';
import { Medication, Prescription, PrescriptionStatus, MedicationType } from '../types';
import { Pill, AlertTriangle, CheckCircle, Search, Clock, FileText, RefreshCw, XCircle, Plus } from 'lucide-react';

export const PharmacyModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PRESCRIPTIONS' | 'INVENTORY'>('PRESCRIPTIONS');

  return (
    <div className="space-y-6 h-full flex flex-col animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Pharmacy & Inventory</h2>
          <p className="text-slate-500 dark:text-slate-400">Dispense prescriptions and manage medical stock.</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('PRESCRIPTIONS')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'PRESCRIPTIONS' ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            Prescriptions
          </button>
          <button
            onClick={() => setActiveTab('INVENTORY')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'INVENTORY' ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            Inventory
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'PRESCRIPTIONS' ? <PrescriptionList /> : <InventoryList />}
      </div>
    </div>
  );
};

const PrescriptionList: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | PrescriptionStatus>('ALL');

  const refreshData = () => {
    setPrescriptions(db.getPrescriptions());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleDispense = (id: string) => {
    const result = db.dispensePrescription(id);
    if (result.success) {
      refreshData();
    } else {
      alert(result.message);
    }
  };

  const filtered = prescriptions.filter(p => {
    const patient = db.getPatientById(p.patientId);
    const matchesSearch = patient 
      ? (patient.firstName + ' ' + patient.lastName).toLowerCase().includes(searchTerm.toLowerCase())
      : false;
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
           <input 
             type="text" 
             placeholder="Search by patient name..." 
             className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
        <div className="flex gap-2">
           {['ALL', 'PENDING', 'DISPENSED'].map((status) => (
             <button
               key={status}
               onClick={() => setStatusFilter(status as any)}
               className={`px-3 py-1 text-sm rounded-full border ${
                 statusFilter === status 
                   ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800 font-medium' 
                   : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
               }`}
             >
               {status.charAt(0) + status.slice(1).toLowerCase()}
             </button>
           ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-1">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 p-3">
            {filtered.map(p => {
              const patient = db.getPatientById(p.patientId);
              const doctor = db.getDoctors().find(d => d.id === p.doctorId);
              const med = db.getMedications().find(m => m.id === p.medicationId);

              return (
                <div key={p.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                   <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                         <h4 className="font-bold text-slate-800 dark:text-white">{patient?.lastName}, {patient?.firstName}</h4>
                         <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">{p.id}</span>
                      </div>
                      <p className="text-sm font-medium text-primary-700 dark:text-primary-400 flex items-center gap-1">
                         <Pill size={14} /> {med?.name} {med?.strength}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Dosage: {p.dosage} • Qty: {p.quantity}</p>
                      {p.notes && (
                        <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 text-xs rounded border border-yellow-100 dark:border-yellow-900/50 flex gap-2 items-start">
                          <FileText size={12} className="mt-0.5 flex-shrink-0" />
                          <span>Note: {p.notes}</span>
                        </div>
                      )}
                      <p className="text-xs text-slate-400 mt-2">Dr. {doctor?.name}</p>
                   </div>
                   
                   <div className="flex flex-col items-end gap-2">
                      {p.status === 'PENDING' ? (
                        <div className="flex items-center gap-2">
                           <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 rounded-full flex items-center gap-1">
                             <Clock size={12} /> Pending
                           </span>
                           <button 
                             onClick={() => handleDispense(p.id)}
                             className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-md hover:bg-emerald-700 font-medium transition-colors"
                           >
                             Dispense Now
                           </button>
                        </div>
                      ) : (
                        <div className="text-right">
                           <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full flex items-center gap-1 mb-1 justify-end">
                             <CheckCircle size={12} /> Dispensed
                           </span>
                           <span className="text-[10px] text-slate-400 block">
                             {p.dispensedAt && new Date(p.dispensedAt).toLocaleString()}
                           </span>
                        </div>
                      )}
                   </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
             <FileText size={48} className="mb-4 opacity-50" />
             <p>No prescriptions found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const InventoryList: React.FC = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const refreshData = () => {
    setMedications(db.getMedications());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const filtered = medications.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.genericName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-wrap justify-between items-center gap-4">
         <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
               type="text" 
               placeholder="Search inventory..." 
               className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="flex gap-2">
            <button 
               onClick={() => setShowAddModal(true)}
               className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium transition-colors"
            >
               <Plus size={16} /> Add Medication
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white dark:text-slate-200 rounded-lg hover:bg-slate-700 dark:hover:bg-slate-600 text-sm font-medium transition-colors border border-transparent dark:border-slate-600">
               <RefreshCw size={16} /> Reorder Stock
            </button>
         </div>
      </div>

      {/* Table */}
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
         <div className="overflow-auto flex-1">
           <table className="w-full text-left border-collapse">
             <thead className="bg-slate-50 dark:bg-slate-700 sticky top-0 z-10">
               <tr>
                 <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600">Name</th>
                 <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600">Type</th>
                 <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600">Strength</th>
                 <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600 text-center">Stock</th>
                 <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600">Expiry</th>
                 <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600 text-right">Unit Price</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
               {filtered.map(med => {
                 const isLowStock = med.stock <= med.reorderLevel;
                 return (
                   <tr key={med.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                     <td className="p-4">
                        <div className="font-bold text-slate-800 dark:text-white">{med.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 italic">{med.genericName}</div>
                     </td>
                     <td className="p-4">
                        <span className="text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">{med.type}</span>
                     </td>
                     <td className="p-4 text-slate-600 dark:text-slate-300 font-mono text-sm">{med.strength}</td>
                     <td className="p-4 text-center">
                        <span className={`font-bold px-2 py-1 rounded-full text-sm ${
                           isLowStock ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                        }`}>
                           {med.stock}
                        </span>
                        {isLowStock && <div className="text-[10px] text-red-500 mt-1 font-bold flex items-center justify-center gap-1"><AlertTriangle size={10} /> Low Stock</div>}
                     </td>
                     <td className="p-4 text-slate-600 dark:text-slate-300 text-sm">{med.expiryDate}</td>
                     <td className="p-4 text-right font-mono text-slate-800 dark:text-slate-200">${med.unitPrice.toFixed(2)}</td>
                   </tr>
                 );
               })}
             </tbody>
           </table>
         </div>
      </div>

      {showAddModal && (
        <AddMedicationModal 
          onClose={() => setShowAddModal(false)}
          onSave={() => {
            refreshData();
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
};

const AddMedicationModal: React.FC<{ onClose: () => void; onSave: () => void; }> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Medication>>({
    type: 'TABLET',
    expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'stock' || name === 'reorderLevel' || name === 'unitPrice' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMed: Medication = {
      id: `M-${Date.now()}`,
      name: formData.name!,
      genericName: formData.genericName!,
      type: formData.type as MedicationType,
      strength: formData.strength!,
      stock: formData.stock!,
      reorderLevel: formData.reorderLevel!,
      unitPrice: formData.unitPrice!,
      expiryDate: formData.expiryDate!,
      manufacturer: formData.manufacturer!,
    };
    db.addMedication(newMed);
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
       <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl p-6 animate-in fade-in zoom-in duration-200 border dark:border-slate-700">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-xl font-bold text-slate-800 dark:text-white">Add New Medication</h3>
             <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><XCircle size={24} /></button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Brand Name</label>
                  <input required name="name" onChange={handleChange} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 dark:bg-slate-700 dark:text-white" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Generic Name</label>
                  <input required name="genericName" onChange={handleChange} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 dark:bg-slate-700 dark:text-white" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                  <select name="type" value={formData.type} onChange={handleChange} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 dark:bg-slate-700 dark:text-white">
                     <option value="TABLET">Tablet</option>
                     <option value="CAPSULE">Capsule</option>
                     <option value="SYRUP">Syrup</option>
                     <option value="INJECTION">Injection</option>
                     <option value="CREAM">Cream</option>
                     <option value="DROPS">Drops</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Strength</label>
                  <input required name="strength" placeholder="e.g. 500mg" onChange={handleChange} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 dark:bg-slate-700 dark:text-white" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Initial Stock</label>
                  <input required type="number" name="stock" onChange={handleChange} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 dark:bg-slate-700 dark:text-white" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reorder Level</label>
                  <input required type="number" name="reorderLevel" onChange={handleChange} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 dark:bg-slate-700 dark:text-white" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Unit Price ($)</label>
                  <input required type="number" step="0.01" name="unitPrice" onChange={handleChange} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 dark:bg-slate-700 dark:text-white" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Expiry Date</label>
                  <input required type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 dark:bg-slate-700 dark:text-white" />
               </div>
               <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Manufacturer</label>
                  <input required name="manufacturer" onChange={handleChange} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 dark:bg-slate-700 dark:text-white" />
               </div>
             </div>

             <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700 mt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 shadow-sm">Save Medication</button>
             </div>
          </form>
       </div>
    </div>
  );
};
