import { apiFetch, API_BASE_URL, type ApiResponse } from "@/lib/api";
import { IntrospectResponse, LoginRequest, LoginResponse, RegisterRequest, VerifyEmailRequest, ProfileCompletionRequest, ProfileStatusResponse } from "@/types/auth";
import { profileService } from "@/lib/services/profileService";

export interface ChangePasswordRequest {
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
}

export const AuthAPI = {
  login: async (data: LoginRequest) => {
    return apiFetch<LoginResponse>(`/authenticate/auth/login`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  register: async (data: RegisterRequest) => {
    return apiFetch<unknown>(`/authenticate/users/register`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  sendVerification: async (email: string) => {
    return apiFetch<unknown>(`/authenticate/auth/send-email-verification`, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },
  verifyEmail: async (data: VerifyEmailRequest) => {
    return apiFetch<unknown>(`/authenticate/auth/verify-email`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  introspect: async (token: string) => {
    // For introspect, we send the token in the body, not in Authorization header
    // So we make a direct fetch call instead of using apiFetch
    const res = await fetch(`${API_BASE_URL}/authenticate/auth/introspect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });
    return (await res.json()) as ApiResponse<IntrospectResponse>;
  },
  completeProfile: async (data: ProfileCompletionRequest) => {
    return apiFetch<unknown>(`/authenticate/users/complete-profile`, {
      method: "POST",
      body: JSON.stringify(data),
    });
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
  resendOTP: async (email: string) => {
    return apiFetch<unknown>(`/authenticate/users/resend-otp?email=${encodeURIComponent(email)}`, {
      method: "POST",
    });
  },

  sendPasswordResetOTP: async (email: string) => {
    return apiFetch<unknown>(`/authenticate/auth/send-password-reset?email=${encodeURIComponent(email)}`, {
      method: "POST",
    });
  },
  logout: async (token: string) => {
    // For logout, we don't need Authorization header since token is in body
    const res = await fetch(`${API_BASE_URL}/authenticate/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });
    return (await res.json()) as ApiResponse<unknown>;
  },
  getMe: async () => {
    return apiFetch<unknown>(`/authenticate/users/me`, {
      method: "GET",
    });
  },

  // Password management functions
  changePassword: async (data: ChangePasswordRequest) => {
    return apiFetch<unknown>(`/authenticate/auth/change-password`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  setupPasswordForGoogleUser: async (email: string, newPassword: string) => {
    // This is a PUBLIC endpoint, so we don't use apiFetch (which adds Authorization header)
    const response = await fetch(`${API_BASE_URL}/authenticate/auth/google/setup-password?email=${encodeURIComponent(email)}&newPassword=${encodeURIComponent(newPassword)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Setup password failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Failed to setup password: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  },

  resetPassword: async (data: { email: string; otp: string; newPassword: string }) => {
    return apiFetch<unknown>(`/authenticate/auth/reset-password`, {
      method: "POST",
      body: JSON.stringify({
        email: data.email,
        otpCode: data.otp,
        newPassword: data.newPassword
      }),
    });
  },

  getPasswordSetupStatus: async (email: string) => {
    // This is a PUBLIC endpoint, so we don't use apiFetch (which adds Authorization header)
    const response = await fetch(`${API_BASE_URL}/authenticate/auth/password-setup-status?email=${encodeURIComponent(email)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Get password setup status failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Failed to get password setup status: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
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

  /**
   * Kiểm tra xem user có cần setup password không
   */
  async checkPasswordSetupRequired(): Promise<boolean> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return false;

      // Get user email from token
      const payload = JSON.parse(atob(token.split('.')[1]));
      const email = payload.email;
      
      if (!email) return false;

      const res = await AuthAPI.getPasswordSetupStatus(email);
      return res.result || false;
    } catch (error) {
      console.error('Error checking password setup:', error);
      return false;
    }
  }

  /**
   * Setup password cho Google users
   */
  async setupPassword(password: string, email?: string): Promise<void> {
    try {
      if (!email) {
        throw new Error('Email is required for password setup');
      }
      
      console.log('Setup password request:', {
        email,
        hasPassword: !!password
      });

      // Use the AuthAPI service (through gateway)
      await AuthAPI.setupPasswordForGoogleUser(email, password);
      
      // After successful setup, refresh auth context to update passwordSetupRequired status
      if (typeof window !== 'undefined') {
        // Trigger a page refresh or context update
        window.dispatchEvent(new CustomEvent('passwordSetupCompleted'));
      }
    } catch (error) {
      console.error('Setup password error:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
export default authService;
