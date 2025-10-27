import { useAuth } from '@/context/auth-context';

/**
 * Kiểm tra authentication và redirect nếu cần
 */
export function requireAuth(): boolean {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('authToken');
  if (!token) {
    window.location.href = '/auth/login';
    return false;
  }
  
  return true;
}

/**
 * Hook để sử dụng auth context
 */
export function useAuthContext() {
  return useAuth();
}
