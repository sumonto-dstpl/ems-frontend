import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import { 
  AuthState, 
  User, 
  AuthResponse, 
  isUserAdmin, 
  isUserManager,
  hasUserRole, 
  LoginRequest 
} from '../../types/auth';
import { SystemRole } from '../../types/roles';
import tokenUtils from '../../utils/tokenUtils';

// Initial state
const initialState: AuthState = {
  // isAuthenticated: tokenUtils.hasToken() && !tokenUtils.isTokenExpired(),
  isAuthenticated: tokenUtils.hasToken() && !tokenUtils.isTokenExpired(),
  user: null,
  loading: false,
  error: null,
  isAdmin: false,
  isManager: false,
  roles: [],
  systemRole: null,
  permissions: [],
};

// Async thunks
export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (_: void, { rejectWithValue }: { rejectWithValue: (value: string) => any }) => {
    try {
      // Use environment variable instead of hardcoded URL
      const authUrl = process.env.REACT_APP_GOOGLE_AUTH_URL || '/auth/login';
      window.location.href = authUrl;
      return null;
    } catch (error) {
      return rejectWithValue('Failed to redirect to Google login');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: LoginRequest, { rejectWithValue }: { rejectWithValue: (value: string) => any }) => {
    try {
      const response = await authService.login(credentials);
      return response;
    } catch (error) {
      return rejectWithValue('Login failed. Please check your credentials and try again.');
    }
  }
);

export const adminLogin = createAsyncThunk(
  'auth/adminLogin',
  async (credentials: LoginRequest, { rejectWithValue }: { rejectWithValue: (value: string) => any }) => {
    try {
      // Set isAdmin flag to ensure admin login is used
      const adminCredentials = { ...credentials, isAdmin: true };
      const response = await authService.adminLogin(adminCredentials);
      return response;
    } catch (error) {
      return rejectWithValue('Admin login failed. Please check your credentials and try again.');
    }
  }
);

export const processOAuthCallback = createAsyncThunk(
  'auth/processOAuthCallback',
  async (queryParams: URLSearchParams, { rejectWithValue }: { rejectWithValue: (value: string) => any }) => {
    try {
      const token = queryParams.get('token');
      const refreshToken = queryParams.get('refreshToken');
      const userId = queryParams.get('userId');
      const email = queryParams.get('email');
      const name = queryParams.get('name');
      const picture = queryParams.get('picture');
      
      if (!token || !refreshToken) {
        return rejectWithValue('Invalid authentication data received');
      }
      
      // Store tokens using tokenUtils
      tokenUtils.setAccessToken(token);
      tokenUtils.setRefreshToken(refreshToken);
      
      // Log success for debugging but don't log sensitive data
      console.log('Authentication data processed successfully');
      
      return {
        userId: userId ? parseInt(userId, 10) : null,
        email,
        name,
        picture,
        token,
        refreshToken,
        authenticated: true,
        message: 'Authentication successful'
      };
    } catch (error) {
      console.error('OAuth callback processing error:', error);
      return rejectWithValue('Failed to process authentication data');
    }
  }
);

