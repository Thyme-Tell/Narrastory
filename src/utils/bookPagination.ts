import { Story } from "@/types/supabase";
import { StoryMediaItem } from "@/types/media";
import { 
  paginateContent, 
  calculateStoryPagesExact, 
  getPageContentExact,
  CHARS_PER_LINE, 
  LINES_PER_PAGE 
} from "./paginationUtils";

/**
 * Calculates how many pages a story will take based on its content
 */
export const calculateStoryPages = (story: Story): number => {
  return calculateStoryPagesExact(story);
};

/**
 * Splits text into lines without breaking words
 * @param text Text to split into lines
 * @param maxCharsPerLine Maximum characters per line
 * @returns Array of lines
 */
const splitTextIntoLines = (text: string, maxCharsPerLine: number): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    // If adding this word would exceed line length
    if ((currentLine.length + word.length + 1) > maxCharsPerLine) {
      // Push current line if it's not empty
      if (currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = '';
      }
      
      // If the word itself is longer than max chars, hyphenate it
      if (word.length > maxCharsPerLine) {
        // Split the word and add hyphens
        let remaining = word;
        while (remaining.length > maxCharsPerLine) {
          const segment = remaining.substring(0, maxCharsPerLine - 1) + '-';
          lines.push(segment);
          remaining = remaining.substring(maxCharsPerLine - 1);
        }
        currentLine = remaining;
      } else {
        // Normal case, just add the word to the empty line
        currentLine = word;
      }
    } else {
      // Add word to current line with a space if needed
      currentLine = currentLine.length > 0 ? `${currentLine} ${word}` : word;
    }
  });

  // Don't forget the last line
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines;
};

/**
 * Calculates which paragraphs should be displayed on a specific page of a story
 * Returns an array of paragraph segments to display
 */
export const getPageContent = (story: Story, pageNumber: number): string[] => {
  return getPageContentExact(story, pageNumber);
};

/**
 * Calculates the total number of pages for all stories, including cover
 */
export const calculateTotalPages = (stories: Story[], storyMediaMap: Map<string, StoryMediaItem[]> = new Map()): number => {
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

export const mapPageToStory = (globalPage: number, stories: Story[], storyMediaMap: Map<string, StoryMediaItem[]> = new Map()): PageMapping => {
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
