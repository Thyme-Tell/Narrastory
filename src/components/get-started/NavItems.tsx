
import React from "react";
import { Book, Users, ArrowRight, Building } from "lucide-react";

export type NavItem = {
  name: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  ref: React.RefObject<HTMLElement | HTMLDivElement> | null;
  isButton?: boolean;
  anchorId?: string; // Add anchor ID property
};

export const getNavItems = (
  homeRef: React.RefObject<HTMLDivElement>,
  howItWorksRef: React.RefObject<HTMLElement>,
  storyCirclesRef: React.RefObject<HTMLElement>,
  seniorLivingRef: React.RefObject<HTMLElement>,
  signUpRef: React.RefObject<HTMLElement>
): NavItem[] => [
  { 
    name: "how-it-works", 
    label: "How It Works", 
    path: "/get-started#how-it-works",
    icon: <Book className="mr-1 h-4 w-4 sm:h-4 sm:w-4 text-white" />,
    ref: howItWorksRef,
    anchorId: "how-it-works"
  },
  { 
    name: "join-story-circle", 
    label: "Join a Story Circle", 
    path: "/get-started#join-story-circle",
    icon: <Users className="mr-1 h-4 w-4 sm:h-4 sm:w-4 text-white" />,
    ref: storyCirclesRef,
    anchorId: "join-story-circle"
  },
  { 
    name: "senior-living", 
    label: "For Senior Living", 
    path: "/get-started#senior-living",
    icon: <Building className="mr-1 h-4 w-4 sm:h-4 sm:w-4 text-white" />,
    ref: seniorLivingRef,
    anchorId: "senior-living"
  },
  {
    name: "sign-up",
    label: "Sign Up",
    path: "/get-started#sign-up",
    icon: <ArrowRight className="mr-1 h-4 w-4 sm:h-4 sm:w-4 text-white" />,
    ref: signUpRef,
    isButton: true,
    anchorId: "sign-up"
  }
];
