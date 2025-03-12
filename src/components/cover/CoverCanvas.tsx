
import React, { useRef, useEffect } from "react";
import { CoverData } from "./CoverTypes";

interface CoverCanvasProps {
  coverData: CoverData;
  width: number;
  height: number;
  className?: string; // Add className as an optional prop
}

const CoverCanvas = ({ coverData, width, height, className = "" }: CoverCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Base font sizes as percentage of canvas width
  const baseTitleSize = width * 0.08;  // 8% of width
  const baseAuthorSize = width * 0.045; // 4.5% of width

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply background color
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
        const settings = coverData.backgroundSettings || {
          position: 'center',
          scale: 1,
          opacity: 1,
          blur: 0
        };
        
        // Save current state
        ctx.save();
        
        // Apply opacity
        ctx.globalAlpha = settings.opacity;
        
        // Calculate position and dimensions
        let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;
        let dx = 0, dy = 0, dWidth = canvas.width, dHeight = canvas.height;
        
        if (settings.position === 'center') {
          // Center the image
          const aspectRatio = img.width / img.height;
          const canvasAspectRatio = canvas.width / canvas.height;
          
          if (aspectRatio > canvasAspectRatio) {
            // Image is wider than canvas (relative to their heights)
            dHeight = canvas.width / aspectRatio;
            dy = (canvas.height - dHeight) / 2;
          } else {
            // Image is taller than canvas (relative to their widths)
            dWidth = canvas.height * aspectRatio;
            dx = (canvas.width - dWidth) / 2;
          }
          
          // Apply scale
          const scaledWidth = dWidth * settings.scale;
          const scaledHeight = dHeight * settings.scale;
          dx = dx - (scaledWidth - dWidth) / 2;
          dy = dy - (scaledHeight - dHeight) / 2;
          dWidth = scaledWidth;
          dHeight = scaledHeight;
        } else if (settings.position === 'fill') {
          // Fill: cover the entire canvas, maintaining aspect ratio
          const aspectRatio = img.width / img.height;
          const canvasAspectRatio = canvas.width / canvas.height;
          
          if (aspectRatio > canvasAspectRatio) {
            // Image is wider, crop the sides
            sWidth = (img.height * canvasAspectRatio);
            sx = (img.width - sWidth) / 2;
          } else {
            // Image is taller, crop top and bottom
            sHeight = (img.width / canvasAspectRatio);
            sy = (img.height - sHeight) / 2;
          }
          
          // Apply scale by adjusting source rectangle
          const scaleCenterX = sx + sWidth / 2;
          const scaleCenterY = sy + sHeight / 2;
          const scaledSWidth = sWidth / settings.scale;
          const scaledSHeight = sHeight / settings.scale;
          sx = scaleCenterX - scaledSWidth / 2;
          sy = scaleCenterY - scaledSHeight / 2;
          sWidth = scaledSWidth;
          sHeight = scaledSHeight;
        } else if (settings.position === 'fit') {
          // Fit: contain the entire image within the canvas
          const aspectRatio = img.width / img.height;
          const canvasAspectRatio = canvas.width / canvas.height;
          
          if (aspectRatio > canvasAspectRatio) {
            // Image is wider, fit to width
            dWidth = canvas.width;
            dHeight = canvas.width / aspectRatio;
            dy = (canvas.height - dHeight) / 2;
          } else {
            // Image is taller, fit to height
            dHeight = canvas.height;
            dWidth = canvas.height * aspectRatio;
            dx = (canvas.width - dWidth) / 2;
          }
          
          // Apply scale
          const scaledWidth = dWidth * settings.scale;
          const scaledHeight = dHeight * settings.scale;
          dx = dx - (scaledWidth - dWidth) / 2;
          dy = dy - (scaledHeight - dHeight) / 2;
          dWidth = scaledWidth;
          dHeight = scaledHeight;
        } else if (settings.position === 'stretch') {
          // Stretch: stretch the image to fill the canvas
          // No adjustments needed, full canvas dimensions used
          
          // Scale is applied to source dimensions (inverse relationship)
          const scaleCenterX = sx + sWidth / 2;
          const scaleCenterY = sy + sHeight / 2;
          const scaledSWidth = sWidth / settings.scale;
          const scaledSHeight = sHeight / settings.scale;
          sx = scaleCenterX - scaledSWidth / 2;
          sy = scaleCenterY - scaledSHeight / 2;
          sWidth = scaledSWidth;
          sHeight = scaledSHeight;
        }
        
        // Apply blur if needed
        if (settings.blur > 0) {
          ctx.filter = `blur(${settings.blur}px)`;
        }
        
        // Draw the image
        ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
        
        // Reset context state
        ctx.filter = 'none';
        ctx.globalAlpha = 1;
        ctx.restore();
        
        // Apply text after image is loaded
        drawText();
      };
      
      img.onerror = () => {
        console.error("Error loading background image");
        // Draw text even if image fails to load
        drawText();
      };
    } else {
      // If no background image, draw text immediately
      drawText();
    }

    function drawText() {
      // Calculate font sizes based on base size and user's custom size
      // User's custom size acts as a multiplier to the responsive base size
      const titleFontSize = baseTitleSize * (coverData.titleSize ? coverData.titleSize / 21 : 1);
      const authorFontSize = baseAuthorSize * (coverData.authorSize ? coverData.authorSize / 14 : 1);
      
      // Determine text positions based on layout
      const layout = coverData.layout || 'centered';
      let titleY, authorY;
      
      if (layout === 'top') {
        titleY = height * 0.2; // 20% from top
        authorY = height * 0.3; // 30% from top
      } else if (layout === 'bottom') {
        titleY = height * 0.7; // 70% from top
        authorY = height * 0.8; // 80% from top
      } else { // centered
        titleY = height * 0.45; // 45% from top
        authorY = height * 0.55; // 55% from top
      }

      // Draw title text
      if (coverData.titleText) {
        ctx.font = `bold ${titleFontSize}px 'Georgia', serif`;
        ctx.fillStyle = coverData.titleColor || "#000000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // Handle multi-line titles
        const words = coverData.titleText.split(' ');
        let line = '';
        let lines = [];
        const maxWidth = canvas.width * 0.8; // 80% of canvas width
        
        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i] + ' ';
          const metrics = ctx.measureText(testLine);
          
          if (metrics.width > maxWidth && i > 0) {
            lines.push(line);
            line = words[i] + ' ';
          } else {
            line = testLine;
          }
        }
        lines.push(line);
        
        // Adjust starting position for multi-line text
        let startY = titleY - ((lines.length - 1) * titleFontSize * 0.6); 
        
        lines.forEach(line => {
          ctx.fillText(line.trim(), canvas.width / 2, startY);
          startY += titleFontSize * 1.2; // Line height
        });
      }

      // Draw author text
      if (coverData.authorText) {
        ctx.font = `${authorFontSize}px 'Georgia', serif`;
        ctx.fillStyle = coverData.authorColor || "#000000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(coverData.authorText, canvas.width / 2, authorY);
      }
    }
  }, [coverData, width, height, baseTitleSize, baseAuthorSize]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`max-w-full h-auto mx-auto ${className}`.trim()}
    />
  );
};

export default CoverCanvas;
