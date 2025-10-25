'use client';

import { Menu, Bell, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface AdminHeaderProps {
  onMenuClick: () => void;
  currentTab: string;
}

const tabLabels: Record<string, string> = {
  analytics: 'Analytics Dashboard',
  users: 'Quản lý Users',
  classrooms: 'Quản lý Lớp học',
  tenants: 'Quản lý Tenant',
  subscriptions: 'Quản lý Subscription'
};

export default function AdminHeader({ onMenuClick, currentTab }: AdminHeaderProps) {
  return (
    <header className="bg-slate-800/50 backdrop-blur-xl border-b border-purple-500/20 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden text-white hover:bg-purple-500/20"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold text-white">
              {tabLabels[currentTab] || 'Admin Dashboard'}
            </h1>
            <p className="text-sm text-purple-200">
              Quản lý hệ thống MathMind
            </p>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-300" />
            <Input
              placeholder="Tìm kiếm..."
              className="pl-10 bg-slate-700/50 border-purple-500/30 text-white placeholder:text-purple-300 focus:border-purple-400 focus:ring-purple-400/20"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="relative text-white hover:bg-purple-500/20"
          >
            <Bell className="w-5 h-5" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              3
            </Badge>
          </Button>

          {/* User Profile */}
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-purple-500/20"
          >
            <User className="w-5 h-5" />
          </Button>

          {/* Status Indicator */}
          <div className="hidden sm:flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-green-300">Online</span>
          </div>
        </div>
      </div>
    </header>
  );
}
