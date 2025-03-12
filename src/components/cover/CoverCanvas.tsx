
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
        // Apply background settings if available
        const settings = coverData.backgroundSettings || {
          position: 'center',
          scale: 1,
          opacity: 1,
          blur: 0
        };
        
        // Create a temporary canvas for applying filters if needed
        let sourceCanvas = document.createElement('canvas');
        let sourceCtx = sourceCanvas.getContext('2d');
        sourceCanvas.width = img.width;
        sourceCanvas.height = img.height;
        
        if (!sourceCtx) {
          // Fallback if we can't get context
          drawImageWithSettings(ctx, img, settings);
          drawTexts();
          return;
        }
        
        // Draw the image to the source canvas first
        sourceCtx.drawImage(img, 0, 0);
        
        // Apply blur if specified
        if (settings.blur && settings.blur > 0) {
          sourceCtx.filter = `blur(${settings.blur * 10}px)`;
          sourceCtx.drawImage(sourceCanvas, 0, 0);
          sourceCtx.filter = 'none';
        }
        
        // Now draw the processed image to the main canvas
        drawImageWithSettings(ctx, sourceCanvas, settings);
        drawTexts();
      };
      
      img.onerror = () => {
        console.error("Failed to load background image");
        drawTexts();
      };
    } else {
      drawTexts();
    }
    
    function drawImageWithSettings(
      ctx: CanvasRenderingContext2D, 
      image: HTMLImageElement | HTMLCanvasElement, 
      settings: NonNullable<CoverData['backgroundSettings']>
    ) {
      // Save the current state
      ctx.save();
      
      // Set global alpha for opacity
      if (settings.opacity !== undefined) {
        ctx.globalAlpha = settings.opacity;
      }
      
      // Calculate dimensions based on position setting
      const imgRatio = image.width / image.height;
      const canvasRatio = canvas.width / canvas.height;
      
      let drawWidth, drawHeight, x, y;
      
      switch (settings.position) {
        case 'fill':
          // Cover the entire canvas (may crop the image)
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
          break;
          
        case 'fit':
          // Fit entire image within canvas (may have whitespace)
          if (imgRatio > canvasRatio) {
            drawWidth = canvas.width;
            drawHeight = canvas.width / imgRatio;
            x = 0;
            y = (canvas.height - drawHeight) / 2;
          } else {
            drawHeight = canvas.height;
            drawWidth = canvas.height * imgRatio;
            x = (canvas.width - drawWidth) / 2;
            y = 0;
          }
          break;
          
        case 'stretch':
          // Stretch to fill canvas (may distort image)
          drawWidth = canvas.width;
          drawHeight = canvas.height;
          x = 0;
          y = 0;
          break;
          
        case 'center':
        default:
          // Center the image at its natural size
          const scaledWidth = image.width * settings.scale;
          const scaledHeight = image.height * settings.scale;
          x = (canvas.width - scaledWidth) / 2;
          y = (canvas.height - scaledHeight) / 2;
          drawWidth = scaledWidth;
          drawHeight = scaledHeight;
          break;
      }
      
      // Draw the image with the calculated dimensions
      ctx.drawImage(image, x, y, drawWidth, drawHeight);
      
      // Restore the original state
      ctx.restore();
    }
    
    function drawTexts() {
      if (coverData.titleText) {
        // Calculate base font size as a percentage of canvas width
        const baseTitleSize = Math.floor(canvas.width * 0.08); // 8% of canvas width
        
        // Apply the user's size preference as a multiplier (default is 1.0)
        // titleSize ranges from 18-24, so we map it to 0.85-1.15 multiplier
        const titleSizeMultiplier = coverData.titleSize ? 
          (0.85 + ((coverData.titleSize - 18) / (24 - 18)) * 0.3) : 1.0;
        
        // Calculate final title size with user preferences applied
        const finalTitleSize = Math.floor(baseTitleSize * titleSizeMultiplier * scale);

        // Draw title
        ctx.font = `bold ${finalTitleSize}px 'Rosemartin', serif`;
        ctx.fillStyle = coverData.titleColor || '#303441';
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
        const titleLines = wrapText(ctx, coverData.titleText, canvas.width * 0.8, finalTitleSize);
        titleLines.forEach((line, index) => {
          ctx.fillText(line, canvas.width / 2, titleY + index * (finalTitleSize * 1.2));
        });
      }
      
      if (coverData.authorText) {
        // Calculate base author font size
        const baseAuthorSize = Math.floor(canvas.width * 0.045); // 4.5% of canvas width
        
        // Apply user's size preference (default is 1.0)
        // authorSize ranges from 12-16, so we map it to 0.9-1.1 multiplier
        const authorSizeMultiplier = coverData.authorSize ? 
          (0.9 + ((coverData.authorSize - 12) / (16 - 12)) * 0.2) : 1.0;
        
        // Calculate final author size with user preferences applied
        const finalAuthorSize = Math.floor(baseAuthorSize * authorSizeMultiplier * scale);
        
        ctx.font = `${finalAuthorSize}px 'Rosemartin', serif`;
        ctx.fillStyle = coverData.authorColor || '#303441';
        ctx.textAlign = 'center';
        
        // Get title size for spacing calculation
        const baseTitleSize = Math.floor(canvas.width * 0.08);
        const titleSizeMultiplier = coverData.titleSize ? 
          (0.85 + ((coverData.titleSize - 18) / (24 - 18)) * 0.3) : 1.0;
        const finalTitleSize = Math.floor(baseTitleSize * titleSizeMultiplier * scale);
        
        let authorY;
        if (coverData.layout === 'top') {
          authorY = canvas.height * 0.3 + ((coverData.titleText ? (finalTitleSize * 1.5) : 0));
        } else if (coverData.layout === 'bottom') {
          authorY = canvas.height * 0.75 + ((coverData.titleText ? (finalTitleSize * 1.5) : 0));
        } else { // centered
          authorY = canvas.height * 0.55 + ((coverData.titleText ? (finalTitleSize * 1.5) : 0));
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
