
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Story } from "@/types/supabase";
import { useCoverData } from "@/hooks/useCoverData";
import { useBookNavigation } from "@/hooks/useBookNavigation";

export const useBookPreview = () => {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { coverData, isLoading: isCoverLoading } = useCoverData(profileId || "");
  const [isRendered, setIsRendered] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  
  // Detect iOS device
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOSDevice(isIOS);
    console.log("iOS device detection:", isIOS);
  }, []);
  
  // Set up page rendering
  useEffect(() => {
    // Mark as rendered for animation purposes
    setIsRendered(true);
    
    // Prevent scrolling on body while preview is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      // Restore scrolling when component unmounts
      document.body.style.overflow = '';
    };
  }, []);
  
  // Fetch stories for the book content
  const { data: stories, isLoading: isStoriesLoading } = useQuery({
    queryKey: ["stories", profileId],
    queryFn: async () => {
      if (!profileId) return [];
      
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching stories:", error);
        toast({
          title: "Error",
          description: "Failed to load stories for preview",
          variant: "destructive",
        });
        return [];
      }

      return data as Story[];
    },
  });

  // Get profile info
  const { data: profile } = useQuery({
    queryKey: ["profile", profileId],
    queryFn: async () => {
      if (!profileId) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", profileId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
      
      return data;
    },
  });

  // Use our custom hook for book navigation
  const bookNavigation = useBookNavigation(stories, true);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
          bookNavigation.goToNextPage();
          break;
        case "ArrowLeft":
          bookNavigation.goToPrevPage();
          break;
        case "Escape":
          handleClose();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [bookNavigation.currentPage, bookNavigation.totalPageCount, bookNavigation.goToNextPage, bookNavigation.goToPrevPage]);

  const handleClose = () => {
    navigate(`/profile/${profileId}`);
  };

  const authorName = profile ? `${profile.first_name} ${profile.last_name}` : "";

  return {
    profileId,
    stories,
    isStoriesLoading,
    coverData,
    isCoverLoading,
    authorName,
    bookNavigation,
    isRendered,
    isIOSDevice,
    handleClose
  };
};
