
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Story } from "@/types/supabase";
import { useCoverData } from "@/hooks/useCoverData";
import { useBookNavigation } from "@/hooks/useBookNavigation";
import BookPreviewHeader from "./BookPreviewHeader";
import BookPreviewContent from "./BookPreviewContent";
import TableOfContents from "./TableOfContents";
import { useIsMobile } from "@/hooks/use-mobile";

interface BookPreviewProps {
  profileId: string;
  open: boolean;
  onClose: () => void;
}

const BookPreview = ({ profileId, open, onClose }: BookPreviewProps) => {
  const bookContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { coverData, isLoading: isCoverLoading } = useCoverData(profileId);
  const isMobile = useIsMobile();
  const [isRendered, setIsRendered] = useState(false);
  
  // Debug logging for mobile visibility issues
  useEffect(() => {
    if (open) {
      console.log("BookPreview opened, isMobile:", isMobile);
      setIsRendered(true);
    } else {
      setIsRendered(false);
    }
  }, [open, isMobile]);
  
  // Fetch stories for the book content
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

  // Get profile info
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

  // Use our custom hook for book navigation
  const {
    currentPage,
    zoomLevel,
    showToc,
    setShowToc,
    bookmarks,
    storyPages,
    totalPageCount,
    goToNextPage,
    goToPrevPage,
    getCurrentStory,
    zoomIn,
    zoomOut,
    toggleBookmark,
    jumpToPage,
    storyMediaMap
  } = useBookNavigation(stories, open);

  // Handle keyboard navigation
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
          onClose();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, currentPage, totalPageCount, onClose, goToNextPage, goToPrevPage]);

  // Fix for mobile devices - prevent body scrolling when preview is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  // Get the current story to display
  const currentStoryInfo = getCurrentStory();
  const authorName = profile ? `${profile.first_name} ${profile.last_name}` : "";

  return (
    <div 
      className="fixed inset-0 bg-black/80 z-[999] flex flex-col items-center justify-start overflow-hidden w-full"
      style={{ touchAction: "none" }}
      data-is-mobile={isMobile ? "true" : "false"} // For debugging
      data-is-rendered={isRendered ? "true" : "false"} // For debugging
    >
      {/* Header */}
      <BookPreviewHeader
        totalPageCount={totalPageCount}
        currentPage={currentPage}
        zoomLevel={zoomLevel}
        showToc={showToc}
        bookmarks={bookmarks}
        onToggleToc={() => setShowToc(!showToc)}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onToggleBookmark={toggleBookmark}
        onClose={onClose}
        isMobile={isMobile}
      />

      <div className="flex-1 w-full flex overflow-hidden">
        {/* TOC Sidebar */}
        {showToc && (
          <div className={`${isMobile ? "w-48" : "w-64"} h-full bg-muted p-4 overflow-y-auto animate-slide-in-right`}>
            <TableOfContents 
              stories={stories || []} 
              currentPage={currentPage}
              onSelectPage={jumpToPage}
              bookmarks={bookmarks}
              storyPages={storyPages}
            />
          </div>
        )}

        {/* Book Content */}
        <div 
          className="flex-1 h-full flex flex-col items-center justify-center p-4 overflow-auto"
          ref={bookContainerRef}
        >
          <BookPreviewContent
            currentPage={currentPage}
            totalPageCount={totalPageCount}
            zoomLevel={zoomLevel}
            stories={stories || []}
            isStoriesLoading={isStoriesLoading}
            isCoverLoading={isCoverLoading}
            coverData={coverData}
            authorName={authorName}
            goToNextPage={goToNextPage}
            goToPrevPage={goToPrevPage}
            currentStoryInfo={currentStoryInfo}
            isMobile={isMobile}
            bookmarks={bookmarks}
            storyPages={storyPages}
            storyMediaMap={storyMediaMap}
            jumpToPage={jumpToPage}
          />
        </div>
      </div>
    </div>
  );
};

export default BookPreview;
