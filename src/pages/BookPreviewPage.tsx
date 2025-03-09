
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Story } from "@/types/supabase";
import { useCoverData } from "@/hooks/useCoverData";
import { useBookNavigation } from "@/hooks/useBookNavigation";
import BookPreviewHeader from "@/components/book/BookPreviewHeader";
import BookPreviewContent from "@/components/book/BookPreviewContent";
import TableOfContents from "@/components/book/TableOfContents";
import { useIsMobile } from "@/hooks/use-mobile";

const BookPreviewPage = () => {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const bookContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { coverData, isLoading: isCoverLoading } = useCoverData(profileId || "");
  const isMobile = useIsMobile();
  const [isRendered, setIsRendered] = useState(false);
  
  // Set up page rendering
  useEffect(() => {
    console.log("BookPreviewPage mounted, isMobile:", isMobile);
    
    // Mark as rendered for animation purposes
    setIsRendered(true);
    
    // Prevent scrolling on body while preview is open
    document.body.style.overflow = 'hidden';
    
    // Setup touch event handling for mobile
    if (isMobile && bookContainerRef.current) {
      bookContainerRef.current.style.touchAction = 'pan-y';
    }
    
    return () => {
      // Restore scrolling when component unmounts
      document.body.style.overflow = '';
    };
  }, [isMobile]);
  
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
    jumpToPage
  } = useBookNavigation(stories, true);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
          goToNextPage();
          break;
        case "ArrowLeft":
          goToPrevPage();
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
  }, [currentPage, totalPageCount, goToNextPage, goToPrevPage]);

  const handleClose = () => {
    navigate(`/profile/${profileId}`);
  };

  // Get the current story to display
  const currentStoryInfo = getCurrentStory();
  const authorName = profile ? `${profile.first_name} ${profile.last_name}` : "";

  return (
    <div 
      className={`fixed inset-0 bg-black/90 z-[999] flex flex-col items-center justify-start overflow-hidden w-full h-full ios-book-preview-fix ${isRendered ? 'opacity-100' : 'opacity-0'}`}
      style={{ 
        touchAction: "none",
        transition: "opacity 0.25s ease-in-out",
      }}
      data-is-mobile={isMobile ? "true" : "false"}
      data-is-rendered={isRendered ? "true" : "false"}
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
        onClose={handleClose}
        isMobile={isMobile}
      />

      <div className="flex-1 w-full flex overflow-hidden">
        {/* TOC Sidebar */}
        {showToc && (
          <div className={`${isMobile ? "w-48 toc-mobile" : "w-64"} h-full bg-muted p-4 overflow-y-auto animate-slide-in-right`}>
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
          className={`flex-1 h-full flex flex-col items-center justify-center p-4 overflow-auto book-preview-mobile-container ${isMobile ? 'pt-2 pb-6' : 'p-4'}`}
          ref={bookContainerRef}
        >
          <BookPreviewContent
            currentPage={currentPage}
            totalPageCount={totalPageCount}
            zoomLevel={zoomLevel}
            stories={stories}
            isStoriesLoading={isStoriesLoading}
            isCoverLoading={isCoverLoading}
            coverData={coverData}
            authorName={authorName}
            goToNextPage={goToNextPage}
            goToPrevPage={goToPrevPage}
            currentStoryInfo={currentStoryInfo}
            isMobile={isMobile}
          />
        </div>
      </div>
    </div>
  );
};

export default BookPreviewPage;
