/**
 * ActivityLogType enum - represents different types of activity logs
 */
export enum ActivityLogType {
  REGULAR = 'REGULAR',
  HOLIDAY = 'HOLIDAY',
  LEAVE = 'LEAVE',
  WFH = 'WFH'
}

export type DayStatus = 'completed' | 'pending' | 'missing' | 'future' | 'none';

// Define the day info type
export interface DayInfo {
  date: Date;
  status: DayStatus;
}

/**
 * ActivityLog interface - represents a user's activity log entry
 */
export interface ActivityLog {
  id: number;
  userId: number;
  date: string;
  userName?: string |undefined;
  // tasks: { description: string; completed: boolean }[] | string;
  tasks: string;
  hoursSpent?: number;
  blockers?: string;
  accomplishments?: string;
  status: string;
  submittedAt?: string;
  approvedAt?: string;
  approvedById?: number;
  createdAt: string;
  updatedAt: string;
  type?: ActivityLogType;
  challenges?: { description: string }[];
  plannedTasks?: { description: string }[];
}

/**
 * ActivityLogSummary interface - represents summary statistics for activity logs
 */
export interface ActivityLogSummary {
  totalLogs: number;
  submittedLogs: number;
  approvedLogs: number;
  pendingApprovalLogs: number;
  draftLogs: number;
  totalHoursLogged: number;
  averageHoursPerDay: number;
  completionRate: number;
  totalHoursSpent: number,
  statistics: {
    totalSubmitted: number;
    totalApproved: number;
    averageHoursPerDay: number;
  };
}

/**
 * ActivityLogRequest interface - for creating/updating activity logs
 */
export interface ActivityLogRequest {
  date: string;
  // tasks: { description: string; completed: boolean }[] | string;
  tasks: string;
  hoursSpent?: number;
  blockers?: string;
  accomplishments?: string;
  status?: string;
  type?: ActivityLogType;
  challenges?: { description: string }[];
  plannedTasks?: { description: string }[];
}

/**
 * ActivityLogStatus enum - represents the possible statuses of an activity log
 */
export enum ActivityLogStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

// export interface Entry {
//   id?: number;
//   date: Date;
//   tasks: string;
//   hoursSpent: number;
//   blockers: string;
//   accomplishments: string;
//   status: 'draft' | 'submitted' | 'approved';
// }

// export interface PastEntryDisplay {
//   id: number;
//   date: string;
//   status: 'Complete' | 'Partial';
//   hours?: number ;
//   description: string;
//   originalEntry: Entry;
// }

export interface PastEntryDisplay {
  id: number;                     // Unique identifier for the entry
  date: string;                   // The formatted date string (e.g., 'MMMM d, yyyy')
  status: 'Complete' | 'Partial'; // The status of the entry (either 'Complete' or 'Partial')
  hours: number | null | undefined;  // The number of hours spent (can be null or undefined)
  description: string;            // A textual description of the entry
  originalEntry: ActivityLog;     // The original entry (presumably of type `ActivityLog`)
}

/**
 * PageResponse interface - represents a paginated response
 */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  pageNumber: number;
  pageSize: number;
  last: boolean;
}