
import React, { useState, useEffect } from "react";
import { NavItem } from "./NavItems";
import MobileNavigation from "./navigation/MobileNavigation";
import DesktopLogo from "./navigation/DesktopLogo";
import DesktopNavigation from "./navigation/DesktopNavigation";
import NarraLogo from "./navigation/NarraLogo";
import useHeaderScroll from "./navigation/useHeaderScroll";

interface HeaderProps {
  navItems: NavItem[];
  activeItem: string;
  handleMenuItemClick: (item: NavItem) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  navItems, 
  activeItem, 
  handleMenuItemClick 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pastHowItWorks, setPastHowItWorks] = useState(false);
  
  // Track scroll position for logo visibility and section detection
  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY;
      
      // Set scrolled state for header styling
      if (position > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
      
      // Check if we've scrolled past "How It Works" section
      const howItWorksSection = document.getElementById("how-it-works");
      if (howItWorksSection) {
        const howItWorksPosition = howItWorksSection.getBoundingClientRect().top;
        setPastHowItWorks(howItWorksPosition <= 100);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Initial check
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Simplify to just use activeItem directly
  const activeNavItem = navItems.find(item => item.name === activeItem) || navItems[0];

  // Handle nav item click with anchor navigation
  const handleNavItemClick = (e: React.MouseEvent, item: NavItem) => {
    e.preventDefault();
    
    // Call the handleMenuItemClick function to update the active item
    handleMenuItemClick(item);
    
    // Simple anchor navigation
    if (item.anchorId) {
      const element = document.getElementById(item.anchorId);
      if (element) {
        // Update URL with hash
        window.location.hash = item.anchorId;
        
        // Scroll to element
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    
    // Close mobile dropdown if open
    setIsDropdownOpen(false);
  };

  // Handle logo click to scroll to top
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.location.hash = '';
  };

  // Display nav items without scroll modifications
  const displayNavItems = navItems;

  return (
    <header className="py-4 px-4 sm:px-8 sticky top-0 z-50 transition-all bg-transparent">
      <nav className="flex items-center justify-between bg-transparent py-1.5 sm:py-2">
        <div className="flex items-center">
          {/* Mobile navigation - visible below 860px */}
          <div className="block sm:hidden">
            <MobileNavigation 
              navItems={navItems}
              activeItem={activeItem}
              isDropdownOpen={isDropdownOpen}
              setIsDropdownOpen={setIsDropdownOpen}
              handleNavItemClick={handleNavItemClick}
              scrolled={scrolled}
              activeNavItem={activeNavItem}
              displayNavItems={displayNavItems}
              pastHowItWorks={pastHowItWorks}
              handleLogoClick={handleLogoClick}
            />
          </div>

          {/* Desktop logo - hide when scrolled on mobile */}
          <div className="hidden sm:block">
            {!scrolled && <DesktopLogo scrolled={scrolled} />}
          </div>
        </div>

        {/* Navigation menu - always inline with logo */}
        <div className="hidden sm:block">
          <DesktopNavigation 
            displayNavItems={displayNavItems} 
            activeItem={activeItem} 
            handleNavItemClick={handleNavItemClick}
            scrolled={scrolled}
            pastHowItWorks={pastHowItWorks}
            handleLogoClick={handleLogoClick}
          />
        </div>
      </nav>
    </header>
  );
};

export default Header;
