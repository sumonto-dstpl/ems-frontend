import api from './api';
import axios from 'axios';
import { ActivityLog, ActivityLogRequest, ActivityLogSummary, PageResponse } from '../types/activityLog';

/**
 * Service for handling activity log API calls
 */
class ActivityLogService {
  /**
   * Get all activity logs for the current user (paginated)
   */
  async getActivityLogs(page = 0, size = 10, status?: string, fromDate?: string, toDate?: string): Promise<PageResponse<ActivityLog>> {
    const response = await api.get('/api/activity-logs', {
      params: {
        page,
        size,
        status,
        fromDate,
        toDate
      }
    });
    return response.data;
  }

  /**
   * Get all activity logs for the current user (for backwards compatibility)
   * @deprecated Use getActivityLogs instead
   */
  async getAllActivityLogs(): Promise<ActivityLog[]> {
    const response = await api.get('/api/activity-logs/all');
    return response.data;
  }

  /**
   * Get activity log by ID
   */
  async getActivityLogById(id: number): Promise<ActivityLog> {
    const response = await api.get(`/api/activity-logs/${id}`);
    return response.data;
  }

  /**
   * Get activity log by date
   */
  async getActivityLogByDate(date: string): Promise<ActivityLog | null> {
    try {
      const response = await api.get(`/api/activity-logs/date/${date}`);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        // If 404, return null
        if (error.response?.status === 404) {
          return null;
        }
      }
  
      throw error;
    }
  }

  /**
   * Create a new activity log
   */
  async createActivityLog(data: ActivityLogRequest): Promise<ActivityLog> {
    const response = await api.post('/api/activity-logs', data);
    return response.data;
  }

  /**
   * Update an existing activity log
   */
  async updateActivityLog(id: number, data: ActivityLogRequest): Promise<ActivityLog> {
    const response = await api.put(`/api/activity-logs/${id}`, data);
    return response.data;
  }

  /**
   * Delete an activity log
   */
  async deleteActivityLog(id: number): Promise<void> {
    await api.delete(`/api/activity-logs/${id}`);
  }

  /**
   * Submit an activity log (change status from draft to submitted)
   */
  async submitActivityLog(id: number): Promise<ActivityLog> {
    const response = await api.post(`/api/activity-logs/${id}/submit`);
    return response.data;
  }

  /**
   * Get activity log summary
   */
  async getActivityLogSummary(): Promise<ActivityLogSummary> {
    const response = await api.get('/api/activity-logs/summary');
    return response.data;
  }
}

export default new ActivityLogService();