import type { Metadata } from 'next';
import './globals.css';
import { RootLayoutClient } from '@/components/RootLayoutClient';

export const metadata: Metadata = {
  title: 'GLEC - ISO-14083 국제표준 물류 탄소배출 측정',
  description:
    'DHL GoGreen 파트너십 기반 글로벌 물류 탄소배출 측정 솔루션. GLEC DTG, API Console, Cloud 제공',
  keywords: [
    'GLEC',
    'ISO-14083',
    '탄소배출',
    '물류',
    'DTG',
    '운행기록장치',
    'Carbon API',
    'DHL GoGreen',
  ],
  authors: [{ name: 'GLEC Inc.' }],
  openGraph: {
    title: 'GLEC - ISO-14083 국제표준 물류 탄소배출 측정',
    description: 'DHL GoGreen 파트너십 기반 글로벌 물류 탄소배출 측정 솔루션',
    url: 'https://glec.io',
    siteName: 'GLEC',
    locale: 'ko_KR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
