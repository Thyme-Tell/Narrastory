
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Story } from "@/types/supabase";
import { StoryMediaItem } from "@/types/media";
import { getPageContent } from "@/utils/bookPagination";
import { format } from "date-fns";

// Book format specifications
const PAGE_WIDTH_INCHES = 5;
const PAGE_HEIGHT_INCHES = 8;
const MARGIN_INCHES = 0.5;
const CONTENT_WIDTH_INCHES = PAGE_WIDTH_INCHES - (MARGIN_INCHES * 2);
const CONTENT_HEIGHT_INCHES = PAGE_HEIGHT_INCHES - (MARGIN_INCHES * 2);

// PDF conversions
const POINTS_PER_INCH = 72;
const PAGE_WIDTH_POINTS = PAGE_WIDTH_INCHES * POINTS_PER_INCH;
const PAGE_HEIGHT_POINTS = PAGE_HEIGHT_INCHES * POINTS_PER_INCH;
const MARGIN_POINTS = MARGIN_INCHES * POINTS_PER_INCH;

// Font sizes and spacing
const TITLE_FONT_SIZE = 16;
const BODY_FONT_SIZE = 12;
const HEADER_FONT_SIZE = 10;
const FOOTER_FONT_SIZE = 10;
const LINE_HEIGHT_FACTOR = 1.2;

/**
 * Generates a PDF book from an array of stories with correct book dimensions
 */
export const generateBookPDF = async (
  stories: Story[],
  coverData: any,
  authorName: string,
  storyMediaMap: Map<string, StoryMediaItem[]>
): Promise<string> => {
  // Initialize PDF with correct dimensions
  const pdf = new jsPDF({
    unit: "pt",
    format: [PAGE_WIDTH_POINTS, PAGE_HEIGHT_POINTS],
    orientation: "portrait",
  });

  // Add cover page
  await addCoverPage(pdf, coverData, authorName);

  // Add content pages
  let pageNumber = 1;
  const bookTitle = coverData?.titleText || "My Book";

  // Process each story
  for (let i = 0; i < stories.length; i++) {
    const story = stories[i];
    
    // Add story title page
    pdf.addPage();
    addStoryTitlePage(pdf, story, pageNumber);
    pageNumber++;

    // Add content pages
    const paragraphs = story.content.split('\n').filter(p => p.trim() !== '');
    if (paragraphs.length > 0) {
      const storyPages = processStoryContent(pdf, paragraphs, bookTitle, pageNumber);
      pageNumber += storyPages;
    }

    // Add media pages if any
    const mediaItems = storyMediaMap.get(story.id) || [];
    if (mediaItems.length > 0) {
      for (const media of mediaItems) {
        pdf.addPage();
        await addMediaPage(pdf, media, bookTitle, pageNumber);
        pageNumber++;
      }
    }
  }

  // Return the PDF as base64 data URL
  return pdf.output('datauristring');
};

/**
 * Adds the book cover to the PDF
 */
const addCoverPage = async (pdf: jsPDF, coverData: any, authorName: string): Promise<void> => {
  try {
    // Set cover background color
    pdf.setFillColor(coverData.backgroundColor || "#CADCDA");
    pdf.rect(0, 0, PAGE_WIDTH_POINTS, PAGE_HEIGHT_POINTS, "F");
    
    // Add title
    if (coverData.titleText) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(coverData.titleSize * 1.2 || TITLE_FONT_SIZE * 1.5);
      pdf.setTextColor(coverData.titleColor || "#303441");
      
      const titleLines = pdf.splitTextToSize(
        coverData.titleText, 
        PAGE_WIDTH_POINTS - (MARGIN_POINTS * 2)
      );
      
      // Position based on layout
      let yPos = PAGE_HEIGHT_POINTS / 2.5;
      if (coverData.layout === 'top') {
        yPos = PAGE_HEIGHT_POINTS / 4;
      } else if (coverData.layout === 'bottom') {
        yPos = PAGE_HEIGHT_POINTS * 0.6;
      }
      
      pdf.text(titleLines, PAGE_WIDTH_POINTS / 2, yPos, { align: "center" });
    }
    
    // Add author name at bottom
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(coverData.authorSize || BODY_FONT_SIZE);
    pdf.setTextColor(coverData.authorColor || "#303441");
    pdf.text(
      `By ${authorName}`, 
      PAGE_WIDTH_POINTS / 2, 
      PAGE_HEIGHT_POINTS - MARGIN_POINTS * 2, 
      { align: "center" }
    );
  } catch (error) {
    console.error("Error creating cover page:", error);
    // Add fallback cover if there's an error
    pdf.setFillColor("#CADCDA");
    pdf.rect(0, 0, PAGE_WIDTH_POINTS, PAGE_HEIGHT_POINTS, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(TITLE_FONT_SIZE);
    pdf.text("My Book", PAGE_WIDTH_POINTS / 2, PAGE_HEIGHT_POINTS / 2, { align: "center" });
  }
};

