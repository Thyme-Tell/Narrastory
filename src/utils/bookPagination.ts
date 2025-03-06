
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
  
  if (pageNumber === 1) {
    // First page - account for title and date
    let charCount = 0;
    let paraIndex = 0;
    
    while (paraIndex < paragraphs.length && charCount + paragraphs[paraIndex].length <= charsPerPage - titleSpace) {
      pageContent.push(paragraphs[paraIndex]);
      charCount += paragraphs[paraIndex].length;
      paraIndex++;
    }
  } else {
    // Subsequent pages - calculate how much content should be skipped
    let totalCharsToSkip = charsPerPage - titleSpace; // First page capacity
    totalCharsToSkip += (pageNumber - 2) * charsPerPage; // Plus full pages in between
    
    // Skip content until we reach what should be shown on this page
    let charCount = 0;
    let paraIndex = 0;
    
    // Skip content that would be on previous pages
    while (paraIndex < paragraphs.length && charCount < totalCharsToSkip) {
      if (charCount + paragraphs[paraIndex].length <= totalCharsToSkip) {
        // This paragraph fits entirely on previous pages
        charCount += paragraphs[paraIndex].length;
        paraIndex++;
      } else {
        // This paragraph spans across pages, take the remainder
        const charsToSkipInPara = totalCharsToSkip - charCount;
        // Save the remaining part of this paragraph for this page
        const remainingPart = paragraphs[paraIndex].substring(charsToSkipInPara);
        
        if (remainingPart.length > 0) {
          pageContent.push(remainingPart);
        }
        
        // Move to next paragraph
        charCount = totalCharsToSkip;
        paraIndex++;
        break;
      }
    }
    
    // Now add paragraphs that fit on this page
    let pageCharCount = pageContent.length > 0 ? pageContent[0].length : 0;
    
    // Add more paragraphs until we fill this page
    while (paraIndex < paragraphs.length && pageCharCount + paragraphs[paraIndex].length <= charsPerPage) {
      pageContent.push(paragraphs[paraIndex]);
      pageCharCount += paragraphs[paraIndex].length;
      paraIndex++;
    }
    
    // Check if we need to include a partial paragraph
    if (paraIndex < paragraphs.length && pageCharCount < charsPerPage) {
      const remainingSpace = charsPerPage - pageCharCount;
      const partialPara = paragraphs[paraIndex].substring(0, remainingSpace);
      pageContent.push(partialPara + "...");
    }
  }
  
  return pageContent;
};

export const checkContentOverflow = (
  contentHeight: number, 
  pageCapacity: number
): boolean => {
  return contentHeight > pageCapacity;
};
