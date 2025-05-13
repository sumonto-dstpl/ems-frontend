import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import LoadingSpinner from './LoadingSpinner';
import Layout from './Layout';
import { SystemRole } from '../types/roles';
import { 
  hasUserRole, 
  isUserAdmin, 
  isUserManager, 
  isUserAdminOrManager,
  hasUserPermission,
  hasResourceAccess
} from '../types/auth';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRoles?: SystemRole[];
  adminOnly?: boolean;
  managerOnly?: boolean;
  adminOrManagerOnly?: boolean;
  requiresAnyRole?: boolean;
  requiredPermissions?: string[];
  requireAllPermissions?: boolean;
  resource?: string;
  action?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  requiredRoles, 
  adminOnly = false,
  managerOnly = false,
  adminOrManagerOnly = false,
  requiresAnyRole = false,
  requiredPermissions = [],
  requireAllPermissions = false,
  resource,
  action
}) => {
  const location = useLocation();
  const { isAuthenticated, loading, user, isAdmin, isManager, roles, permissions } = useSelector((state: RootState) => state.auth);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    // Redirect to login page but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Check role-based access requirements
  
  // If admin access is required, check if user is admin
  if (adminOnly && !isAdmin) {
    return <Navigate to="/unauthorized" state={{ message: "This page requires admin privileges" }} replace />;
  }
  
  // If manager access is required, check if user is manager
  if (managerOnly && !isManager) {
    return <Navigate to="/unauthorized" state={{ message: "This page requires manager privileges" }} replace />;
  }
  
  // If admin or manager access is required
  if (adminOrManagerOnly && !isAdmin && !isManager) {
    return <Navigate to="/unauthorized" state={{ message: "This page requires admin or manager privileges" }} replace />;
  }
  
  // If specific roles are required, check if the user has any of them
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => hasUserRole(user, role));
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" state={{ message: "You don't have the required role to access this page" }} replace />;
    }
  }
  
  // If any role is required, check if user has at least one role
  if (requiresAnyRole && (!roles || roles.length === 0)) {
    return <Navigate to="/unauthorized" state={{ message: "You need to be assigned a role to access this page" }} replace />;
  }
  
  // Check permission-based access requirements
  
  // If specific permissions are required
  if (requiredPermissions.length > 0) {
    if (requireAllPermissions) {
      // User must have ALL specified permissions
      const hasAllPermissions = requiredPermissions.every(permission => 
        hasUserPermission(user, permission)
      );
      
      if (!hasAllPermissions) {
        return <Navigate to="/unauthorized" state={{ message: "You don't have all required permissions to access this page" }} replace />;
      }
    } else {
      // User must have AT LEAST ONE of the specified permissions
      const hasAnyPermission = requiredPermissions.some(permission => 
        hasUserPermission(user, permission)
      );
      
      if (!hasAnyPermission) {
        return <Navigate to="/unauthorized" state={{ message: "You don't have any of the required permissions to access this page" }} replace />;
      }
    }
  }
  
  // If resource access is required
  if (resource && action) {
    if (!hasResourceAccess(user, resource, action)) {
      return <Navigate to="/unauthorized" state={{ message: `You don't have permission to ${action} ${resource}` }} replace />;
    }
  }
  
  return <Layout>{children}</Layout>;
};

export default PrivateRoute;