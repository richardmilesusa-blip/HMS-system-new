
import { Patient, Doctor, PatientStatus, UserRole, AppState, Ward, Bed, BedStatus, Appointment, AppointmentStatus, Medication, Prescription, PrescriptionStatus, User, AuditLog } from '../types';

const STORAGE_KEY = 'NEXUS_HMS_DB_V2';

// Seed Data
const SEED_PATIENTS: Patient[] = [
  {
    id: 'P-1001',
    firstName: 'Sarah',
    lastName: 'Connor',
    dob: '1984-05-12',
    gender: 'Female',
    status: PatientStatus.ADMITTED,
    bloodType: 'O-',
    allergies: ['Penicillin'],
    diagnosis: ['Hypertension', 'Type 2 Diabetes'],
    roomNumber: '304',
    bedId: 'B-304-A',
    admissionDate: '2023-10-25T10:00:00',
    vitalsHistory: [
      { date: '2023-10-26T08:00', heartRate: 78, bpSystolic: 135, bpDiastolic: 85, temperature: 37.1, spo2: 98, respRate: 16 },
      { date: '2023-10-25T08:00', heartRate: 82, bpSystolic: 140, bpDiastolic: 88, temperature: 37.2, spo2: 97, respRate: 18 }
    ],
    labResults: [
      { id: 'L-501', testName: 'Complete Blood Count', date: '2023-10-25', status: 'COMPLETED', result: 'WBC 11.5 (High)', flag: 'ABNORMAL' },
      { id: 'L-502', testName: 'Lipid Panel', date: '2023-10-25', status: 'PENDING' }
    ]
  },
  {
    id: 'P-1002',
    firstName: 'James',
    lastName: 'Howlett',
    dob: '1970-11-01',
    gender: 'Male',
    status: PatientStatus.EMERGENCY,
    bloodType: 'AB+',
    allergies: [],
    diagnosis: ['Multiple Trauma', 'Lacerations'],
    roomNumber: 'ER-1',
    bedId: 'B-ER-1',
    admissionDate: '2023-10-27T02:30:00',
    vitalsHistory: [
      { date: '2023-10-27T02:35', heartRate: 110, bpSystolic: 90, bpDiastolic: 60, temperature: 36.5, spo2: 94, respRate: 22, flag: 'CRITICAL' }
    ],
    labResults: []
  },
  {
    id: 'P-1003',
    firstName: 'Elena',
    lastName: 'Roslin',
    dob: '1995-02-14',
    gender: 'Female',
    status: PatientStatus.OUTPATIENT,
    bloodType: 'A+',
    allergies: ['Peanuts', 'Latex'],
    diagnosis: ['Seasonal Allergies', 'Mild Asthma'],
    vitalsHistory: [
      { date: '2023-10-20T14:00', heartRate: 72, bpSystolic: 118, bpDiastolic: 75, temperature: 36.8, spo2: 99, respRate: 14 }
    ],
    labResults: []
  }
];

const SEED_DOCTORS: Doctor[] = [
  { id: 'D-001', name: 'Dr. Gregory House', specialty: 'Diagnostician', availability: 'On Call' },
  { id: 'D-002', name: 'Dr. Stephen Strange', specialty: 'Neurosurgeon', availability: 'Available' },
  { id: 'D-003', name: 'Dr. Meredith Grey', specialty: 'General Surgery', availability: 'In Surgery' }
];

const SEED_WARDS: Ward[] = [
  { id: 'W-GEN', name: 'General Ward', specialty: 'General Medicine', floor: 3 },
  { id: 'W-ICU', name: 'Intensive Care Unit', specialty: 'Critical Care', floor: 4 },
  { id: 'W-ER', name: 'Emergency Room', specialty: 'Emergency', floor: 1 }
];

