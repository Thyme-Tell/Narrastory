
export interface PaginationConfig {
  charsPerPage: number;
  titleSpace: number;
}

export const calculatePageContent = (
  paragraphs: string[],
  pageNumber: number,
  config: PaginationConfig
): string[] => {
  const { charsPerPage, titleSpace } = config;
  
  if (!paragraphs || paragraphs.length === 0) {
    return [];
  }
  
  // For first page, account for title space
  const effectiveCharsForFirstPage = charsPerPage - titleSpace;
  
  // Initialize tracking variables
  let currentPageNumber = 1;
  let currentPageCharCount = 0;
  let result: string[] = [];
  let paragraphIndex = 0;
  
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
    }
    
    // Move to the next paragraph
    paragraphIndex++;
  }
  
  return result;
};

export const checkContentOverflow = (contentHeight: number, pageCapacity: number): boolean => {
  return contentHeight > pageCapacity;
};

export const isLastPageOfStory = (
  paragraphs: string[],
  pageNumber: number, 
  config: PaginationConfig
): boolean => {
  // Count how many pages this story would take
  const { charsPerPage, titleSpace } = config;
  let totalPages = 1; // Start with 1 page
  let currentPageChars = 0;
  const firstPageCapacity = charsPerPage - titleSpace;
  
  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i];
    const currentPageCapacity = totalPages === 1 ? firstPageCapacity : charsPerPage;
    
    // If paragraph doesn't fit on current page
    if (currentPageChars + paragraph.length > currentPageCapacity) {
      totalPages++;
      currentPageChars = paragraph.length;
    } else {
      currentPageChars += paragraph.length;
    }
  }
  
  return pageNumber >= totalPages;
};
