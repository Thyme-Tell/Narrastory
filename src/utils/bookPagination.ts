
export interface PaginationConfig {
  charsPerPage: number;
  titleSpace: number;
  imageSpace: number; // Adding space consideration for images
}

export const calculatePageContent = (
  paragraphs: string[],
  pageNumber: number,
  config: PaginationConfig,
  hasImage: boolean = false
): string[] => {
  const { charsPerPage, titleSpace, imageSpace } = config;
  
  if (!paragraphs || paragraphs.length === 0) {
    return [];
  }
  
  // For first page, account for title space and possibly image space
  const firstPageDeduction = titleSpace + (hasImage && pageNumber === 1 ? imageSpace : 0);
  const effectiveCharsForFirstPage = charsPerPage - firstPageDeduction;
  
  // Initialize tracking variables
  let currentPageNumber = 1;
  let currentPageCharCount = 0;
  let result: string[] = [];
  let paragraphIndex = 0;
  
  // Track if we've processed any paragraphs for the requested page
  let processedAnyForRequestedPage = false;
  
  // Iterate through paragraphs until we reach the requested page
  while (paragraphIndex < paragraphs.length) {
    const paragraph = paragraphs[paragraphIndex];
    const maxCharsForCurrentPage = currentPageNumber === 1 
      ? effectiveCharsForFirstPage 
      : charsPerPage;
    
    // Check if adding this paragraph would exceed the current page's capacity
    if (currentPageCharCount + paragraph.length > maxCharsForCurrentPage) {
      // This paragraph doesn't fit on the current page, move to next page
      currentPageNumber++;
      currentPageCharCount = 0;
      
      // If we've moved past the requested page, we're done
      if (currentPageNumber > pageNumber) {
        break;
      }
      
      // Don't increment paragraphIndex, try this paragraph on the next page
      continue;
    }
    
    // This paragraph fits on the current page
    currentPageCharCount += paragraph.length;
    
    // If we're on the requested page, add this paragraph to the result
    if (currentPageNumber === pageNumber) {
      result.push(paragraph);
      processedAnyForRequestedPage = true;
    }
    
    // Move to the next paragraph
    paragraphIndex++;
  }
  
  return result;
};

export const checkContentOverflow = (contentHeight: number, pageCapacity: number): boolean => {
  return contentHeight > pageCapacity;
};

export const getTotalPageCount = (
  paragraphs: string[],
  config: PaginationConfig,
  hasImage: boolean = false
): number => {
  if (!paragraphs || paragraphs.length === 0) {
    return 1; // At least cover page
  }
  
  // Calculate total chars in the content
  let totalChars = paragraphs.reduce((sum, p) => sum + p.length, 0);
  
  // First page has less capacity due to title space and possibly image
  const firstPageDeduction = config.titleSpace + (hasImage ? config.imageSpace : 0);
  const firstPageCapacity = config.charsPerPage - firstPageDeduction;
  
  // Calculate how many full pages we need
  let totalPages = 1; // Start with one page (first page)
  
  // Account for content on first page
  let remainingChars = totalChars - firstPageCapacity;
  
  // Add additional pages as needed
  if (remainingChars > 0) {
    totalPages += Math.ceil(remainingChars / config.charsPerPage);
  }
  
  return totalPages;
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
