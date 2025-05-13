import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { ProjectRole } from '../types/roles';

/**
 * Hook to check if the current user has a specific role in a project
 *
 * @param projectId The ID of the project to check
 * @returns Object with helper methods to check project roles
 */
export function useProjectRole(projectId: number | string) {
  const { user, isAuthenticated, isAdmin } = useSelector((state: RootState) => state.auth);
  
  // Convert projectId to number if it's a string
  const numericProjectId = typeof projectId === 'string' ? parseInt(projectId, 10) : projectId;
  
  // Get the user's project membership
  const projectMembership = user?.projects?.find(p => p.project.id === numericProjectId);
  const userProjectRole = projectMembership?.role;
  
  /**
   * Check if the user is a member of the project
   */
  const isProjectMember = (): boolean => {
    // Admin has access to everything
    if (isAdmin) return true;
    
    // Check if user is authenticated and has a membership
    return isAuthenticated && !!projectMembership;
  };
  
  /**
   * Check if the user has a specific role in the project
   */
  const hasProjectRole = (role: ProjectRole): boolean => {
    // Admin has access to everything
    if (isAdmin) return true;
    
    // Check if user is authenticated and has the specified role
    return isAuthenticated && userProjectRole === role;
  };
  
  /**
   * Check if the user has any of the specified roles in the project
   */
  const hasAnyProjectRole = (roles: ProjectRole[]): boolean => {
    // Admin has access to everything
    if (isAdmin) return true;
    
    // Check if user is authenticated and has any of the specified roles
    return isAuthenticated && !!userProjectRole && roles.includes(userProjectRole);
  };
  
  /**
   * Check if the user is an admin of the project
   */
  const isProjectAdmin = (): boolean => {
    // Global admin has access to everything
    if (isAdmin) return true;
    
    // Check if user is authenticated and is a project admin
    return isAuthenticated && userProjectRole === 'PROJECT_ADMIN';
  };
  
  /**
   * Check if the user is a manager of the project
   */
  const isProjectManager = (): boolean => {
    // Global admin has access to everything
    if (isAdmin) return true;
    
    // Check if user is authenticated and is a project manager or admin
    return isAuthenticated && (
      userProjectRole === 'PROJECT_ADMIN' || 
      userProjectRole === 'PROJECT_MANAGER'
    );
  };
  
  /**
   * Get the user's role in the project (or null if not a member)
   */
  const getProjectRole = (): ProjectRole | null => {
    return isAuthenticated ? userProjectRole || null : null;
  };
  
  return {
    isProjectMember,
    hasProjectRole,
    hasAnyProjectRole,
    isProjectAdmin,
    isProjectManager,
    getProjectRole,
    projectRole: userProjectRole,
  };
}

export default useProjectRole;