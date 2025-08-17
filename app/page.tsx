import BgGradient from "@/components/common/bg-gradient";
import HeroSection from "@/components/home/hero-section";

import HowItWorksSection from "@/components/home/how-it-works-section";

import CTASection from "@/components/home/cta-section";
export default function Home() {
  return (
    <div className="relative w-full">
      <BgGradient />
      <div className="flex flex-col ">
        <HeroSection />
        {/* <DemoSection /> */}
        <HowItWorksSection />
        {/* <PricingSection /> */}
      <CTASection />
      </div>
    </div>
  );
}
