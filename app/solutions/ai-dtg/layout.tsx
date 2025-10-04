/**
 * AI DTG Solution Page Layout
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GLEC AI DTG - AI로 예측하는 차세대 탄소관리',
  description: 'LSTM 기반 배출량 예측, Q-Learning 경로 최적화, 95% 예측 정확도. Beta Program 진행 중 (50% 할인)',
  keywords: 'AI DTG, 인공지능 탄소 예측, LSTM, Q-Learning, 배출량 예측, 경로 최적화',
  openGraph: {
    title: 'GLEC AI DTG - AI 기반 탄소관리',
    description: 'LSTM 배출량 예측, Q-Learning 경로 최적화, 95% 정확도',
    type: 'website',
  }
};

export default function AIDTGLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
