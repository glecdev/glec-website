import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog | GLEC',
  description: '탄소배출 관리의 최신 기술, 산업 동향, 사례 연구를 GLEC 전문가가 직접 전합니다.',
  keywords: ['GLEC 블로그', '탄소배출', '기술 트렌드', '산업 동향', '사례 연구'],
  openGraph: {
    title: 'Blog | GLEC',
    description: '탄소배출 관리의 최신 기술, 산업 동향, 사례 연구를 GLEC 전문가가 직접 전합니다.',
    type: 'website',
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
