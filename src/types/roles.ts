/**
 * Role-based authorization types
 */

/**
 * System roles that determine application-wide permissions
 */
export type SystemRole = 'ADMIN' | 'MANAGER' | 'USER' | 'GUEST';

/**
 * Project-specific roles that affect permissions within a project context
 */
export type ProjectRole = 'PROJECT_ADMIN' | 'PROJECT_MANAGER' | 'PROJECT_MEMBER' | 'PROJECT_VIEWER';

/**
 * User role interface
 */
export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
}

/**
 * Permission interface
 */
export interface Permission {
  id: number;
  name: string;
  description: string;
  resource: string;
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'MANAGE';
}

/**
 * Project interface
 */
export interface Project {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  ownerId: number;
}

/**
 * Project member interface
 */
export interface ProjectMember {
  id: number;
  userId: number;
  projectId: number;
  role: ProjectRole;
  joinedAt: string;
}

/**
 * Enhanced user interface with roles
 */
export interface EnhancedUser {
  id: number;
  email: string;
  name: string;
  picture?: string;
  systemRole: SystemRole;
  projects: ProjectMembership[];
  permissions: Permission[];
}

/**
 * Project membership interface
 */
export interface ProjectMembership {
  project: Project;
  role: ProjectRole;
  joinedAt: string;
}

/**
 * Helper to check if a user has a specific permission
 */
export function hasPermission(user: EnhancedUser | null, permission: string): boolean {
  if (!user || !user.permissions) {
    return false;
  }
  
  return user.permissions.some(p => p.name === permission);
}

/**
 * Helper to check if a user has a specific system role
 */
export function hasRole(user: EnhancedUser | null, role: SystemRole): boolean {
  if (!user) {
    return false;
  }
  
  return user.systemRole === role;
}

/**
 * Helper to check if a user has access to a specific project
 */
export function hasProjectAccess(user: EnhancedUser | null, projectId: number): boolean {
  if (!user || !user.projects) {
    return false;
  }
  
  return user.projects.some(p => p.project.id === projectId);
}

/**
 * Helper to check if a user has a specific role in a project
 */
export function hasProjectRole(user: EnhancedUser | null, projectId: number, role: ProjectRole): boolean {
  if (!user || !user.projects) {
    return false;
  }
  
  const membership = user.projects.find(p => p.project.id === projectId);
  if (!membership) {
    return false;
  }
  
  return membership.role === role;
}