import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '팀 소개 | GLEC - 혁신을 이끄는 전문가 팀',
  description: 'ISO-14083 국제표준을 만드는 열정과 전문성을 갖춘 인재들. 물류 탄소중립 전문가, 글로벌 경험, 혁신 DNA를 가진 GLEC 팀을 만나보세요.',
  keywords: 'GLEC, 팀, 직원, 채용, ISO-14083 전문가, 물류 탄소중립, 리더십, 엔지니어링',
  openGraph: {
    title: '팀 소개 | GLEC',
    description: 'ISO-14083 국제표준을 만드는 열정과 전문성을 갖춘 인재들.',
    type: 'website',
    url: 'https://glec.io/about/team',
  },
};

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