/**
 * Adds a story title page to the PDF
 */
const addStoryTitlePage = (pdf: jsPDF, story: Story, pageNumber: number): void => {
  // Set page background
  pdf.setFillColor("#f5f5f0");
  pdf.rect(0, 0, PAGE_WIDTH_POINTS, PAGE_HEIGHT_POINTS, "F");
  
  // Add story title
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(TITLE_FONT_SIZE);
  pdf.setTextColor("#000000");
  
  const title = story.title || "Untitled Story";
  const titleLines = pdf.splitTextToSize(title, CONTENT_WIDTH_INCHES * POINTS_PER_INCH);
  
  pdf.text(
    titleLines, 
    PAGE_WIDTH_POINTS / 2, 
    PAGE_HEIGHT_POINTS / 2, 
    { align: "center" }
  );
  
  // Add date
  const storyDate = format(new Date(story.created_at), "MMMM d, yyyy");
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(BODY_FONT_SIZE);
  pdf.text(
    storyDate, 
    PAGE_WIDTH_POINTS / 2, 
    (PAGE_HEIGHT_POINTS / 2) + 40, 
    { align: "center" }
  );
  
  // Add page number at bottom
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(FOOTER_FONT_SIZE);
  pdf.text(
    pageNumber.toString(), 
    PAGE_WIDTH_POINTS / 2, 
    PAGE_HEIGHT_POINTS - MARGIN_POINTS / 2, 
    { align: "center" }
  );
};

/**
 * Processes story content and adds it to the PDF with proper pagination
 * Returns the number of content pages added
 */
const processStoryContent = (
  pdf: jsPDF, 
  paragraphs: string[], 
  bookTitle: string, 
  startPageNumber: number
): number => {
  let currentPage = 0;
  let yPosition = MARGIN_POINTS;
  
  // Set text properties for content
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(BODY_FONT_SIZE);
  pdf.setTextColor("#000000");
  
  // Calculate the line height
  const lineHeight = BODY_FONT_SIZE * LINE_HEIGHT_FACTOR;
  
  // Add a new page to start
  pdf.addPage();
  currentPage++;
  
  // Set page background
  pdf.setFillColor("#f5f5f0");
  pdf.rect(0, 0, PAGE_WIDTH_POINTS, PAGE_HEIGHT_POINTS, "F");
  
  // Add header (except on first content page)
  yPosition = addHeader(pdf, bookTitle);
  
  // Process each paragraph
  for (const paragraph of paragraphs) {
    // Wrap text to fit within margins
    const contentWidth = CONTENT_WIDTH_INCHES * POINTS_PER_INCH;
    const wrappedText = pdf.splitTextToSize(paragraph, contentWidth);
    
    // Calculate if this paragraph will fit on current page
    const paragraphHeight = wrappedText.length * lineHeight;
    const spaceRemaining = PAGE_HEIGHT_POINTS - MARGIN_POINTS - yPosition;
    
    // If it doesn't fit, add a new page
    if (paragraphHeight > spaceRemaining) {
      pdf.addPage();
      currentPage++;
      
      // Set page background
      pdf.setFillColor("#f5f5f0");
      pdf.rect(0, 0, PAGE_WIDTH_POINTS, PAGE_HEIGHT_POINTS, "F");
      
      // Add header and reset y position
      yPosition = addHeader(pdf, bookTitle);
    }
    
    // Add paragraph with first line indentation
    const indent = 20; // 20 points indent
    pdf.text(wrappedText[0], MARGIN_POINTS + indent, yPosition);
    yPosition += lineHeight;
    
    // Add remaining lines without indentation if any
    if (wrappedText.length > 1) {
      for (let i = 1; i < wrappedText.length; i++) {
        pdf.text(wrappedText[i], MARGIN_POINTS, yPosition);
        yPosition += lineHeight;
      }
    }
    
    // Add spacing after paragraph
    yPosition += lineHeight / 2;
    
    // Add page number at bottom
    addFooter(pdf, startPageNumber + currentPage - 1);
  }
  
  return currentPage;
};

