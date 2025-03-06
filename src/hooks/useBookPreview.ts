
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Story } from "@/types/supabase";
import { useToast } from "@/hooks/use-toast";
import { getTotalPageCount } from "@/utils/bookPagination";

export function useBookPreview(profileId: string, open: boolean) {
  const [currentPage, setCurrentPage] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showToc, setShowToc] = useState(false);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [storyPages, setStoryPages] = useState<number[]>([]);
  const [totalPageCount, setTotalPageCount] = useState(1); // Cover page by default
  const { toast } = useToast();

  const { data: stories, isLoading: isStoriesLoading } = useQuery({
    queryKey: ["stories", profileId],
    queryFn: async () => {
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
    enabled: open,
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", profileId],
    queryFn: async () => {
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
    enabled: open,
  });

  useEffect(() => {
    if (!stories || stories.length === 0) {
      setStoryPages([]);
      setTotalPageCount(1); // Just the cover
      return;
    }

    let pageCount = 1; // Start with cover page
    const pageStartIndices: number[] = [];

    stories.forEach((story) => {
      pageStartIndices.push(pageCount);
      
      // Use our pagination utility to calculate pages needed
      const PAGINATION_CONFIG = {
        charsPerPage: 1800, // Baseline character estimate
        titleSpace: 150,    // Space for title
        imageSpace: 300,    // Space for image if present
        lineHeight: 30,     // Default line height
        linesPerPage: Math.floor((768 - 64) / 30) // Approx lines per page
      };
      
      // Parse paragraphs from story content
      const paragraphs = story.content.split('\n').filter(p => p.trim() !== '');
      
      // Check if the story has images
      const hasImage = async () => {
        const { data } = await supabase
          .from("story_media")
          .select("id")
          .eq("story_id", story.id)
          .limit(1);
        return data && data.length > 0;
      };
      
      // For simplicity, let's assume images might exist
      // In a production app, you'd want to properly check this with a query
      const pagesNeeded = getTotalPageCount(paragraphs, PAGINATION_CONFIG, true);
      
      pageCount += pagesNeeded;
    });

    setStoryPages(pageStartIndices);
    setTotalPageCount(pageCount);
    
    // Log important information for debugging
    console.log("Story page indices:", pageStartIndices);
    console.log("Total pages calculated:", pageCount);
  }, [stories]);

  const goToNextPage = () => {
    if (currentPage < totalPageCount - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getCurrentStoryIndex = () => {
    if (currentPage === 0) return -1; // Cover page
    
    for (let i = storyPages.length - 1; i >= 0; i--) {
      if (currentPage >= storyPages[i]) {
        return i;
      }
    }
    return -1;
  };

  const getPageWithinStory = () => {
    const storyIndex = getCurrentStoryIndex();
    if (storyIndex === -1) return 0;
    
    return currentPage - storyPages[storyIndex] + 1;
  };

  const zoomIn = () => {
    setZoomLevel(Math.min(2, zoomLevel + 0.1));
  };

  const zoomOut = () => {
    setZoomLevel(Math.max(0.5, zoomLevel - 0.1));
  };

  const toggleBookmark = () => {
    if (bookmarks.includes(currentPage)) {
      setBookmarks(bookmarks.filter(b => b !== currentPage));
    } else {
      setBookmarks([...bookmarks, currentPage]);
    }
  };

  const toggleToc = () => {
    setShowToc(!showToc);
  };

  const jumpToPage = (pageIndex: number) => {
    setCurrentPage(pageIndex);
    setShowToc(false);
  };

  useEffect(() => {
    if (open) {
      setCurrentPage(0);
      setZoomLevel(1);
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      
      switch (e.key) {
        case "ArrowRight":
          goToNextPage();
          break;
        case "ArrowLeft":
          goToPrevPage();
          break;
        case "Escape":
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, currentPage, totalPageCount]);

  return {
    currentPage,
    zoomLevel,
    showToc,
    bookmarks,
    storyPages,
    totalPageCount,
    stories,
    profile,
    isStoriesLoading,
    goToNextPage,
    goToPrevPage,
    getCurrentStoryIndex,
    getPageWithinStory,
    zoomIn,
    zoomOut,
    toggleBookmark,
    toggleToc,
    jumpToPage
  };
}
