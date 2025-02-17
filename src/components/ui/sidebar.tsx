
import { useNavigate } from "react-router-dom";
import { LogIn, Home, BookOpen, User } from "lucide-react";
import {
  Sidebar as ShadcnSidebar,
  SidebarGroup as ShadcnSidebarGroup,
  SidebarGroupContent as ShadcnSidebarGroupContent,
} from "@/components/ui/shadcn-sidebar";
import { useAuth } from "@/contexts/AuthContext";

export function AppSidebar() {
  const navigate = useNavigate();
  const { isAuthenticated, profileId } = useAuth();

  const handleStoryBooksClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate(`/sign-in?redirectTo=${encodeURIComponent('/storybooks')}`, { replace: true });
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
      to: isAuthenticated ? `/profile/${profileId}` : "/sign-in",
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
