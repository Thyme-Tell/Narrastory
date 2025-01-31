import { useNavigate } from "react-router-dom";
import { LogIn, Home, BookOpen, User } from "lucide-react";
import Cookies from "js-cookie";
import {
  Sidebar as ShadcnSidebar,
  SidebarGroup as ShadcnSidebarGroup,
  SidebarGroupContent as ShadcnSidebarGroupContent,
} from "@/components/ui/shadcn-sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export function AppSidebar() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication state when component mounts
    checkAuth();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };

  const handleStoryBooksClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      // Add the current path as a redirect parameter
      navigate('/sign-in?redirectTo=/storybooks');
      return;
    }

    navigate('/storybooks');
  };

  const menuItems = [
    {
      title: "Home",
      icon: Home,
      to: "/",
    },
    {
      title: isAuthenticated ? "Profile" : "Sign In",
      icon: isAuthenticated ? User : LogIn,
      to: isAuthenticated ? `/profile/${Cookies.get('profile_id')}` : "/sign-in",
    },
    {
      title: "Storybooks",
      icon: BookOpen,
      onClick: handleStoryBooksClick,
    },
  ];

  return (
    <ShadcnSidebar>
      <ShadcnSidebarGroup>
        <ShadcnSidebarGroupContent>
          {menuItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent rounded-lg transition-colors"
              onClick={item.onClick || (() => navigate(item.to))}
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              <span>{item.title}</span>
            </div>
          ))}
        </ShadcnSidebarGroupContent>
      </ShadcnSidebarGroup>
    </ShadcnSidebar>
  );
}