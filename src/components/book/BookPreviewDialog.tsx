
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Book } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string;
  currentPage: number;
  totalPages: number;
  onNextPage?: () => void;
  onPreviousPage?: () => void;
}

const BookPreviewDialog = ({
  open,
  onOpenChange,
  title,
  content,
  currentPage = 1,
  totalPages = 1,
  onNextPage,
  onPreviousPage,
}: BookPreviewDialogProps) => {
  // Format the date as MM.DD.YY
  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: '2-digit'
  }).replace(/\//g, '.');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="book-preview-dialog p-0"
        hideCloseButton
      >
        <div className="book-preview-content-container">
          <div className="book-preview-page">
            {/* Header Section */}
            <div className="px-6 pt-6">
              <div className="flex items-center justify-between text-gray-500 mb-3">
                <span className="text-sm font-sans">My Stories</span>
                <Book className="w-5 h-5" />
                <span className="text-sm font-sans">{formattedDate}</span>
              </div>
              <div className="border-b border-gray-200 w-full"></div>
            </div>
            
            {/* Title Section */}
            <div className="px-6 pt-8 pb-6 text-center">
              <h1 className="book-preview-title">{title}</h1>
              <div className="flex justify-center">
                <div className="w-16 border-t border-gray-300"></div>
              </div>
            </div>
            
            {/* Content Area - Scrollable */}
            <div className="px-6 flex-1 overflow-y-auto">
              <div className="book-preview-content">
                {content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </div>
            
            {/* Footer Navigation */}
            <div className="px-6 pb-6 pt-4 book-preview-navigation">
              <button 
                onClick={onPreviousPage} 
                disabled={currentPage <= 1}
                className={cn(
                  "book-preview-button book-preview-button-back",
                  currentPage <= 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"
                )}
              >
                Back
              </button>
              
              <button className="book-preview-button book-preview-button-page">
                Page {currentPage} / {totalPages}
              </button>
              
              <button 
                onClick={onNextPage} 
                disabled={currentPage >= totalPages}
                className={cn(
                  "book-preview-button book-preview-button-next",
                  currentPage >= totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"
                )}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookPreviewDialog;
