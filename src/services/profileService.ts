import api from './api';
import { UserProfile, ProfileUpdateRequest } from '../types/profile';

/**
 * Service for handling user profile API calls
 */
class ProfileService {
  /**
   * Get the current user's profile
   */
  async getCurrentUserProfile(): Promise<UserProfile> {
    const response = await api.get('/api/profile/me');
    return response.data;
  }

  /**
   * Get a user profile by ID
   */
  async getUserProfile(userId: number): Promise<UserProfile> {
    const response = await api.get(`/api/profile/${userId}`);
    return response.data;
  }

  /**
   * Update the current user's profile
   */
  async updateProfile(data: ProfileUpdateRequest): Promise<UserProfile> {
    const response = await api.put('/api/profile/update', data);
    return response.data;
  }
}

export default new ProfileService();