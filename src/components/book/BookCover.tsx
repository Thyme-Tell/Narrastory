
import React from "react";
import { CoverData } from "@/components/cover/CoverTypes";
import CoverCanvas from "@/components/cover/CoverCanvas";
import { useIsMobile } from "@/hooks/use-mobile";

interface BookCoverProps {
  coverData: CoverData;
  authorName: string;
}

const BookCover = ({ coverData, authorName }: BookCoverProps) => {
  const isMobile = useIsMobile();
  
  // Use coverData.authorText if available, otherwise fall back to authorName
  const displayAuthorName = coverData.authorText || authorName;
  
  // Create a copy of coverData with the correct author
  const coverDataWithAuthor = {
    ...coverData,
    authorText: displayAuthorName
  };
  
  return (
    <div className="w-full h-full relative flex items-center justify-center bg-white book-page">
      {/* Left-side gradient */}
      <div className="absolute left-0 top-0 w-[20px] h-full bg-gradient-to-r from-gray-400/40 to-transparent"></div>
      
      <div className="w-full h-full flex items-center justify-center">
        <CoverCanvas 
          coverData={coverDataWithAuthor} 
          width={isMobile ? 300 : 600}
          height={isMobile ? 480 : 960}
          scale={2}
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
};

export default BookCover;
