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
import { useToast } from "@/hooks/use-toast";

export function AppSidebar() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          console.log("Auth state changed:", event, !!session);
          setIsAuthenticated(!!session);
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  const handleStoryBooksClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Only redirect to sign-in if we're sure the user isn't authenticated
    if (isAuthenticated === false) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access storybooks",
      });
      navigate('/sign-in?redirectTo=/storybooks');
      return;
    }

    navigate('/storybooks');
  };

  // Don't render menu items until we know the auth state
  if (isAuthenticated === null) {
    return (
      <ShadcnSidebar>
        <ShadcnSidebarGroup>
          <ShadcnSidebarGroupContent>
            <div className="flex items-center justify-center h-screen">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          </ShadcnSidebarGroupContent>
        </ShadcnSidebarGroup>
      </ShadcnSidebar>
    );
  }

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