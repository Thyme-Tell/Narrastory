
import React from "react";
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
