'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronDown, 
  Shield, 
  BarChart3, 
  Users, 
  GraduationCap, 
  Building2, 
  CreditCard,
  Settings,
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/auth-context';
import { isAdmin } from '@/lib/role-utils';

const adminQuickLinks = [
  {
    href: '/admin',
    label: 'Dashboard',
    icon: BarChart3,
    description: 'Tổng quan hệ thống'
  },
  {
    href: '/admin?tab=users',
    label: 'Quản lý Users',
    icon: Users,
    description: 'Quản lý người dùng'
  },
  {
    href: '/admin?tab=classrooms',
    label: 'Quản lý Lớp học',
    icon: GraduationCap,
    description: 'Quản lý lớp học'
  },
  {
    href: '/admin?tab=tenants',
    label: 'Quản lý Tenants',
    icon: Building2,
    description: 'Quản lý tổ chức'
  },
  {
    href: '/admin?tab=subscriptions',
    label: 'Quản lý Subscriptions',
    icon: CreditCard,
    description: 'Quản lý gói đăng ký'
  }
];

interface AdminQuickAccessProps {
  readonly variant?: 'button' | 'compact' | 'mobile';
}

export default function AdminQuickAccess({ variant = 'button' }: AdminQuickAccessProps) {
  const { role, roleId } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!isAdmin(role, roleId)) {
    return null;
  }

  const getButtonVariant = () => {
    switch (variant) {
      case 'compact':
        return 'h-8 px-2 text-xs';
      case 'mobile':
        return 'w-full h-12 px-4 text-base justify-center';
      default:
        return 'h-10 px-4 text-sm';
    }
  };

  const getIconSize = () => {
    switch (variant) {
      case 'compact':
        return 'w-3 h-3';
      case 'mobile':
        return 'w-4 h-4';
      default:
        return 'w-4 h-4';
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`border-purple-400/30 text-purple-200 hover:bg-purple-500/20 transition-all duration-300 group ${getButtonVariant()}`}
        >
          <Shield className={`${getIconSize()} mr-2 group-hover:scale-110 transition-transform`} />
          Admin
          <ChevronDown className={`${getIconSize()} ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-64 bg-slate-800/95 border-purple-500/20 backdrop-blur-xl"
        sideOffset={5}
      >
        <DropdownMenuLabel className="text-purple-200 flex items-center">
          <Crown className="w-4 h-4 mr-2 text-yellow-400" />
          Admin Panel
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-purple-500/20" />
        
        {adminQuickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <DropdownMenuItem key={link.href} asChild>
              <Link 
                href={link.href}
                className="flex items-center space-x-3 px-3 py-2 text-slate-300 hover:bg-purple-500/20 hover:text-white transition-colors cursor-pointer"
                onClick={() => setIsOpen(false)}
              >
                <Icon className="w-4 h-4 text-purple-400" />
                <div className="flex-1">
                  <div className="font-medium">{link.label}</div>
                  <div className="text-xs text-slate-400">{link.description}</div>
                </div>
              </Link>
            </DropdownMenuItem>
          );
        })}
        
        <DropdownMenuSeparator className="bg-purple-500/20" />
        <DropdownMenuItem asChild>
          <Link 
            href="/admin"
            className="flex items-center space-x-3 px-3 py-2 text-purple-200 hover:bg-purple-500/20 hover:text-white transition-colors cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            <Settings className="w-4 h-4" />
            <div className="flex-1">
              <div className="font-medium">Tất cả tính năng</div>
              <div className="text-xs text-slate-400">Xem toàn bộ admin dashboard</div>
            </div>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