export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async (_: void, { rejectWithValue }: { rejectWithValue: (value: string) => any }) => {
    try {
      // First check if we have a token
      if (!tokenUtils.hasToken()) {
        return {
          userId: null,
          email: null,
          name: null,
          picture: null,
          token: null,
          refreshToken: null,
          authenticated: false,
          message: 'No authentication token found'
        };
      }
      
      // Check if token is expired
      if (tokenUtils.isTokenExpired()) {
        try {
          // Try to refresh the token
          const newToken = await authService.refreshToken();
          if (!newToken) {
            // If refresh failed, return unauthenticated
            tokenUtils.clearTokens(); // Clear invalid tokens
            return {
              userId: null,
              email: null,
              name: null,
              picture: null,
              token: null,
              refreshToken: null,
              authenticated: false,
              message: 'Token expired and refresh failed'
            };
          }
          console.log('Token refreshed successfully');
        } catch (refreshError) {
          console.error('Token refresh error:', refreshError);
          // If refresh throws an error, clear tokens and return unauthenticated
          tokenUtils.clearTokens();
          return {
            userId: null,
            email: null,
            name: null,
            picture: null,
            token: null,
            refreshToken: null,
            authenticated: false,
            message: 'Token refresh error'
          };
        }
      }
      
      // Get current user with valid token
      try {
        const response = await authService.getCurrentUser();
        return response;
      } catch (userError) {
        console.error('Error getting current user:', userError);
        // If getting user fails, clear tokens and return error
        tokenUtils.clearTokens();
        return rejectWithValue('Failed to get current user information');
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      return rejectWithValue('Authentication check failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_: void, { rejectWithValue }: { rejectWithValue: (value: string) => any }) => {
    try {
      await authService.logout();
      return null;
    } catch (error) {
      console.error('Logout error:', error);
      return rejectWithValue('Logout failed');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle loginWithGoogle
      .addCase(loginWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(loginWithGoogle.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Handle processOAuthCallback
      .addCase(processOAuthCallback.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processOAuthCallback.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = {
          id: action.payload.userId,
          email: action.payload.email,
          name: action.payload.name,
          picture: action.payload.picture,
          roles: action.payload.roles,
          systemRole: action.payload.systemRole,
          permissions: action.payload.permissions,
          projects: action.payload.projects
        };
        
        // Set roles and check user roles
        state.roles = action.payload.roles || [];
        state.systemRole = action.payload.systemRole || null;
        state.permissions = action.payload.permissions || [];
        state.isAdmin = isUserAdmin(state.user);
        state.isManager = isUserManager(state.user);
      })
      .addCase(processOAuthCallback.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Handle checkAuthStatus
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.loading = false;
        state.isAuthenticated = action.payload.authenticated;
        
        if (action.payload.authenticated) {
          state.user = {
            id: action.payload.userId,
            email: action.payload.email,
            name: action.payload.name,
            picture: action.payload.picture,
            roles: action.payload.roles,
            systemRole: action.payload.systemRole,
            permissions: action.payload.permissions,
            projects: action.payload.projects,
          };
          
          // Set roles and check user roles
          state.roles = action.payload.roles || [];
          state.systemRole = action.payload.systemRole || null;
          state.permissions = action.payload.permissions || [];
          state.isAdmin = isUserAdmin(state.user);
          state.isManager = isUserManager(state.user);
        } else {
          state.user = null;
          state.roles = [];
          state.isAdmin = false;
          state.isManager = false;
          state.systemRole = null;
          state.permissions = [];
        }
      })
      .addCase(checkAuthStatus.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
      })
      
      // Handle logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.roles = [];
        state.isAdmin = false;
        state.isManager = false;
        state.systemRole = null;
        state.permissions = [];
        // Clear tokens using tokenUtils
        tokenUtils.clearTokens();
      })
      .addCase(logout.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Handle loginUser
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.loading = false;
        state.isAuthenticated = action.payload.authenticated;
        
        if (action.payload.authenticated) {
          state.user = {
            id: action.payload.userId,
            email: action.payload.email,
            name: action.payload.name,
            picture: action.payload.picture,
            roles: action.payload.roles,
            systemRole: action.payload.systemRole,
            permissions: action.payload.permissions,
            projects: action.payload.projects,
          };
          
          // Set roles and check user roles
          state.roles = action.payload.roles || [];
          state.systemRole = action.payload.systemRole || null;
          state.permissions = action.payload.permissions || [];
          state.isAdmin = isUserAdmin(state.user);
          state.isManager = isUserManager(state.user);
        }
      })
      .addCase(loginUser.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Handle adminLogin
      .addCase(adminLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.loading = false;
        state.isAuthenticated = action.payload.authenticated;
        
        if (action.payload.authenticated) {
          state.user = {
            id: action.payload.userId,
            email: action.payload.email,
            name: action.payload.name,
            picture: action.payload.picture,
            roles: action.payload.roles,
            systemRole: action.payload.systemRole,
            permissions: action.payload.permissions,
            projects: action.payload.projects,
          };
          
          // Set roles and check user roles
          state.roles = action.payload.roles || [];
          state.systemRole = action.payload.systemRole || null;
          state.permissions = action.payload.permissions || [];
          state.isAdmin = isUserAdmin(state.user);
          state.isManager = isUserManager(state.user);
        }
      })
      .addCase(adminLogin.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetAuthError } = authSlice.actions;
export default authSlice.reducer;