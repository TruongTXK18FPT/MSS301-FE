'use client';

import { useEffect, useState } from 'react';

interface BodyWrapperProps {
  readonly children: React.ReactNode;
}

/**
 * Wrapper component to prevent hydration mismatch caused by browser extensions
 * that add attributes to the body element
 */
export default function BodyWrapper({ children }: BodyWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
