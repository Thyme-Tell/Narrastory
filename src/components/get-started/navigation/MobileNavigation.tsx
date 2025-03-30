
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
  pastHowItWorks?: boolean;
  handleLogoClick?: (e: React.MouseEvent) => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  navItems,
  activeItem,
  isDropdownOpen,
  setIsDropdownOpen,
  handleNavItemClick,
  scrolled,
  activeNavItem,
  displayNavItems,
  pastHowItWorks = false,
  handleLogoClick = () => {}
}) => {
  return (
    <div className="w-full flex sm:hidden justify-end items-center">
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center justify-between px-4 py-2 bg-[#17342C]/70 backdrop-blur-sm rounded-[4px] text-white">
            <div className="flex items-center">
              {activeNavItem.icon}
              <span className="ml-2 text-xs">{activeNavItem.label}</span>
            </div>
            <ChevronDown className="ml-2 h-4 w-4 text-white opacity-70" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[200px] bg-[#333333]/80 backdrop-blur-md border-0 text-white rounded-[4px]">
          {/* Home menu item */}
          <DropdownMenuItem asChild>
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setIsDropdownOpen(false);
              }}
              className="flex items-center w-full px-4 py-1.5 text-xs text-white rounded-[4px] hover:bg-[#17342C]/30"
            >
              <img 
                src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets//narra-icon-white.svg" 
                alt="Narra Icon" 
                className="h-4 w-4 mr-2"
              />
              <span className="text-xs">Home</span>
            </a>
          </DropdownMenuItem>
          
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
  );
};

export default MobileNavigation;
