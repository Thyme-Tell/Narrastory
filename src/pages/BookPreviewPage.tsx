
import React, { useEffect } from "react";
import { useBookPreview } from "@/hooks/useBookPreview";
import BookPreviewLayout from "@/components/book/BookPreviewLayout";
import BookPreviewContainer from "@/components/book/BookPreviewContainer";

const BookPreviewPage = () => {
  const {
    stories,
    isStoriesLoading,
    coverData,
    isCoverLoading,
    authorName,
    bookNavigation,
    isRendered,
    isIOSDevice,
    handleClose,
    isGeneratingPDF,
    generationProgress,
    handleDownloadPDF
  } = useBookPreview();

  // Get the current story to display
  const currentStoryInfo = bookNavigation.getCurrentStory();
  
  // We need to ensure PDF generation gets the exact same styling
  useEffect(() => {
    const updateViewportMeta = () => {
      // Make sure no weird scaling happens that might affect the PDF output
      let viewportMeta = document.querySelector('meta[name="viewport"]');
      if (!viewportMeta) {
        viewportMeta = document.createElement('meta');
        viewportMeta.setAttribute('name', 'viewport');
        document.head.appendChild(viewportMeta);
      }
      viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    };
    
    updateViewportMeta();
    
    return () => {
      // Reset viewport when component unmounts
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (viewportMeta) {
        viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0');
      }
    };
  }, []);

  return (
    <BookPreviewLayout
      totalPageCount={bookNavigation.totalPageCount}
      currentPage={bookNavigation.currentPage}
      zoomLevel={bookNavigation.zoomLevel}
      showToc={bookNavigation.showToc}
      setShowToc={bookNavigation.setShowToc}
      bookmarks={bookNavigation.bookmarks}
      onZoomIn={bookNavigation.zoomIn}
      onZoomOut={bookNavigation.zoomOut}
      onToggleBookmark={bookNavigation.toggleBookmark}
      onClose={handleClose}
      stories={stories}
      storyPages={bookNavigation.storyPages}
      storyMediaMap={bookNavigation.storyMediaMap}
      jumpToPage={bookNavigation.jumpToPage}
      isRendered={isRendered}
      isIOSDevice={isIOSDevice}
      onDownloadPDF={handleDownloadPDF}
      isGeneratingPDF={isGeneratingPDF}
      generationProgress={generationProgress}
    >
      <BookPreviewContainer
        currentPage={bookNavigation.currentPage}
        totalPageCount={bookNavigation.totalPageCount}
        zoomLevel={bookNavigation.zoomLevel}
        stories={stories}
        isStoriesLoading={isStoriesLoading || isGeneratingPDF}
        isCoverLoading={isCoverLoading}
        coverData={coverData}
        authorName={authorName}
        goToNextPage={bookNavigation.goToNextPage}
        goToPrevPage={bookNavigation.goToPrevPage}
        currentStoryInfo={currentStoryInfo}
        isIOSDevice={isIOSDevice}
        onDownloadPDF={handleDownloadPDF}
        isGeneratingPDF={isGeneratingPDF}
        bookmarks={bookNavigation.bookmarks}
        storyPages={bookNavigation.storyPages}
        storyMediaMap={bookNavigation.storyMediaMap}
        jumpToPage={bookNavigation.jumpToPage}
      />
    </BookPreviewLayout>
  );
};

export default BookPreviewPage;
