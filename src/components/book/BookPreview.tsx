
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Book, ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import BookCover from "./BookCover";
import PageView from "./PageView";
import TableOfContents from "./TableOfContents";
import { useCoverData } from "@/hooks/useCoverData";
import { Story } from "@/types/supabase";
import { cn } from "@/lib/utils";

interface BookPreviewProps {
  profileId: string;
  open: boolean;
  onClose: () => void;
}

const BookPreview = ({ profileId, open, onClose }: BookPreviewProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showToc, setShowToc] = useState(false);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [storyPages, setStoryPages] = useState<number[]>([]);
  const [totalPageCount, setTotalPageCount] = useState(1); // Cover page by default
  const bookContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { coverData, isLoading: isCoverLoading } = useCoverData(profileId);
  
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

  // Calculate page distribution for stories
  useEffect(() => {
    if (!stories || stories.length === 0) {
      setStoryPages([]);
      setTotalPageCount(1); // Just the cover
      return;
    }

    let pageCount = 1; // Start with cover page
    const pageStartIndices: number[] = [];

    // Each story starts on a new page
    stories.forEach((story) => {
      pageStartIndices.push(pageCount);
      
      // Estimate number of pages based on content length
      // This is a simple estimation - about 2000 characters per page
      const contentLength = story.content.length;
      const estimatedPages = Math.max(1, Math.ceil(contentLength / 2000));
      pageCount += estimatedPages;
    });

    setStoryPages(pageStartIndices);
    setTotalPageCount(pageCount);
  }, [stories]);

  // Handle page navigation
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

  // Find which story is displayed on the current page
  const getCurrentStoryIndex = () => {
    if (currentPage === 0) return -1; // Cover page
    
    for (let i = storyPages.length - 1; i >= 0; i--) {
      if (currentPage >= storyPages[i]) {
        return i;
      }
    }
    return -1;
  };

  // Get current page number within a story
  const getPageWithinStory = () => {
    const storyIndex = getCurrentStoryIndex();
    if (storyIndex === -1) return 0;
    
    return currentPage - storyPages[storyIndex] + 1;
  };

  // Handle zoom controls
  const zoomIn = () => {
    setZoomLevel(Math.min(2, zoomLevel + 0.1));
  };

  const zoomOut = () => {
    setZoomLevel(Math.max(0.5, zoomLevel - 0.1));
  };

  // Toggle bookmark for current page
  const toggleBookmark = () => {
    if (bookmarks.includes(currentPage)) {
      setBookmarks(bookmarks.filter(b => b !== currentPage));
    } else {
      setBookmarks([...bookmarks, currentPage]);
    }
  };

  // Jump to specific page from TOC
  const jumpToPage = (pageIndex: number) => {
    setCurrentPage(pageIndex);
    setShowToc(false);
  };

  // Reset state when dialog is opened
  useEffect(() => {
    if (open) {
      setCurrentPage(0);
      setZoomLevel(1);
    }
  }, [open]);

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
  }, [open, currentPage, totalPageCount, onClose]);

  if (!open) return null;

  // Get the current story to display
  const currentStoryIndex = getCurrentStoryIndex();
  const currentStory = currentStoryIndex !== -1 ? stories?.[currentStoryIndex] : null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-start overflow-hidden">
      {/* Header */}
      <div className="w-full bg-background p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowToc(!showToc)}
          >
            <Book className="h-4 w-4 mr-2" />
            Table of Contents
          </Button>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={zoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm">{Math.round(zoomLevel * 100)}%</span>
            <Button variant="outline" size="icon" onClick={zoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleBookmark}
            className={cn(
              bookmarks.includes(currentPage) && "text-amber-500"
            )}
          >
            <Bookmark className="h-4 w-4 mr-2" />
            {bookmarks.includes(currentPage) ? "Bookmarked" : "Bookmark"}
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm">
            Page {currentPage + 1} of {totalPageCount}
          </span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 w-full flex overflow-hidden">
        {/* TOC Sidebar */}
        {showToc && (
          <div className="w-64 h-full bg-muted p-4 overflow-y-auto animate-slide-in-right">
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
          <div 
            className="relative bg-white shadow-xl rounded-md transition-transform"
            style={{ 
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center',
              width: '600px',  // Adjusted for 5x8 aspect ratio (5:8 = 600:960)
              height: '960px', // 5x8 inch ratio
              maxHeight: '90vh'
            }}
          >
            {/* Book Pages */}
            {isStoriesLoading || isCoverLoading ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <>
                {currentPage === 0 ? (
                  // Cover Page
                  <BookCover 
                    coverData={coverData} 
                    authorName={profile ? `${profile.first_name} ${profile.last_name}` : ""}
                  />
                ) : (
                  // Content Pages
                  currentStory && (
                    <PageView 
                      story={currentStory} 
                      pageNumber={getPageWithinStory()}
                      isLastPage={currentStoryIndex < stories!.length - 1 && currentPage === storyPages[currentStoryIndex + 1] - 1}
                    />
                  )
                )}
              </>
            )}

            {/* Page Turn Buttons */}
            <div className="absolute inset-0 flex justify-between items-center pointer-events-none">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={goToPrevPage}
                disabled={currentPage === 0}
                className="h-12 w-12 rounded-full bg-background/80 pointer-events-auto ml-2"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={goToNextPage}
                disabled={currentPage === totalPageCount - 1}
                className="h-12 w-12 rounded-full bg-background/80 pointer-events-auto mr-2"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookPreview;
