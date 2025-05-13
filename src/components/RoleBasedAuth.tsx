import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { 
  isUserAdmin, 
  isUserManager, 
  isUserAdminOrManager, 
  hasUserRole,
  hasResourceAccess,
  hasUserPermission
} from '../types/auth';
import { SystemRole } from '../types/roles';

interface RoleBasedProps {
  children: React.ReactNode;
  
  // Role requirements
  requireAdmin?: boolean;
  requireManager?: boolean;
  requireAdminOrManager?: boolean;
  requiredRoles?: SystemRole[];
  requireAllRoles?: boolean;
  
  // Permission requirements
  requiredPermissions?: string[];
  requireAllPermissions?: boolean;
  
  // Resource access requirements
  resource?: string;
  action?: string;
  
  // Alternative content
  fallback?: React.ReactNode;
}

/**
 * Role-based authorization component
 * Conditionally renders children based on user roles and permissions
 *
 * @param children Content to render if authorized
 * @param requireAdmin Only render for admins
 * @param requireManager Only render for managers
 * @param requireAdminOrManager Render for either admins or managers
 * @param requiredRoles Array of specific roles required
 * @param requireAllRoles If true, user must have ALL requiredRoles; otherwise ANY role is sufficient
 * @param requiredPermissions Array of permission names required
 * @param requireAllPermissions If true, user must have ALL requiredPermissions; otherwise ANY permission is sufficient
 * @param resource Resource identifier for checking resource access
 * @param action Action identifier for checking resource access
 * @param fallback Optional content to render if not authorized
 * @returns Either children, fallback, or null
 */
export const RoleBasedAuth: React.FC<RoleBasedProps> = ({
  children,
  requireAdmin = false,
  requireManager = false,
  requireAdminOrManager = false,
  requiredRoles = [],
  requireAllRoles = false,
  requiredPermissions = [],
  requireAllPermissions = false,
  resource,
  action,
  fallback = null,
}) => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  if (!isAuthenticated || !user) {
    return fallback as React.ReactElement || null;
  }
  
  // Check specific role requirements
  if (requireAdmin && !isUserAdmin(user)) {
    return fallback as React.ReactElement || null;
  }
  
  if (requireManager && !isUserManager(user)) {
    return fallback as React.ReactElement || null;
  }
  
  if (requireAdminOrManager && !isUserAdminOrManager(user)) {
    return fallback as React.ReactElement || null;
  }
  
  // Check array of required roles
  if (requiredRoles.length > 0) {
    if (requireAllRoles) {
      // Must have ALL required roles
      const hasAllRoles = requiredRoles.every(role => hasUserRole(user, role));
      if (!hasAllRoles) {
        return fallback as React.ReactElement || null;
      }
    } else {
      // Must have ANY required role
      const hasAnyRole = requiredRoles.some(role => hasUserRole(user, role));
      if (!hasAnyRole) {
        return fallback as React.ReactElement || null;
      }
    }
  }
  
  // Check array of required permissions
  if (requiredPermissions.length > 0) {
    if (requireAllPermissions) {
      // Must have ALL required permissions
      const hasAllPermissions = requiredPermissions.every(permission => 
        hasUserPermission(user, permission)
      );
      if (!hasAllPermissions) {
        return fallback as React.ReactElement || null;
      }
    } else {
      // Must have ANY required permission
      const hasAnyPermission = requiredPermissions.some(permission => 
        hasUserPermission(user, permission)
      );
      if (!hasAnyPermission) {
        return fallback as React.ReactElement || null;
      }
    }
  }
  
  // Check resource access
  if (resource && action) {
    if (!hasResourceAccess(user, resource, action)) {
      return fallback as React.ReactElement || null;
    }
  }
  
  // User has all required roles and permissions
  return <>{children}</>;
};

/**
 * Admin-only content component
 */
export const AdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback = null 
}) => {
  return <RoleBasedAuth requireAdmin fallback={fallback}>{children}</RoleBasedAuth>;
};

/**
 * Manager-only content component
 */
export const ManagerOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback = null 
}) => {
  return <RoleBasedAuth requireManager fallback={fallback}>{children}</RoleBasedAuth>;
};

/**
 * Admin or Manager content component
 */
export const AdminOrManagerOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback = null 
}) => {
  return <RoleBasedAuth requireAdminOrManager fallback={fallback}>{children}</RoleBasedAuth>;
};

export default RoleBasedAuth;