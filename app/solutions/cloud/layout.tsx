/**
 * GLEC Cloud Solution Page Layout
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GLEC Cloud - 클라우드 기반 완벽한 탄소관리 플랫폼',
  description: '실시간 대시보드, EU CBAM 보고서 자동 생성, 다중 사용자 관리. 14일 무료 체험, 월 12만원부터',
  keywords: 'GLEC Cloud, 탄소관리 플랫폼, SaaS, EU CBAM, 탄소 보고서, 실시간 대시보드',
  openGraph: {
    title: 'GLEC Cloud - 클라우드 탄소관리 플랫폼',
    description: '실시간 대시보드, EU CBAM 보고서, 다중 사용자 관리',
    type: 'website',
  }
};

export default function CloudLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
