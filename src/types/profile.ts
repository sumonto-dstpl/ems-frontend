/**
 * User Profile interface
 */
export interface UserProfile {
  id: number | null;
  name: string | null;
  email: string | null;
  picture: string | null;
  bio: string | null;
  jobTitle: string | null;
  department: string | null;
  skills: string[];
  preferences: Record<string, string>;
  profileCompletion: number;
}

/**
 * Profile Update Request interface
 */
export interface ProfileUpdateRequest {
  name?: string;
  bio?: string;
  jobTitle?: string;
  department?: string;
  skills?: string[];
  preferences?: Record<string, string>;
}