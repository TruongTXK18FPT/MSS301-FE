'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

export default function AuthRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const { passwordSetupRequired, profileCompleted, loading, email } = useAuth();

  useEffect(() => {
    if (loading || !email) return;

    // Remove automatic redirect for password setup - let user choose when to setup
    // Password setup is now optional and can be done from profile completion or dashboard banner
    // if (passwordSetupRequired && pathname !== '/auth/setup-password') {
    //   router.push('/auth/setup-password');
    // }
    
    // Remove automatic redirect for profile completion - let banner handle it
    // else if (!profileCompleted && pathname !== '/profile/complete') {
    //   router.push('/profile/complete');
    // }
  }, [passwordSetupRequired, profileCompleted, loading, email, pathname, router]);

  return null;
}
