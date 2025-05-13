import api from './api';
import { PageResponse, ActivityLog, ActivityLogSummary } from '../types/activityLog';
import { TeamActivitySummary } from '../types/team';

/**
 * Service for team management functions (manager access)
 */
class TeamManagementService {
  /**
   * Get all activity logs for team members
   */
  async getTeamActivityLogs(page = 0, size = 10, status?: string, from?: string, to?: string): Promise<PageResponse<ActivityLog>> {
    const response = await api.get('/api/activity-logs/team', {
      params: { page, size, status, from, to }
    });
    return response.data;
  }

  /**
   * Get all pending approval activity logs
   */
  async getPendingApprovalLogs(page = 0, size = 10): Promise<PageResponse<ActivityLog>> {
    const response = await api.get('/api/activity-logs/team/pending', {
      params: { page, size }
    });
    return response.data;
  }

  /**
   * Get team activity log summary
   */
  async getTeamActivityLogSummary(): Promise<TeamActivitySummary> {
    const response = await api.get('/api/activity-logs/team/summary');
    return response.data;
  }
  
  /**
   * Get team activity metrics
   */
  async getTeamActivityMetrics(month?: string): Promise<TeamActivitySummary> {
    const response = await api.get('/api/teams/metrics', {
      params: { month }
    });
    return response.data;
  }
  
  /**
   * Get team tasks metrics
   */
  async getTeamTaskMetrics(month?: string): Promise<{
    completedTasks: number;
    totalTasks: number;
    overdueTasks: number;
  }> {
    const response = await api.get('/api/teams/tasks/metrics', {
      params: { month }
    });
    return response.data;
  }
  
  /**
   * Get pending approval requests
   */
  async getPendingApprovalRequests(): Promise<{
    id: number;
    type: string;
    user: string;
    userId: number;
    icon: string;
    date: string;
    details?: string;
  }[]> {
    const response = await api.get('/api/teams/pending-approvals');
    return response.data;
  }

  /**
   * Approve an activity log
   */
  async approveActivityLog(logId: number): Promise<ActivityLog> {
    const response = await api.post(`/api/activity-logs/team/${logId}/approve`);
    return response.data;
  }

  /**
   * Get activity logs for a specific team member
   */
  async getUserActivityLogs(userId: number, page = 0, size = 10, status?: string, from?: string, to?: string): Promise<PageResponse<ActivityLog>> {
    const response = await api.get(`/api/activity-logs/team/user/${userId}`, {
      params: { page, size, status, from, to }
    });
    return response.data;
  }

  /**
   * Check if the current user can approve an activity log
   */
  async canApproveActivityLog(logId: number): Promise<boolean> {
    const response = await api.get(`/api/activity-logs/team/${logId}/can-approve`);
    return response.data;
  }

  /**
   * Get the team members
   */
  async getTeamMembers(page = 0, size = 20): Promise<PageResponse<any>> {
    const response = await api.get('/api/teams/members', {
      params: { page, size }
    });
    return response.data;
  }

  /**
   * Get active projects for the team
   */
  async getTeamProjects(page = 0, size = 10): Promise<PageResponse<any>> {
    const response = await api.get('/api/teams/projects', {
      params: { page, size }
    });
    return response.data;
  }

  /**
   * Get members of a specific project
   */
  async getProjectMembers(projectId: number): Promise<any[]> {
    const response = await api.get(`/api/projects/${projectId}/members`);
    return response.data;
  }
}

export default new TeamManagementService();