
export enum UserRole {
  ADMIN = 'ADMIN',
  DOCTOR = 'DOCTOR',
  NURSE = 'NURSE',
  RECEPTIONIST = 'RECEPTIONIST'
}

export enum PatientStatus {
  ADMITTED = 'ADMITTED',
  OUTPATIENT = 'OUTPATIENT',
  DISCHARGED = 'DISCHARGED',
  EMERGENCY = 'EMERGENCY'
}

export enum Urgency {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface Vitals {
  date: string;
  heartRate: number;
  bpSystolic: number;
  bpDiastolic: number;
  temperature: number;
  spo2: number;
  respRate: number;
  flag?: 'NORMAL' | 'ABNORMAL' | 'CRITICAL';
}

export interface LabResult {
  id: string;
  testName: string;
  date: string;
  status: 'PENDING' | 'COMPLETED';
  result?: string;
  flag?: 'NORMAL' | 'ABNORMAL' | 'CRITICAL';
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  status: PatientStatus;
  bloodType: string;
  allergies: string[];
  diagnosis: string[];
  vitalsHistory: Vitals[];
  labResults: LabResult[];
  assignedDoctorId?: string;
  roomNumber?: string;
  bedId?: string;
  admissionDate?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  availability: string;
}

export type BedStatus = 'AVAILABLE' | 'OCCUPIED' | 'CLEANING' | 'MAINTENANCE';
export type BedType = 'STANDARD' | 'ICU' | 'ER' | 'MATERNITY' | 'PEDIATRIC';

export interface Ward {
  id: string;
  name: string;
  specialty: string;
  floor: number;
}

export interface Bed {
  id: string;
  wardId: string;
  roomNumber: string;
  bedNumber: string;
  type: BedType;
  status: BedStatus;
  patientId?: string;
}

// Appointment Types
export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export type AppointmentType = 'CONSULTATION' | 'CHECKUP' | 'SURGERY' | 'FOLLOW_UP';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string; // ISO Date YYYY-MM-DD
  time: string; // HH:mm
  duration: number; // minutes
  type: AppointmentType;
  status: AppointmentStatus;
  notes?: string;
}

// Pharmacy & Inventory Types
export type MedicationType = 'TABLET' | 'CAPSULE' | 'SYRUP' | 'INJECTION' | 'CREAM' | 'DROPS';
export type PrescriptionStatus = 'PENDING' | 'DISPENSED' | 'CANCELLED';

export interface Medication {
  id: string;
  name: string;
  genericName: string;
  type: MedicationType;
  strength: string; // e.g., "500mg"
  stock: number;
  reorderLevel: number;
  unitPrice: number;
  expiryDate: string; // ISO Date
  manufacturer: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  medicationId: string;
  date: string;
  dosage: string; // e.g., "1 tablet 3x daily"
  quantity: number;
  status: PrescriptionStatus;
  dispensedAt?: string;
  notes?: string;
}

// Admin Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE';
  lastLogin?: string;
  password?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  userName: string;
  timestamp: string;
  details: string;
  module: string;
}

export interface AppState {
  patients: Patient[];
  doctors: Doctor[];
  wards: Ward[];
  beds: Bed[];
  appointments: Appointment[];
  medications: Medication[];
  prescriptions: Prescription[];
  users: User[];
  auditLogs: AuditLog[];
  currentUser: {
    id: string;
    name: string;
    role: UserRole;
  };
  notifications: Array<{id: string, message: string, type: 'info'|'warning'|'error', read: boolean}>;
}

export type ViewState = 'DASHBOARD' | 'PATIENTS' | 'BEDS' | 'APPOINTMENTS' | 'PHARMACY' | 'CLINICAL_AI' | 'SETTINGS';
