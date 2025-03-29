
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { NavItem } from "./NavItems";

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
  const activeNavItem = navItems.find(item => item.name === activeItem) || navItems[0];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="py-4 px-4 sm:px-8 bg-transparent sticky top-0 z-50">
      <nav className="flex flex-col lg:flex-row lg:justify-between lg:items-center bg-transparent py-1.5 sm:py-2 navbar-below-logo">
        <div className="w-full flex sm:flex lg:w-auto lg:flex-shrink-0">
          {/* Mobile dropdown */}
          <div className="w-full flex sm:hidden justify-between items-center">
            <Link 
              to="/get-started" 
              onClick={scrollToTop}
              className="bg-[#EFF1E9]/50 backdrop-blur-2xl rounded-[100px] p-2 inline-block"
              style={{ boxShadow: "0 0 20px rgba(239, 241, 233, 0.8)" }}
            >
              <img 
                src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets//narra-horizontal.svg" 
                alt="Narra Logo" 
                className="w-[100px] h-auto"
              />
            </Link>

            <div className="ml-2">
              <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-between px-4 py-2 bg-[#17342C]/60 backdrop-blur-xl rounded-[4px] text-white">
                    <div className="flex items-center">
                      {activeNavItem.icon}
                      <span className="ml-2 text-xs">{activeNavItem.label}</span>
                    </div>
                    <ChevronDown className="ml-2 h-4 w-4 text-white opacity-70" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[200px] bg-[#8A9096]/60 backdrop-blur-2xl border-0 text-white rounded-[4px]">
                  {navItems.map((item) => (
                    item.isButton ? (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={(e) => {
                          e.preventDefault();
                          handleMenuItemClick(item);
                        }}
                        className="flex items-center w-full px-4 py-2 text-xs font-medium bg-atlantic hover:bg-atlantic/90 text-white mr-[5px] rounded-[4px]"
                      >
                        {item.icon}
                        <span className="ml-2 text-xs">Sign Up</span>
                        <ArrowRight className="ml-auto h-3 w-3 text-white" />
                      </Link>
                    ) : (
                      <DropdownMenuItem key={item.name} asChild>
                        <Link
                          to={item.path}
                          onClick={(e) => {
                            e.preventDefault();
                            handleMenuItemClick(item);
                          }}
                          className={`flex items-center w-full px-4 py-1.5 text-xs text-white rounded-[4px] ${
                            activeItem === item.name
                              ? "bg-[#17342C]"
                              : "hover:bg-[#17342C]/30"
                          }`}
                        >
                          {React.cloneElement(item.icon as React.ReactElement, { 
                            className: "h-3 w-3 mr-2" 
                          })}
                          <span className="text-xs">{item.label}</span>
                        </Link>
                      </DropdownMenuItem>
                    )
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Tablet/desktop logo */}
          <Link 
            to="/get-started" 
            onClick={scrollToTop}
            className="hidden sm:inline-block bg-[#EFF1E9]/50 backdrop-blur-2xl rounded-[100px] p-4 lg:p-3 w-full sm:w-auto flex justify-center"
            style={{ boxShadow: "0 0 20px rgba(239, 241, 233, 0.8)" }}
          >
            <img 
              src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets//narra-horizontal.svg" 
              alt="Narra Logo" 
              className="w-[130px] h-auto"
            />
          </Link>
        </div>

        {/* Navigation menu */}
        <div className="flex w-full justify-center mt-4 lg:mt-0 lg:w-auto navbar-menu">
          <div className="hidden sm:flex bg-[#8A9096]/40 backdrop-blur-xl rounded-[4px] p-0.5 items-center mx-auto lg:mx-0 shadow-sm whitespace-nowrap overflow-x-auto" 
            style={{ padding: "3px 2px", backdropFilter: "blur(12px)" }}>
            {navItems.map((item) => (
              item.isButton ? (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    handleMenuItemClick(item);
                  }}
                  className={`flex items-center px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-[4px] text-sm font-medium whitespace-nowrap bg-atlantic text-white hover:bg-atlantic/90 transition-colors duration-200 w-full sm:w-auto justify-center m-[2px] mr-[3px] my-auto`}
                >
                  Sign Up <ArrowRight className="ml-1.5 sm:ml-2 h-4 w-4 text-white" />
                </Link>
              ) : (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    handleMenuItemClick(item);
                  }}
                  className={`flex items-center px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-[4px] text-sm font-medium whitespace-nowrap text-white m-[2px] my-auto ${
                    activeItem === item.name
                      ? "bg-[#17342C]"
                      : "hover:bg-[#17342C]/10"
                  } transition-colors duration-200 w-full sm:w-auto mb-0 sm:mb-0 sm:mr-0.5`}
                >
                  {React.cloneElement(item.icon as React.ReactElement, { 
                    className: "h-4 w-4 mr-2" 
                  })}
                  {item.label}
                </Link>
              )
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
