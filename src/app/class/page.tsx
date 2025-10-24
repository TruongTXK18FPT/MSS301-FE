'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import TeacherDashboard from "../classroom/teacher/page";
import StudentDashboard from "../classroom/student/page";

export default function ClassPage() {
  const { role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!role) {
        router.push('/auth/login');
        return;
      }
    }
  }, [role, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // Role-based rendering
  switch (role) {
    case 'TEACHER':
      return <TeacherDashboard />;
    case 'STUDENT':
      return <StudentDashboard />;
    case 'GUARDIAN':
      return <StudentDashboard />; // Guardians see student view
    default:
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Không có quyền truy cập</h1>
            <p className="text-emerald-200/70">Vui lòng đăng nhập để tiếp tục</p>
          </div>
        </div>
      );
  }
}
