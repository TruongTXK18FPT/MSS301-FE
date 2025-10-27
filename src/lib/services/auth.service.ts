import { authApi } from './axios';
import { ApiResponse } from '@/lib/dto/common';
import { IntrospectResponse, LoginRequest, LoginResponse, RegisterRequest, VerifyEmailRequest, ProfileCompletionRequest, ProfileStatusResponse, ChangePasswordRequest } from "@/lib/dto/auth";
import { profileService } from "@/lib/services/profileService";

export const AuthAPI = {
  login: async (data: LoginRequest) => {
    const response = await authApi.post<ApiResponse<LoginResponse>>('/auth/login', data);
    return response.data;
  },
  
  register: async (data: RegisterRequest) => {
    const response = await authApi.post<ApiResponse<unknown>>('/users/register', data);
    return response.data;
  },
  
  sendVerification: async (email: string) => {
    const response = await authApi.post<ApiResponse<unknown>>('/auth/send-email-verification', { email });
    return response.data;
  },
  
  verifyEmail: async (data: VerifyEmailRequest) => {
    const response = await authApi.post<ApiResponse<unknown>>('/auth/verify-email', data);
    return response.data;
  },
  
  introspect: async (token: string) => {
    // For introspect, we send the token in the body, not in Authorization header
    // So we make a direct call without the default Authorization header
    const response = await authApi.post<ApiResponse<IntrospectResponse>>(
      '/auth/introspect',
      { token },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        // This will override the Authorization header from interceptor for this specific request
        transformRequest: [(data) => JSON.stringify(data)]
      }
    );
    return response.data;
  },
  
  completeProfile: async (data: ProfileCompletionRequest) => {
    const response = await authApi.post<ApiResponse<unknown>>('/users/complete-profile', data);
    return response.data;
  },
  
  getProfileStatus: async () => {
    try {
      const result = await profileService.getProfileCompletionStatus();
      return {
        code: 1000,
        message: "Success",
        result: {
          profileCompleted: result.profileCompleted,
          userType: result.userType || "STUDENT",
          email: result.email || ""
        }
      };
    } catch (error) {
      throw error;
    }
  },
  
  resendEmailVerificationOTP: async (email: string) => {
    const response = await authApi.post<ApiResponse<unknown>>(`/auth/resend-email-verification?email=${encodeURIComponent(email)}`);
    return response.data;
  },

  resendPasswordResetOTP: async (email: string) => {
    const response = await authApi.post<ApiResponse<unknown>>(`/auth/resend-password-reset?email=${encodeURIComponent(email)}`);
    return response.data;
  },

  sendPasswordResetOTP: async (email: string) => {
    const response = await authApi.post<ApiResponse<unknown>>(`/auth/send-password-reset?email=${encodeURIComponent(email)}`);
    return response.data;
  },
  
  logout: async (token: string) => {
    // For logout, we don't need Authorization header since token is in body
    const response = await authApi.post<ApiResponse<unknown>>(
      '/auth/logout',
      { token },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    return response.data;
  },
  
  getMe: async () => {
    const response = await authApi.get<ApiResponse<unknown>>('/users/me');
    return response.data;
  },

  // Password management functions
  changePassword: async (data: ChangePasswordRequest) => {
    console.log('[AuthAPI] Change password request:', {
      hasCurrentPassword: !!data.currentPassword,
      hasNewPassword: !!data.newPassword
    });
    
    const response = await authApi.post<ApiResponse<unknown>>('/auth/change-password', data);
    return response.data;
  },

  setupPasswordForGoogleUser: async (email: string, newPassword: string) => {
    // This is now a PRIVATE endpoint, so we use authApi (which adds Authorization header)
    const response = await authApi.post<ApiResponse<unknown>>(
      `/auth/google/setup-password?email=${encodeURIComponent(email)}&newPassword=${encodeURIComponent(newPassword)}`
    );
    return response.data;
  },

  resetPassword: async (data: { email: string; otp: string; newPassword: string }) => {
    const response = await authApi.post<ApiResponse<unknown>>('/auth/reset-password', {
      email: data.email,
      otpCode: data.otp,
      newPassword: data.newPassword
    });
    return response.data;
  },

  getPasswordSetupStatus: async (email: string) => {
    // This is a PUBLIC endpoint, so we make a direct axios call without auth
    const response = await authApi.get<ApiResponse<any>>(
      `/auth/password-setup-status?email=${encodeURIComponent(email)}`,
      {
        // Override the Authorization header for this public endpoint
        transformRequest: [(data) => data],
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (response.status !== 200) {
      console.error('Get password setup status failed:', {
        status: response.status,
        statusText: response.statusText,
      });
      throw new Error(`Failed to get password setup status: ${response.status} ${response.statusText}`);
    }

    return response.data;
  },
};

// AuthService class for higher-level operations
class AuthService {
  /**
   * Lấy thông tin user hiện tại từ localStorage
   */
  getCurrentUserFromStorage() {
    if (typeof window === 'undefined') return null;
    
    const token = localStorage.getItem('authToken');
    if (!token) return null;

    try {
      // Decode JWT token để lấy thông tin user
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.sub,
        email: payload.email,
        username: payload.email,
        role: payload.role || 'STUDENT'
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Đăng xuất
   */
  async logout() {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        await AuthAPI.logout(token);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
    }
  }

}

export const authService = new AuthService();
export default authService;

