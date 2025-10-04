/**
 * DTG Product Page Layout
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GLEC DTG Series5 - 세계 최초 스마트폰 CPU 탑재 차량용 탄소배출 측정 장치',
  description: 'ARM Cortex-A53 기반, 90% 지입차 데이터 자동 수집, ISO-14083 인증. 설치 5분, 무료 30일 체험.',
  keywords: '차량용 탄소배출 측정, DTG, GLEC DTG Series5, 지입차 데이터 수집, ISO-14083, 탄소 중립',
  openGraph: {
    title: 'GLEC DTG Series5 - 세계 최초 스마트폰 CPU 탑재 DTG',
    description: 'ARM Cortex-A53 기반, 90% 지입차 데이터 자동 수집, ISO-14083 인증',
    type: 'website',
  }
};

export default function DTGLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
