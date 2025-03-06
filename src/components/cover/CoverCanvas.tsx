
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

    // Set canvas dimensions
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
          // Image is wider than canvas (relative to height)
          drawHeight = canvas.height;
          drawWidth = canvas.height * imgRatio;
          x = (canvas.width - drawWidth) / 2;
          y = 0;
        } else {
          // Image is taller than canvas (relative to width)
          drawWidth = canvas.width;
          drawHeight = canvas.width / imgRatio;
          x = 0;
          y = (canvas.height - drawHeight) / 2;
        }
        
        ctx.drawImage(img, x, y, drawWidth, drawHeight);
        
        // Redraw text on top of the image
        drawTexts();
      };
    } else {
      // If no image, just draw the texts
      drawTexts();
    }
    
    function drawTexts() {
      if (coverData.titleText) {
        const titleSize = (coverData.titleSize || 36) * scale;
        ctx.font = `bold ${titleSize}px 'Rosemartin', serif`;
        ctx.fillStyle = coverData.titleColor || '#333333';
        ctx.textAlign = 'center';
        
        let titleY;
        if (coverData.layout === 'top') {
          titleY = canvas.height * 0.2;
        } else if (coverData.layout === 'bottom') {
          titleY = canvas.height * 0.65;
        } else { // centered
          titleY = canvas.height * 0.45;
        }
        
        // Handle multiline text
        const titleLines = wrapText(ctx, coverData.titleText, canvas.width * 0.8, titleSize);
        titleLines.forEach((line, index) => {
          ctx.fillText(line, canvas.width / 2, titleY + index * (titleSize * 1.2));
        });
      }
      
      if (coverData.authorText) {
        const authorSize = (coverData.authorSize || 24) * scale;
        ctx.font = `${authorSize}px 'Rosemartin', serif`;
        ctx.fillStyle = coverData.authorColor || '#666666';
        ctx.textAlign = 'center';
        
        let authorY;
        if (coverData.layout === 'top') {
          authorY = canvas.height * 0.3 + (coverData.titleText ? ((coverData.titleSize || 36) * scale * 1.5) : 0);
        } else if (coverData.layout === 'bottom') {
          authorY = canvas.height * 0.75 + (coverData.titleText ? ((coverData.titleSize || 36) * scale * 1.5) : 0);
        } else { // centered
          authorY = canvas.height * 0.55 + (coverData.titleText ? ((coverData.titleSize || 36) * scale * 1.5) : 0);
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
    <canvas
      ref={canvasRef}
      className={`shadow-lg rounded-md ${className}`}
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: 'contain',
        aspectRatio: '5/8'
      }}
    />
  );
};

export default CoverCanvas;
