/**
 * Attendance status types as an enum for better type safety
 */
export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  LEAVE = 'LEAVE',
  WFH = 'WFH'
}

/**
 * User attendance record interface
 */
export interface UserAttendance {
  id: number;
  userId: number;
  userName: string;  // For display purposes
  date: string;      // ISO format date
  status: AttendanceStatus;
  notes?: string;    // Optional notes about attendance
  markedBy: number;  // Admin ID who marked the attendance
  markedAt: string;  // Timestamp when attendance was recorded
}

/**
 * Holiday entry interface
 */
export interface HolidayEntry {
  id: number;
  date: string;      // ISO format date
  name: string;      // Name/description of the holiday
  isRecurringYearly?: boolean; // Whether this holiday repeats every year
}

/**
 * Attendance report interface
 */
export interface AttendanceReport {
  userId: number;
  userName: string;
  totalWorkingDays: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  leaveCount: number;
  wfhCount: number;
  attendancePercentage: number; // Calculated field
}

/**
 * Attendance summary interface
 */
export interface AttendanceSummary {
  period: string;
  totalUsers: number;
  totalWorkingDays: number;
  averageAttendance: number;
  statusBreakdown: {
    present: number;
    absent: number;
    late: number;
    leave: number;
    wfh: number;
  };
}