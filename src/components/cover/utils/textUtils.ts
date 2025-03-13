
/**
 * Utility for wrapping text on canvas
 */
export const wrapText = (
  ctx: CanvasRenderingContext2D, 
  text: string, 
  maxWidth: number,
  fontSize: number
): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  
  lines.push(currentLine);
  return lines;
};

/**
 * Calculate font sizes based on canvas dimensions and user preferences
 */
export const calculateFontSizes = (
  canvasHeight: number,
  titleSize?: number,
  authorSize?: number
) => {
  // Define the base height constant for standardization
  const baseHeight = 600; // default height representing 8"
  
  // Calculate title font size based on 5"x8" book cover standards
  const baseTitleSize = Math.floor((canvasHeight / baseHeight) * 38); // 38pt as base size
  
  // Apply the user's size preference as a multiplier
  // titleSize ranges from 18-24, so we map it to 0.9-1.1 multiplier
  const titleSizeMultiplier = titleSize ? 
    (0.9 + ((titleSize - 18) / (24 - 18)) * 0.2) : 1.0;
  
  // Calculate author font size (typically half the title size)
  const baseAuthorSize = Math.floor((canvasHeight / baseHeight) * 21); // 21pt as base size
  
  // Apply user's size preference for author
  // authorSize ranges from 12-16, so we map it to 0.9-1.1 multiplier
  const authorSizeMultiplier = authorSize ? 
    (0.9 + ((authorSize - 12) / (16 - 12)) * 0.2) : 1.0;
  
  return {
    titleSize: Math.floor(baseTitleSize * titleSizeMultiplier),
    authorSize: Math.floor(baseAuthorSize * authorSizeMultiplier)
  };
};