const SEED_BEDS: Bed[] = [
  // General Ward
  { id: 'B-301-A', wardId: 'W-GEN', roomNumber: '301', bedNumber: 'A', type: 'STANDARD', status: 'AVAILABLE' },
  { id: 'B-301-B', wardId: 'W-GEN', roomNumber: '301', bedNumber: 'B', type: 'STANDARD', status: 'AVAILABLE' },
  { id: 'B-302-A', wardId: 'W-GEN', roomNumber: '302', bedNumber: 'A', type: 'STANDARD', status: 'CLEANING' },
  { id: 'B-303-A', wardId: 'W-GEN', roomNumber: '303', bedNumber: 'A', type: 'STANDARD', status: 'MAINTENANCE' },
  { id: 'B-304-A', wardId: 'W-GEN', roomNumber: '304', bedNumber: 'A', type: 'STANDARD', status: 'OCCUPIED', patientId: 'P-1001' },
  { id: 'B-304-B', wardId: 'W-GEN', roomNumber: '304', bedNumber: 'B', type: 'STANDARD', status: 'AVAILABLE' },
  // ICU
  { id: 'B-ICU-1', wardId: 'W-ICU', roomNumber: 'ICU-1', bedNumber: '1', type: 'ICU', status: 'AVAILABLE' },
  { id: 'B-ICU-2', wardId: 'W-ICU', roomNumber: 'ICU-2', bedNumber: '1', type: 'ICU', status: 'AVAILABLE' },
  // ER
  { id: 'B-ER-1', wardId: 'W-ER', roomNumber: 'ER-1', bedNumber: '1', type: 'ER', status: 'OCCUPIED', patientId: 'P-1002' },
  { id: 'B-ER-2', wardId: 'W-ER', roomNumber: 'ER-2', bedNumber: '1', type: 'ER', status: 'AVAILABLE' },
  { id: 'B-ER-3', wardId: 'W-ER', roomNumber: 'ER-3', bedNumber: '1', type: 'ER', status: 'CLEANING' },
];

const today = new Date().toISOString().split('T')[0];
const SEED_APPOINTMENTS: Appointment[] = [
  { 
    id: 'A-100', 
    patientId: 'P-1003', 
    doctorId: 'D-001', 
    date: today, 
    time: '09:00', 
    duration: 30, 
    type: 'CONSULTATION', 
    status: 'SCHEDULED', 
    notes: 'Recurring migraine headaches' 
  },
  { 
    id: 'A-101', 
    patientId: 'P-1001', 
    doctorId: 'D-002', 
    date: today, 
    time: '11:00', 
    duration: 60, 
    type: 'CHECKUP', 
    status: 'CONFIRMED', 
    notes: 'Post-op follow up' 
  },
  { 
    id: 'A-102', 
    patientId: 'P-1002', 
    doctorId: 'D-003', 
    date: today, 
    time: '14:30', 
    duration: 45, 
    type: 'FOLLOW_UP', 
    status: 'SCHEDULED', 
    notes: 'Wound dressing change' 
  }
];

const SEED_MEDICATIONS: Medication[] = [
  { 
    id: 'M-101', name: 'Paracetamol', genericName: 'Acetaminophen', type: 'TABLET', strength: '500mg', 
    stock: 5000, reorderLevel: 1000, unitPrice: 0.10, expiryDate: '2025-12-31', manufacturer: 'PharmaCorp' 
  },
  { 
    id: 'M-102', name: 'Amoxil', genericName: 'Amoxicillin', type: 'CAPSULE', strength: '500mg', 
    stock: 200, reorderLevel: 500, unitPrice: 0.45, expiryDate: '2024-06-30', manufacturer: 'BioGen' 
  },
  { 
    id: 'M-103', name: 'Lipitor', genericName: 'Atorvastatin', type: 'TABLET', strength: '20mg', 
    stock: 800, reorderLevel: 200, unitPrice: 1.20, expiryDate: '2025-01-15', manufacturer: 'Pfizer' 
  },
  { 
    id: 'M-104', name: 'Ventolin', genericName: 'Salbutamol', type: 'INJECTION', strength: '100mcg', 
    stock: 50, reorderLevel: 100, unitPrice: 8.50, expiryDate: '2024-11-20', manufacturer: 'GSK' 
  },
  { 
    id: 'M-105', name: 'Ibuprofen', genericName: 'Ibuprofen', type: 'TABLET', strength: '400mg', 
    stock: 1200, reorderLevel: 300, unitPrice: 0.15, expiryDate: '2026-03-10', manufacturer: 'GenericLab' 
  }
];

