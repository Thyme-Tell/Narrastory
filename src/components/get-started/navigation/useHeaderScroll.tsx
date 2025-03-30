
import { useState } from 'react';
import { NavItem } from "../NavItems";

interface UseHeaderScrollProps {
  navItems: NavItem[];
  activeItem: string;
  handleMenuItemClick: (item: NavItem) => void;
}

export const useHeaderScroll = ({ 
  activeItem
}: UseHeaderScrollProps) => {
  // Set scrolled state to false as we're removing scroll functionality
  const [scrolled] = useState(false);
  
  // Return the active section directly from props
  const activeSection = activeItem;

  // Empty functions for compatibility
  const scrollToSection = () => {};
  const scrollToTop = () => {};

  return { 
    scrolled,
    activeSection,
    scrollToSection,
    scrollToTop
  };
};

export default useHeaderScroll;
