import { AuthAPI } from '@/services/auth.service';

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

      const res = await AuthAPI.introspect(token);
      return res.result?.passwordSetupRequired || false;
    } catch (error) {
      console.error('Error checking password setup:', error);
      return false;
    }
  }

  /**
   * Setup password cho Google users
   */
  async setupPassword(password: string): Promise<void> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No token found');

      // Call setup password API
      const response = await fetch('http://localhost:8080/api/v1/authenticate/users/setup-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password })
      });

      if (!response.ok) {
        throw new Error('Failed to setup password');
      }
    } catch (error) {
      console.error('Setup password error:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
export default authService;