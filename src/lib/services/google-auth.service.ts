import { apiFetch } from '@/lib/api';

export interface GoogleAuthResponse {
  authenticated: boolean;
  email?: string;
  name?: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
  token?: string;
  expiryTime?: string;
}

export interface PasswordSetupRequest {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

// Profile completion will be handled by profile-service

export class GoogleAuthService {
  /**
   * Redirect to Google OAuth - Backend handles the redirect
   */
  static async redirectToGoogle(): Promise<void> {
    try {
      // Direct redirect to backend endpoint which will handle Google OAuth
      window.location.href = 'http://localhost:8080/api/v1/authenticate/auth/google/redirect';
    } catch (error) {
      console.error('Failed to redirect to Google OAuth:', error);
      throw error;
    }
  }

  /**
   * Handle Google OAuth callback
   */
  static async handleCallback(code: string, state: string): Promise<GoogleAuthResponse> {
    try {
      const response = await apiFetch<GoogleAuthResponse>('/auth/google/callback', {
        method: 'GET',
        params: { code, state }
      });
      return response.result;
    } catch (error) {
      console.error('Failed to handle Google OAuth callback:', error);
      throw error;
    }
  }

  /**
   * Setup password for Google user
   */
  static async setupPassword(request: PasswordSetupRequest): Promise<void> {
    try {
      await apiFetch('/auth/google/setup-password', {
        method: 'POST',
        body: JSON.stringify({
          email: request.email,
          newPassword: request.newPassword
        })
      });
    } catch (error) {
      console.error('Failed to setup password:', error);
      throw error;
    }
  }

  /**
   * Check if password setup is required
   */
  static async isPasswordSetupRequired(email: string): Promise<boolean> {
    try {
      const response = await apiFetch<boolean>('/auth/password/check', {
        method: 'GET',
        params: { email }
      });
      return response.result;
    } catch (error) {
      console.error('Failed to check password setup requirement:', error);
      return false;
    }
  }

  // Profile completion methods will be handled by profile-service
}

