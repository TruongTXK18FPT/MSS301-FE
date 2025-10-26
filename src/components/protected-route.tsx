'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { UserRole } from '@/lib/dto/classroom';
import { getCurrentRole } from '@/lib/role-utils';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles = [], 
  fallback 
}: ProtectedRouteProps) {
  const { role, roleId, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      const currentRole = getCurrentRole(role, roleId);
      
      if (!currentRole) {
        router.push('/auth/login');
        return;
      }
      
      if (allowedRoles.length > 0 && !allowedRoles.includes(currentRole)) {
        router.push('/class');
        return;
      }
    }
  }, [role, roleId, loading, router, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // Get current role - prefer roleId if available
  const currentRole = getCurrentRole(role, roleId);

  if (!currentRole) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Vui lòng đăng nhập</h1>
          <p className="text-emerald-200/70">Bạn cần đăng nhập để truy cập trang này</p>
        </div>
      </div>
    );
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(currentRole)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Không có quyền truy cập</h1>
          <p className="text-emerald-200/70">Bạn không có quyền truy cập trang này</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
