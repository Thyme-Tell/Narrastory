
import React, { useState } from "react";
import { useBookPreview } from "@/hooks/useBookPreview";
import BookPreviewLayout from "@/components/book/BookPreviewLayout";
import BookPreviewContainer from "@/components/book/BookPreviewContainer";
import { generateBookPDF } from "@/utils/pdfGenerator";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

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
    handleClose
  } = useBookPreview();
  const { toast } = useToast();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Get the current story to display
  const currentStoryInfo = bookNavigation.getCurrentStory();

  const handleDownloadPDF = async () => {
    if (isGeneratingPDF || isStoriesLoading || !stories || stories.length === 0) return;
    
    try {
      setIsGeneratingPDF(true);
      toast({
        title: "Generating PDF",
        description: "This process may take up to 30 seconds depending on book size. Please wait...",
        duration: 6000,
      });
      
      // Add timeout to ensure UI updates before heavy processing
      setTimeout(async () => {
        try {
          const pdfDataUrl = await generateBookPDF(
            stories, 
            coverData, 
            authorName,
            bookNavigation.storyMediaMap
          );
          
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
        }
      }, 300); // Slightly longer delay to ensure UI updates first
      
    } catch (error) {
      console.error("Error initiating PDF generation:", error);
      toast({
        title: "PDF Generation Failed",
        description: "Could not start PDF generation. Please try again.",
        variant: "destructive",
      });
      setIsGeneratingPDF(false);
    }
  };

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
      />
    </BookPreviewLayout>
  );
};

export default BookPreviewPage;
