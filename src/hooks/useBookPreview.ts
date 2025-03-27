
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Story } from "@/types/supabase";
import { useCoverData } from "@/hooks/useCoverData";
import { useBookNavigation } from "@/hooks/useBookNavigation";
import { StoryMediaItem } from "@/types/media";
import { generateBookPDF } from "@/utils/pdfGenerator";

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

  // Fetch all media for the stories in one query to ensure PDF has all media
  const { data: allMediaItems = [], isLoading: isMediaLoading } = useQuery({
    queryKey: ["all-story-media", stories?.map(s => s.id).join(",")],
    queryFn: async () => {
      if (!stories || stories.length === 0) return [];
      
      const storyIds = stories.map(s => s.id);
      console.log("Fetching media for stories:", storyIds);
      
      const { data, error } = await supabase
        .from("story_media")
        .select("*")
        .in("story_id", storyIds)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching all story media:", error);
        return [];
      }

      return data as StoryMediaItem[];
    },
    enabled: !!stories && stories.length > 0,
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

  // Organize media by story ID for PDF generation
  const mediaMap = new Map<string, StoryMediaItem[]>();
  if (allMediaItems.length > 0) {
    allMediaItems.forEach(item => {
      const existing = mediaMap.get(item.story_id) || [];
      existing.push(item);
      mediaMap.set(item.story_id, existing);
    });
  }

  // Use our custom hook for book navigation with the media map
  const bookNavigation = useBookNavigation(stories, true, mediaMap);

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
  
  // New function to handle PDF generation
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  
  const handleDownloadPDF = async () => {
    if (isGeneratingPDF || isStoriesLoading || !stories || stories.length === 0) return;
    
    try {
      setIsGeneratingPDF(true);
      setGenerationProgress(10);
      
      toast({
        title: "Generating PDF",
        description: "This process may take a few moments. Please wait...",
        duration: 10000,
      });
      
      // Add timeout to ensure UI updates before heavy processing
      setTimeout(async () => {
        try {
          setGenerationProgress(20);
          
          const pdfDataUrl = await generateBookPDF(
            stories, 
            coverData, 
            authorName,
            bookNavigation.storyMediaMap
          );
          
          setGenerationProgress(90);
          
          if (!pdfDataUrl) {
            throw new Error("Failed to generate PDF data");
          }
          
          // Create a temporary link to download the PDF
          const link = document.createElement("a");
          link.href = pdfDataUrl;
          link.download = `${coverData.titleText || "My Book"}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          setGenerationProgress(100);
          
          toast({
            title: "PDF Downloaded",
            description: "Your book has been successfully downloaded as a PDF.",
          });
        } catch (error) {
          console.error("Error generating PDF:", error);
          toast({
            title: "PDF Generation Failed",
            description: "There was an error creating your PDF. Please try again.",
            variant: "destructive",
            duration: 5000,
          });
        } finally {
          setIsGeneratingPDF(false);
          setGenerationProgress(0);
        }
      }, 300);
      
    } catch (error) {
      console.error("Error initiating PDF generation:", error);
      toast({
        title: "PDF Generation Failed",
        description: "Could not start PDF generation. Please try again.",
        variant: "destructive",
      });
      setIsGeneratingPDF(false);
      setGenerationProgress(0);
    }
  };

  return {
    profileId,
    stories,
    isStoriesLoading: isStoriesLoading || isMediaLoading,
    coverData,
    isCoverLoading,
    authorName,
    bookNavigation,
    isRendered,
    isIOSDevice,
    handleClose,
    allMediaItems,
    isGeneratingPDF,
    generationProgress,
    handleDownloadPDF
  };
};
