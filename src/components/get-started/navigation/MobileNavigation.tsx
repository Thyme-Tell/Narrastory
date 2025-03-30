
import React from "react";
import { ChevronDown } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { NavItem } from "../NavItems";

interface MobileNavigationProps {
  navItems: NavItem[];
  activeItem: string;
  isDropdownOpen: boolean;
  setIsDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleNavItemClick: (e: React.MouseEvent, item: NavItem) => void;
  scrolled: boolean;
  activeNavItem: NavItem;
  displayNavItems: NavItem[];
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  navItems,
  activeItem,
  isDropdownOpen,
  setIsDropdownOpen,
  handleNavItemClick,
  scrolled,
  activeNavItem,
  displayNavItems
}) => {
  return (
    <div className="w-full flex sm:hidden justify-between items-center">
      {/* Only show logo when not scrolled */}
      {!scrolled ? (
        <a 
          href="#home"
          className="bg-[#EFF1E9]/50 rounded-[100px] p-2"
          style={{ boxShadow: "0 0 20px rgba(239, 241, 233, 0.8)" }}
        >
          <img 
            src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets//narra-horizontal.svg" 
            alt="Narra Logo" 
            className="w-[100px] h-auto"
          />
        </a>
      ) : (
        <div className="w-[100px]"></div> // Empty space to maintain layout
      )}

      <div className="ml-2">
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center justify-between px-4 py-2 bg-[#17342C]/70 rounded-[4px] text-white">
              <div className="flex items-center">
                {activeNavItem.icon}
                <span className="ml-2 text-xs">{activeNavItem.label}</span>
              </div>
              <ChevronDown className="ml-2 h-4 w-4 text-white opacity-70" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[200px] bg-[#333333]/80 backdrop-blur-md border-0 text-white rounded-[4px]">
            {/* Render all menu items */}
            {displayNavItems.map((item) => (
              item.isButton ? (
                <a
                  key={item.name}
                  href={`#${item.anchorId}`}
                  onClick={(e) => handleNavItemClick(e, item)}
                  className="flex items-center w-full px-4 py-2 text-xs font-medium bg-atlantic hover:bg-atlantic/90 text-white mr-[5px] rounded-[4px]"
                >
                  {item.icon}
                  <span className="ml-2 text-xs">Sign Up</span>
                </a>
              ) : (
                <DropdownMenuItem key={item.name} asChild>
                  <a
                    href={`#${item.anchorId}`}
                    onClick={(e) => handleNavItemClick(e, item)}
                    className={`flex items-center w-full px-4 py-1.5 text-xs text-white rounded-[4px] ${
                      activeItem === item.name
                        ? "bg-[#17342C]"
                        : "hover:bg-[#17342C]/30"
                    }`}
                  >
                    {item.icon}
                    <span className="ml-2 text-xs">{item.label}</span>
                  </a>
                </DropdownMenuItem>
              )
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default MobileNavigation;
