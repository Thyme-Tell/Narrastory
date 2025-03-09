
import React, { useEffect, useRef } from "react";
import { Story } from "@/types/supabase";
import { StoryMediaItem } from "@/types/media";
import { CoverData } from "@/components/cover/CoverTypes";
import { 
  BOOK_WIDTH_PX, 
  BOOK_HEIGHT_PX, 
  MARGIN_PX,
  FONT_SIZE_PX,
  LINE_HEIGHT_PX,
  getPageContentExact 
} from "@/utils/paginationUtils";

interface BookPageProps {
  story: Story;
  pageNumber: number;
  isMediaPage?: boolean;
  mediaItem?: StoryMediaItem;
  globalPageNumber: number;
  bookTitle: string;
}

const BookPage: React.FC<BookPageProps> = ({
  story,
  pageNumber,
  isMediaPage = false,
  mediaItem,
  globalPageNumber,
  bookTitle
}) => {
  const pageContentRef = useRef<HTMLDivElement>(null);
  
  // Get page content using our exact pagination
  const pageContent = getPageContentExact(story, pageNumber);
  
  // Effect to ensure proper rendering and measurement
  useEffect(() => {
    if (pageContentRef.current) {
      // Force proper line heights and spacing
      const paragraphs = pageContentRef.current.querySelectorAll('p');
      paragraphs.forEach(p => {
        p.style.lineHeight = `${LINE_HEIGHT_PX}px`;
        p.style.fontSize = `${FONT_SIZE_PX}px`;
        p.style.margin = '0';
        p.style.padding = '0';
        p.style.textIndent = '2em';
      });
    }
  }, [pageContent]);

  // If this is a media page
  if (isMediaPage && mediaItem) {
    return (
      <div className="book-page-exact" style={{
        width: `${BOOK_WIDTH_PX}px`,
        height: `${BOOK_HEIGHT_PX}px`,
        position: 'relative',
        backgroundColor: '#f5f5f0',
        fontFamily: 'Playfair Display, serif',
      }}>
        {/* Header with book title */}
        <div style={{ 
          textAlign: 'center', 
          fontStyle: 'italic',
          paddingTop: '8px',
          fontSize: `${FONT_SIZE_PX * 0.9}px`,
          color: '#2d3748' 
        }}>
          {bookTitle}
        </div>
        
        {/* Media content centered on page */}
        <div style={{ 
          position: 'absolute',
          top: `${MARGIN_PX}px`,
          left: `${MARGIN_PX}px`,
          width: `${BOOK_WIDTH_PX - (MARGIN_PX * 2)}px`,
          height: `${BOOK_HEIGHT_PX - (MARGIN_PX * 2)}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {mediaItem.content_type.startsWith("image/") ? (
            <div style={{ 
              maxWidth: '100%', 
              maxHeight: '75%', 
              textAlign: 'center' 
            }}>
              <img 
                src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/story-media/${mediaItem.file_path}`}
                alt={mediaItem.caption || "Story image"} 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '250px', 
                  objectFit: 'contain',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  borderRadius: '4px'
                }}
              />
              {mediaItem.caption && (
                <p style={{
                  fontSize: `${FONT_SIZE_PX * 0.9}px`,
                  fontStyle: 'italic',
                  textAlign: 'center',
                  marginTop: '12px',
                  paddingLeft: '20px',
                  paddingRight: '20px',
                  textIndent: '0'
                }}>
                  {mediaItem.caption}
                </p>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', maxWidth: '80%' }}>
              <p>Scan QR code to view video content</p>
              {/* Display QR code for video (implementation would go here) */}
            </div>
          )}
        </div>
        
        {/* Footer with page number */}
        <div style={{ 
          position: 'absolute', 
          bottom: '8px', 
          left: '0', 
          right: '0', 
          textAlign: 'center',
          fontSize: `${FONT_SIZE_PX * 0.9}px`,
        }}>
          {globalPageNumber}
        </div>
      </div>
    );
  }

  // Text content page
  return (
    <div className="book-page-exact" style={{
      width: `${BOOK_WIDTH_PX}px`,
      height: `${BOOK_HEIGHT_PX}px`,
      position: 'relative',
      backgroundColor: '#f5f5f0',
      fontFamily: 'Playfair Display, serif',
    }}>
      {/* Header with book title */}
      <div style={{ 
        textAlign: 'center', 
        fontStyle: 'italic',
        paddingTop: '8px',
        fontSize: `${FONT_SIZE_PX * 0.9}px`,
        color: '#2d3748' 
      }}>
        {bookTitle}
      </div>
      
      {/* Story title only on first page */}
      {pageNumber === 1 && (
        <h1 style={{
          fontSize: `${FONT_SIZE_PX * 1.5}px`,
          fontWeight: 'bold',
          textAlign: 'center',
          marginTop: `${MARGIN_PX / 2}px`,
          marginBottom: `${MARGIN_PX / 2}px`,
        }}>
          {story.title || "Untitled Story"}
        </h1>
      )}
      
      {/* Text content with precise margins */}
      <div 
        ref={pageContentRef}
        style={{ 
          position: 'absolute',
          top: pageNumber === 1 ? `${MARGIN_PX + 40}px` : `${MARGIN_PX}px`,
          left: `${MARGIN_PX}px`,
          width: `${BOOK_WIDTH_PX - (MARGIN_PX * 2)}px`,
          height: pageNumber === 1 
            ? `${BOOK_HEIGHT_PX - (MARGIN_PX * 2) - 40}px` 
            : `${BOOK_HEIGHT_PX - (MARGIN_PX * 2)}px`,
          overflow: 'hidden',
          fontFamily: 'Playfair Display, serif',
          fontSize: `${FONT_SIZE_PX}px`,
          lineHeight: `${LINE_HEIGHT_PX}px`,
          textAlign: 'justify',
        }}
      >
        {pageContent.length > 0 ? (
          <>
            {pageContent.map((paragraph, index) => (
              <p 
                key={index} 
                style={{
                  textIndent: '2em',
                  margin: '0',
                  padding: '0',
                  marginBottom: `${LINE_HEIGHT_PX / 2}px`,
                  fontSize: `${FONT_SIZE_PX}px`,
                  lineHeight: `${LINE_HEIGHT_PX}px`,
                }}
              >
                {paragraph}
              </p>
            ))}
          </>
        ) : (
          <p className="text-gray-400 italic">No content on this page</p>
        )}
      </div>
      
      {/* Footer with page number */}
      <div style={{ 
        position: 'absolute', 
        bottom: '8px', 
        left: '0', 
        right: '0', 
        textAlign: 'center',
        fontSize: `${FONT_SIZE_PX * 0.9}px`,
      }}>
        {globalPageNumber}
      </div>
    </div>
  );
}

