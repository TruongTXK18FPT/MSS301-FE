'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import ProtectedRoute from '@/components/protected-route';
import { UserRole, ROLE_IDS } from '@/lib/dto/classroom';
import AdminSidebar from '@/components/admin/admin-sidebar';
import AdminHeader from '@/components/admin/admin-header';
import AnalyticsDashboard from '@/components/admin/analytics-dashboard';
import UserManagement from '@/components/admin/user-management';
import TeacherRegistrationsPage from './teacher-registrations/page';
import ClassroomManagement from '@/components/admin/classroom-management';
import TenantManagement from '@/components/admin/tenant-management';
import SubscriptionManagement from '@/components/admin/subscription-management';

type AdminTab = 'analytics' | 'users' | 'teacher-registrations' | 'classrooms' | 'tenants' | 'subscriptions';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'users':
        return <UserManagement />;
      case 'teacher-registrations':
        return <TeacherRegistrationsPage />;
      case 'classrooms':
        return <ClassroomManagement />;
      case 'tenants':
        return <TenantManagement />;
      case 'subscriptions':
        return <SubscriptionManagement />;
      default:
        return <AnalyticsDashboard />;
    }
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN' as UserRole]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Galaxy Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 left-1/2 w-60 h-60 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        </div>

        {/* Stars */}
        <div className="absolute inset-0">
          {Array.from({ length: 100 }, (_, i) => (
            <div
              key={`star-${i}`}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex h-screen">
          {/* Sidebar */}
          <AdminSidebar 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <AdminHeader 
              onMenuClick={() => setSidebarOpen(true)}
              currentTab={activeTab}
            />

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto p-6">
              <div className="max-w-7xl mx-auto">
                {renderContent()}
              </div>
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
