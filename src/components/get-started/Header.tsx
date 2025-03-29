
import React, { useState } from "react";
import { Section } from "@/hooks/useScrollToSection";
import MobileNavigation from "./navigation/MobileNavigation";
import DesktopLogo from "./navigation/DesktopLogo";
import DesktopNavigation from "./navigation/DesktopNavigation";
import { NavItem, getNavItems } from "./NavItems";

interface HeaderProps {
  sections: Section[];
  activeSection: string;
  scrolled: boolean;
  scrollToSection: (sectionId: string) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  sections, 
  activeSection, 
  scrolled, 
  scrollToSection 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Create nav items based on the sections
  const navItems = getNavItems();
  
  // Find the active nav item
  const activeNavItem = navItems.find(item => item.name === activeSection) || navItems[0];

  // Handle navigation item click 
  const handleNavItemClick = (e: React.MouseEvent, item: NavItem) => {
    e.preventDefault();
    scrollToSection(item.name);
    
    // Close mobile dropdown if open
    if (isDropdownOpen) {
      setIsDropdownOpen(false);
    }
  };

  // Handle home/logo click
  const scrollToTop = () => {
    scrollToSection("home");
  };

  // Modify nav items to show Narra icon instead of Home icon when scrolled
  const displayNavItems = navItems.map(item => {
    if (scrolled && item.name === 'home') {
      return {
        ...item,
        icon: <img 
          src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets//narra-icon-white.svg" 
          alt="Narra Icon" 
          className="h-4 w-4 mr-2"
        />
      };
    }
    return item;
  });

  return (
    <header className={`py-4 px-4 sm:px-8 sticky top-0 z-50 transition-all ${scrolled ? 'bg-transparent' : 'bg-transparent'}`}>
      <nav className="flex flex-col lg:flex-row lg:justify-between lg:items-center bg-transparent py-1.5 sm:py-2 navbar-below-logo">
        <div className="w-full flex md:flex lg:w-auto lg:flex-shrink-0">
          {/* Mobile dropdown - visible below 640px */}
          <MobileNavigation 
            navItems={navItems}
            activeSection={activeSection}
            isDropdownOpen={isDropdownOpen}
            setIsDropdownOpen={setIsDropdownOpen}
            scrollToTop={scrollToTop}
            handleNavItemClick={handleNavItemClick}
            scrolled={scrolled}
            activeNavItem={activeNavItem}
            displayNavItems={displayNavItems}
          />

          {/* Tablet/desktop logo - only visible when not scrolled */}
          <DesktopLogo scrolled={scrolled} scrollToTop={scrollToTop} />
        </div>

        {/* Navigation menu */}
        <div className="flex w-full justify-center mt-4 lg:mt-0 lg:w-auto navbar-menu">
          <DesktopNavigation 
            displayNavItems={displayNavItems} 
            activeSection={activeSection} 
            handleNavItemClick={handleNavItemClick} 
          />
        </div>
      </nav>
    </header>
  );
};

export default Header;