const SEED_PRESCRIPTIONS: Prescription[] = [
  { 
    id: 'RX-501', patientId: 'P-1001', doctorId: 'D-001', medicationId: 'M-103', 
    date: today, dosage: '20mg once daily', quantity: 30, status: 'PENDING',
    notes: 'Take with food to avoid stomach upset.'
  },
  { 
    id: 'RX-502', patientId: 'P-1003', doctorId: 'D-002', medicationId: 'M-105', 
    date: today, dosage: '400mg every 6 hours as needed', quantity: 20, status: 'DISPENSED', dispensedAt: '2023-10-27T09:30:00' 
  },
  {
    id: 'RX-503', patientId: 'P-1002', doctorId: 'D-003', medicationId: 'M-101',
    date: today, dosage: '1g IV every 6 hours', quantity: 4, status: 'PENDING',
    notes: 'Monitor liver function if high dosage persists.'
  }
];

const SEED_USERS: User[] = [
  { id: 'U-001', name: 'Admin User', email: 'admin@nexus.hms', role: UserRole.ADMIN, status: 'ACTIVE', lastLogin: new Date().toISOString(), password: 'password123' },
  { id: 'U-002', name: 'Dr. Gregory House', email: 'house@nexus.hms', role: UserRole.DOCTOR, status: 'ACTIVE', lastLogin: '2023-10-26T14:20:00', password: 'password123' },
  { id: 'U-003', name: 'Nurse Joy', email: 'joy@nexus.hms', role: UserRole.NURSE, status: 'ACTIVE', lastLogin: '2023-10-27T07:00:00', password: 'password123' },
  { id: 'U-004', name: 'Receptionist Pam', email: 'pam@nexus.hms', role: UserRole.RECEPTIONIST, status: 'ACTIVE', lastLogin: '2023-10-27T08:00:00', password: 'password123' }
];

const SEED_LOGS: AuditLog[] = [
  { id: 'LOG-001', action: 'SYSTEM_INIT', userId: 'SYSTEM', userName: 'System', timestamp: new Date(Date.now() - 86400000).toISOString(), details: 'Database initialized', module: 'SYSTEM' },
  { id: 'LOG-002', action: 'USER_LOGIN', userId: 'U-001', userName: 'Admin User', timestamp: new Date().toISOString(), details: 'Successful login', module: 'AUTH' },
  { id: 'LOG-003', action: 'ADMIT_PATIENT', userId: 'U-003', userName: 'Nurse Joy', timestamp: new Date(Date.now() - 3600000).toISOString(), details: 'Admitted Patient P-1002', module: 'PATIENTS' }
];

