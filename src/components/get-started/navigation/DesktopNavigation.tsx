
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { NavItem } from "../NavItems";

interface DesktopNavigationProps {
  displayNavItems: NavItem[];
  activeItem: string;
  handleNavItemClick: (e: React.MouseEvent, item: NavItem) => void;
}

const DesktopNavigation: React.FC<DesktopNavigationProps> = ({
  displayNavItems,
  activeItem,
  handleNavItemClick
}) => {
  return (
    <div className="hidden sm:flex bg-[#333333]/60 backdrop-blur-md rounded-[4px] p-0.5 items-center mx-auto lg:mx-0 shadow-sm whitespace-nowrap overflow-x-auto" 
      style={{ padding: "3px 2px" }}>
      {displayNavItems.map((item) => (
        item.isButton ? (
          <Link
            key={item.name}
            to={item.path}
            onClick={(e) => handleNavItemClick(e, item)}
            className={`flex items-center px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-[4px] text-sm font-medium whitespace-nowrap bg-atlantic text-white hover:bg-atlantic/90 transition-colors w-full sm:w-auto justify-center m-[2px] mr-[3px] my-auto`}
          >
            Sign Up <ArrowRight className="ml-1.5 sm:ml-2 h-4 w-4 text-white" />
          </Link>
        ) : (
          <Link
            key={item.name}
            to={item.path}
            onClick={(e) => handleNavItemClick(e, item)}
            className={`flex items-center px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-[4px] text-sm font-medium whitespace-nowrap text-white m-[2px] my-auto ${
              activeItem === item.name
                ? "bg-[#17342C]"
                : "hover:bg-[#17342C]/10"
            } transition-colors w-full sm:w-auto mb-0 sm:mb-0 sm:mr-0.5`}
          >
            {item.icon}
            {item.label}
          </Link>
        )
      ))}
    </div>
  );
};

export default DesktopNavigation;
