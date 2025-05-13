import { Permission, ProjectMembership, SystemRole } from './roles';

// Re-export SystemRole for backward compatibility
export type { SystemRole };

/**
 * User data interface
 */
export interface User {
  id: number | null;
  email: string | null;
  name: string | null;
  picture: string | null;
  roles?: string[];
  systemRole?: SystemRole;
  permissions?: Permission[];
  projects?: ProjectMembership[];
  enabled?: boolean;
  profileCompletion?: number;
}

/**
 * Role assignment request interface
 */
export interface RoleAssignment {
  roleName: string;
}

/**
 * User status update interface
 */
export interface UserStatus {
  enabled: boolean;
}

/**
 * Authentication state interface for Redux store
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  isManager: boolean;
  roles: string[];
  systemRole: SystemRole | null;
  permissions: Permission[];
}

/**
 * Response interface from authentication endpoints
 */
export interface AuthResponse {
  userId: number | null;
  email: string | null;
  name: string | null;
  picture: string | null;
  token: string | null;
  refreshToken?: string | null;
  authenticated: boolean;
  message: string;
  roles?: string[];
  systemRole?: SystemRole;
  permissions?: Permission[];
  projects?: ProjectMembership[];
}

/**
 * Token response interface for refresh token endpoint
 */
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Login request data
 */
export interface LoginRequest {
  email: string;
  password: string;
  isAdmin?: boolean;
}

/**
 * Check if user has admin role
 */
export function isUserAdmin(user: User | null): boolean {
  if (!user) return false;
  
  // Check if user has explicit admin role
  if (user.systemRole === 'ADMIN') return true;
  
  // Fall back to checking roles array
  return user.roles?.includes('ADMIN') || false;
}

/**
 * Check if user has manager role
 */
export function isUserManager(user: User | null): boolean {
  if (!user) return false;
  
  // Check if user has explicit manager role
  if (user.systemRole === 'MANAGER') return true;
  
  // Fall back to checking roles array
  return user.roles?.includes('MANAGER') || false;
}

/**
 * Check if user has admin or manager role
 */
export function isUserAdminOrManager(user: User | null): boolean {
  return isUserAdmin(user) || isUserManager(user);
}

/**
 * Check if user has specific role
 */
export function hasUserRole(user: User | null, role: string): boolean {
  if (!user) return false;
  
  if (user.systemRole === role) return true;
  
  return user.roles?.includes(role) || false;
}

/**
 * Check if user has specific permission
 */
export function hasUserPermission(user: User | null, permissionName: string): boolean {
  if (!user || !user.permissions) return false;
  
  return user.permissions.some(permission => permission.name === permissionName);
}

/**
 * Check if user has access to specific resource
 */
export function hasResourceAccess(user: User | null, resource: string, action: string): boolean {
  if (!user || !user.permissions) return false;
  
  // Admin has access to everything
  if (isUserAdmin(user)) return true;
  
  return user.permissions.some(
    permission => permission.resource === resource && permission.action === action
  );
}