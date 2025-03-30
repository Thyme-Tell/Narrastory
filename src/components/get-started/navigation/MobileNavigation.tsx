
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
          <button className="flex items-center justify-between px-5 py-3 bg-[#17342C]/70 rounded-[6px] text-white">
            <div className="flex items-center">
              {activeNavItem.icon}
              <span className="ml-2 text-sm">{activeNavItem.label}</span>
            </div>
            <ChevronDown className="ml-2 h-5 w-5 text-white opacity-70" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[240px] backdrop-blur-xl bg-[#333333]/80 border-0 text-white rounded-[6px]">
          {/* Home menu item */}
          <DropdownMenuItem asChild>
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setIsDropdownOpen(false);
              }}
              className="flex items-center w-full px-5 py-2 text-sm text-white rounded-[4px] hover:bg-[#17342C]/30"
            >
              <img 
                src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets//narra-icon-white.svg" 
                alt="Narra Icon" 
                className="h-5 w-5 mr-2"
              />
              <span className="text-sm">Home</span>
            </a>
          </DropdownMenuItem>
          
          {/* Render all menu items */}
          {displayNavItems.map((item) => (
            item.isButton ? (
              <a
                key={item.name}
                href={`#${item.anchorId}`}
                onClick={(e) => handleNavItemClick(e, item)}
                className="flex items-center w-full px-5 py-2.5 text-sm font-medium bg-atlantic hover:bg-atlantic/90 text-white mr-[5px] rounded-[4px] m-2"
              >
                {item.icon}
                <span className="ml-2 text-sm">Sign Up</span>
              </a>
            ) : (
              <DropdownMenuItem key={item.name} asChild>
                <a
                  href={`#${item.anchorId}`}
                  onClick={(e) => handleNavItemClick(e, item)}
                  className={`flex items-center w-full px-5 py-2 text-sm text-white rounded-[4px] ${
                    activeItem === item.name
                      ? "bg-[#17342C]"
                      : "hover:bg-[#17342C]/30"
                  }`}
                >
                  {item.icon}
                  <span className="ml-2 text-sm">{item.label}</span>
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
