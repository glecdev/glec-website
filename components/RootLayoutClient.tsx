'use client';

import { usePathname } from 'next/navigation';
import { Header, Footer } from '@/components/layout';
import { PopupManager } from '@/components/PopupManager';
import { BannerPopupManager } from '@/components/BannerPopupManager';

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  // Admin pages: No Banner, Header, Footer, PopupManager
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // Website pages: Full layout
  return (
    <>
      <BannerPopupManager />
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <PopupManager />
    </>
  );
}
