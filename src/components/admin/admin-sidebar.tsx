'use client';

import React from 'react';
import { 
  BarChart3, 
  Users, 
  GraduationCap, 
  Building2, 
  CreditCard, 
  X,
  Settings,
  LogOut,
  FileText
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type AdminTab = 'analytics' | 'users' | 'teacher-registrations' | 'classrooms' | 'tenants' | 'subscriptions' | 'documents';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    description: 'Thống kê và phân tích'
  },
  {
    id: 'users',
    label: 'Quản lý Users',
    icon: Users,
    description: 'Quản lý người dùng'
  },
  {
    id: 'teacher-registrations',
    label: 'Quản lý đơn đăng ký giáo viên',
    icon: GraduationCap,
    description: 'Duyệt đơn đăng ký giáo viên'
  },
  {
    id: 'classrooms',
    label: 'Quản lý Lớp học',
    icon: GraduationCap,
    description: 'Quản lý lớp học'
  },
  {
    id: 'tenants',
    label: 'Quản lý Tenant',
    icon: Building2,
    description: 'Quản lý tổ chức'
  },
  {
    id: 'subscriptions',
    label: 'Gói Subscription',
    icon: CreditCard,
    description: 'Quản lý gói đăng ký'
  },
  {
    id: 'documents',
    label: 'Quản lý Tài liệu',
    icon: FileText,
    description: 'Quản lý tài liệu PDF'
  }
];

export default function AdminSidebar({ activeTab, onTabChange, isOpen, onClose }: AdminSidebarProps) {
  const { logout, email } = useAuth();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-80 bg-slate-900/95 backdrop-blur-xl border-r border-purple-500/20 transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-purple-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Admin Panel</h2>
                  <p className="text-sm text-purple-200">MathMind System</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="lg:hidden text-white hover:bg-purple-500/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id as AdminTab);
                    onClose();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onTabChange(item.id as AdminTab);
                      onClose();
                    }
                  }}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                    isActive 
                      ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-white shadow-lg shadow-purple-500/20" 
                      : "text-purple-200 hover:bg-purple-500/10 hover:text-white hover:border-purple-500/20 border border-transparent"
                  )}
                  role="tab"
                  aria-selected={isActive}
                >
                  <Icon className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-purple-300" : "text-purple-400 group-hover:text-purple-300"
                  )} />
                  <div className="flex-1 text-left">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs opacity-70">{item.description}</div>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-purple-500/20">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{email}</p>
                <p className="text-xs text-purple-200">Administrator</p>
              </div>
            </div>
            
            <Button
              onClick={logout}
              variant="outline"
              size="sm"
              className="w-full border-purple-500/30 text-purple-200 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
