import { Story } from "@/types/supabase";

// Book physical measurements in inches
export const BOOK_WIDTH_INCHES = 5;
export const BOOK_HEIGHT_INCHES = 8;
export const MARGIN_INCHES = 1;

// Typography settings
export const FONT_SIZE_PT = 12;
export const LINE_HEIGHT_RATIO = 1.5;

// Calculated dimensions for page content
export const CONTENT_WIDTH_INCHES = BOOK_WIDTH_INCHES - (MARGIN_INCHES * 2);
export const CONTENT_HEIGHT_INCHES = BOOK_HEIGHT_INCHES - (MARGIN_INCHES * 2);

// Convert measurements to pixels at standard 96 DPI
export const INCH_TO_PX = 96;
export const BOOK_WIDTH_PX = BOOK_WIDTH_INCHES * INCH_TO_PX;
export const BOOK_HEIGHT_PX = BOOK_HEIGHT_INCHES * INCH_TO_PX;
export const MARGIN_PX = MARGIN_INCHES * INCH_TO_PX;
export const CONTENT_WIDTH_PX = CONTENT_WIDTH_INCHES * INCH_TO_PX;
export const CONTENT_HEIGHT_PX = CONTENT_HEIGHT_INCHES * INCH_TO_PX;

// Typography calculations
export const FONT_SIZE_PX = Math.round((FONT_SIZE_PT / 72) * 96); // Convert pt to px
export const LINE_HEIGHT_PX = Math.round(FONT_SIZE_PX * LINE_HEIGHT_RATIO);

// Characters per line calculation (approximation for proportional font)
export const CHARS_PER_INCH = 10; // Approximate for 12pt font
export const CHARS_PER_LINE = Math.floor(CONTENT_WIDTH_INCHES * CHARS_PER_INCH);

// Updated for more efficient space usage
export const LINES_PER_PAGE = Math.floor(CONTENT_HEIGHT_PX / LINE_HEIGHT_PX);

export interface Page {
  content: string[];
  pageNumber: number;
}

/**
 * Paginates content into properly formatted pages respecting word boundaries
 * @param content Full text content to paginate
 * @returns Array of Page objects
 */
export function paginateContent(content: string): Page[] {
  if (!content || content.trim() === '') {
    return [{ content: [], pageNumber: 1 }];
  }

  const pages: Page[] = [];
  const paragraphs = content.split('\n').filter(p => p.trim() !== '');
  
  let currentPage: string[] = [];
  let currentLines = 0;
  let pageNumber = 1;

  paragraphs.forEach(paragraph => {
    // Skip empty paragraphs
    if (paragraph.trim() === '') return;
    
    // Split paragraph into lines without breaking words
    const paragraphLines = splitParagraphIntoLines(paragraph, CHARS_PER_LINE);
    
    // Add a small buffer to ensure we don't leave too much whitespace
    const remainingLines = LINES_PER_PAGE - currentLines;
    
    // Check if this paragraph would overflow the current page
    if (currentLines + paragraphLines.length > LINES_PER_PAGE) {
      // If we're near the end of the page (less than 15% remaining), start a new page
      // This prevents large whitespace gaps at the bottom of pages
      if (remainingLines < Math.floor(LINES_PER_PAGE * 0.15) && currentLines > 0) {
        pages.push({
          content: currentPage,
          pageNumber: pageNumber++
        });
        currentPage = [];
        currentLines = 0;
      }
      
      // Complete the current page if it has content
      else if (currentLines > 0) {
        pages.push({
          content: currentPage,
          pageNumber: pageNumber++
        });
        currentPage = [];
        currentLines = 0;
      }
      
      // Handle paragraphs longer than a page
      if (paragraphLines.length > LINES_PER_PAGE) {
        // Split very long paragraphs across pages
        let remainingLines = [...paragraphLines];
        
        while (remainingLines.length > 0) {
          const pageLines = remainingLines.slice(0, LINES_PER_PAGE);
          remainingLines = remainingLines.slice(LINES_PER_PAGE);
          
          pages.push({
            content: [pageLines.join(' ')],
            pageNumber: pageNumber++
          });
        }
      } else {
        // Start a new page with this paragraph
        currentPage = [paragraphLines.join(' ')];
        currentLines = paragraphLines.length;
      }
    } else {
      // Add paragraph to current page
      currentPage.push(paragraphLines.join(' '));
      currentLines += paragraphLines.length;
    }
  });
  
  // Add the last page if it has content
  if (currentLines > 0) {
    pages.push({
      content: currentPage,
      pageNumber: pageNumber
    });
  }
  
  return pages;
}

/**
 * Splits text into lines without breaking words
 * @param text Text to split into lines
 * @param maxCharsPerLine Maximum characters per line
 * @returns Array of lines
 */
export function splitParagraphIntoLines(text: string, maxCharsPerLine: number): string[] {
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
}

/**
 * Calculates how many pages a story will take based on its content
 * using the precise pagination algorithm
 */
export const calculateStoryPagesExact = (story: Story): number => {
  if (!story.content || story.content.trim() === '') {
    return 1; // At least one page even if empty
  }
  
  return paginateContent(story.content).length;
};

/**
 * Gets the content for a specific page of a story using the precise pagination algorithm
 */
export const getPageContentExact = (story: Story, pageNumber: number): string[] => {
  if (!story.content || story.content.trim() === '') {
    return [];
  }
  
  const allPages = paginateContent(story.content);
  
  // Page numbers are 1-based
  if (pageNumber < 1 || pageNumber > allPages.length) {
    return [];
  }
  
  return allPages[pageNumber - 1].content;
};
