import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import CosmicBackground from '@/components/cosmic-background';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { AuthProvider } from '@/context/auth-context';
import { ProfileBannerWrapper } from '@/components/ProfileBannerWrapper';
import AuthRedirect from '@/components/AuthRedirect';
import HydrationSafeWrapper from '@/components/hydration-safe-wrapper-v2';

export const metadata: Metadata = {
  title: 'MathMind',
  description: 'Khám phá vũ trụ Toán học của bạn',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;600&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning={true}>
        <HydrationSafeWrapper>
          <CosmicBackground />
          <div className="relative z-10 flex min-h-screen flex-col">
            <AuthProvider>
              <AuthRedirect />
              <Navbar />
              <ProfileBannerWrapper />
              <main className="flex-grow">{children}</main>
              <Footer />
            </AuthProvider>
          </div>
          <Toaster />
        </HydrationSafeWrapper>
      </body>
    </html>
  );
}
