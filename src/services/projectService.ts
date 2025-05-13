import api from './api';
import { Project } from '../types/roles';

/**
 * Service for project management functions
 */
class ProjectService {
  /**
   * Get all projects (paginated)
   */
  async getAllProjects(page = 0, size = 10, status?: string): Promise<{
    content: Project[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    const response = await api.get('/api/projects', {
      params: { page, size, status }
    });
    return response.data;
  }

  /**
   * Get project by ID
   */
  async getProjectById(id: number): Promise<Project> {
    const response = await api.get(`/api/projects/${id}`);
    return response.data;
  }

  /**
   * Create a new project
   */
  async createProject(projectData: {
    name: string;
    description: string;
    [key: string]: any;
  }): Promise<Project> {
    const response = await api.post('/api/projects', projectData);
    return response.data;
  }

  /**
   * Update an existing project
   */
  async updateProject(id: number, projectData: {
    name?: string;
    description?: string;
    status?: string;
    [key: string]: any;
  }): Promise<Project> {
    const response = await api.put(`/api/projects/${id}`, projectData);
    return response.data;
  }

  /**
   * Delete a project
   */
  async deleteProject(id: number): Promise<void> {
    await api.delete(`/api/projects/${id}`);
  }

  /**
   * Get project members
   */
  async getProjectMembers(projectId: number): Promise<any[]> {
    const response = await api.get(`/api/projects/${projectId}/members`);
    return response.data;
  }

  /**
   * Add member to project
   */
  async addProjectMember(projectId: number, userId: number, role: string): Promise<any> {
    const response = await api.post(`/api/projects/${projectId}/members`, {
      userId,
      role
    });
    return response.data;
  }

  /**
   * Remove member from project
   */
  async removeProjectMember(projectId: number, userId: number): Promise<void> {
    await api.delete(`/api/projects/${projectId}/members/${userId}`);
  }

  /**
   * Update member role in project
   */
  async updateProjectMemberRole(projectId: number, userId: number, role: string): Promise<any> {
    const response = await api.put(`/api/projects/${projectId}/members/${userId}`, {
      role
    });
    return response.data;
  }

  /**
   * Get project statistics
   */
  async getProjectStats(projectId: number): Promise<{
    memberCount: number;
    completionRate: number;
    activityCount: number;
    lastActivity: string;
  }> {
    const response = await api.get(`/api/projects/${projectId}/stats`);
    return response.data;
  }
}

export default new ProjectService();