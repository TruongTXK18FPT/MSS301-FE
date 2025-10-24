'use client';

import { useAuth } from "@/context/auth-context";
import { ProfileCompletionBanner } from "./ProfileCompletionBanner";
import { usePathname } from "next/navigation";

export function ProfileBannerWrapper() {
  const { token, profileCompleted } = useAuth();
  const pathname = usePathname();
  
  // Don't show banner on auth pages or profile completion page
  const isAuthPage = pathname?.startsWith('/auth');
  const isProfileCompletePage = pathname === '/profile/complete';
  
  if (!token || profileCompleted || isAuthPage || isProfileCompletePage) {
    return null;
  }

  return <ProfileCompletionBanner />;
}
