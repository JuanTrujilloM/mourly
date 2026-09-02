import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { WhySection } from '@/components/landing/WhySection';
import { SocialProofSection } from '@/components/landing/SocialProofSection';
import { UniversitiesSection } from '@/components/landing/UniversitiesSection';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function HomePage() {
  return (
    <div className="bg-navy-deep flex flex-1 flex-col">
      <LandingNavbar />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <WhySection />
        <SocialProofSection />
        <UniversitiesSection />
      </main>
      <LandingFooter />
    </div>
  );
}
