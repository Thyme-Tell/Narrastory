
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
  
  let pageContent: string[] = [];
  let currentCharCount = 0;
  let paragraphsToSkip = 0;
  
  // For first page, account for title space
  const effectiveCharsForFirstPage = charsPerPage - titleSpace;
  
  // Calculate how many paragraphs to skip based on previous pages
  if (pageNumber > 1) {
    let accumulatedChars = 0;
    let firstPageDone = false;
    
    for (let i = 0; i < paragraphs.length; i++) {
      const paraLength = paragraphs[i].length;
      
      if (!firstPageDone) {
        accumulatedChars += paraLength;
        if (accumulatedChars > effectiveCharsForFirstPage) {
          firstPageDone = true;
          accumulatedChars = paraLength - (accumulatedChars - effectiveCharsForFirstPage);
        }
        paragraphsToSkip++;
        continue;
      }
      
      accumulatedChars += paraLength;
      if (accumulatedChars > charsPerPage * (pageNumber - 1)) {
        break;
      }
      paragraphsToSkip++;
    }
  }
  
  // Now collect paragraphs for the current page
  for (let i = paragraphsToSkip; i < paragraphs.length; i++) {
    const paraLength = paragraphs[i].length;
    
    if (currentCharCount + paraLength <= (pageNumber === 1 ? effectiveCharsForFirstPage : charsPerPage)) {
      pageContent.push(paragraphs[i]);
      currentCharCount += paraLength;
    } else {
      break;
    }
  }
  
  return pageContent;
};

export const checkContentOverflow = (contentHeight: number, pageCapacity: number): boolean => {
  return contentHeight > pageCapacity;
};
