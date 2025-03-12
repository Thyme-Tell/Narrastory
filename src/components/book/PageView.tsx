
import React from "react";
import { Story } from "@/types/supabase";
import { StoryMediaItem } from "@/types/media";
import TextPageView from "./TextPageView";
import MediaPageView from "./MediaPageView";

interface PageViewProps {
  story: Story;
  pageNumber: number; // 1-based page number within the story
  totalPagesInStory?: number;
  isMediaPage?: boolean;
  mediaItem?: StoryMediaItem;
  isMobile?: boolean;
  globalPageNumber?: number; // Added to display the page number at the bottom
  bookTitle?: string; // Add book title prop
}

const PageView = ({ 
  story, 
  pageNumber, 
  totalPagesInStory = 1,
  isMediaPage = false,
  mediaItem,
  isMobile = false,
  globalPageNumber = 1,
  bookTitle = "My Book"
}: PageViewProps) => {
  
  if (isMediaPage && mediaItem) {
    return (
      <MediaPageView 
        story={story}
        mediaItem={mediaItem}
        globalPageNumber={globalPageNumber}
        bookTitle={bookTitle}
      />
    );
  }

  return (
    <TextPageView 
      story={story}
      pageNumber={pageNumber}
      globalPageNumber={globalPageNumber}
      bookTitle={bookTitle}
    />
  );
};

export default PageView;
