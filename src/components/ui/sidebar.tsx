import { Home, LogIn, User, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent as ShadcnSidebarContent,
  SidebarGroup as ShadcnSidebarGroup,
  SidebarGroupContent as ShadcnSidebarGroupContent,
} from "@/components/ui/shadcn-sidebar";

export function AppSidebar() {
  const menuItems = [
    {
      title: "Home",
      icon: Home,
      to: "/",
    },
    {
      title: "Sign In",
      icon: LogIn,
      to: "/signin",
    },
    {
      title: "Profile",
      icon: User,
      to: "/profile",
    },
    {
      title: "Storybooks",
      icon: BookOpen,
      to: "/storybooks",
    },
  ];

  return (
    <ShadcnSidebar>
      <ShadcnSidebarContent>
        <ShadcnSidebarGroup>
          <ShadcnSidebarGroupContent>
            {menuItems.map((item) => (
              <Link key={item.title} to={item.to}>
                <item.icon />
                <span>{item.title}</span>
              </Link>
            ))}
          </ShadcnSidebarGroupContent>
        </ShadcnSidebarGroup>
      </ShadcnSidebarContent>
    </ShadcnSidebar>
  );
}