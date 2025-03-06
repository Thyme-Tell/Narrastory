
import React, { useState, useEffect } from "react";
import { ChevronsRight } from "lucide-react";
import { Story } from "@/types/supabase";
import { StoryMediaItem } from "@/types/media";
import BookCover from "./BookCover";
import PageView from "./PageView";
import { CoverData } from "@/components/cover/CoverTypes";
import { motion, AnimatePresence } from "framer-motion";

interface TwoPageBookLayoutProps {
  currentPage: number;
  totalPageCount: number;
  coverData: CoverData;
  authorName: string;
  currentStoryInfo: {
    story: Story;
    pageWithinStory: number;
    totalPagesInStory: number;
    isMediaPage?: boolean;
    mediaItem?: StoryMediaItem;
  } | null;
  nextStoryInfo: {
    story: Story;
    pageWithinStory: number;
    totalPagesInStory: number;
    isMediaPage?: boolean;
    mediaItem?: StoryMediaItem;
  } | null;
  onPageClick: (pageNumber: number) => void;
}

const TwoPageBookLayout = ({
  currentPage,
  totalPageCount,
  coverData,
  authorName,
  currentStoryInfo,
  nextStoryInfo,
  onPageClick,
}: TwoPageBookLayoutProps) => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  
  // In a real book, we show left and right pages except for cover and first page
  const isLeftPageCover = currentPage === 0;
  const isRightPageFirst = currentPage === 0; // First content page appears on right of cover
  
  // When we click, we'll determine which side was clicked and advance accordingly
  const handleLeftPageClick = () => {
    if (!isLeftPageCover) {
      setDirection("backward");
      onPageClick(currentPage - 1);
    }
  };
  
  const handleRightPageClick = () => {
    if (currentPage < totalPageCount - 1) {
      setDirection("forward");
      onPageClick(currentPage + 1);
    }
  };

  // Determine what to show on left and right pages
  // Left page is even-numbered, right page is odd-numbered in a real book
  const renderLeftPage = () => {
    if (isLeftPageCover) {
      return (
        <BookCover 
          coverData={coverData} 
          authorName={authorName}
        />
      );
    } else if (currentStoryInfo && currentPage > 0) {
      // Left page - current page
      return (
        <PageView 
          story={currentStoryInfo.story} 
          pageNumber={currentStoryInfo.pageWithinStory}
          totalPagesInStory={currentStoryInfo.totalPagesInStory}
          isMediaPage={currentStoryInfo.isMediaPage}
          mediaItem={currentStoryInfo.mediaItem}
          pagePosition="left"
          pageIndex={currentPage}
        />
      );
    }
    return <div className="empty-page" />;
  };
  
  const renderRightPage = () => {
    if (isRightPageFirst && nextStoryInfo) {
      // First content page after cover
      return (
        <PageView 
          story={nextStoryInfo.story} 
          pageNumber={nextStoryInfo.pageWithinStory}
          totalPagesInStory={nextStoryInfo.totalPagesInStory}
          isMediaPage={nextStoryInfo.isMediaPage}
          mediaItem={nextStoryInfo.mediaItem}
          pagePosition="right"
          pageIndex={currentPage + 1}
        />
      );
    } else if (nextStoryInfo && currentPage < totalPageCount - 1) {
      // Regular right page
      return (
        <PageView 
          story={nextStoryInfo.story} 
          pageNumber={nextStoryInfo.pageWithinStory}
          totalPagesInStory={nextStoryInfo.totalPagesInStory}
          isMediaPage={nextStoryInfo.isMediaPage}
          mediaItem={nextStoryInfo.mediaItem}
          pagePosition="right"
          pageIndex={currentPage + 1}
        />
      );
    }
    return <div className="empty-page" />;
  };

  return (
    <div className="book-container">
      <div className="page-spread">
        {/* Left Page with animation */}
        <motion.div 
          className="book-page left-page"
          onClick={handleLeftPageClick}
          initial={{ rotateY: 0 }}
          animate={{ 
            rotateY: isFlipping && direction === "backward" ? -180 : 0,
            zIndex: isFlipping && direction === "backward" ? 10 : 5
          }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {renderLeftPage()}
          <div className="page-number left">
            {!isLeftPageCover && currentPage > 0 && (
              <span>{currentPage}</span>
            )}
          </div>
          <div className="page-fold left"></div>
        </motion.div>
        
        {/* Right Page with animation */}
        <motion.div 
          className="book-page right-page"
          onClick={handleRightPageClick}
          initial={{ rotateY: 0 }}
          animate={{ 
            rotateY: isFlipping && direction === "forward" ? 180 : 0,
            zIndex: isFlipping && direction === "forward" ? 10 : 5
          }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {renderRightPage()}
          <div className="page-number right">
            {currentPage < totalPageCount - 1 && (
              <span>{currentPage + 1}</span>
            )}
          </div>
          <div className="page-fold right"></div>
        </motion.div>
      </div>
      
      {/* Hint to show users they can navigate */}
      {currentPage < totalPageCount - 2 && (
        <div className="page-hint">
          <ChevronsRight className="h-6 w-6 animate-pulse" />
          <span className="text-sm text-muted-foreground">Tap to turn page</span>
        </div>
      )}
    </div>
  );
};

export default TwoPageBookLayout;
