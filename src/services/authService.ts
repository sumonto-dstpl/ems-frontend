import api from './api';
import { AuthResponse, TokenResponse, LoginRequest } from '../types/auth';
import tokenUtils from '../utils/tokenUtils';

/**
 * Service for handling authentication-related API calls.
 */
class AuthService {
  /**
   * Get the current authenticated user
   */
  async getCurrentUser(): Promise<AuthResponse> {
    try {
      // Check if token exists and is valid
      if (!tokenUtils.hasToken() || tokenUtils.isTokenExpired()) {
        // Try to refresh token if we have a refresh token
        const refreshResult = await this.refreshToken();
        if (!refreshResult) {
          throw new Error('No valid authentication found');
        }
      }
      
      const response = await api.get('/auth/current-user');
      return response.data;
    } catch (error) {
      console.error('Failed to get current user', error);
      return {
        userId: null,
        email: null,
        name: null,
        picture: null,
        token: null,
        authenticated: false,
        message: 'Failed to get current user'
      };
    }
  }

  /**
   * Log out the current user
   */
  async logout(): Promise<void> {
    try {
      // Call the logout endpoint
      await api.post('/auth/logout');
      // Clear tokens
      tokenUtils.clearTokens();
    } catch (error) {
      console.error('Logout failed', error);
      // Still clear tokens even if API call fails
      tokenUtils.clearTokens();
    }
  }

  /**
   * Refresh the access token using the refresh token
   */
  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = tokenUtils.getRefreshToken();
      if (!refreshToken) {
        return null;
      }

      const response = await api.post<TokenResponse>('/auth/refresh-token', { refreshToken });
      const { accessToken, refreshToken: newRefreshToken } = response.data;
      
      // Store the new tokens
      tokenUtils.setAccessToken(accessToken);
      tokenUtils.setRefreshToken(newRefreshToken);
      
      return accessToken;
    } catch (error) {
      console.error('Token refresh failed', error);
      // Clear tokens on failure to force re-login
      tokenUtils.clearTokens();
      return null;
    }
  }

  /**
   * Get the stored access token
   */
  getAccessToken(): string | null {
    return tokenUtils.getAccessToken();
  }

  /**
   * Check if the user is authenticated with a valid token
   */
  isAuthenticated(): boolean {
    return tokenUtils.hasToken() && !tokenUtils.isTokenExpired();
  }

  /**
   * Admin login with email and password
   */
  async adminLogin(credentials: { email: string; password: string }): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/admin/login', credentials);
      const { token, refreshToken } = response.data;
      
      // Store tokens
      if (token && refreshToken) {
        tokenUtils.setAccessToken(token);
        tokenUtils.setRefreshToken(refreshToken);
      }
      
      return response.data;
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    }
  }

  /**
   * Regular user login with email and password
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const endpoint = credentials.isAdmin ? '/auth/admin/login' : '/auth/login';
      const response = await api.post(endpoint, credentials);
      const { token, refreshToken } = response.data;
      
      // Store tokens
      if (token && refreshToken) {
        tokenUtils.setAccessToken(token);
        tokenUtils.setRefreshToken(refreshToken);
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }
}

export default new AuthService();