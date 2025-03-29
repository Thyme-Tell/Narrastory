
import React, { useState } from "react";
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
  const { scrolled } = useHeaderScroll({ navItems, activeItem, handleMenuItemClick });
  const activeNavItem = navItems.find(item => item.name === activeItem) || navItems[0];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle manual navigation when clicking on a nav item
  const handleNavItemClick = (e: React.MouseEvent, item: NavItem) => {
    e.preventDefault();
    
    // Call the handleMenuItemClick function to update the active item
    handleMenuItemClick(item);
    
    // Scroll to the appropriate section
    if (item.ref && item.ref.current) {
      const sectionTop = item.ref.current.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ 
        top: sectionTop - 100, // Offset to account for header height
        behavior: 'smooth' 
      });
      
      // Update URL hash without scrolling
      const url = new URL(window.location.href);
      url.hash = item.name === 'home' ? '' : `#${item.name}`;
      window.history.replaceState({}, "", url.toString());
    } else if (item.name === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Remove hash from URL
      const url = new URL(window.location.href);
      url.hash = '';
      window.history.replaceState({}, "", url.toString());
    }
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
            activeItem={activeItem}
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
            activeItem={activeItem} 
            handleNavItemClick={handleNavItemClick} 
          />
        </div>
      </nav>
    </header>
  );
};

export default Header;
