'use client';

import CosmicBackground from './cosmic-background';
import { AuthProvider } from '@/context/auth-context';
import { ProfileBannerWrapper } from './ProfileBannerWrapper';
import ClientOnlyWrapper from './client-only-wrapper';
import BodyWrapper from './body-wrapper';
import AppWrapper from './app-wrapper';
import { Toaster } from '@/components/ui/toaster';

interface DynamicAppProps {
  readonly children: React.ReactNode;
}

export default function DynamicApp({ children }: DynamicAppProps) {
  return (
    <AppWrapper>
      <BodyWrapper>
        <CosmicBackground />
        <div className="relative z-10 flex min-h-screen flex-col">
          <AuthProvider>
            <ClientOnlyWrapper>
              <ProfileBannerWrapper />
            </ClientOnlyWrapper>
            <main className="flex-grow">{children}</main>
          </AuthProvider>
        </div>
        <Toaster />
      </BodyWrapper>
    </AppWrapper>
  );
}
