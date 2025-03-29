
import React, { useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Section, useScrollToSection } from "@/hooks/useScrollToSection";
import ScrollToTopButton from "@/components/ScrollToTopButton";

// Import our components
import Header from "@/components/get-started/Header";
import HomeSection from "@/components/get-started/HomeSection";
import HowItWorksSection from "@/components/get-started/HowItWorksSection";
import StoryCirclesSection from "@/components/get-started/StoryCirclesSection";
import SignUpSection from "@/components/get-started/SignUpSection";
import Footer from "@/components/get-started/Footer";

const GetStarted = () => {
  const isMobile = useIsMobile();
  
  // References for scrolling to sections
  const homeRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLElement>(null);
  const storyCirclesRef = useRef<HTMLElement>(null);
  const signUpRef = useRef<HTMLElement>(null);
  
  // Create sections array for the scroll hook
  const sections: Section[] = [
    { id: "home", ref: homeRef },
    { id: "how-it-works", ref: howItWorksRef },
    { id: "join-story-circle", ref: storyCirclesRef },
    { id: "sign-up", ref: signUpRef }
  ];
  
  // Initialize our scroll hook with the sections
  const { activeSection, scrolled, scrollToSection } = useScrollToSection(sections);

  // Document title
  React.useEffect(() => {
    document.title = "Narra Story | Get Started";
  }, []);

  return (
    <div className="min-h-screen bg-[#EFF1E9]">
      <div className="px-[7%]">
        <Header 
          sections={sections}
          activeSection={activeSection}
          scrolled={scrolled}
          scrollToSection={scrollToSection}
        />

        <HomeSection homeRef={homeRef} isMobile={isMobile} />
        <HowItWorksSection howItWorksRef={howItWorksRef} isMobile={isMobile} />
        <StoryCirclesSection storyCirclesRef={storyCirclesRef} />
        <SignUpSection signUpRef={signUpRef} />
      </div>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default GetStarted;
