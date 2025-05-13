/**
 * SystemRole enum - represents the main role of a user in the system
 */
export enum SystemRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
  GUEST = 'GUEST'
}

/**
 * User interface - represents a user in the system
 */
export interface User {
  id: number;
  userName: string |undefined;
  email: string;
  firstName: string;
  lastName: string;
  systemRole: SystemRole;
  enabled: boolean;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
  roles?: Role[];
  permissions?: string[];
}

/**
 * Role interface - represents a role that can be assigned to a user
 */
export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string[];
}

/**
 * ProjectMembership interface - represents a user's role in a project
 */
export interface ProjectMembership {
  id: number;
  userId: number;
  projectId: number;
  role: string;
  joinedAt: string;
}

/**
 * ProjectRole enum - represents a role within a project
 */
export enum ProjectRole {
  PROJECT_ADMIN = 'PROJECT_ADMIN',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  PROJECT_MEMBER = 'PROJECT_MEMBER',
  PROJECT_VIEWER = 'PROJECT_VIEWER'
}

/**
 * RoleAssignmentRequest interface - for assigning roles to users
 */
export interface RoleAssignmentRequest {
  userId: number;
  role: string;
  assignmentType: 'SYSTEM_ROLE' | 'ROLE' | 'PROJECT_ROLE';
  projectId?: number;
}

/**
 * UserProfile interface - represents extended user information
 */
export interface UserProfile extends User {
  department?: string;
  position?: string;
  phoneNumber?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  joinDate?: string;
  lastActive?: string;
  projectCount?: number;
  completedTasks?: number;
}

/**
 * UserWithStats interface - includes user statistics
 */
export interface UserWithStats extends User {
  totalActivities?: number;
  completedActivities?: number;
  averageHoursPerDay?: number;
  projectCount?: number;
}

/**
 * LoginRequest interface - for user login
 */
export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * ProfileUpdateRequest interface - for updating user profile
 */
export interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  department?: string;
  position?: string;
  location?: string;
  bio?: string;
  skills?: string[];
}