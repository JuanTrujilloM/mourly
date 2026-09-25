import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { UniversitiesSection } from '@/components/landing/UniversitiesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { FirstDateSection } from '@/components/landing/FirstDateSection';
import { WhySection } from '@/components/landing/WhySection';
import { SurveySection } from '@/components/landing/SurveySection';
import { PricingSection } from '@/components/landing/PricingSection';
import { AboutSection } from '@/components/landing/AboutSection';
import { FaqSection } from '@/components/landing/FaqSection';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <LandingNavbar />
      <main>
        <HeroSection />
        <UniversitiesSection />
        <HowItWorksSection />
        <FirstDateSection />
        <WhySection />
        <SurveySection />
        <PricingSection />
        <AboutSection />
        <FaqSection />
      </main>
      <LandingFooter />
    </div>
  );
}
