
import { Story } from "@/types/supabase";
import { StoryMediaItem } from "@/types/media";

// Constants for book dimensions and content
const CHARS_PER_LINE = 45; // Reduced from 50 to be more conservative
const LINES_PER_PAGE = 20; // Reduced from 25 to ensure content fits
const PAGE_MARGIN_LINES = 6; // Space for header and footer

/**
 * Calculates how many pages a story will take based on its content
 */
export const calculateStoryPages = (story: Story): number => {
  if (!story.content || story.content.trim() === '') {
    return 1; // At least one page even if empty
  }

  const paragraphs = story.content.split('\n').filter(p => p.trim() !== '');
  let totalLines = 0;

  // Calculate lines needed for each paragraph
  paragraphs.forEach(paragraph => {
    // Each paragraph starts on a new line
    const paragraphLines = Math.ceil(paragraph.length / CHARS_PER_LINE);
    totalLines += paragraphLines + 1; // +1 for paragraph spacing
  });

  // Calculate pages needed, accounting for margins
  return Math.max(1, Math.ceil(totalLines / (LINES_PER_PAGE - PAGE_MARGIN_LINES)));
};

/**
 * Calculates which paragraphs should be displayed on a specific page of a story
 * Returns an array of paragraph segments to display
 */
export const getPageContent = (story: Story, pageNumber: number): string[] => {
  if (!story.content || story.content.trim() === '') {
    return [];
  }

  // Split content into paragraphs
  const paragraphs = story.content.split('\n').filter(p => p.trim() !== '');
  const effectiveLineLimit = LINES_PER_PAGE - PAGE_MARGIN_LINES;
  
  // Calculate exact character and line positions for more accurate pagination
  const allLinePositions: { text: string, paragraph: number, isLastLine: boolean }[] = [];
  
  paragraphs.forEach((paragraph, pIndex) => {
    // Skip empty paragraphs
    if (paragraph.trim() === '') return;
    
    // Split paragraph into lines based on character limit
    let remainingText = paragraph;
    while (remainingText.length > 0) {
      const lineText = remainingText.slice(0, CHARS_PER_LINE);
      const isLastLine = remainingText.length <= CHARS_PER_LINE;
      
      allLinePositions.push({
        text: lineText,
        paragraph: pIndex,
        isLastLine
      });
      
      remainingText = remainingText.slice(lineText.length);
    }
    
    // Add an empty line after each paragraph for spacing
    allLinePositions.push({
      text: '',
      paragraph: pIndex,
      isLastLine: true
    });
  });
  
  // Calculate which lines belong on the requested page
  const startLine = (pageNumber - 1) * effectiveLineLimit;
  const endLine = startLine + effectiveLineLimit;
  const pageLines = allLinePositions.slice(startLine, endLine);
  
  // Group the lines back into paragraphs
  const pageContent: string[] = [];
  let currentParagraph = '';
  let lastParagraphIndex = -1;
  
  pageLines.forEach(line => {
    // If this is from a new paragraph or it's the first line
    if (line.paragraph !== lastParagraphIndex || lastParagraphIndex === -1) {
      // If we have content from the previous paragraph, add it to the result
      if (currentParagraph.trim()) {
        pageContent.push(currentParagraph);
      }
      
      // Start a new paragraph
      currentParagraph = line.text;
      lastParagraphIndex = line.paragraph;
    } else {
      // Continue the same paragraph
      currentParagraph += line.text;
    }
    
    // If this is the last line of a paragraph, prepare for the next one
    if (line.isLastLine) {
      if (currentParagraph.trim()) {
        pageContent.push(currentParagraph);
      }
      currentParagraph = '';
      lastParagraphIndex = -1;
    }
  });
  
  // Add the last paragraph if there's remaining content
  if (currentParagraph.trim()) {
    pageContent.push(currentParagraph);
  }
  
  // If this pagination method produces no content but we know there should be content
  // (e.g., due to calculation errors), fall back to a simpler approach
  if (pageContent.length === 0 && pageNumber <= calculateStoryPages(story)) {
    // Simple fallback: just return the whole paragraph that should appear on this page
    const paragraphsPerPage = Math.max(1, Math.floor(paragraphs.length / calculateStoryPages(story)));
    const startParagraph = (pageNumber - 1) * paragraphsPerPage;
    return paragraphs.slice(startParagraph, startParagraph + paragraphsPerPage);
  }
  
  return pageContent;
};

/**
 * Calculates the total number of pages for all stories, including cover
 */
export const calculateTotalPages = (stories: Story[], storyMediaMap: Map<string, StoryMediaItem[]>): number => {
  if (!stories || stories.length === 0) {
    return 1; // Just the cover page
  }

  let totalPages = 1; // Start with cover page
  
  stories.forEach(story => {
    totalPages += calculateStoryPages(story);
    
    // Add pages for media items
    const mediaItems = storyMediaMap.get(story.id) || [];
    totalPages += mediaItems.length;
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

export const mapPageToStory = (globalPage: number, stories: Story[], storyMediaMap: Map<string, StoryMediaItem[]>): PageMapping => {
  if (globalPage === 0) {
    return { storyIndex: -1, pageWithinStory: 0 }; // Cover page
  }
  
  let currentPage = 1; // Start after cover page
  
  for (let i = 0; i < stories.length; i++) {
    const storyTextPages = calculateStoryPages(stories[i]);
    const mediaItems = storyMediaMap.get(stories[i].id) || [];
    const totalStoryPages = storyTextPages + mediaItems.length;
    
    // If the global page falls within this story's range
    if (globalPage < currentPage + totalStoryPages) {
      return {
        storyIndex: i,
        pageWithinStory: globalPage - currentPage + 1 // Convert to 1-based for the story
      };
    }
    
    currentPage += totalStoryPages;
  }
  
  // If we get here, the page is beyond our content
  return { storyIndex: -1, pageWithinStory: 0 };
};
