'use client';

import { useEffect, useState } from 'react';

interface HydrationSafeWrapperProps {
  readonly children: React.ReactNode;
  readonly fallback?: React.ReactNode;
}

/**
 * Wrapper component to completely prevent hydration mismatch
 * by ensuring server and client render the same content
 */
export default function HydrationSafeWrapper({ 
  children, 
  fallback = null 
}: HydrationSafeWrapperProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Always render the same content on server and client initially
  if (!isClient) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
