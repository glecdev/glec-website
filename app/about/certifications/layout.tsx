import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '인증 및 표준 | GLEC - 검증된 기술력 국제 인증',
  description: '국제 표준 기반의 신뢰할 수 있는 탄소배출 측정 솔루션. ISO-14083 기반, Smart Freight Centre GLEC Tool 인증 진행 중, EU CBAM 준수. 한국 최초 ISO-14083 기반 솔루션.',
  keywords: 'GLEC, ISO-14083, 인증, 표준, Smart Freight Centre, EU CBAM, 탄소배출 측정, 국제 인증',
  openGraph: {
    title: '인증 및 표준 | GLEC',
    description: '국제 표준 기반의 신뢰할 수 있는 탄소배출 측정 솔루션. ISO-14083 기반, Smart Freight Centre GLEC Tool 인증 진행 중',
    type: 'website',
    url: 'https://glec.io/about/certifications',
  },
};

export default function CertificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
