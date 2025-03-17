
import React from "react";
import { Book, X } from "lucide-react";
import { cn } from "@/lib/utils";
import "../../styles/book.css";

interface BookPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  author: string;
  content: string;
  currentPage: number;
  totalPages: number;
  onNextPage: () => void;
  onPreviousPage: () => void;
}

const BookPreviewDialog = ({
  open,
  onClose,
  title,
  author,
  content,
  currentPage,
  totalPages,
  onNextPage,
  onPreviousPage,
}: BookPreviewDialogProps) => {
  if (!open) return null;

  return (
    <div className="book-preview-backdrop">
      <div className="book-preview-container">
        <div className="book-frame">
          {/* Header */}
          <div className="book-header">
            <div>{title}</div>
            <div className="book-icon">
              <Book size={16} />
            </div>
            <div>{author}</div>
          </div>
          
          <div className="book-header-divider"></div>
          
          {/* Title Section */}
          <div className="book-title-section">
            <h1 className="book-title">{title}</h1>
            <div className="book-title-divider"></div>
          </div>
          
          {/* Content Area */}
          <div className="book-content-area">
            <div className="book-text">
              {content.split('\n\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </div>
          
          {/* Footer Navigation */}
          <div className="book-navigation">
            <button 
              onClick={onPreviousPage} 
              disabled={currentPage <= 1}
              className={cn(
                "book-nav-button",
                currentPage <= 1 ? "opacity-50 cursor-not-allowed" : ""
              )}
            >
              Back
            </button>
            
            <div className="book-nav-page">
              Page {currentPage} / {totalPages}
            </div>
            
            <button 
              onClick={onNextPage} 
              disabled={currentPage >= totalPages}
              className={cn(
                "book-nav-button",
                currentPage >= totalPages ? "opacity-50 cursor-not-allowed" : ""
              )}
            >
              Next
            </button>
          </div>
        </div>
        
        {/* Close button below the book */}
        <div className="close-preview" onClick={onClose}>
          Close Preview
        </div>
      </div>
    </div>
  );
};

export default BookPreviewDialog;
