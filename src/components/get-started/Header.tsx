
import React, { useState } from "react";
import { NavItem } from "./NavItems";
import MobileNavigation from "./navigation/MobileNavigation";
import DesktopLogo from "./navigation/DesktopLogo";
import DesktopNavigation from "./navigation/DesktopNavigation";

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
  const scrolled = false; // Always set to false since we're removing scroll functionality
  
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

  // Display nav items without scroll modifications
  const displayNavItems = navItems;

  return (
    <header className="py-4 px-4 sm:px-8 sticky top-0 z-50 transition-all bg-transparent">
      <nav className="flex flex-col lg:flex-row lg:justify-between lg:items-center bg-transparent py-1.5 sm:py-2 navbar-below-logo">
        <div className="w-full flex md:flex lg:w-auto lg:flex-shrink-0">
          {/* Mobile dropdown - visible below 640px */}
          <MobileNavigation 
            navItems={navItems}
            activeItem={activeItem}
            isDropdownOpen={isDropdownOpen}
            setIsDropdownOpen={setIsDropdownOpen}
            handleNavItemClick={handleNavItemClick}
            scrolled={scrolled}
            activeNavItem={activeNavItem}
            displayNavItems={displayNavItems}
          />

          {/* Tablet/desktop logo */}
          <DesktopLogo scrolled={scrolled} />
        </div>

        {/* Navigation menu */}
        <div className="flex w-full justify-center mt-4 lg:mt-0 lg:w-auto navbar-menu">
          <DesktopNavigation 
            displayNavItems={displayNavItems} 
            activeItem={activeItem} 
            handleNavItemClick={handleNavItemClick} 
          />
        </div>
      </nav>
    </header>
  );
};

export default Header;
