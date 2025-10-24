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

    // Only redirect for password setup, not for profile completion
    if (passwordSetupRequired && pathname !== '/auth/setup-password') {
      router.push('/auth/setup-password');
    }
    // Remove automatic redirect for profile completion - let banner handle it
    // else if (!profileCompleted && pathname !== '/profile/complete') {
    //   router.push('/profile/complete');
    // }
  }, [passwordSetupRequired, profileCompleted, loading, email, pathname, router]);

  return null;
}
