import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '회사 소개 | GLEC - ISO-14083 물류 탄소배출 측정 솔루션',
  description: '글로벌 탄소관리 리더 GLEC의 도전. DHL GoGreen 파트너십, ISO-14083 국제표준 기반, 1,200+ 기업 신뢰. 물류 산업의 탄소 중립을 실현하는 리더.',
  keywords: 'GLEC, 회사 소개, ISO-14083, 탄소배출 측정, 물류, DHL GoGreen, 탄소중립, Smart Freight Centre',
  openGraph: {
    title: '회사 소개 | GLEC',
    description: '글로벌 탄소관리 리더 GLEC의 도전. DHL GoGreen 파트너십, ISO-14083 국제표준 기반.',
    type: 'website',
    url: 'https://glec.io/about/company',
  },
};

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
