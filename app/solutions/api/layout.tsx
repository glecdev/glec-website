/**
 * Carbon API Solution Page Layout
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GLEC Carbon API - 개발자를 위한 완벽한 탄소배출 측정 API',
  description: '48개 API 엔드포인트, 99.9% Uptime SLA, <100ms 응답 속도. RESTful + GraphQL 지원, ISO-14083 인증 데이터',
  keywords: 'Carbon API, 탄소배출 API, GLEC API, RESTful API, GraphQL, ISO-14083, 탄소 측정',
  openGraph: {
    title: 'GLEC Carbon API - 개발자를 위한 탄소배출 측정 API',
    description: '48개 엔드포인트, 99.9% Uptime, <100ms 응답 속도',
    type: 'website',
  }
};

export default function APILayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
