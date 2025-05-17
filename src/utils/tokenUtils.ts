/**
 * Utility functions for handling authentication tokens
 */
class TokenUtils {
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';

  /**
   * Set the access token in localStorage
   */
  setAccessToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  /**
   * Set the refresh token in localStorage
   */
  setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  /**
   * Get the access token from localStorage
   */
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Get the refresh token from localStorage
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Clear all authentication tokens
   */
  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Check if a token exists
   */
  hasToken(): boolean {
    return !!this.getAccessToken();
    // return true
  }

  /**
   * Parse JWT token and extract payload
   */
  parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error parsing JWT token', e);
      return null;
    }
  }

  /**
   * Check if the access token is expired
   */
  isTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;
    
    try {
      const payload = this.parseJwt(token);
      if (!payload || !payload.exp) return true;
      
      // exp is in seconds, Date.now() is in milliseconds
      return payload.exp * 1000 < Date.now();
    } catch (e) {
      console.error('Error checking token expiration', e);
      return true;
    }
    // return false;
  }

  /**
   * Get user ID from token
   */
  getUserIdFromToken(): number | null {
    const token = this.getAccessToken();
    if (!token) return null;
    
    try {
      const payload = this.parseJwt(token);
      return payload?.userId || null;
    } catch (e) {
      console.error('Error getting user ID from token', e);
      return null;
    }
  }

  /**
   * Get user email from token
   */
  getUserEmailFromToken(): string | null {
    const token = this.getAccessToken();
    if (!token) return null;
    
    try {
      const payload = this.parseJwt(token);
      return payload?.sub || null;
    } catch (e) {
      console.error('Error getting user email from token', e);
      return null;
    }
  }

  /**
   * Get user name from token
   */
  getUserNameFromToken(): string | null {
    const token = this.getAccessToken();
    if (!token) return null;
    
    try {
      const payload = this.parseJwt(token);
      return payload?.name || null;
    } catch (e) {
      console.error('Error getting user name from token', e);
      return null;
    }
  }

  /**
   * Get user picture from token
   */
  getUserPictureFromToken(): string | null {
    const token = this.getAccessToken();
    if (!token) return null;
    
    try {
      const payload = this.parseJwt(token);
      return payload?.picture || null;
    } catch (e) {
      console.error('Error getting user picture from token', e);
      return null;
    }
  }

  /**
   * Get user roles from token
   */
  getUserRolesFromToken(): string[] {
    const token = this.getAccessToken();
    if (!token) return [];
    
    try {
      const payload = this.parseJwt(token);
      return payload?.roles || [];
    } catch (e) {
      console.error('Error getting user roles from token', e);
      return [];
    }
  }

  /**
   * Get user system role from token
   */
  getSystemRoleFromToken(): string | null {
    const token = this.getAccessToken();
    if (!token) return null;
    
    try {
      const payload = this.parseJwt(token);
      return payload?.systemRole || null;
    } catch (e) {
      console.error('Error getting system role from token', e);
      return null;
    }
  }

  /**
   * Get user permissions from token
   */
  getUserPermissionsFromToken(): string[] {
    const token = this.getAccessToken();
    if (!token) return [];
    
    try {
      const payload = this.parseJwt(token);
      return payload?.permissions || [];
    } catch (e) {
      console.error('Error getting user permissions from token', e);
      return [];
    }
  }

  /**
   * Get user project memberships from token
   */
  getUserProjectsFromToken(): any[] {
    const token = this.getAccessToken();
    if (!token) return [];
    
    try {
      const payload = this.parseJwt(token);
      return payload?.projects || [];
    } catch (e) {
      console.error('Error getting user projects from token', e);
      return [];
    }
  }

  /**
   * Check if user has a specific role
   */
  hasRole(roleName: string): boolean {
    const roles = this.getUserRolesFromToken();
    return roles.includes(roleName);
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.getSystemRoleFromToken() === 'ADMIN';
  }

  /**
   * Check if user is manager
   */
  isManager(): boolean {
    const systemRole = this.getSystemRoleFromToken();
    return systemRole === 'MANAGER' || systemRole === 'ADMIN';
  }

  /**
   * Check if user has a specific permission
   */
  hasPermission(permissionName: string): boolean {
    const permissions = this.getUserPermissionsFromToken();
    return permissions.includes(permissionName);
  }
}

export default new TokenUtils();