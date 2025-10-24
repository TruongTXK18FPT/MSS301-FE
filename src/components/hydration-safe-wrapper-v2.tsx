'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const DynamicApp = dynamic(() => import('./dynamic-app'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-surface" />
});

interface HydrationSafeWrapperProps {
  readonly children: React.ReactNode;
}

/**
 * Wrapper component to completely prevent hydration mismatch
 * by using dynamic import with ssr: false
 */
export default function HydrationSafeWrapper({ children }: HydrationSafeWrapperProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface" />}>
      <DynamicApp>{children}</DynamicApp>
    </Suspense>
  );
}
