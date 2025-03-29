import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePageNavigation } from "@/hooks/usePageNavigation";

// Import our components
import Header from "@/components/get-started/Header";
import HomeSection from "@/components/get-started/HomeSection";
import HowItWorksSection from "@/components/get-started/HowItWorksSection";
import StoryCirclesSection from "@/components/get-started/StoryCirclesSection";
import SignUpSection from "@/components/get-started/SignUpSection";
import Footer from "@/components/get-started/Footer";
import PageNavigation from "@/components/get-started/navigation/PageNavigation";
import { getNavItems } from "@/components/get-started/NavItems";

const GetStarted = () => {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState("home");
  const isMobile = useIsMobile();
  const { links, activeLink, handleLinkClick } = usePageNavigation();
  
  // References for sections (keeping refs without scroll functionality)
  const homeRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLElement>(null);
  const storyCirclesRef = useRef<HTMLElement>(null);
  const signUpRef = useRef<HTMLElement>(null);
  
  // Get navigation items with references
  const navItems = getNavItems(homeRef, howItWorksRef, storyCirclesRef, signUpRef);
  
  useEffect(() => {
    document.title = "Narra Story | Get Started";
    
    const path = location.pathname;
    const hash = location.hash;

    // Handle navigation based on URL hash (without scrolling)
    if (hash) {
      const targetSection = hash.substring(1); // Remove the # character
      const selectedItem = navItems.find(item => item.name === targetSection);
      
      if (selectedItem) {
        setActiveItem(selectedItem.name);
      }
    } else if (path === "/get-started") {
      setActiveItem("home");
    }
  }, [location, navItems]);

  const handleMenuItemClick = (item: any) => {
    setActiveItem(item.name);
  };

  return (
    <div className="min-h-screen bg-[#EFF1E9]">
      <div className="px-[7%]">
        <Header 
          navItems={navItems} 
          activeItem={activeItem} 
          handleMenuItemClick={handleMenuItemClick} 
        />
        
        <div className="flex justify-center my-4">
          <PageNavigation 
            links={links} 
            defaultActive={activeLink} 
            onLinkClick={handleLinkClick} 
          />
        </div>

        <HomeSection homeRef={homeRef} isMobile={isMobile} />
        <HowItWorksSection howItWorksRef={howItWorksRef} isMobile={isMobile} />
        <StoryCirclesSection storyCirclesRef={storyCirclesRef} />
        <SignUpSection signUpRef={signUpRef} />
      </div>
      <Footer />
    </div>
  );
};

export default GetStarted;
