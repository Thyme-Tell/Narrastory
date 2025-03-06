
export interface PaginationConfig {
  charsPerPage: number;
  titleSpace: number;
  imageSpace: number;
  lineHeight: number;
  linesPerPage: number;
}

// Helper function to estimate if a paragraph will fit on a page
const willParagraphFit = (
  paragraph: string, 
  remainingLines: number,
  avgCharsPerLine: number
): boolean => {
  // Estimate the number of lines this paragraph will take
  const estimatedLines = Math.ceil(paragraph.length / avgCharsPerLine);
  return estimatedLines <= remainingLines;
};

export const calculatePageContent = (
  paragraphs: string[],
  pageNumber: number,
  config: PaginationConfig,
  hasImage: boolean = false
): string[] => {
  const { charsPerPage, titleSpace, imageSpace, linesPerPage } = config;
  
  // Filter out empty paragraphs first
  const nonEmptyParagraphs = paragraphs.filter(p => p.trim() !== '');
  
  if (!nonEmptyParagraphs || nonEmptyParagraphs.length === 0) {
    return [];
  }
  
  // For first page, account for title space and possibly image space
  const firstPageDeduction = titleSpace + (hasImage && pageNumber === 1 ? imageSpace : 0);
  const effectiveCharsForFirstPage = charsPerPage - firstPageDeduction;
  
  // Calculate lines available for first page vs other pages
  const firstPageLines = Math.floor(linesPerPage - (titleSpace / 30) - (hasImage && pageNumber === 1 ? (imageSpace / 30) : 0));
  const regularPageLines = linesPerPage;
  
  // Average characters per line (rough estimate)
  const avgCharsPerLine = 60; // This can be adjusted based on font size and page width
  
  // Initialize tracking variables
  let currentPageNumber = 1;
  let currentPageLines = currentPageNumber === 1 ? firstPageLines : regularPageLines;
  let currentPageContent: string[] = [];
  let paragraphIndex = 0;
  
  // Process paragraphs until we reach the requested page
  while (paragraphIndex < nonEmptyParagraphs.length) {
    const paragraph = nonEmptyParagraphs[paragraphIndex];
    const linesForCurrentPage = currentPageNumber === 1 ? firstPageLines : regularPageLines;
    
    // Check if adding this paragraph would exceed the current page's capacity
    if (!willParagraphFit(paragraph, currentPageLines, avgCharsPerLine)) {
      // This paragraph doesn't fit on the current page
      
      // If the current page is empty but we're trying to add a very long paragraph,
      // we should force at least some content onto the page
      if (currentPageContent.length === 0) {
        // Split the paragraph to fit what we can on this page
        const charsForCurrentPage = currentPageLines * avgCharsPerLine;
        const partialParagraph = paragraph.substring(0, charsForCurrentPage);
        
        if (currentPageNumber === pageNumber) {
          currentPageContent.push(partialParagraph);
          return currentPageContent;
        }
        
        // Move to next page
        currentPageNumber++;
        currentPageLines = currentPageNumber === 1 ? firstPageLines : regularPageLines;
        currentPageContent = [];
        
        // Continue with the rest of the paragraph
        const remainingParagraph = paragraph.substring(charsForCurrentPage);
        if (remainingParagraph.trim()) {
          nonEmptyParagraphs[paragraphIndex] = remainingParagraph;
          continue;
        } else {
          paragraphIndex++;
          continue;
        }
      }
      
      // If we've reached the requested page, return what we have
      if (currentPageNumber === pageNumber) {
        return currentPageContent;
      }
      
      // Move to next page
      currentPageNumber++;
      currentPageLines = currentPageNumber === 1 ? firstPageLines : regularPageLines;
      currentPageContent = [];
      
      // Don't increment paragraphIndex, try this paragraph on the next page
      continue;
    }
    
    // This paragraph fits on the current page
    const estimatedLines = Math.ceil(paragraph.length / avgCharsPerLine);
    currentPageLines -= estimatedLines;
    
    // If we're on the requested page, add this paragraph to the result
    if (currentPageNumber === pageNumber) {
      currentPageContent.push(paragraph);
    }
    
    // Move to the next paragraph
    paragraphIndex++;
    
    // If we've run out of lines on this page, move to the next page
    if (currentPageLines <= 0) {
      if (currentPageNumber === pageNumber) {
        // We've filled the requested page, return what we have
        return currentPageContent;
      }
      
      // Move to next page
      currentPageNumber++;
      currentPageLines = currentPageNumber === 1 ? firstPageLines : regularPageLines;
      currentPageContent = [];
    }
  }
  
  // If we've processed all paragraphs and reached our target page with content
  if (currentPageNumber === pageNumber && currentPageContent.length > 0) {
    return currentPageContent;
  }
  
  // If we've reached here, there is no content for this page
  return [];
};

export const checkContentOverflow = (contentHeight: number, pageCapacity: number): boolean => {
  // Add a small buffer to prevent edge cases
  return contentHeight > (pageCapacity - 10);
};

export const getTotalPageCount = (
  paragraphs: string[],
  config: PaginationConfig,
  hasImage: boolean = false
): number => {
  if (!paragraphs || paragraphs.length === 0) {
    return 1; // At least cover page
  }
  
  // Filter out empty paragraphs
  const nonEmptyParagraphs = paragraphs.filter(p => p.trim() !== '');
  
  if (nonEmptyParagraphs.length === 0) {
    return 1; // Just cover if all paragraphs are empty
  }
  
  // Simulate pagination through all content to count non-empty pages
  let currentPage = 1;
  let pageContent: string[] = [];
  let nonEmptyPageCount = 0;
  
  do {
    pageContent = calculatePageContent(nonEmptyParagraphs, currentPage, config, hasImage);
    if (pageContent.length > 0) {
      nonEmptyPageCount++;
      currentPage++;
    } else {
      // If we hit an empty page, we've reached the end
      break;
    }
  } while (pageContent.length > 0 && currentPage < 100); // Safety limit of 100 pages
  
  // Ensure at least 1 page if we have paragraphs (even if they're empty)
  return Math.max(1, nonEmptyPageCount);
};

export const isLastPageOfStory = (
  paragraphs: string[],
  pageNumber: number, 
  config: PaginationConfig,
  hasImage: boolean = false
): boolean => {
  const totalPages = getTotalPageCount(paragraphs, config, hasImage);
  return pageNumber >= totalPages;
};
