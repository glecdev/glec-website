/**
 * Contact Page Metadata
 *
 * Based on:
 * - GLEC-Page-Structure-Standards.md: SEO and Metadata Standards
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '문의하기 | GLEC - ISO-14083 국제표준 물류 탄소배출 측정',
  description:
    '전문가 상담을 통해 최적의 솔루션을 찾아드립니다. 제품 문의, 파트너십, 기술 지원 등 문의사항을 남겨주세요.',
  keywords: [
    '문의',
    '상담',
    'GLEC',
    'ISO-14083',
    '물류 탄소배출',
    'GLEC DTG',
    'Carbon API',
  ],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://glec.io/contact',
    siteName: 'GLEC',
    title: '문의하기 | GLEC',
    description:
      '전문가 상담을 통해 최적의 솔루션을 찾아드립니다. 제품 문의, 파트너십, 기술 지원 등 문의사항을 남겨주세요.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GLEC 문의하기',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '문의하기 | GLEC',
    description:
      '전문가 상담을 통해 최적의 솔루션을 찾아드립니다. 제품 문의, 파트너십, 기술 지원 등 문의사항을 남겨주세요.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
