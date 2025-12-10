
import { UserRole, ViewState } from '../types';

// Define which roles have access to which views
const ROLE_ACCESS_CONFIG: Record<UserRole, ViewState[]> = {
  [UserRole.ADMIN]: [
    'DASHBOARD', 'PATIENTS', 'BEDS', 'APPOINTMENTS', 'PHARMACY', 'CLINICAL_AI', 'SETTINGS'
  ],
  [UserRole.DOCTOR]: [
    'DASHBOARD', 'PATIENTS', 'BEDS', 'APPOINTMENTS', 'PHARMACY', 'CLINICAL_AI', 'SETTINGS'
  ],
  [UserRole.NURSE]: [
    'DASHBOARD', 'PATIENTS', 'BEDS', 'PHARMACY', 'SETTINGS'
  ],
  [UserRole.RECEPTIONIST]: [
    'DASHBOARD', 'PATIENTS', 'APPOINTMENTS'
  ]
};

/**
 * Checks if a specific role is allowed to access a specific view.
 */
export const hasAccess = (role: UserRole, view: ViewState): boolean => {
  const allowedViews = ROLE_ACCESS_CONFIG[role];
  return allowedViews ? allowedViews.includes(view) : false;
};

/**
 * Returns the default view for a given role (usually DASHBOARD, but could vary).
 */
export const getDefaultViewForRole = (role: UserRole): ViewState => {
  return 'DASHBOARD';
};
