import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import LoadingSpinner from './LoadingSpinner';
import Layout from './Layout';
import { ProjectRole } from '../types/roles';
import { hasResourceAccess } from '../types/auth';

interface ProjectRouteProps {
  children: React.ReactNode;
  requiredRole?: ProjectRole | ProjectRole[];
  requireAnyRole?: boolean;
  resource?: string;
  action?: string;
}

/**
 * ProjectRoute - A specialized private route component that handles project-specific permissions
 * 
 * This component checks if the current user has the required project role(s) to access a project-specific page
 * It automatically extracts the projectId from URL params
 */
const ProjectRoute: React.FC<ProjectRouteProps> = ({
  children,
  requiredRole,
  requireAnyRole = false,
  resource,
  action
}) => {
  const location = useLocation();
  const { projectId } = useParams<{ projectId: string }>();
  const { isAuthenticated, loading, user, isAdmin } = useSelector((state: RootState) => state.auth);
  const [checkingProjectAccess, setCheckingProjectAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  
  // Validate projectId
  const validProjectId = projectId ? parseInt(projectId, 10) : undefined;
  
  useEffect(() => {
    const checkProjectAccess = async () => {
      if (!isAuthenticated || !user || !validProjectId) {
        setHasAccess(false);
        setCheckingProjectAccess(false);
        return;
      }
      
      // Admin always has access to all projects
      if (isAdmin) {
        setHasAccess(true);
        setCheckingProjectAccess(false);
        return;
      }
      
      // Check if user has project membership
      const projectMembership = user.projects?.find(
        p => p.project.id === validProjectId
      );
      
      if (!projectMembership) {
        setHasAccess(false);
        setCheckingProjectAccess(false);
        return;
      }
      
      // Check if specific role is required
      if (requiredRole) {
        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        
        if (requireAnyRole) {
          // User needs any of the required roles
          const hasRequiredRole = roles.some(role => projectMembership.role === role);
          setHasAccess(hasRequiredRole);
        } else {
          // User needs the specific required role
          setHasAccess(roles.includes(projectMembership.role));
        }
      } else {
        // No specific role required, membership is enough
        setHasAccess(true);
      }
      
      // Check for resource-specific access if needed
      if (resource && action) {
        const resourceId = `project:${validProjectId}:${resource}`;
        const hasPermission = hasResourceAccess(user, resourceId, action);
        setHasAccess(prevAccess => prevAccess && hasPermission);
      }
      
      setCheckingProjectAccess(false);
    };
    
    checkProjectAccess();
  }, [isAuthenticated, user, validProjectId, requiredRole, requireAnyRole, resource, action, isAdmin]);
  
  if (loading || checkingProjectAccess) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    // Redirect to login page but save the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (!validProjectId) {
    return <Navigate to="/not-found" state={{ message: "Invalid project ID" }} replace />;
  }
  
  if (!hasAccess) {
    return <Navigate to="/unauthorized" state={{ 
      message: "You don't have the required access to this project",
      projectId: validProjectId 
    }} replace />;
  }
  
  return <Layout>{children}</Layout>;
};

/**
 * ProjectAdminRoute - Route that requires PROJECT_ADMIN role for the specific project
 */
export const ProjectAdminRoute: React.FC<Omit<ProjectRouteProps, 'requiredRole'>> = (props) => {
  return <ProjectRoute {...props} requiredRole="PROJECT_ADMIN" />;
};

/**
 * ProjectManagerRoute - Route that requires PROJECT_MANAGER or higher role
 */
export const ProjectManagerRoute: React.FC<Omit<ProjectRouteProps, 'requiredRole'>> = (props) => {
  return <ProjectRoute 
    {...props} 
    requiredRole={['PROJECT_ADMIN', 'PROJECT_MANAGER']}
    requireAnyRole={true} 
  />;
};

/**
 * ProjectMemberRoute - Route that requires at least PROJECT_MEMBER or higher role
 */
export const ProjectMemberRoute: React.FC<Omit<ProjectRouteProps, 'requiredRole'>> = (props) => {
  return <ProjectRoute 
    {...props} 
    requiredRole={['PROJECT_ADMIN', 'PROJECT_MANAGER', 'PROJECT_MEMBER']}
    requireAnyRole={true} 
  />;
};

export default ProjectRoute;