
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Story } from "@/types/supabase";
import { CoverData } from "@/components/cover/CoverTypes";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const generateBookPDF = async (
  stories: Story[],
  coverData: CoverData,
  authorName: string,
  storyPages: number[],
  containerRef: React.RefObject<HTMLDivElement>
): Promise<void> => {
  if (!stories || stories.length === 0 || !containerRef.current) {
    toast.error("No content available to generate PDF");
    return;
  }

  try {
    toast.info("Generating PDF...", { duration: 3000 });
    
    // Initialize PDF with A5 size (5.83 x 8.27 inches)
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "in",
      format: [5.83, 8.27] // A5 size
    });

    // Get the book container element to capture
    const bookContainer = containerRef.current;
    if (!bookContainer) return;

    // Generate the cover page
    const coverCanvas = await html2canvas(bookContainer, {
      scale: 2, // Higher quality
      useCORS: true, // Allow cross-origin images
      allowTaint: true,
      logging: false
    });
    
    // Add cover to PDF (first page)
    const coverImgData = coverCanvas.toDataURL("image/jpeg", 0.95);
    pdf.addImage(
      coverImgData, 
      "JPEG", 
      0, 0, 
      5.83, 8.27, 
      undefined, 
      'FAST'
    );

    // Process each story
    for (let i = 0; i < stories.length; i++) {
      const story = stories[i];
      const storyStartPage = storyPages[i];
      
      // Check if the story has media
      let hasMedia = false;
      
      try {
        // Query for media related to this story
        const { data: mediaItems } = await supabase
          .from('story_media')
          .select('id')
          .eq('story_id', story.id)
          .limit(1);
          
        hasMedia = !!mediaItems && mediaItems.length > 0;
      } catch (error) {
        console.error("Error checking for story media:", error);
        hasMedia = false;
      }
      
      // For each story page
      let pageIndex = 0;
      let hasMorePages = true;
      
      while (hasMorePages) {
        // Add a new page to the PDF
        pdf.addPage();
        
        // Simulate changing to this page in the DOM
        if (containerRef.current) {
          // Clear existing content
          containerRef.current.innerHTML = "";
          
          // Create a temporary page view for this page
          const tempPageView = document.createElement("div");
          tempPageView.className = "w-full h-full book-page flex flex-col p-8 bg-white";
          
          // Create content container
          const contentContainer = document.createElement("div");
          contentContainer.className = "w-full mx-auto book-content flex-1";
          
          // Add header on first page of story
          if (pageIndex === 0) {
            const header = document.createElement("div");
            header.className = "mb-6";
            
            const titleContainer = document.createElement("div");
            titleContainer.className = "flex justify-between items-baseline";
            
            const title = document.createElement("h2");
            title.className = "text-2xl font-semibold";
            title.textContent = story.title || "Untitled Story";
            
            const date = document.createElement("span");
            date.className = "text-sm text-gray-500";
            date.textContent = new Date(story.created_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric"
            });
            
            titleContainer.appendChild(title);
            titleContainer.appendChild(date);
            header.appendChild(titleContainer);
            
            const pageIndicator = document.createElement("div");
            pageIndicator.className = "text-right text-sm text-gray-400";
            pageIndicator.textContent = `Page ${pageIndex + 1}`;
            header.appendChild(pageIndicator);
            
            contentContainer.appendChild(header);
          }
          
          // Calculate content for this page
          const paragraphs = story.content.split('\n').filter(p => p.trim() !== '');
          const CHARS_PER_PAGE = 1800;
          const TITLE_SPACE = 150;
          
          let startChar = 0;
          if (pageIndex > 0) {
            // Skip content from previous pages
            startChar = CHARS_PER_PAGE - TITLE_SPACE + (pageIndex - 1) * CHARS_PER_PAGE;
          }
          
          let contentText = "";
          let charCount = 0;
          let paraIndex = 0;
          
          // Find starting paragraph
          while (paraIndex < paragraphs.length) {
            if (charCount + paragraphs[paraIndex].length > startChar) {
              // This paragraph contains our starting point
              const charOffset = startChar - charCount;
              if (charOffset > 0 && charOffset < paragraphs[paraIndex].length) {
                contentText = paragraphs[paraIndex].substring(charOffset);
                paraIndex++;
              } else {
                contentText = paragraphs[paraIndex];
                paraIndex++;
              }
              break;
            }
            charCount += paragraphs[paraIndex].length;
            paraIndex++;
          }
          
          // Add remaining paragraphs until we fill the page
          let currentLength = contentText.length;
          const pageLimit = (pageIndex === 0) ? CHARS_PER_PAGE - TITLE_SPACE : CHARS_PER_PAGE;
          
          while (paraIndex < paragraphs.length && currentLength + paragraphs[paraIndex].length <= pageLimit) {
            contentText += "\n\n" + paragraphs[paraIndex];
            currentLength += paragraphs[paraIndex].length + 2; // +2 for the newlines
            paraIndex++;
          }
          
          // Check if we have more pages
          hasMorePages = paraIndex < paragraphs.length;
          
          // Add content
          const contentElement = document.createElement("div");
          contentElement.className = "prose max-w-none book-text";
          contentElement.style.fontSize = "18.5px";
          
          // Split content into paragraphs and add them
          const contentParagraphs = contentText.split("\n\n");
          contentParagraphs.forEach(para => {
            if (para.trim()) {
              const p = document.createElement("p");
              p.className = "mb-4";
              p.textContent = para;
              contentElement.appendChild(p);
            }
          });
          
          // Add "continued" text if needed
          if (hasMorePages) {
            const continued = document.createElement("div");
            continued.className = "text-right text-sm text-gray-400 mt-4";
            continued.textContent = "Continued on next page...";
            contentElement.appendChild(continued);
          }
          
          contentContainer.appendChild(contentElement);
          
          // Add media on first page only
          if (pageIndex === 0 && hasMedia) {
            const mediaPlaceholder = document.createElement("div");
            mediaPlaceholder.className = "mt-6 border rounded-md p-2 text-center";
            mediaPlaceholder.textContent = "Media content will appear here in the PDF";
            contentContainer.appendChild(mediaPlaceholder);
          }
          
          tempPageView.appendChild(contentContainer);
          containerRef.current.appendChild(tempPageView);
          
          // Capture the page content
          const canvas = await html2canvas(containerRef.current, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false
          });
          
          // Add the page to PDF
          const imgData = canvas.toDataURL("image/jpeg", 0.95);
          pdf.addImage(
            imgData, 
            "JPEG", 
            0, 0, 
            5.83, 8.27, 
            undefined, 
            'FAST'
          );
        }
        
        pageIndex++;
      }
    }

    // Download the PDF
    pdf.save(`${authorName.replace(/\s+/g, "_")}_Book.pdf`);
    
    toast.success("PDF generated successfully!");
  } catch (error) {
    console.error("Error generating PDF:", error);
    toast.error("Failed to generate PDF. Please try again.");
  }
};
