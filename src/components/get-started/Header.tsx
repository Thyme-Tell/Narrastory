
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
  const [showMobileNav, setShowMobileNav] = useState(false);
  
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
        const isPastHowItWorks = howItWorksPosition <= 100;
        setPastHowItWorks(isPastHowItWorks);
        setShowMobileNav(isPastHowItWorks);
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
    <header className="py-4 px-4 sm:px-8 sticky top-0 z-50 transition-all">
      <nav className="navbar-container flex items-center justify-between bg-transparent py-1.5 sm:py-2">
        <div className={`navbar-logo flex ${!showMobileNav ? 'w-full justify-center sm:justify-center sm:w-auto' : 'items-center'}`}>
          {/* Always show logo on mobile */}
          <a 
            href="#home"
            className="bg-[#EFF1E9]/50 backdrop-blur-sm rounded-[100px] p-2 sm:hidden"
            onClick={handleLogoClick}
            style={{ boxShadow: "0 0 20px rgba(239, 241, 233, 0.8)" }}
          >
            <img 
              src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets//narra-horizontal.svg" 
              alt="Narra Logo" 
              className="w-[100px] h-auto"
            />
          </a>

          {showMobileNav && (
            <MobileNavigation 
              navItems={navItems}
              activeItem={activeItem}
              isDropdownOpen={isDropdownOpen}
              setIsDropdownOpen={setIsDropdownOpen}
              handleNavItemClick={handleNavItemClick}
              scrolled={scrolled}
              activeNavItem={activeNavItem}
              displayNavItems={displayNavItems}
              pastHowItWorks={false}
              handleLogoClick={handleLogoClick}
            />
          )}

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
