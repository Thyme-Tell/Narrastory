
import { useRef, useEffect } from "react";
import { CoverData } from "./CoverTypes";

interface CoverCanvasProps {
  coverData: CoverData;
  width?: number;
  height?: number;
  scale?: number;
  className?: string;
}

const CoverCanvas = ({ 
  coverData,
  width = 400,
  height = 600,
  scale = 1,
  className = ""
}: CoverCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions with high resolution scaling
    canvas.width = width * scale;
    canvas.height = height * scale;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background color
    if (coverData.backgroundColor) {
      ctx.fillStyle = coverData.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Draw background image if available
    if (coverData.backgroundImage) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = coverData.backgroundImage;
      
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
        drawTexts();
      };
    } else {
      drawTexts();
    }
    
    function drawTexts() {
      // Define the base height constant once at the top so it can be reused
      const baseHeight = 600; // default height representing 8"
      
      if (coverData.titleText) {
        // Calculate title font size based on 5"x8" book cover standards
        // For a 5"x8" book, title is typically 36-42pt
        // Scale this based on the canvas height (8" = 600px in our default scale)
        const baseTitleSize = Math.floor((canvas.height / baseHeight) * 38); // 38pt as base size
        
        // Apply the user's size preference as a multiplier
        // titleSize ranges from 18-24, so we map it to 0.9-1.1 multiplier
        const titleSizeMultiplier = coverData.titleSize ? 
          (0.9 + ((coverData.titleSize - 18) / (24 - 18)) * 0.2) : 1.0;
        
        // Calculate final title size with user preferences applied
        const finalTitleSize = Math.floor(baseTitleSize * titleSizeMultiplier);

        // Draw title
        ctx.font = `bold ${finalTitleSize}px 'Rosemartin', serif`;
        ctx.fillStyle = coverData.titleColor || '#303441';
        ctx.textAlign = 'center';
        
        // Determine vertical position based on layout
        let titleY;
        if (coverData.layout === 'top') {
          titleY = canvas.height * 0.2;
        } else if (coverData.layout === 'bottom') {
          titleY = canvas.height * 0.65;
        } else { // centered
          titleY = canvas.height * 0.45;
        }
        
        // Handle multiline text
        const titleLines = wrapText(ctx, coverData.titleText, canvas.width * 0.8, finalTitleSize);
        const titleHeight = titleLines.length * (finalTitleSize * 1.2);
        
        titleLines.forEach((line, index) => {
          ctx.fillText(line, canvas.width / 2, titleY + index * (finalTitleSize * 1.2));
        });
      }
      
      if (coverData.authorText) {
        // Calculate author font size based on 5"x8" book cover standards
        // For a 5"x8" book, author name is typically 18-24pt (around half the title size)
        const baseAuthorSize = Math.floor((canvas.height / baseHeight) * 21); // 21pt as base size
        
        // Apply user's size preference (default is 1.0)
        // authorSize ranges from 12-16, so we map it to 0.9-1.1 multiplier
        const authorSizeMultiplier = coverData.authorSize ? 
          (0.9 + ((coverData.authorSize - 12) / (16 - 12)) * 0.2) : 1.0;
        
        // Calculate final author size with user preferences applied
        const finalAuthorSize = Math.floor(baseAuthorSize * authorSizeMultiplier);
        
        ctx.font = `${finalAuthorSize}px 'Rosemartin', serif`;
        ctx.fillStyle = coverData.authorColor || '#303441';
        ctx.textAlign = 'center';
        
        // Calculate title sizes for proper spacing
        const baseTitleSize = Math.floor((canvas.height / baseHeight) * 38);
        const titleSizeMultiplier = coverData.titleSize ? 
          (0.9 + ((coverData.titleSize - 18) / (24 - 18)) * 0.2) : 1.0;
        const finalTitleSize = Math.floor(baseTitleSize * titleSizeMultiplier);
        
        // Get number of title lines for calculating spacing
        let titleLines = 0;
        if (coverData.titleText) {
          titleLines = wrapText(ctx, coverData.titleText, canvas.width * 0.8, finalTitleSize).length;
        }
        
        // Add extra spacing between title and author
        const titleAuthorSpacing = finalTitleSize * 1.2; // One full line height of spacing
        
        let authorY;
        if (coverData.layout === 'top') {
          authorY = canvas.height * 0.2 + (titleLines * (finalTitleSize * 1.2)) + titleAuthorSpacing;
        } else if (coverData.layout === 'bottom') {
          authorY = canvas.height * 0.65 + (titleLines * (finalTitleSize * 1.2)) + titleAuthorSpacing;
        } else { // centered
          authorY = canvas.height * 0.45 + (titleLines * (finalTitleSize * 1.2)) + titleAuthorSpacing;
        }
        
        ctx.fillText(coverData.authorText, canvas.width / 2, authorY);
      }
    }
    
  }, [coverData, width, height, scale]);

  // Utility function to wrap text for canvas
  const wrapText = (
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

  return (
    <div className="book-cover-container">
      <canvas
        ref={canvasRef}
        className={`shadow-lg rounded-md book-canvas ${className}`}
        style={{ 
          width: `${width}px`, 
          height: `${height}px`,
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          aspectRatio: '5/8'
        }}
      />
      <div className="book-spine-overlay"></div>
      <div className="book-cover-overlay"></div>
    </div>
  );
};

export default CoverCanvas;
