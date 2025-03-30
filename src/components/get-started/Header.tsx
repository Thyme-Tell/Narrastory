import React, { useState, useEffect } from "react";
import { NavItem } from "./NavItems";
import MobileNavigation from "./navigation/MobileNavigation";
import DesktopLogo from "./navigation/DesktopLogo";
import DesktopNavigation from "./navigation/DesktopNavigation";
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
  
  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY;
      
      if (position > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
      
      const howItWorksSection = document.getElementById("how-it-works");
      if (howItWorksSection) {
        const howItWorksPosition = howItWorksSection.getBoundingClientRect().top;
        setPastHowItWorks(howItWorksPosition <= 100);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const activeNavItem = navItems.find(item => item.name === activeItem) || navItems[0];

  const handleNavItemClick = (e: React.MouseEvent, item: NavItem) => {
    e.preventDefault();
    
    handleMenuItemClick(item);
    
    if (item.anchorId) {
      const element = document.getElementById(item.anchorId);
      if (element) {
        window.location.hash = item.anchorId;
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    
    setIsDropdownOpen(false);
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.location.hash = '';
  };

  const displayNavItems = navItems;

  return (
    <header className="py-4 px-4 sm:px-8 sticky top-0 z-50 transition-all bg-transparent">
      <nav className="navbar-container flex items-center justify-between bg-transparent py-1.5 sm:py-2">
        <div className="navbar-logo">
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

          {!scrolled && <DesktopLogo scrolled={scrolled} />}
        </div>

        <div className="navbar-menu flex-grow-0">
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
