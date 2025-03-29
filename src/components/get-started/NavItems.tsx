
import React from "react";
import { Home, Book, Users, ArrowRight } from "lucide-react";

export type NavItem = {
  name: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  isButton?: boolean;
};

export const getNavItems = (): NavItem[] => [
  { 
    name: "home", 
    label: "Home", 
    path: "/get-started",
    icon: <Home className="mr-1 h-4 w-4 sm:h-4 sm:w-4 text-white" />
  },
  { 
    name: "how-it-works", 
    label: "How It Works", 
    path: "/get-started#how-it-works",
    icon: <Book className="mr-1 h-4 w-4 sm:h-4 sm:w-4 text-white" />
  },
  { 
    name: "join-story-circle", 
    label: "Join a Story Circle", 
    path: "/get-started#join-story-circle",
    icon: <Users className="mr-1 h-4 w-4 sm:h-4 sm:w-4 text-white" />
  },
  {
    name: "sign-up",
    label: "Sign Up",
    path: "/get-started#sign-up",
    icon: <ArrowRight className="mr-1 h-4 w-4 sm:h-4 sm:w-4 text-white" />,
    isButton: true
  }
];
