'use client';

import { useAuth } from "@/context/auth-context";
import { ProfileCompletionBanner } from "./ProfileCompletionBanner";
import { usePathname } from "next/navigation";

export function ProfileBannerWrapper() {
  const { token, profileCompleted, role } = useAuth();
  const pathname = usePathname();
  
  // Don't show banner on auth pages or profile completion page
  const isAuthPage = pathname?.startsWith('/auth');
  const isProfileCompletePage = pathname === '/profile/complete';
  
  console.log('[ProfileBannerWrapper] State:', { token: !!token, profileCompleted, role, pathname, isAuthPage, isProfileCompletePage });
  
  // Only show for authenticated STUDENT users who haven't completed profile
  if (!token || profileCompleted || role !== 'STUDENT' || isAuthPage || isProfileCompletePage) {
    console.log('[ProfileBannerWrapper] Not showing banner. Reasons:', { 
      noToken: !token, 
      profileCompleted, 
      notStudent: role !== 'STUDENT',
      isAuthPage,
      isProfileCompletePage
    });
    return null;
  }

  console.log('[ProfileBannerWrapper] Showing ProfileCompletionBanner');
  return <ProfileCompletionBanner />;
}
