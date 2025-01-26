import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Image } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const TopNav = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-full bg-white/80 border-b">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/">
          <img 
            src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets/narra-logo.svg?t=2025-01-22T21%3A53%3A58.812Z" 
            alt="Narra Logo"
            className="h-11"
          />
        </Link>
        
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/">
                <NavigationMenuLink 
                  className={`${navigationMenuTriggerStyle()} ${isActive('/') ? 'bg-accent' : ''}`}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link to="/profile/2f803af2-710f-46af-8e6f-91516375ee3c">
                <NavigationMenuLink 
                  className={`${navigationMenuTriggerStyle()} ${isActive('/profile/2f803af2-710f-46af-8e6f-91516375ee3c') ? 'bg-accent' : ''}`}
                >
                  <Image className="w-4 h-4 mr-2" />
                  Your Memories
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link to="/storybooks">
                <NavigationMenuLink 
                  className={`${navigationMenuTriggerStyle()} ${isActive('/storybooks') ? 'bg-accent' : ''}`}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Storybooks
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
};

export default TopNav;