
import { useState } from 'react';
import { NavItem } from "../NavItems";

interface UseHeaderScrollProps {
  navItems: NavItem[];
  activeItem: string;
  handleMenuItemClick: (item: NavItem) => void;
}

export const useHeaderScroll = ({ 
  navItems, 
  activeItem, 
  handleMenuItemClick 
}: UseHeaderScrollProps) => {
  // Return a fixed scrolled state instead of calculating it
  const [scrolled] = useState(false);
  
  return { scrolled };
};

export default useHeaderScroll;
