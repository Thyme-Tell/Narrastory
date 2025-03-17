import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Story } from "@/types/supabase";
import { useCoverData } from "@/hooks/useCoverData";
import { useBookNavigation } from "@/hooks/useBookNavigation";
import BookPreviewContent from "./BookPreviewContent";
import TableOfContents from "./TableOfContents";
import BookPagination from "./BookPagination";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "../ui/button";
import { Menu, X } from "lucide-react";

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
  const [showToc, setShowToc] = useState(false);
  
  useEffect(() => {
    if (open) {
      console.log("BookPreview opened, isMobile:", isMobile);
      setIsRendered(true);
    } else {
      setIsRendered(false);
    }
  }, [open, isMobile]);
  
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

  const {
    currentPage,
    zoomLevel,
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

  const currentStoryInfo = getCurrentStory();
  const authorName = profile ? `${profile.first_name} ${profile.last_name}` : "";

  return (
    <div 
      className="fixed inset-0 bg-black/80 z-[999] flex flex-col items-center justify-start overflow-hidden w-full"
      style={{ touchAction: "none" }}
      data-is-mobile={isMobile ? "true" : "false"}
      data-is-rendered={isRendered ? "true" : "false"}
    >
      <div className="flex-1 w-full flex overflow-hidden">
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
            onDownloadPDF={undefined}
            isGeneratingPDF={false}
          />
        </div>
      </div>
      
      <div className="w-full bottom-controls-bar py-3 px-2">
        <BookPagination 
          currentPage={currentPage}
          totalPageCount={totalPageCount}
          goToNextPage={goToNextPage}
          goToPrevPage={goToPrevPage}
          isMobile={isMobile}
        />
        
        <div className="flex justify-between items-center px-4 pt-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowToc(!showToc)}
            aria-label="Toggle table of contents"
            className="text-xs"
          >
            <Menu className="h-4 w-4 mr-1" />
            Contents
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onClose}
            aria-label="Close preview"
            className="text-xs"
          >
            <X className="h-4 w-4 mr-1" />
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookPreview;
