'use client';

import { useEffect, useState } from 'react';

interface AppWrapperProps {
  readonly children: React.ReactNode;
}

/**
 * Wrapper component to prevent hydration mismatch caused by browser extensions
 * that add attributes to the body element and other DOM elements
 */
export default function AppWrapper({ children }: AppWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-surface">{children}</div>;
  }

  return <>{children}</>;
}
