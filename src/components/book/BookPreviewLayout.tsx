
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import BookPreviewHeader from "./BookPreviewHeader";
import TableOfContents from "./TableOfContents";
import { Progress } from "@/components/ui/progress";

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
  isGeneratingPDF?: boolean;
  generationProgress?: number;
}

const BookPreviewLayout = ({
  totalPageCount,
  currentPage,
  zoomLevel,
  showToc,
  setShowToc,
  bookmarks,
  onZoomIn,
  onZoomOut,
  onToggleBookmark,
  onClose,
  stories,
  storyPages,
  storyMediaMap,
  jumpToPage,
  children,
  isRendered,
  isIOSDevice,
  onDownloadPDF,
  isGeneratingPDF = false,
  generationProgress = 0
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
      {/* Header */}
      <BookPreviewHeader
        totalPageCount={totalPageCount}
        currentPage={currentPage}
        zoomLevel={zoomLevel}
        showToc={showToc}
        bookmarks={bookmarks}
        onToggleToc={() => setShowToc(!showToc)}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onToggleBookmark={onToggleBookmark}
        onClose={onClose}
        onDownloadPDF={onDownloadPDF}
        isGeneratingPDF={isGeneratingPDF}
        isMobile={isMobile}
      />

      {/* PDF Generation Progress */}
      {isGeneratingPDF && generationProgress > 0 && (
        <div className="w-full px-4 py-2 bg-[#3C2A21]/90">
          <div className="flex items-center justify-between mb-1">
            <p className="text-white text-sm">Generating PDF...</p>
            <p className="text-white text-sm">{generationProgress}%</p>
          </div>
          <Progress value={generationProgress} className="h-1.5 bg-amber-200/30" indicatorClassName="bg-amber-400" />
        </div>
      )}

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

        {/* Book Content */}
        {children}
      </div>
    </div>
  );
};

export default BookPreviewLayout;