/**
 * Adds a media page to the PDF
 */
const addMediaPage = async (
  pdf: jsPDF, 
  media: StoryMediaItem, 
  bookTitle: string, 
  pageNumber: number
): Promise<void> => {
  // Set page background
  pdf.setFillColor("#FFFFFF");
  pdf.rect(0, 0, PAGE_WIDTH_POINTS, PAGE_HEIGHT_POINTS, "F");
  
  // Add header
  const yPosition = addHeader(pdf, bookTitle);
  
  try {
    // Handle image media
    if (media.content_type.startsWith("image/")) {
      // Fetch image
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/story-media/${media.file_path}`
      );
      const blob = await response.blob();
      
      // Convert blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      
      const base64data = await base64Promise;
      
      // Calculate image dimensions to fit within content area
      const img = new Image();
      img.src = base64data;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      
      const aspectRatio = img.width / img.height;
      const maxWidth = CONTENT_WIDTH_INCHES * POINTS_PER_INCH;
      const maxHeight = (PAGE_HEIGHT_POINTS - MARGIN_POINTS * 3 - yPosition);
      
      let width = maxWidth;
      let height = width / aspectRatio;
      
      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }
      
      // Center the image horizontally
      const xPosition = MARGIN_POINTS + (maxWidth - width) / 2;
      
      // Add image to PDF
      pdf.addImage(
        base64data, 
        media.content_type.split('/')[1].toUpperCase(), 
        xPosition, 
        yPosition + 20, 
        width, 
        height
      );
      
      // Add caption if available
      if (media.caption) {
        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(BODY_FONT_SIZE - 2);
        
        const captionY = yPosition + 40 + height;
        const captionLines = pdf.splitTextToSize(
          media.caption, 
          CONTENT_WIDTH_INCHES * POINTS_PER_INCH
        );
        
        pdf.text(
          captionLines, 
          PAGE_WIDTH_POINTS / 2, 
          captionY, 
          { align: "center" }
        );
      }
    } else {
      // For non-image media, just show a placeholder
      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(BODY_FONT_SIZE);
      pdf.text(
        `[Media: ${media.content_type}]`, 
        PAGE_WIDTH_POINTS / 2, 
        PAGE_HEIGHT_POINTS / 2, 
        { align: "center" }
      );
      
      if (media.caption) {
        pdf.text(
          media.caption, 
          PAGE_WIDTH_POINTS / 2, 
          PAGE_HEIGHT_POINTS / 2 + 40, 
          { align: "center" }
        );
      }
    }
  } catch (error) {
    console.error("Error adding media to PDF:", error);
    
    // Add error placeholder
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(BODY_FONT_SIZE);
    pdf.text(
      `[Could not load media]`, 
      PAGE_WIDTH_POINTS / 2, 
      PAGE_HEIGHT_POINTS / 2, 
      { align: "center" }
    );
  }
  
  // Add page number at bottom
  addFooter(pdf, pageNumber);
};

/**
 * Adds a header to a page and returns the Y position after the header
 */
const addHeader = (pdf: jsPDF, bookTitle: string): number => {
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(HEADER_FONT_SIZE);
  pdf.setTextColor("#303441");
  
  // Position header 0.5 inches from the top
  const headerPosition = MARGIN_POINTS / 2;
  pdf.text(bookTitle, PAGE_WIDTH_POINTS / 2, headerPosition, { align: "center" });
  
  // Return the Y position for content (after header + margin)
  return MARGIN_POINTS;
};

/**
 * Adds a footer with page number
 */
const addFooter = (pdf: jsPDF, pageNumber: number): void => {
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(FOOTER_FONT_SIZE);
  pdf.setTextColor("#000000");
  
  // Position footer 0.5 inches from the bottom
  const footerPosition = PAGE_HEIGHT_POINTS - MARGIN_POINTS / 2;
  pdf.text(
    pageNumber.toString(), 
    PAGE_WIDTH_POINTS / 2, 
    footerPosition, 
    { align: "center" }
  );
};
