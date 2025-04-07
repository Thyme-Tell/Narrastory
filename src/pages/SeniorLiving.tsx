
import React, { useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import SeniorLivingHeader from "@/components/senior-living/SeniorLivingHeader";
import HeroSection from "@/components/senior-living/HeroSection";
import SocialProofBanner from "@/components/senior-living/SocialProofBanner";
import PainPointsSection from "@/components/senior-living/PainPointsSection";
import SolutionSection from "@/components/senior-living/SolutionSection";
import BenefitsSection from "@/components/senior-living/BenefitsSection";
import TestimonialSection from "@/components/senior-living/TestimonialSection";
import FeaturesSection from "@/components/senior-living/FeaturesSection";
import ROISection from "@/components/senior-living/ROISection";
import RiskReversalSection from "@/components/senior-living/RiskReversalSection";
import FinalCTASection from "@/components/senior-living/FinalCTASection";
import Footer from "@/components/get-started/Footer";
import ExitIntentPopup from "@/components/senior-living/ExitIntentPopup";

const SeniorLiving: React.FC = () => {
  const isMobile = useIsMobile();
  
  // References for sections
  const heroRef = useRef<HTMLDivElement>(null);
  const painPointsRef = useRef<HTMLElement>(null);
  const solutionRef = useRef<HTMLElement>(null);
  const benefitsRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const demoRef = useRef<HTMLElement>(null);
  
  // Track if user has seen exit intent popup
  const [hasSeenPopup, setHasSeenPopup] = React.useState(false);
  const [showExitPopup, setShowExitPopup] = React.useState(false);
  
  // Handle exit intent
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasSeenPopup) {
        setShowExitPopup(true);
        setHasSeenPopup(true);
      }
    };

    if (typeof window !== 'undefined') {
      document.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (typeof window !== 'undefined') {
        document.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [hasSeenPopup]);

  useEffect(() => {
    document.title = "Narra Story | For Senior Living Communities";
  }, []);

  return (
    <div className="min-h-screen bg-[#EFF1E9]">
      <div className="px-[7%]">
        <SeniorLivingHeader 
          refs={{
            hero: heroRef,
            painPoints: painPointsRef,
            solution: solutionRef,
            benefits: benefitsRef,
            features: featuresRef,
            demo: demoRef
          }}
        />

        <div id="hero" className="scroll-mt-24">
          <HeroSection heroRef={heroRef} isMobile={isMobile} />
        </div>
        
        <SocialProofBanner />
        
        <section id="pain-points" className="scroll-mt-24">
          <PainPointsSection ref={painPointsRef} />
        </section>
        
        <section id="solution" className="scroll-mt-24">
          <SolutionSection ref={solutionRef} />
        </section>
        
        <section id="benefits" className="scroll-mt-24 bg-transparent">
          <BenefitsSection ref={benefitsRef} />
        </section>
        
        <TestimonialSection />
        
        <section id="features" className="scroll-mt-24">
          <FeaturesSection ref={featuresRef} />
        </section>
        
        <ROISection />
        
        <RiskReversalSection />
        
        <section id="demo" className="scroll-mt-24">
          <FinalCTASection ref={demoRef} />
        </section>
      </div>
      
      <Footer />
      
      <ExitIntentPopup 
        open={showExitPopup} 
        onOpenChange={setShowExitPopup} 
      />
    </div>
  );
};

export default SeniorLiving;