class DatabaseService {
  private state: AppState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): AppState {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure new fields exist for legacy data
      if (!parsed.users) parsed.users = SEED_USERS;
      if (!parsed.auditLogs) parsed.auditLogs = SEED_LOGS;
      if (!parsed.currentUser.id) parsed.currentUser.id = 'U-001';
      return parsed;
    }
    const initialState: AppState = {
      patients: SEED_PATIENTS,
      doctors: SEED_DOCTORS,
      wards: SEED_WARDS,
      beds: SEED_BEDS,
      appointments: SEED_APPOINTMENTS,
      medications: SEED_MEDICATIONS,
      prescriptions: SEED_PRESCRIPTIONS,
      users: SEED_USERS,
      auditLogs: SEED_LOGS,
      currentUser: { id: 'U-001', name: 'Admin User', role: UserRole.ADMIN },
      notifications: [
        { id: 'n1', message: 'System Maintenance scheduled for midnight.', type: 'info', read: false },
        { id: 'n2', message: 'Critical Lab Result: P-1002', type: 'error', read: false }
      ]
    };
    this.saveState(initialState);
    return initialState;
  }

  private saveState(state: AppState) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    this.state = state;
  }

  // --- Patient Methods ---

  getPatients(): Patient[] {
    return this.state.patients;
  }

  getPatientById(id: string): Patient | undefined {
    return this.state.patients.find(p => p.id === id);
  }

  addPatient(patient: Patient): void {
    const newState = { ...this.state, patients: [patient, ...this.state.patients] };
    this.logAction('CREATE_PATIENT', `Registered patient ${patient.id}`, 'PATIENTS');
    this.saveState(newState);
  }

  updatePatient(patient: Patient): void {
    const index = this.state.patients.findIndex(p => p.id === patient.id);
    if (index !== -1) {
      const newPatients = [...this.state.patients];
      newPatients[index] = patient;
      this.saveState({ ...this.state, patients: newPatients });
    }
  }

  // --- Bed & Ward Methods ---

  getWards(): Ward[] {
    return this.state.wards;
  }

  getBeds(): Bed[] {
    return this.state.beds;
  }

  getAvailableBeds(): Bed[] {
    return this.state.beds.filter(b => b.status === 'AVAILABLE');
  }

  getBedById(id: string): Bed | undefined {
    return this.state.beds.find(b => b.id === id);
  }

  updateBed(bed: Bed): void {
    const index = this.state.beds.findIndex(b => b.id === bed.id);
    if (index !== -1) {
      const newBeds = [...this.state.beds];
      newBeds[index] = bed;
      this.saveState({ ...this.state, beds: newBeds });
    }
  }

  assignPatientToBed(patientId: string, bedId: string): void {
    const patient = this.getPatientById(patientId);
    const bed = this.getBedById(bedId);
    
    if (patient && bed) {
      // If patient already in a bed, empty that bed
      if (patient.bedId) {
        const oldBed = this.getBedById(patient.bedId);
        if (oldBed) {
          this.updateBed({ ...oldBed, status: 'CLEANING', patientId: undefined });
        }
      }

      // Update new Bed
      const updatedBed: Bed = { ...bed, status: 'OCCUPIED', patientId: patient.id };
      
      // Update Patient
      const updatedPatient: Patient = { 
        ...patient, 
        bedId: bed.id, 
        roomNumber: bed.roomNumber,
        status: PatientStatus.ADMITTED // Auto admit
      };

      // Atomic-ish update
      const newBeds = this.state.beds.map(b => b.id === bedId ? updatedBed : (b.id === patient.bedId ? { ...b, status: 'CLEANING' as BedStatus, patientId: undefined } : b));
      const newPatients = this.state.patients.map(p => p.id === patientId ? updatedPatient : p);

      this.logAction('ASSIGN_BED', `Assigned patient ${patientId} to bed ${bedId}`, 'BEDS');
      this.saveState({ ...this.state, beds: newBeds, patients: newPatients });
    }
  }

  dischargePatientFromBed(bedId: string): void {
    const bed = this.getBedById(bedId);
    if (bed && bed.patientId) {
       const patientId = bed.patientId;
       const patient = this.getPatientById(patientId);

       const updatedBed: Bed = { ...bed, status: 'CLEANING', patientId: undefined };
       
       const newBeds = this.state.beds.map(b => b.id === bedId ? updatedBed : b);
       let newPatients = this.state.patients;
       
       if (patient) {
         const updatedPatient = { ...patient, bedId: undefined, roomNumber: undefined, status: PatientStatus.DISCHARGED };
         newPatients = this.state.patients.map(p => p.id === patientId ? updatedPatient : p);
       }

       this.logAction('DISCHARGE_PATIENT', `Discharged patient ${patientId} from bed ${bedId}`, 'BEDS');
       this.saveState({ ...this.state, beds: newBeds, patients: newPatients });
    }
  }

  // --- Doctor Methods ---

  getDoctors(): Doctor[] {
    return this.state.doctors;
  }

  // --- Appointment Methods ---
  
  getAppointments(): Appointment[] {
    return this.state.appointments || [];
  }

  addAppointment(appt: Appointment): void {
    const newState = { ...this.state, appointments: [...(this.state.appointments || []), appt] };
    this.logAction('CREATE_APPT', `Scheduled appointment ${appt.id}`, 'APPOINTMENTS');
    this.saveState(newState);
  }

  updateAppointment(appt: Appointment): void {
    const list = this.state.appointments || [];
    const index = list.findIndex(a => a.id === appt.id);
    if (index !== -1) {
       const newList = [...list];
       newList[index] = appt;
       this.saveState({ ...this.state, appointments: newList });
    }
  }

  // --- Pharmacy Methods ---

  getMedications(): Medication[] {
    return this.state.medications || [];
  }

  getPrescriptions(): Prescription[] {
    return this.state.prescriptions || [];
  }

  updateMedicationStock(id: string, newStock: number): void {
    const meds = this.state.medications || [];
    const index = meds.findIndex(m => m.id === id);
    if (index !== -1) {
      const newMeds = [...meds];
      newMeds[index] = { ...newMeds[index], stock: newStock };
      this.saveState({ ...this.state, medications: newMeds });
    }
  }

  addMedication(med: Medication): void {
    const newState = { ...this.state, medications: [med, ...(this.state.medications || [])] };
    this.logAction('ADD_MEDICATION', `Added medication ${med.name}`, 'PHARMACY');
    this.saveState(newState);
  }

  addPrescription(prescription: Prescription): void {
    const newState = { ...this.state, prescriptions: [prescription, ...(this.state.prescriptions || [])] };
    this.saveState(newState);
  }

  dispensePrescription(id: string): { success: boolean, message: string } {
    const prescriptions = this.state.prescriptions || [];
    const meds = this.state.medications || [];
    
    const pIndex = prescriptions.findIndex(p => p.id === id);
    if (pIndex === -1) return { success: false, message: 'Prescription not found' };

    const prescription = prescriptions[pIndex];
    if (prescription.status === 'DISPENSED') return { success: false, message: 'Already dispensed' };

    const mIndex = meds.findIndex(m => m.id === prescription.medicationId);
    if (mIndex === -1) return { success: false, message: 'Medication not found in inventory' };

    const med = meds[mIndex];
    if (med.stock < prescription.quantity) {
      return { success: false, message: `Insufficient stock. Required: ${prescription.quantity}, Available: ${med.stock}` };
    }

    // Process Transaction
    const newMeds = [...meds];
    newMeds[mIndex] = { ...med, stock: med.stock - prescription.quantity };

    const newPrescriptions = [...prescriptions];
    newPrescriptions[pIndex] = { ...prescription, status: 'DISPENSED', dispensedAt: new Date().toISOString() };

    this.logAction('DISPENSE', `Dispensed RX ${id}`, 'PHARMACY');
    this.saveState({ ...this.state, medications: newMeds, prescriptions: newPrescriptions });
    return { success: true, message: 'Medication dispensed successfully' };
  }

  // --- User & Admin Methods ---

  getUsers(): User[] {
    return this.state.users || [];
  }

  getCurrentUser(): { id: string, name: string, role: UserRole } {
    return this.state.currentUser;
  }

  validateUser(email: string, password: string): User | undefined {
    return this.state.users?.find(u => u.email === email && u.password === password && u.status === 'ACTIVE');
  }

  addUser(user: User): void {
    const newState = { ...this.state, users: [...(this.state.users || []), user] };
    this.logAction('CREATE_USER', `Created user ${user.name} (${user.role})`, 'ADMIN');
    this.saveState(newState);
  }

  updateUserStatus(userId: string, status: 'ACTIVE' | 'INACTIVE'): void {
    const users = this.state.users || [];
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      const newUsers = [...users];
      newUsers[index] = { ...newUsers[index], status };
      this.logAction('UPDATE_USER', `Changed status of ${userId} to ${status}`, 'ADMIN');
      this.saveState({ ...this.state, users: newUsers });
    }
  }

  updateUserPassword(userId: string, newPassword: string): void {
    const users = this.state.users || [];
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      const newUsers = [...users];
      newUsers[index] = { ...newUsers[index], password: newPassword };
      this.logAction('CHANGE_PASSWORD', `Changed password for user ${newUsers[index].name}`, 'ADMIN');
      this.saveState({ ...this.state, users: newUsers });
    }
  }

  getAuditLogs(): AuditLog[] {
    return this.state.auditLogs || [];
  }

  private logAction(action: string, details: string, module: string) {
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      action,
      userId: this.state.currentUser.id,
      userName: this.state.currentUser.name,
      timestamp: new Date().toISOString(),
      details,
      module
    };
    // Keep only last 100 logs
    const newLogs = [newLog, ...(this.state.auditLogs || [])].slice(0, 100);
    // Note: We don't save state here to avoid recursive save calls if called from saveState,
    // but typically we should. For this simple mock, we update state object directly before save.
    this.state.auditLogs = newLogs; 
  }

  // --- Stats ---

  getStats() {
    const totalPatients = this.state.patients.length;
    const admitted = this.state.patients.filter(p => p.status === PatientStatus.ADMITTED).length;
    const emergency = this.state.patients.filter(p => p.status === PatientStatus.EMERGENCY).length;
    const critical = this.state.patients.filter(p => p.vitalsHistory[0]?.flag === 'CRITICAL').length || 0; 
    
    // Calculate Occupancy
    const totalBeds = this.state.beds.length;
    const occupiedBeds = this.state.beds.filter(b => b.status === 'OCCUPIED').length;
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    return { totalPatients, admitted, emergency, critical, occupancyRate };
  }
}

export const db = new DatabaseService();
