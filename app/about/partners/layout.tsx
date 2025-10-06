import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '파트너 | GLEC - 함께 성장하는 글로벌 파트너',
  description: '세계 최고의 기업들과 함께 물류 탄소중립을 실현합니다. Cloudflare, Neon, Vercel, Smart Freight Centre 등 글로벌 파트너십.',
  keywords: 'GLEC, 파트너, Cloudflare, Neon, Vercel, Smart Freight Centre, 파트너십, 협력사',
  openGraph: {
    title: '파트너 | GLEC',
    description: '세계 최고의 기업들과 함께 물류 탄소중립을 실현합니다.',
    type: 'website',
    url: 'https://glec.io/about/partners',
  },
};

export default function PartnersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
