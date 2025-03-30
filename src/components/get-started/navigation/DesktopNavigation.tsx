
import React from "react";
import { NavItem } from "../NavItems";

interface DesktopNavigationProps {
  displayNavItems: NavItem[];
  activeItem: string;
  handleNavItemClick: (e: React.MouseEvent, item: NavItem) => void;
  scrolled: boolean;
  atHeroSection: boolean;
}

const DesktopNavigation: React.FC<DesktopNavigationProps> = ({
  displayNavItems,
  activeItem,
  handleNavItemClick,
  scrolled,
  atHeroSection
}) => {
  // Find the home item from the navigation items
  const homeItem = displayNavItems.find(item => item.name === "home");
  
  return (
    <div className="hidden sm:flex bg-[#333333]/60 backdrop-blur-md rounded-[4px] p-0.5 items-center mx-auto lg:mx-0 shadow-sm whitespace-nowrap overflow-x-auto" 
      style={{ padding: "3px 2px" }}>
      {/* Render home item as Narra logo only when not at hero section */}
      {homeItem && !atHeroSection && (
        <a
          key={homeItem.name}
          href={`#${homeItem.anchorId}`}
          onClick={(e) => handleNavItemClick(e, homeItem)}
          className={`flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-[4px] text-sm font-medium whitespace-nowrap m-[2px] my-auto ${
            activeItem === homeItem.name
              ? "bg-[#17342C]"
              : "hover:bg-[#17342C]/10"
          } transition-colors w-auto sm:w-auto mb-0 sm:mb-0 sm:mr-0.5`}
        >
          <img 
            src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets//narra-icon-white.svg" 
            alt="Narra" 
            className="w-5 h-5"
          />
        </a>
      )}
      
      {/* Render the rest of the items */}
      {displayNavItems
        .filter(item => item.name !== "home" || atHeroSection)
        .map((item) => (
          item.isButton ? (
            <a
              key={item.name}
              href={`#${item.anchorId}`}
              onClick={(e) => handleNavItemClick(e, item)}
              className={`flex items-center px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-[4px] text-sm font-medium whitespace-nowrap bg-atlantic text-white hover:bg-atlantic/90 transition-colors w-full sm:w-auto justify-center m-[2px] mr-[3px] my-auto`}
            >
              Save Your Spot (x available)
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
        ))
      }
    </div>
  );
};

export default DesktopNavigation;