interface BookPreviewPageContentProps {
  stories: Story[] | undefined;
  currentPage: number;
  currentStoryInfo: any;
  coverData: CoverData;
  authorName: string;
  zoomLevel: number;
  isMobile: boolean;
}

const BookPreviewPageContent: React.FC<BookPreviewPageContentProps> = ({
  stories,
  currentPage,
  currentStoryInfo,
  coverData,
  authorName,
  zoomLevel,
  isMobile
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Force repaint to fix rendering issues
  useEffect(() => {
    if (containerRef.current) {
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.style.opacity = '0.99';
          requestAnimationFrame(() => {
            if (containerRef.current) {
              containerRef.current.style.opacity = '1';
            }
          });
        }
      }, 100);
    }
  }, [currentPage]);

  // Get book title from cover
  const bookTitle = coverData?.titleText || "My Book";

  return (
    <div 
      ref={containerRef}
      className="book-preview-exact-container"
      style={{
        transform: `scale(${zoomLevel})`,
        transformOrigin: 'center',
        transition: 'transform 0.2s ease-out',
      }}
    >
      {currentPage === 0 ? (
        // Book cover
        <div className="book-cover-exact" style={{
          width: `${BOOK_WIDTH_PX}px`,
          height: `${BOOK_HEIGHT_PX}px`,
          backgroundColor: coverData?.backgroundColor || '#f5f5f0',
          position: 'relative',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: coverData?.titleColor || '#000000',
        }}>
          <h1 style={{ 
            fontSize: `${coverData?.titleSize || 24}px`,
            fontWeight: 'bold',
            textAlign: 'center',
            maxWidth: '80%',
            margin: '0 auto'
          }}>
            {bookTitle}
          </h1>
          
          <div style={{ marginTop: 'auto', marginBottom: '24px' }}>
            <p style={{ 
              fontSize: `${FONT_SIZE_PX * 1.2}px`,
              fontStyle: 'italic'
            }}>
              By {authorName || "Anonymous"}
            </p>
          </div>
        </div>
      ) : (
        // Story content
        currentStoryInfo && currentStoryInfo.story && (
          <BookPage 
            story={currentStoryInfo.story}
            pageNumber={currentStoryInfo.pageWithinStory}
            isMediaPage={currentStoryInfo.isMediaPage}
            mediaItem={currentStoryInfo.mediaItem}
            globalPageNumber={currentPage}
            bookTitle={bookTitle}
          />
        )
      )}
    </div>
  );
};

export default BookPreviewPageContent;
