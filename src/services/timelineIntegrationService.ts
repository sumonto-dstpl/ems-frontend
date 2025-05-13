import { format } from 'date-fns';
import attendanceService from './attendanceService';
import activityLogService from './activityLogService';
import { ActivityLog, ActivityLogType } from '../types/activityLog';
import { AttendanceStatus } from '../types/attendance';

/**
 * Service to integrate attendance and timeline functionality
 */
class TimelineIntegrationService {
  /**
   * Check if a specific date requires a timeline entry submission
   * (returns false for holidays and leave days)
   */
  async requiresTimelineSubmission(date: Date, userId?: number): Promise<boolean> {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const year = date.getFullYear();
    
    try {
      // Check if it's a holiday
      const holidays = await attendanceService.getHolidays(year);
      const isHoliday = holidays.some(holiday => {
        const holidayDate = new Date(holiday.date);
        return holidayDate.toISOString().split('T')[0] === formattedDate;
      });
      
      if (isHoliday) {
        return false;
      }
      
      // Check if user is on leave for this date
      if (userId) {
        // Get all attendance records for the date range (this date only)
        const attendanceRecords = await attendanceService.getAttendanceByDateRange(formattedDate, formattedDate);
        
        // Find user's record for the date
        const userRecord = attendanceRecords.find(record => record.userId === userId);
        
        // If user is on leave, no timeline submission required
        if (userRecord && (userRecord.status === AttendanceStatus.LEAVE || 
                           userRecord.status === AttendanceStatus.WFH)) {
          return false;
        }
      }
      
      // Not a holiday and not on leave, so timeline submission is required
      return true;
    } catch (error) {
      console.error('Error checking timeline submission requirement:', error);
      // If there's an error, default to requiring submission
      return true;
    }
  }
  
  /**
   * Get or create an appropriate activity log entry for a date
   * (will auto-generate entries for holidays and leave days)
   */
  async getOrCreateActivityLog(date: Date, userId?: number): Promise<ActivityLog | null> {
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    try {
      // Try to get existing activity log
      let activityLog = await activityLogService.getActivityLogByDate(formattedDate);
      
      // If activity log exists, return it
      if (activityLog) {
        return activityLog;
      }
      
      // Check if it requires submission
      const requiresSubmission = await this.requiresTimelineSubmission(date, userId);
      
      if (!requiresSubmission) {
        // Determine if it's a holiday or leave day
        const year = date.getFullYear();
        const holidays = await attendanceService.getHolidays(year);
        const holiday = holidays.find(h => {
          const holidayDate = new Date(h.date);
          return holidayDate.toISOString().split('T')[0] === formattedDate;
        });
        
        if (holiday) {
          // Create a special holiday entry
          const holidayEntry = await activityLogService.createActivityLog({
            date: formattedDate,
            tasks: JSON.stringify([{ description: `Holiday: ${holiday.name}`, completed: true }]),
            hoursSpent: 0,
            type: ActivityLogType.HOLIDAY,
            status: 'auto-submitted'
          });
          return holidayEntry;
        }
        
        if (userId) {
          // Check if it's a leave day
          const attendanceRecords = await attendanceService.getAttendanceByDateRange(formattedDate, formattedDate);
          const userRecord = attendanceRecords.find(record => record.userId === userId);
          
          if (userRecord && userRecord.status === AttendanceStatus.LEAVE) {
            // Create a special leave entry
            const leaveEntry = await activityLogService.createActivityLog({
              date: formattedDate,
              tasks: JSON.stringify([{ description: 'On Leave', completed: true }]),
              hoursSpent: 0,
              type: ActivityLogType.LEAVE,
              status: 'auto-submitted'
            });
            return leaveEntry;
          } else if (userRecord && userRecord.status === AttendanceStatus.WFH) {
            // Create a special WFH entry
            const wfhEntry = await activityLogService.createActivityLog({
              date: formattedDate,
              tasks: JSON.stringify([{ description: 'Working From Home', completed: true }]),
              hoursSpent: 8, // Default working hours
              type: ActivityLogType.WFH,
              status: 'auto-submitted'
            });
            return wfhEntry;
          }
        }
      }
      
      // No special conditions apply, return null to allow normal timeline entry
      return null;
    } catch (error) {
      console.error('Error in getOrCreateActivityLog:', error);
      return null;
    }
  }
}

export default new TimelineIntegrationService();