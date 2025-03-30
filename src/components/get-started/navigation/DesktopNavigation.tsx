
import React from "react";
import { NavItem } from "../NavItems";
import NarraLogo from "./NarraLogo";

interface DesktopNavigationProps {
  displayNavItems: NavItem[];
  activeItem: string;
  handleNavItemClick: (e: React.MouseEvent, item: NavItem) => void;
  scrolled: boolean;
  pastHowItWorks?: boolean;
  handleLogoClick?: (e: React.MouseEvent) => void;
}

const DesktopNavigation: React.FC<DesktopNavigationProps> = ({
  displayNavItems,
  activeItem,
  handleNavItemClick,
  scrolled,
  pastHowItWorks = false,
  handleLogoClick = () => {}
}) => {
  return (
    <div className="hidden sm:flex bg-[#333333]/60 backdrop-blur-md rounded-[4px] p-0.5 items-center whitespace-nowrap overflow-x-auto" 
      style={{ padding: "3px 2px" }}>
      
      {/* Always show Narra logo when past How It Works section */}
      {pastHowItWorks && (
        <NarraLogo handleLogoClick={handleLogoClick} />
      )}
      
      {/* Render all navigation items */}
      {displayNavItems.map((item) => (
        item.isButton ? (
          <a
            key={item.name}
            href={`#${item.anchorId}`}
            onClick={(e) => handleNavItemClick(e, item)}
            className={`flex items-center px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-[4px] text-sm font-medium whitespace-nowrap bg-atlantic text-white hover:bg-atlantic/90 transition-colors w-full sm:w-auto justify-center m-[2px] mr-[3px] my-auto`}
          >
            Sign Up
          </a>
        ) : (
          <a
            key={item.name}
            href={`#${item.anchorId}`}
            onClick={(e) => handleNavItemClick(e, item)}
            className={`flex items-center px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-[4px] text-sm font-medium whitespace-nowrap text-white m-[2px] my-auto ${
              activeItem === item.name
                ? "bg-[#17342C]"
                : "hover:bg-[#17342C]/10"
            } transition-colors w-full sm:w-auto mb-0 sm:mb-0 sm:mr-0.5`}
          >
            {item.icon}
            {item.label}
          </a>
        )
      ))}
    </div>
  );
};

export default DesktopNavigation;
