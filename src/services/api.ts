import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import tokenUtils from '../utils/tokenUtils';
import { formatApiError, isAuthError, shouldPromptRetry } from '../utils/errorUtils';
// import store from '../store';
import { logout } from '../store/slices/authSlice';

const apiConfig: AxiosRequestConfig = {
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies/sessions
  timeout: 30000, // 30 second timeout to prevent hanging requests
};

const api: AxiosInstance = axios.create(apiConfig);

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config: any) => {
    const token = tokenUtils.getAccessToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: any) => {
    const originalRequest: any = error.config;
    
    // If error is 401 and we haven't tried refreshing and it's not a token refresh request
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !originalRequest.url?.includes('refresh-token')
    ) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = tokenUtils.getRefreshToken();
        
        if (refreshToken) {
          // Try to refresh the token
          const authBaseUrl = process.env.REACT_APP_AUTH_URL || '/auth';
          console.log('Attempting to refresh token');
          
          const response = await axios.post(`${authBaseUrl}/refresh-token`, 
            { refreshToken }, 
            { headers: { 'Content-Type': 'application/json' } }
          );
          
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          
          if (accessToken && newRefreshToken) {
            console.log('Token refresh successful');
            
            // Update stored tokens
            tokenUtils.setAccessToken(accessToken);
            tokenUtils.setRefreshToken(newRefreshToken);
            
            // Update the authorization header
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            
            // Retry the original request
            return axios(originalRequest);
          } else {
            throw new Error('Invalid refresh token response');
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed', refreshError);
        const { default: store } = await import('../store');
        // Dispatch logout action to update Redux state
        store.dispatch(logout());
      }
      
      // If we get here, refresh failed, redirect to login
      if (window.location.pathname !== '/login') {
        console.log('Authentication failed, redirecting to login');
        // Clear tokens
        tokenUtils.clearTokens();
        const { default: store } = await import('../store');
        // Use proper React routing through Redux
        store.dispatch(logout());
      }
    }
    
    // Create enhanced error with user-friendly messages
    const enhancedError: any = {
      ...error,
      userMessage: formatApiError(error),
      shouldRetry: shouldPromptRetry(error),
      isAuthError: isAuthError(error)
    };
    
    // Log all API errors to help with debugging (but omit sensitive data)
    console.error('API Error:', {
      url: originalRequest?.url || 'Unknown URL',
      method: originalRequest?.method || 'Unknown Method',
      status: error.response?.status,
      statusText: error.response?.statusText || 'No status text',
      message: error.message
    });
    
    return Promise.reject(enhancedError);
  }
);

export default api;