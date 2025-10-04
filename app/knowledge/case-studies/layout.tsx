import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Case Studies | GLEC',
  description: '실제 고객사의 성공 사례를 통해 GLEC 솔루션의 효과를 확인하세요.',
  keywords: ['GLEC 사례', '고객 성공 사례', '물류 탄소배출', '제조업 사례', '유통업 사례'],
  openGraph: {
    title: 'Case Studies | GLEC',
    description: '실제 고객사의 성공 사례를 통해 GLEC 솔루션의 효과를 확인하세요.',
    type: 'website',
  },
};

export default function CaseStudiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
