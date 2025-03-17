
import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Book, ArrowRight, ArrowLeft } from "lucide-react";
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
        className="p-0 bg-white max-w-[400px] min-w-[320px] max-h-[80vh] flex flex-col overflow-hidden"
        hideCloseButton
      >
        <div className="flex flex-col h-full">
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
            <h1 className="text-2xl font-serif mb-3">{title}</h1>
            <div className="flex justify-center">
              <div className="w-16 border-t border-gray-300"></div>
            </div>
          </div>
          
          {/* Content Area - Scrollable */}
          <div className="px-6 flex-1 overflow-y-auto">
            <div className="font-serif text-base leading-relaxed text-[#1A1A1A] space-y-6">
              {content.split('\n\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </div>
          
          {/* Footer Navigation */}
          <div className="p-6 pt-8 border-t border-gray-200 grid grid-cols-3 gap-3">
            <button 
              onClick={onPreviousPage} 
              disabled={currentPage <= 1}
              className={cn(
                "bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm font-sans transition-colors",
                currentPage <= 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"
              )}
            >
              Back
            </button>
            
            <button 
              className="bg-gray-800 text-white py-2 px-4 rounded-lg text-sm font-sans flex items-center justify-center gap-1"
            >
              Page {currentPage} / {totalPages}
            </button>
            
            <button 
              onClick={onNextPage} 
              disabled={currentPage >= totalPages}
              className={cn(
                "bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm font-sans flex items-center justify-center gap-1 transition-colors",
                currentPage >= totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"
              )}
            >
              Next
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookPreviewDialog;
