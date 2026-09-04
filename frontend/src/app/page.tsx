import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { UniversitiesSection } from '@/components/landing/UniversitiesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { WhySection } from '@/components/landing/WhySection';
import { PricingSection } from '@/components/landing/PricingSection';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function HomePage() {
  return (
    <div className="bg-page flex flex-1 flex-col">
      <LandingNavbar />
      <main>
        <HeroSection />
        <UniversitiesSection />
        <HowItWorksSection />
        <WhySection />
        <PricingSection />
      </main>
      <LandingFooter />
    </div>
  );
}
