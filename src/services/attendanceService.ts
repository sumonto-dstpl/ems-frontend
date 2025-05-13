import api from './api';
import { AttendanceStatus, UserAttendance, HolidayEntry, AttendanceReport, AttendanceSummary } from '../types/attendance';

/**
 * Service for handling attendance management API calls
 */
class AttendanceService {
  /**
   * Get attendance for a specific date for all users
   */
  async getDailyAttendance(date: string): Promise<UserAttendance[]> {
    const response = await api.get('/api/attendance/daily', {
      params: { date }
    });
    return response.data;
  }

  /**
   * Get attendance for a date range for all users
   */
  async getAttendanceByDateRange(startDate: string, endDate: string): Promise<UserAttendance[]> {
    const response = await api.get('/api/attendance/range', {
      params: { startDate, endDate }
    });
    return response.data;
  }
  
  /**
   * Mark attendance for a single user
   */
  async markAttendance(userId: number, date: string, status: AttendanceStatus, notes?: string): Promise<UserAttendance> {
    const response = await api.post('/api/attendance/mark', {
      userId,
      date,
      status,
      notes
    });
    return response.data;
  }
  
  /**
   * Bulk mark attendance for multiple users at once
   */
  async bulkMarkAttendance(attendances: Array<{
    userId: number;
    date: string;
    status: AttendanceStatus;
    notes?: string;
  }>): Promise<UserAttendance[]> {
    const response = await api.post('/api/attendance/bulk-mark', {
      attendances
    });
    return response.data;
  }
  
  /**
   * Upload Excel for bulk attendance update
   */
  async uploadAttendanceExcel(file: File): Promise<{ processed: number; errors: any[] }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/api/attendance/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  }
  
  /**
   * Get holiday list for a specific year
   */
  async getHolidays(year: number): Promise<HolidayEntry[]> {
    const response = await api.get('/api/holidays', {
      params: { year }
    });
    return response.data;
  }
  
  /**
   * Add a new holiday
   */
  async addHoliday(holiday: Omit<HolidayEntry, 'id'>): Promise<HolidayEntry> {
    const response = await api.post('/api/holidays', holiday);
    return response.data;
  }
  
  /**
   * Delete a holiday
   */
  async deleteHoliday(id: number): Promise<void> {
    await api.delete(`/api/holidays/${id}`);
  }
  
  /**
   * Upload holiday list (Excel)
   */
  async uploadHolidayList(file: File): Promise<{ processed: number; errors: any[] }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/api/holidays/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  }
  
  /**
   * Download holiday list Excel template
   */
  async downloadHolidayTemplate(): Promise<Blob> {
    const response = await api.get('/api/holidays/template', {
      responseType: 'blob'
    });
    return response.data;
  }
  
  /**
   * Download attendance template
   */
  async downloadAttendanceTemplate(): Promise<Blob> {
    const response = await api.get('/api/attendance/template', {
      responseType: 'blob'
    });
    return response.data;
  }
  
  /**
   * Get attendance report
   */
  async getAttendanceReport(startDate: string, endDate: string): Promise<AttendanceReport[]> {
    const response = await api.get('/api/attendance/report', {
      params: { startDate, endDate }
    });
    return response.data;
  }
  
  /**
   * Get attendance summary statistics
   */
  async getAttendanceSummary(startDate: string, endDate: string): Promise<AttendanceSummary> {
    const response = await api.get('/api/attendance/summary', {
      params: { startDate, endDate }
    });
    return response.data;
  }
  
  /**
   * Export attendance report to Excel
   */
  async exportAttendanceReport(startDate: string, endDate: string): Promise<Blob> {
    const response = await api.get('/api/attendance/export', {
      params: { startDate, endDate },
      responseType: 'blob'
    });
    return response.data;
  }
}

export default new AttendanceService();