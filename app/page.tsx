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
import { LaunchPromotion } from '@/components/launch/LaunchPromotion';

export default function Home() {
  return (
    <>
      <LaunchPromotion />
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
