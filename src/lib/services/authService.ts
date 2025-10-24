import { authApi } from './axios';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthenticationResponse, 
  UserResponse, 
  ApiResponse,
  RefreshTokenRequest,
  LogoutRequest,
  VerifyEmailRequest,
  ResetPasswordRequest,
  PasswordCreationRequest
} from '../dto';

class AuthService {
  /**
   * Đăng nhập user
   */
  async login(credentials: LoginRequest): Promise<AuthenticationResponse> {
    try {
      const response = await authApi.post<ApiResponse<AuthenticationResponse>>('/auth/login', credentials);
      
      if (response.data.result) {
        // Lưu token vào localStorage
        localStorage.setItem('access_token', response.data.result.accessToken);
        localStorage.setItem('refresh_token', response.data.result.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.result.user));
      }
      
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Đăng nhập thất bại');
    }
  }

  /**
   * Đăng ký user mới
   */
  async register(userData: RegisterRequest): Promise<UserResponse> {
    try {
      const response = await authApi.post<ApiResponse<UserResponse>>('/users/register', userData);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Đăng ký thất bại');
    }
  }

  /**
   * Đăng xuất
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await authApi.post('/auth/logout', { refreshToken } as LogoutRequest);
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Ignore logout errors as we still want to clear local storage
    } finally {
      // Xóa token khỏi localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }

  /**
   * Refresh token
   */
  async refreshToken(): Promise<AuthenticationResponse> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authApi.post<ApiResponse<AuthenticationResponse>>('/auth/refresh', { refreshToken } as RefreshTokenRequest);
      
      if (response.data.result) {
        localStorage.setItem('access_token', response.data.result.accessToken);
        localStorage.setItem('refresh_token', response.data.result.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.result.user));
      }
      
      return response.data.result!;
    } catch (error: any) {
      console.error('Token refresh failed:', error);
      // Nếu refresh thất bại, đăng xuất user
      this.logout();
      throw new Error('Token refresh failed');
    }
  }

  /**
   * Lấy thông tin user hiện tại
   */
  async getCurrentUser(): Promise<UserResponse> {
    try {
      const response = await authApi.get<ApiResponse<UserResponse>>('/users/me');
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể lấy thông tin user');
    }
  }

  /**
   * Xác thực email
   */
  async verifyEmail(email: string, otp: string): Promise<void> {
    try {
      await authApi.post('/auth/verify-email', { email, otp } as VerifyEmailRequest);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Xác thực email thất bại');
    }
  }

  /**
   * Gửi lại OTP
   */
  async resendOTP(email: string): Promise<void> {
    try {
      await authApi.post('/users/resend-otp', null, { params: { email } });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Gửi lại OTP thất bại');
    }
  }

  /**
   * Đặt lại mật khẩu
   */
  async resetPassword(email: string, otp: string, newPassword: string): Promise<void> {
    try {
      await authApi.post('/auth/reset-password', { email, otp, newPassword } as ResetPasswordRequest);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Đặt lại mật khẩu thất bại');
    }
  }

  /**
   * Gửi OTP đặt lại mật khẩu
   */
  async sendPasswordResetOTP(email: string): Promise<void> {
    try {
      await authApi.post('/auth/send-password-reset-otp', null, { params: { email } });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Gửi OTP đặt lại mật khẩu thất bại');
    }
  }

  /**
   * Tạo mật khẩu mới
   */
  async createPassword(userId: string, password: string): Promise<void> {
    try {
      await authApi.post('/auth/create-password', { userId, password } as PasswordCreationRequest);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Tạo mật khẩu thất bại');
    }
  }

  /**
   * Kiểm tra xem user đã đăng nhập chưa
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  /**
   * Lấy token hiện tại
   */
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Lấy thông tin user từ localStorage
   */
  getCurrentUserFromStorage(): UserResponse | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Đăng nhập với Google OAuth2
   */
  async loginWithGoogle(code: string): Promise<AuthenticationResponse> {
    try {
      const response = await authApi.post<ApiResponse<AuthenticationResponse>>('/auth/google', { code });
      
      if (response.data.result) {
        localStorage.setItem('access_token', response.data.result.accessToken);
        localStorage.setItem('refresh_token', response.data.result.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.result.user));
      }
      
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Đăng nhập Google thất bại');
    }
  }
}

export const authService = new AuthService();
export default authService;
