import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { hasResourceAccess } from '../types/auth';
import { ProjectRole } from '../types/roles';

interface ProjectRoleBasedProps {
  children: React.ReactNode;
  projectId: number | string;  // Can be number or string from URL params
  
  // Role requirements
  requireProjectAdmin?: boolean;
  requireProjectManager?: boolean;
  requireProjectMember?: boolean;
  requiredProjectRoles?: ProjectRole[];
  requireAnyRole?: boolean;
  
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
 * Project-specific role-based authorization component
 * Conditionally renders children based on user's role in a specific project
 *
 * @param projectId The project ID to check roles against
 * @param children Content to render if authorized
 * @param requireProjectAdmin Only render for project admins
 * @param requireProjectManager Only render for project managers or admins
 * @param requireProjectMember Only render for project members, managers, or admins
 * @param requiredProjectRoles Array of specific project roles required
 * @param requireAnyRole If true, user must have ANY of requiredProjectRoles; otherwise ALL roles are required
 * @param requiredPermissions Array of permission names required
 * @param requireAllPermissions If true, user must have ALL requiredPermissions; otherwise ANY permission is sufficient
 * @param resource Resource identifier for checking resource access
 * @param action Action identifier for checking resource access
 * @param fallback Optional content to render if not authorized
 * @returns Either children, fallback, or null
 */
export const ProjectRoleBasedAuth: React.FC<ProjectRoleBasedProps> = ({
  children,
  projectId,
  requireProjectAdmin = false,
  requireProjectManager = false,
  requireProjectMember = false,
  requiredProjectRoles = [],
  requireAnyRole = true,
  requiredPermissions = [],
  requireAllPermissions = false,
  resource,
  action,
  fallback = null,
}) => {
  const { user, isAuthenticated, isAdmin } = useSelector((state: RootState) => state.auth);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  
  // Convert projectId to number if it's a string
  const numericProjectId = typeof projectId === 'string' ? parseInt(projectId, 10) : projectId;
  
  useEffect(() => {
    const checkAccess = () => {
      if (!isAuthenticated || !user) {
        setHasAccess(false);
        return;
      }
      
      // Admin has access to everything
      if (isAdmin) {
        setHasAccess(true);
        return;
      }
      
      // Find user's membership in this project
      const projectMembership = user.projects?.find(p => p.project.id === numericProjectId);
      
      if (!projectMembership) {
        setHasAccess(false);
        return;
      }
      
      const userProjectRole = projectMembership.role;
      
      // Check specific role requirements
      if (requireProjectAdmin && userProjectRole !== 'PROJECT_ADMIN') {
        setHasAccess(false);
        return;
      }
      
      if (requireProjectManager && 
          userProjectRole !== 'PROJECT_ADMIN' && 
          userProjectRole !== 'PROJECT_MANAGER') {
        setHasAccess(false);
        return;
      }
      
      if (requireProjectMember && 
          userProjectRole !== 'PROJECT_ADMIN' && 
          userProjectRole !== 'PROJECT_MANAGER' &&
          userProjectRole !== 'PROJECT_MEMBER') {
        setHasAccess(false);
        return;
      }
      
      // Check array of required roles
      if (requiredProjectRoles.length > 0) {
        if (requireAnyRole) {
          // Must have ANY required role
          const hasAnyRole = requiredProjectRoles.some(role => userProjectRole === role);
          if (!hasAnyRole) {
            setHasAccess(false);
            return;
          }
        } else {
          // Must have ALL required roles - this is unusual for project roles
          // but included for consistency with the main RoleBasedAuth component
          const hasAllRoles = requiredProjectRoles.every(role => userProjectRole === role);
          if (!hasAllRoles) {
            setHasAccess(false);
            return;
          }
        }
      }
      
      // Check resource access
      if (resource && action) {
        const resourceId = `project:${numericProjectId}:${resource}`;
        if (!hasResourceAccess(user, resourceId, action)) {
          setHasAccess(false);
          return;
        }
      }
      
      // If we've passed all checks, grant access
      setHasAccess(true);
    };
    
    checkAccess();
  }, [
    isAuthenticated, 
    user, 
    numericProjectId, 
    requireProjectAdmin, 
    requireProjectManager, 
    requireProjectMember,
    requiredProjectRoles,
    requireAnyRole,
    resource,
    action,
    isAdmin
  ]);
  
  // Still checking access
  if (hasAccess === null) {
    return null;
  }
  
  // Return children or fallback based on access
  return hasAccess ? <>{children}</> : (fallback as React.ReactElement || null);
};

/**
 * Project Admin only content component
 */
export const ProjectAdminOnly: React.FC<Omit<ProjectRoleBasedProps, 'requireProjectAdmin'>> = ({ 
  children, 
  projectId,
  fallback = null 
}) => {
  return (
    <ProjectRoleBasedAuth 
      projectId={projectId} 
      requireProjectAdmin 
      fallback={fallback}
    >
      {children}
    </ProjectRoleBasedAuth>
  );
};

/**
 * Project Manager or Admin only content component
 */
export const ProjectManagerOnly: React.FC<Omit<ProjectRoleBasedProps, 'requireProjectManager'>> = ({ 
  children, 
  projectId,
  fallback = null 
}) => {
  return (
    <ProjectRoleBasedAuth 
      projectId={projectId} 
      requireProjectManager
      fallback={fallback}
    >
      {children}
    </ProjectRoleBasedAuth>
  );
};

/**
 * Project Member (or higher) only content component
 */
export const ProjectMemberOnly: React.FC<Omit<ProjectRoleBasedProps, 'requireProjectMember'>> = ({ 
  children, 
  projectId,
  fallback = null 
}) => {
  return (
    <ProjectRoleBasedAuth 
      projectId={projectId} 
      requireProjectMember
      fallback={fallback}
    >
      {children}
    </ProjectRoleBasedAuth>
  );
};

export default ProjectRoleBasedAuth;