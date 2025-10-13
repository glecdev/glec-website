import { Metadata } from 'next';
import { HeroSection } from '@/components/sections/HeroSection';
import { ProblemAwarenessSection } from '@/components/sections/ProblemAwarenessSection';
import { SolutionOverviewSection } from '@/components/sections/SolutionOverviewSection';
import { CaseStudiesSection } from '@/components/sections/CaseStudiesSection';
import { PartnersSection } from '@/components/sections/PartnersSection';
import { LatestNewsSection } from '@/components/sections/LatestNewsSection';
import { ContactFormSection } from '@/components/sections/ContactFormSection';
import { FAQSection } from '@/components/sections/FAQSection';
import { FooterCTASection } from '@/components/sections/FooterCTASection';
import { ScrollProgress } from '@/components/ui/ScrollProgress';

export const metadata: Metadata = {
  title: 'GLEC - ISO-14083 국제표준 물류 탄소배출 측정',
  description: 'ISO-14083 국제표준 기반 글로벌 물류 탄소배출 측정 솔루션. GLEC DTG, API Console, Cloud 제공. Smart Freight Centre GLEC Tool 인증 진행 중',
};

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <HeroSection />
      <ProblemAwarenessSection />
      <SolutionOverviewSection />
      <CaseStudiesSection />
      <PartnersSection />
      <LatestNewsSection />
      <ContactFormSection />
      <FAQSection />
      <FooterCTASection />
    </>
  );
}
