
export interface PaginationConfig {
  charsPerPage: number;
  titleSpace: number;
  minContentHeight?: number;
}

export const calculatePageContent = (
  paragraphs: string[],
  pageNumber: number,
  config: PaginationConfig
): string[] => {
  const { charsPerPage, titleSpace } = config;
  
  // Filter empty paragraphs to prevent blank pages
  const filteredParagraphs = paragraphs.filter(p => p.trim() !== '');
  
  if (filteredParagraphs.length === 0) {
    console.log("Warning: No content available for page", pageNumber);
    return [];
  }
  
  let pageContent: string[] = [];
  
  if (pageNumber === 1) {
    // First page - account for title and date
    let charCount = 0;
    let paraIndex = 0;
    
    while (paraIndex < filteredParagraphs.length && charCount + filteredParagraphs[paraIndex].length <= charsPerPage - titleSpace) {
      pageContent.push(filteredParagraphs[paraIndex]);
      charCount += filteredParagraphs[paraIndex].length;
      paraIndex++;
    }
    
    console.log(`Page ${pageNumber} content length: ${pageContent.length} paragraphs, ${charCount} chars`);
  } else {
    // Subsequent pages - calculate how much content should be skipped
    let totalCharsToSkip = charsPerPage - titleSpace; // First page capacity
    totalCharsToSkip += (pageNumber - 2) * charsPerPage; // Plus full pages in between
    
    // Skip content until we reach what should be shown on this page
    let charCount = 0;
    let paraIndex = 0;
    
    // Skip content that would be on previous pages
    while (paraIndex < filteredParagraphs.length && charCount < totalCharsToSkip) {
      if (charCount + filteredParagraphs[paraIndex].length <= totalCharsToSkip) {
        // This paragraph fits entirely on previous pages
        charCount += filteredParagraphs[paraIndex].length;
        paraIndex++;
      } else {
        // This paragraph spans across pages, take the remainder
        const charsToSkipInPara = totalCharsToSkip - charCount;
        // Save the remaining part of this paragraph for this page
        const remainingPart = filteredParagraphs[paraIndex].substring(charsToSkipInPara);
        
        // Only add the remaining part if it's not empty
        if (remainingPart.trim().length > 0) {
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
    while (paraIndex < filteredParagraphs.length && pageCharCount + filteredParagraphs[paraIndex].length <= charsPerPage) {
      pageContent.push(filteredParagraphs[paraIndex]);
      pageCharCount += filteredParagraphs[paraIndex].length;
      paraIndex++;
    }
    
    // Don't split paragraphs if they won't fit entirely
    // This avoids text being cut off mid-paragraph
    if (paraIndex < filteredParagraphs.length && pageCharCount < charsPerPage) {
      const remainingSpace = charsPerPage - pageCharCount;
      // Only add a partial paragraph if it's at least 80% complete
      if (remainingSpace >= filteredParagraphs[paraIndex].length * 0.8) {
        const partialPara = filteredParagraphs[paraIndex].substring(0, remainingSpace);
        pageContent.push(partialPara);
      }
    }
    
    console.log(`Page ${pageNumber} content length: ${pageContent.length} paragraphs, ${pageCharCount} chars`);
  }
  
  // Ensure we never return completely empty content
  if (pageContent.length === 0 && pageNumber <= Math.ceil(filteredParagraphs.join('').length / charsPerPage)) {
    console.log(`Warning: Generated empty content for page ${pageNumber}, attempting to fill with next content`);
    
    // Find the first non-processed paragraph and add it
    const totalSkipped = ((pageNumber - 1) * charsPerPage) - (pageNumber === 1 ? titleSpace : 0);
    let charCount = 0;
    let nextParaIndex = 0;
    
    while (nextParaIndex < filteredParagraphs.length && charCount < totalSkipped) {
      charCount += filteredParagraphs[nextParaIndex].length;
      nextParaIndex++;
    }
    
    if (nextParaIndex < filteredParagraphs.length) {
      pageContent.push(filteredParagraphs[nextParaIndex]);
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

// Helper to estimate the height of content in pixels
export const estimateContentHeight = (
  content: string[],
  fontSize: number,
  lineHeight: number,
  containerWidth: number
): number => {
  if (!content || content.length === 0) return 0;
  
  // Average characters per line based on container width and font size
  // This is a rough estimate, could be improved with more accurate calculations
  const avgCharsPerLine = Math.floor(containerWidth / (fontSize * 0.6));
  
  let totalLines = 0;
  
  content.forEach(paragraph => {
    if (!paragraph || paragraph.trim() === '') return;
    
    // Calculate lines for this paragraph (including the minimum of 1 line)
    const paragraphLines = Math.max(1, Math.ceil(paragraph.length / avgCharsPerLine));
    totalLines += paragraphLines;
    
    // Add spacing between paragraphs (equivalent to margin-bottom)
    totalLines += 1;
  });
  
  // Calculate total height
  return totalLines * fontSize * lineHeight;
};
