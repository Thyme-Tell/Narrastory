
import { CoverData } from "../CoverTypes";
import { calculateFontSizes, wrapText } from "../utils/textUtils";

/**
 * Renders the background of the book cover
 */
export const renderBackground = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  backgroundColor?: string,
  backgroundImage?: string
): Promise<void> => {
  return new Promise((resolve) => {
    // Draw background color
    if (backgroundColor) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Draw background image if available
    if (backgroundImage) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = backgroundImage;
      
      img.onload = () => {
        // Center and cover the canvas with the image
        const imgRatio = img.width / img.height;
        const canvasRatio = canvas.width / canvas.height;
        
        let drawWidth, drawHeight, x, y;
        
        if (imgRatio > canvasRatio) {
          drawHeight = canvas.height;
          drawWidth = canvas.height * imgRatio;
          x = (canvas.width - drawWidth) / 2;
          y = 0;
        } else {
          drawWidth = canvas.width;
          drawHeight = canvas.width / imgRatio;
          x = 0;
          y = (canvas.height - drawHeight) / 2;
        }
        
        ctx.drawImage(img, x, y, drawWidth, drawHeight);
        resolve();
      };
      
      img.onerror = () => {
        console.error("Error loading background image");
        resolve();
      };
    } else {
      resolve();
    }
  });
};

/**
 * Renders the title and author text on the book cover
 */
export const renderText = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  coverData: CoverData
) => {
  const { titleSize: finalTitleSize, authorSize: finalAuthorSize } = 
    calculateFontSizes(canvas.height, coverData.titleSize, coverData.authorSize);
  
  // Variables to track title text bounds
  let titleY;
  let titleHeight = 0;
  
  // Draw title if provided
  if (coverData.titleText) {
    // Set up title styling
    ctx.font = `bold ${finalTitleSize}px 'Rosemartin', serif`;
    ctx.fillStyle = coverData.titleColor || '#303441';
    ctx.textAlign = 'center';
    
    // Determine vertical position based on layout
    if (coverData.layout === 'top') {
      titleY = canvas.height * 0.2;
    } else if (coverData.layout === 'bottom') {
      titleY = canvas.height * 0.65;
    } else { // centered
      titleY = canvas.height * 0.45;
    }
    
    // Handle multiline text
    const titleLines = wrapText(ctx, coverData.titleText, canvas.width * 0.8, finalTitleSize);
    
    // Calculate total height of the title text
    titleHeight = titleLines.length * (finalTitleSize * 1.2);
    
    // Draw the title text lines
    titleLines.forEach((line, index) => {
      ctx.fillText(line, canvas.width / 2, titleY + index * (finalTitleSize * 1.2));
    });
  }
  
  // Draw author if provided
  if (coverData.authorText) {
    ctx.font = `${finalAuthorSize}px 'Rosemartin', serif`;
    ctx.fillStyle = coverData.authorColor || '#303441';
    ctx.textAlign = 'center';
    
    // Add spacing between title and author
    // Use a minimum spacing of 1.5x the author font size
    const minSpacing = finalAuthorSize * 1.5;
    
    // Calculate author Y position based on title position and height
    let authorY;
    if (coverData.layout === 'top') {
      authorY = titleY + titleHeight + minSpacing;
    } else if (coverData.layout === 'bottom') {
      authorY = titleY + titleHeight + minSpacing;
    } else { // centered
      authorY = titleY + titleHeight + minSpacing;
    }
    
    // Ensure author is within canvas bounds
    const maxY = canvas.height - (finalAuthorSize * 2);
    if (authorY > maxY) {
      authorY = maxY;
    }
    
    ctx.fillText(coverData.authorText, canvas.width / 2, authorY);
  }
};
