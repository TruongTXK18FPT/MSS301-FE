'use client';

import { useEffect, useState } from 'react';

interface ClientOnlyWrapperProps {
  readonly children: React.ReactNode;
  readonly fallback?: React.ReactNode;
}

/**
 * Wrapper component to prevent hydration mismatch by only rendering children on client side
 * Useful for components that use browser APIs or have different server/client behavior
 */
export default function ClientOnlyWrapper({ children, fallback = null }: ClientOnlyWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
