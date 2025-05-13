import { ActivityLog } from './activityLog';
import { User } from './user';

/**
 * TeamActivityLog interface - extends ActivityLog with user information
 */
export interface TeamActivityLog extends ActivityLog {
  user?: User;
  userName?: string; // For backward compatibility
}

/**
 * TeamMember interface - represents a team member
 */
export interface TeamMember {
  id: number;
  userId: number;
  name: string;
  email: string;
  role: string;
  department?: string;
  profileImageUrl?: string;
}

/**
 * TeamActivitySummary interface - represents summary statistics for team activity logs
 */
export interface TeamActivitySummary {
  totalMembers: number;
  totalLogs: number;
  submittedLogs: number;
  approvedLogs: number;
  pendingApprovalLogs: number;
  averageHoursPerMember: number;
  completionRate: number;
  mostActiveMembers: Array<{id: number, name: string, logsCount: number}>;
}