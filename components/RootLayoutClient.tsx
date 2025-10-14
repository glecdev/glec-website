'use client';

import { usePathname } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { Header, Footer } from '@/components/layout';
import { PopupManager } from '@/components/PopupManager';
import { BannerPopupManager } from '@/components/BannerPopupManager';
import { CookieConsent } from '@/components/CookieConsent';

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  // Admin pages: No Banner, Header, Footer, PopupManager (but include Toaster)
  if (isAdminRoute) {
    return (
      <>
        <Toaster position="top-right" />
        {children}
      </>
    );
  }

  // Website pages: Full layout with Toaster
  return (
    <>
      <Toaster position="top-right" />
      <BannerPopupManager />
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <PopupManager />
      <CookieConsent />
    </>
  );
}
