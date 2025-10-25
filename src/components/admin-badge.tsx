'use client';

import { Shield, Crown } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { isAdmin } from '@/lib/role-utils';
import { Badge } from '@/components/ui/badge';

interface AdminBadgeProps {
  readonly variant?: 'default' | 'compact' | 'mobile';
  readonly showIcon?: boolean;
  readonly className?: string;
}

export default function AdminBadge({ 
  variant = 'default', 
  showIcon = true, 
  className = '' 
}: AdminBadgeProps) {
  const { role, roleId } = useAuth();

  if (!isAdmin(role, roleId)) {
    return null;
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return 'text-xs px-2 py-1';
      case 'mobile':
        return 'text-sm px-3 py-1.5';
      default:
        return 'text-sm px-3 py-1';
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
    <Badge 
      variant="outline" 
      className={`bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-200 border-purple-400/30 hover:from-purple-500/20 hover:to-pink-500/20 hover:border-purple-400/50 transition-all duration-300 ${getVariantStyles()} ${className}`}
    >
      {showIcon && (
        <Shield className={`${getIconSize()} mr-1.5`} />
      )}
      <span className="font-medium">Admin</span>
      {variant === 'default' && (
        <Crown className="w-3 h-3 ml-1 text-yellow-400" />
      )}
    </Badge>
  );
}
