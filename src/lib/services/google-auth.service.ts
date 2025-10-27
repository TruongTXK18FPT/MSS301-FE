import { authApi } from './axios';
import { GoogleAuthResponse, PasswordSetupRequest } from '@/lib/dto/auth';
import { ApiResponse } from '@/lib/dto/common';

// Profile completion will be handled by profile-service

export class GoogleAuthService {
  /**
   * Redirect to Google OAuth - Backend handles the redirect
   */
  static async redirectToGoogle(): Promise<void> {
    try {
      // Use dynamic URL from authApi configuration
      const baseURL = authApi.defaults.baseURL; // http://localhost:8080/api/v1/authenticate
      window.location.href = `${baseURL}/auth/google/redirect`;
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
      const response = await authApi.get<ApiResponse<GoogleAuthResponse>>('/auth/google/callback', {
        params: { code, state }
      });
      return response.data.result!;
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
      await authApi.post('/auth/google/setup-password', {
        email: request.email,
        newPassword: request.newPassword
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
      const response = await authApi.get<ApiResponse<boolean>>('/auth/password/check', {
        params: { email }
      });
      return response.data.result ?? false;
    } catch (error) {
      console.error('Failed to check password setup requirement:', error);
      return false;
    }
  }

  // Profile completion methods will be handled by profile-service
}

