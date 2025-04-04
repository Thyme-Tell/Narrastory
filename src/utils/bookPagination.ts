
import { Story } from "@/types/supabase";

// Constants for book dimensions and content - refined for better reading experience
const CHARS_PER_LINE = 60; // Approximate characters per line (increased for standard book width)
const LINES_PER_PAGE = 36; // Approximate lines per page for standard book format
const PAGE_MARGIN_LINES = 6; // Top and bottom margins in line count (increased for better spacing)
const PARAGRAPH_SPACING = 1.2; // Spacing multiplier between paragraphs

/**
 * Calculates how many pages a story will take based on its content
 * using professional book formatting standards
 */
export const calculateStoryPages = (story: Story): number => {
  if (!story.content || story.content.trim() === '') {
    return 1; // At least one page even if empty
  }

  const paragraphs = story.content.split('\n').filter(p => p.trim() !== '');
  let totalLines = 0;

  // Calculate lines needed for each paragraph with proper book formatting
  paragraphs.forEach(paragraph => {
    // Each paragraph starts on a new line
    const paragraphLines = Math.ceil(paragraph.length / CHARS_PER_LINE);
    totalLines += paragraphLines + PARAGRAPH_SPACING; // Add proper paragraph spacing
  });

  // Calculate pages needed, accounting for proper book margins
  return Math.max(1, Math.ceil(totalLines / (LINES_PER_PAGE - PAGE_MARGIN_LINES)));
};

/**
 * Calculates which paragraphs should be displayed on a specific page of a story
 * following professional book formatting guidelines
 */
export const getPageContent = (story: Story, pageNumber: number): string[] => {
  if (!story.content || story.content.trim() === '') {
    return [];
  }

  const paragraphs = story.content.split('\n').filter(p => p.trim() !== '');
  const pageContents: string[][] = [];
  let currentPage: string[] = [];
  let currentLineCount = 0;

  // Group paragraphs into pages using professional book formatting standards
  paragraphs.forEach(paragraph => {
    const paragraphLines = Math.ceil(paragraph.length / CHARS_PER_LINE) + PARAGRAPH_SPACING;

    // If adding this paragraph would exceed page limit, start a new page
    if (currentLineCount + paragraphLines > LINES_PER_PAGE - PAGE_MARGIN_LINES) {
      pageContents.push([...currentPage]);
      currentPage = [paragraph];
      currentLineCount = paragraphLines;
    } else {
      currentPage.push(paragraph);
      currentLineCount += paragraphLines;
    }
  });

  // Add the last page if it has content
  if (currentPage.length > 0) {
    pageContents.push(currentPage);
  }

  // Return the content for the requested page
  const pageIndex = pageNumber - 1; // Convert from 1-based to 0-based indexing
  if (pageIndex >= 0 && pageIndex < pageContents.length) {
    return pageContents[pageIndex];
  }

  return []; // Return empty array if page doesn't exist
};

/**
 * Calculates the total number of pages for all stories, including cover
 */
export const calculateTotalPages = (stories: Story[]): number => {
  if (!stories || stories.length === 0) {
    return 1; // Just the cover page
  }

  let totalPages = 1; // Start with cover page
  
  stories.forEach(story => {
    totalPages += calculateStoryPages(story);
  });

  return totalPages;
};

/**
 * Calculates which story and what page within that story corresponds to a global page number
 */
export interface PageMapping {
  storyIndex: number; // -1 for cover page
  pageWithinStory: number; // 1-based page number within the story
}

export const mapPageToStory = (globalPage: number, stories: Story[]): PageMapping => {
  if (globalPage === 0) {
    return { storyIndex: -1, pageWithinStory: 0 }; // Cover page
  }
  
  let currentPage = 1; // Start after cover page
  
  for (let i = 0; i < stories.length; i++) {
    const storyPageCount = calculateStoryPages(stories[i]);
    
    // If the global page falls within this story's range
    if (globalPage < currentPage + storyPageCount) {
      return {
        storyIndex: i,
        pageWithinStory: globalPage - currentPage + 1 // Convert to 1-based for the story
      };
    }
    
    currentPage += storyPageCount;
  }
  
  // If we get here, the page is beyond our content
  return { storyIndex: -1, pageWithinStory: 0 };
};
