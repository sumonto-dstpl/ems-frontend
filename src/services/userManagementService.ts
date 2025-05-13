import api from './api';
import { RoleAssignmentRequest, SystemRole, User } from '../types/user';

/**
 * Service for handling user management API calls (admin only)
 */
class UserManagementService {
  /**
   * Get all users (paginated)
   */
  async getAllUsers(page = 0, size = 20, sort = 'id', direction = 'ASC'): Promise<{ 
    content: User[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    const response = await api.get('/api/users', {
      params: { page, size, sort, direction }
    });
    return response.data;
  }

  /**
   * Get a specific user by ID
   */
  async getUserById(userId: number): Promise<User> {
    const response = await api.get(`/api/users/${userId}`);
    return response.data;
  }

  /**
   * Update a user's system role
   */
  async updateUserSystemRole(userId: number, systemRole: SystemRole): Promise<User> {
    const response = await api.put(`/api/roles/users/${userId}/system-role`, null, {
      params: { role: systemRole }
    });
    return response.data;
  }

  /**
   * Add a role to a user
   */
  async addRoleToUser(userId: number, roleName: string): Promise<User> {
    const response = await api.post(`/api/roles/users/${userId}/roles`, null, {
      params: { role: roleName }
    });
    return response.data;
  }

  /**
   * Remove a role from a user
   */
  async removeRoleFromUser(userId: number, roleName: string): Promise<User> {
    const response = await api.delete(`/api/roles/users/${userId}/roles/${roleName}`);
    return response.data;
  }

  /**
   * Assign a project role to a user
   */
  async assignProjectRole(userId: number, projectId: number, role: string): Promise<any> {
    const response = await api.post(`/api/roles/users/${userId}/projects/${projectId}/roles`, null, {
      params: { role }
    });
    return response.data;
  }

  /**
   * Remove a user from a project
   */
  async removeUserFromProject(userId: number, projectId: number): Promise<void> {
    await api.delete(`/api/roles/users/${userId}/projects/${projectId}`);
  }

  /**
   * Get all available roles
   */
  async getAllRoles(): Promise<{ id: number, name: string, description: string, permissions: string[] }[]> {
    const response = await api.get('/api/roles');
    return response.data;
  }

  /**
   * Get user's roles
   */
  async getUserRoles(userId: number): Promise<{ id: number, name: string, description: string, permissions: string[] }[]> {
    const response = await api.get(`/api/roles/users/${userId}`);
    return response.data;
  }

  /**
   * Get current user's roles
   */
  async getCurrentUserRoles(): Promise<{ id: number, name: string, description: string, permissions: string[] }[]> {
    const response = await api.get('/api/roles/me');
    return response.data;
  }

  /**
   * Get all available system roles
   */
  async getAllSystemRoles(): Promise<SystemRole[]> {
    const response = await api.get('/api/roles/system-roles');
    return response.data;
  }

  /**
   * Update a user's account status (enable/disable)
   */
  async updateUserStatus(userId: number, enabled: boolean): Promise<User> {
    const response = await api.put(`/api/users/${userId}/status`, { enabled });
    return response.data;
  }

  /**
   * Handle role assignment (unified method)
   */
  async assignRole(request: RoleAssignmentRequest): Promise<any> {
    const response = await api.post('/api/roles/assign', request);
    return response.data;
  }
}

export default new UserManagementService();