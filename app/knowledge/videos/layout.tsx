import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Videos | GLEC',
  description: '제품 소개, 사용 가이드, 웨비나 등 GLEC의 모든 영상 자료를 한눈에 확인하세요.',
  keywords: ['GLEC 영상', '튜토리얼', '웨비나', '제품 소개', '사용 가이드'],
  openGraph: {
    title: 'Videos | GLEC',
    description: '제품 소개, 사용 가이드, 웨비나 등 GLEC의 모든 영상 자료를 한눈에 확인하세요.',
    type: 'website',
  },
};

export default function VideosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
