
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import TableOfContents from "./TableOfContents";
import BookPreviewContainer from "./BookPreviewContainer";
import { Book, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BookPreviewLayoutProps {
  totalPageCount: number;
  currentPage: number;
  zoomLevel: number;
  showToc: boolean;
  setShowToc: (show: boolean) => void;
  bookmarks: number[];
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleBookmark: () => void;
  onClose: () => void;
  stories: any[] | undefined;
  storyPages: number[];
  storyMediaMap: Map<string, any[]>;
  jumpToPage: (page: number) => void;
  children: React.ReactNode;
  isRendered: boolean;
  isIOSDevice: boolean;
  onDownloadPDF?: () => void;
}

const BookPreviewLayout = ({
  totalPageCount,
  currentPage,
  showToc,
  setShowToc,
  bookmarks,
  onClose,
  stories,
  storyPages,
  storyMediaMap,
  jumpToPage,
  children,
  isRendered,
  isIOSDevice,
  onDownloadPDF
}: BookPreviewLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <div 
      className={`fixed inset-0 bg-[#1A1A1A]/95 z-[999] flex flex-col items-center justify-start overflow-hidden w-full h-full ios-book-preview-fix ${isRendered ? 'opacity-100' : 'opacity-0'} ${isIOSDevice ? 'ios-safari-render-fix' : ''}`}
      style={{ 
        touchAction: "none",
        transition: "opacity 0.25s ease-in-out",
      }}
      data-is-mobile={isMobile ? "true" : "false"}
      data-is-rendered={isRendered ? "true" : "false"}
      data-is-ios={isIOSDevice ? "true" : "false"}
    >
      <div className="flex-1 w-full flex overflow-hidden">
        {/* TOC Sidebar - Now with bookish styling */}
        {showToc && (
          <div className={`${isMobile ? "w-56 toc-mobile" : "w-72"} h-full bg-[#f8f7f1] p-4 overflow-y-auto animate-slide-in-right border-r border-[#3C2A21]/20 shadow-lg`}>
            <TableOfContents 
              stories={stories || []} 
              currentPage={currentPage}
              onSelectPage={jumpToPage}
              bookmarks={bookmarks}
              storyPages={storyPages}
              storyMediaMap={storyMediaMap}
            />
          </div>
        )}

        {/* Book Content - now expanded to full height */}
        <div className="w-full h-full flex-1 flex flex-col relative">
          {children}
          
          {/* Bottom controls bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm py-3 px-4 shadow-lg flex justify-between items-center z-10">
            <div className="flex items-center space-x-2">
              <Button 
                variant={showToc ? "default" : "outline"}
                size={isMobile ? "sm" : "default"}
                onClick={() => setShowToc(!showToc)}
                className="flex items-center gap-2"
              >
                <Book className="h-4 w-4" />
                <span className={isMobile ? "sr-only" : ""}>Contents</span>
              </Button>
              
              {onDownloadPDF && !isMobile && (
                <Button 
                  variant="outline" 
                  size="default"
                  onClick={onDownloadPDF}
                  className="hidden sm:flex items-center gap-2"
                >
                  <span>Download PDF</span>
                </Button>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-xs sm:text-sm whitespace-nowrap">
                {currentPage + 1}/{totalPageCount}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookPreviewLayout;
