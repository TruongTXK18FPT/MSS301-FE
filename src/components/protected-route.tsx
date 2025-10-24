'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { UserRole } from '@/types/classroom';

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
  const { role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!role) {
        router.push('/auth/login');
        return;
      }
      
      if (allowedRoles.length > 0 && !allowedRoles.includes(role as UserRole)) {
        router.push('/class');
        return;
      }
    }
  }, [role, loading, router, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!role) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Vui lòng đăng nhập</h1>
          <p className="text-emerald-200/70">Bạn cần đăng nhập để truy cập trang này</p>
        </div>
      </div>
    );
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role as UserRole)) {
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
