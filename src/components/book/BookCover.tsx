
import React from "react";
import { CoverData } from "@/components/cover/CoverTypes";
import CoverCanvas from "@/components/cover/CoverCanvas";

interface BookCoverProps {
  coverData: CoverData;
  authorName: string;
}

const BookCover = ({ coverData, authorName }: BookCoverProps) => {
  // Make sure authorName is included in the coverData
  const coverWithAuthor = {
    ...coverData,
    authorText: coverData.authorText || `By ${authorName}`
  };

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      {/* Left side subtle shadow */}
      <div className="absolute top-0 left-0 w-6 h-full bg-gradient-to-r from-black/25 to-transparent z-10"></div>
      <CoverCanvas 
        coverData={coverWithAuthor} 
        width={600}
        height={800}
      />
    </div>
  );
};

export default BookCover;
