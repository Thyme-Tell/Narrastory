
import { Story } from "@/types/supabase";
import { StoryMediaItem } from "@/types/media";

// Constants for book dimensions and content
const CHARS_PER_LINE = 45; // Reduced from 50 to be more conservative
const LINES_PER_PAGE = 26; // Increased from 23 to reduce bottom margin
const PAGE_MARGIN_LINES = 4; // Reduced from 6 to allow more content

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
      
      // If the word itself is longer than max chars, we'll need to split it
      if (word.length > maxCharsPerLine) {
        // Split the word and add hyphens at appropriate places
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
  if (!story.content || story.content.trim() === '') {
    return [];
  }

  // Split content into paragraphs
  const paragraphs = story.content.split('\n').filter(p => p.trim() !== '');
  const effectiveLineLimit = LINES_PER_PAGE - PAGE_MARGIN_LINES;
  
  // Create properly formatted lines from all paragraphs
  const allLines: { text: string, paragraphIndex: number }[] = [];
  
  paragraphs.forEach((paragraph, pIndex) => {
    // Skip empty paragraphs
    if (paragraph.trim() === '') return;
    
    // Split paragraph into lines without breaking words
    const paragraphLines = splitTextIntoLines(paragraph, CHARS_PER_LINE);
    
    // Add each line with its paragraph index
    paragraphLines.forEach(line => {
      allLines.push({ text: line, paragraphIndex: pIndex });
    });
    
    // Add an empty line after each paragraph for spacing
    if (pIndex < paragraphs.length - 1) {
      allLines.push({ text: '', paragraphIndex: pIndex });
    }
  });
  
  // Calculate which lines belong on the requested page
  const startLine = (pageNumber - 1) * effectiveLineLimit;
  const endLine = Math.min(startLine + effectiveLineLimit, allLines.length);
  
  // Get all lines for this page
  const pageLines = allLines.slice(startLine, endLine);
  
  // Group the lines back into paragraphs
  const resultParagraphs: string[] = [];
  let currentParagraph = '';
  let currentParagraphIndex = -1;
  
  pageLines.forEach((line, index) => {
    if (line.paragraphIndex !== currentParagraphIndex) {
      // New paragraph started
      if (currentParagraph) {
        resultParagraphs.push(currentParagraph);
      }
      currentParagraph = line.text;
      currentParagraphIndex = line.paragraphIndex;
    } else if (line.text === '') {
      // Empty line marks paragraph end
      if (currentParagraph) {
        resultParagraphs.push(currentParagraph);
        currentParagraph = '';
      }
    } else {
      // Continue paragraph
      // For better flow, add a space between lines within the same paragraph
      currentParagraph += (currentParagraph.endsWith('-') ? '' : ' ') + line.text;
    }
  });
  
  // Add the last paragraph if any
  if (currentParagraph) {
    resultParagraphs.push(currentParagraph);
  }
  
  return resultParagraphs;
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
