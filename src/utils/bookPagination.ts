
export interface PaginationConfig {
  charsPerPage: number;
  titleSpace: number;
  imageSpace: number;
  lineHeight: number; // Adding line height for better pagination calculations
  linesPerPage: number; // Adding lines per page calculation
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
  
  if (!paragraphs || paragraphs.length === 0) {
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
  let result: string[] = [];
  let paragraphIndex = 0;
  
  // Process paragraphs until we reach the requested page
  while (paragraphIndex < paragraphs.length) {
    const paragraph = paragraphs[paragraphIndex];
    const linesForCurrentPage = currentPageNumber === 1 ? firstPageLines : regularPageLines;
    
    // Check if adding this paragraph would exceed the current page's capacity
    if (!willParagraphFit(paragraph, currentPageLines, avgCharsPerLine)) {
      // This paragraph doesn't fit on the current page, move to next page
      if (currentPageNumber === pageNumber) {
        // We've filled the requested page, return what we have
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
  
  // If we're here, we've processed all paragraphs
  // Only return content if we've reached the requested page
  return currentPageNumber === pageNumber ? currentPageContent : [];
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
  
  // The approach here is to simulate pagination through all content
  let currentPage = 1;
  let pageContent: string[] = [];
  
  do {
    pageContent = calculatePageContent(paragraphs, currentPage, config, hasImage);
    if (pageContent.length > 0) {
      currentPage++;
    }
  } while (pageContent.length > 0);
  
  // currentPage will be one more than the last page with content
  return Math.max(1, currentPage - 1);
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
