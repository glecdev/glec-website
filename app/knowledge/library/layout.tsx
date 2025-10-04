import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Knowledge Library | GLEC',
  description: 'ISO-14083 표준부터 최신 탄소배출 규제까지, 전문가가 집필한 자료를 무료로 다운로드하세요.',
  keywords: ['ISO-14083', '탄소배출', '물류', '규제', '기술 백서', 'GLEC'],
  openGraph: {
    title: 'Knowledge Library | GLEC',
    description: 'ISO-14083 표준부터 최신 탄소배출 규제까지, 전문가가 집필한 자료를 무료로 다운로드하세요.',
    type: 'website',
  },
};

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
