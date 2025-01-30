import { Home, LogIn, User, Library } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent as ShadcnSidebarContent,
  SidebarGroup as ShadcnSidebarGroup,
  SidebarGroupContent as ShadcnSidebarGroupContent,
} from "@/components/ui/shadcn-sidebar";
import { supabase } from "@/integrations/supabase/client";

export function AppSidebar() {
  const navigate = useNavigate();

  const handleStoryBooksClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/sign-in');
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
      title: "Sign In",
      icon: LogIn,
      to: "/sign-in",
    },
    {
      title: "Profile",
      icon: User,
      to: "/profile",
    },
    {
      title: "Storybooks",
      icon: Library,
      onClick: handleStoryBooksClick,
      to: "#",
    },
  ];

  return (
    <ShadcnSidebar>
      <ShadcnSidebarContent>
        <ShadcnSidebarGroup>
          <ShadcnSidebarGroupContent>
            {menuItems.map((item) => (
              <Link 
                key={item.title} 
                to={item.to}
                onClick={item.onClick}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            ))}
          </ShadcnSidebarGroupContent>
        </ShadcnSidebarGroup>
      </ShadcnSidebarContent>
    </ShadcnSidebar>
  );
}