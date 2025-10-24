import { authService } from './services';

/**
 * Kiểm tra xem user đã đăng nhập chưa
 */
export const isAuthenticated = (): boolean => {
  return authService.isAuthenticated();
};

/**
 * Lấy thông tin user hiện tại
 */
export const getCurrentUser = () => {
  return authService.getCurrentUserFromStorage();
};

/**
 * Redirect đến trang login nếu chưa đăng nhập
 */
export const requireAuth = (): boolean => {
  if (!isAuthenticated()) {
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
    return false;
  }
  return true;
};

/**
 * Redirect đến trang profile nếu đã đăng nhập
 */
export const redirectIfAuthenticated = (): boolean => {
  if (isAuthenticated()) {
    if (typeof window !== 'undefined') {
      window.location.href = '/profile';
    }
    return true;
  }
  return false;
};
