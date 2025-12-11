
import { UserRole, ViewState } from '../types';

export type Permission = 
  | 'VIEW_DASHBOARD'
  | 'VIEW_PATIENTS'
  | 'REGISTER_PATIENT'
  | 'EDIT_PATIENT_DEMOGRAPHICS'
  | 'MANAGE_PATIENT_ID'
  | 'VIEW_EMR_CLINICAL_DETAILS'
  | 'ADD_PROGRESS_NOTE'
  | 'ADD_VITALS'
  | 'PRESCRIBE_MEDICATION'
  | 'EDIT_TREATMENT_PLAN'
  | 'ORDER_LABS'
  | 'MANAGE_BEDS'
  | 'MANAGE_APPOINTMENTS'
  | 'VIEW_ROSTER'
  | 'MANAGE_ROSTER'
  | 'MANAGE_PHARMACY'
  | 'VIEW_ADMIN_SETTINGS'
  | 'MANAGE_USERS'; // Restricts Change Password/Deactivate

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    'VIEW_DASHBOARD', 'VIEW_PATIENTS', 'REGISTER_PATIENT', 'EDIT_PATIENT_DEMOGRAPHICS', 
    'MANAGE_PATIENT_ID', 'VIEW_EMR_CLINICAL_DETAILS', 'ADD_PROGRESS_NOTE', 'ADD_VITALS',
    'MANAGE_BEDS', 'MANAGE_APPOINTMENTS', 'VIEW_ROSTER', 'MANAGE_ROSTER',
    'MANAGE_PHARMACY', 'VIEW_ADMIN_SETTINGS', 'MANAGE_USERS'
  ],
  [UserRole.DOCTOR]: [
    'VIEW_DASHBOARD', 'VIEW_PATIENTS', 'VIEW_EMR_CLINICAL_DETAILS', 
    'ADD_PROGRESS_NOTE', 'ADD_VITALS', 'PRESCRIBE_MEDICATION', 'EDIT_TREATMENT_PLAN', 'ORDER_LABS',
    'MANAGE_BEDS', 'MANAGE_APPOINTMENTS', 'VIEW_ROSTER', 'MANAGE_ROSTER', 'MANAGE_PHARMACY'
    // NO REGISTER, NO EDIT DEMOGRAPHICS (Read Only), NO MANAGE ID
  ],
  [UserRole.NURSE]: [
    'VIEW_DASHBOARD', 'VIEW_PATIENTS', 'VIEW_EMR_CLINICAL_DETAILS', 
    'ADD_PROGRESS_NOTE', 'ADD_VITALS', 'MANAGE_BEDS', 'MANAGE_APPOINTMENTS', 'VIEW_ROSTER', 'MANAGE_PHARMACY'
    // NO REGISTER, NO EDIT DEMOGRAPHICS (Read Only), NO MANAGE ID
  ],
  [UserRole.RECEPTIONIST]: [
    // Merged permissions from former CLERK role
    'VIEW_DASHBOARD', 'VIEW_PATIENTS', 'MANAGE_APPOINTMENTS',
    'REGISTER_PATIENT', 'EDIT_PATIENT_DEMOGRAPHICS'
  ],
  [UserRole.MEDICAL_RECORDS]: [
    'VIEW_DASHBOARD', 'VIEW_PATIENTS', 
    'EDIT_PATIENT_DEMOGRAPHICS', 'MANAGE_PATIENT_ID'
    // NO EMR Details, NO Scheduling, NO Roster
  ]
};

// Map ViewStates to required Permissions for general access
const VIEW_ACCESS_MAP: Record<ViewState, Permission[]> = {
  'DASHBOARD': ['VIEW_DASHBOARD'],
  'PATIENTS': ['VIEW_PATIENTS'],
  'BEDS': ['MANAGE_BEDS'], 
  'APPOINTMENTS': ['MANAGE_APPOINTMENTS'],
  'ROSTER': ['VIEW_ROSTER'],
  'PHARMACY': ['MANAGE_PHARMACY'],
  'CLINICAL_AI': ['VIEW_EMR_CLINICAL_DETAILS'], // Clinical only
  'SETTINGS': ['VIEW_ADMIN_SETTINGS', 'MANAGE_USERS'] // Admin only
};

/**
 * Checks if a specific role is allowed to perform a specific action (Permission).
 */
export const hasPermission = (role: UserRole, permission: Permission): boolean => {
  const allowed = ROLE_PERMISSIONS[role];
  return allowed ? allowed.includes(permission) : false;
};

/**
 * Checks if a specific role is allowed to access a specific view.
 */
export const hasAccess = (role: UserRole, view: ViewState): boolean => {
  const requiredPermissions = VIEW_ACCESS_MAP[view];
  if (!requiredPermissions) return true; // Public view
  
  // If user has ANY of the permissions required for the view (OR logic)
  return requiredPermissions.some(p => hasPermission(role, p));
};
