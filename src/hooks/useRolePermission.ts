import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { SystemRole } from '../types/roles';
import { 
  isUserAdmin, 
  isUserManager, 
  isUserAdminOrManager,
  hasUserRole,
  hasUserPermission,
  hasResourceAccess
} from '../types/auth';

/**
 * Hook to check user roles and permissions at the system level
 * 
 * @returns Object with helper methods to check roles and permissions
 */
export function useRolePermission() {
  const { 
    user, 
    isAuthenticated, 
    roles, 
    permissions,
    systemRole 
  } = useSelector((state: RootState) => state.auth);
  
  /**
   * Check if the user has admin role
   */
  const checkIsAdmin = (): boolean => {
    return isUserAdmin(user);
  };
  
  /**
   * Check if the user has manager role
   */
  const checkIsManager = (): boolean => {
    return isUserManager(user);
  };
  
  /**
   * Check if the user has admin or manager role
   */
  const checkIsAdminOrManager = (): boolean => {
    return isUserAdminOrManager(user);
  };
  
  /**
   * Check if the user has a specific role
   */
  const hasRole = (role: SystemRole): boolean => {
    return hasUserRole(user, role);
  };
  
  /**
   * Check if the user has any of the specified roles
   */
  const hasAnyRole = (roleList: SystemRole[]): boolean => {
    if (!isAuthenticated || !user) return false;
    return roleList.some(role => hasUserRole(user, role));
  };
  
  /**
   * Check if the user has all of the specified roles
   */
  const hasAllRoles = (roleList: SystemRole[]): boolean => {
    if (!isAuthenticated || !user) return false;
    return roleList.every(role => hasUserRole(user, role));
  };
  
  /**
   * Check if the user has a specific permission
   */
  const hasPermission = (permission: string): boolean => {
    return hasUserPermission(user, permission);
  };
  
  /**
   * Check if the user has any of the specified permissions
   */
  const hasAnyPermission = (permissionList: string[]): boolean => {
    if (!isAuthenticated || !user) return false;
    return permissionList.some(permission => hasUserPermission(user, permission));
  };
  
  /**
   * Check if the user has all of the specified permissions
   */
  const hasAllPermissions = (permissionList: string[]): boolean => {
    if (!isAuthenticated || !user) return false;
    return permissionList.every(permission => hasUserPermission(user, permission));
  };
  
  /**
   * Check if the user has access to a specific resource
   */
  const canAccessResource = (resource: string, action: string): boolean => {
    return hasResourceAccess(user, resource, action);
  };
  
  return {
    isAdmin: checkIsAdmin,
    isManager: checkIsManager,
    isAdminOrManager: checkIsAdminOrManager,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessResource,
    currentRoles: roles,
    currentPermissions: permissions,
    currentSystemRole: systemRole,
    isAuthenticated
  };
}

export default useRolePermission;