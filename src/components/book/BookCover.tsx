
import React from "react";
import { CoverData } from "@/components/cover/CoverTypes";
import CoverCanvas from "@/components/cover/CoverCanvas";

interface BookCoverProps {
  coverData: CoverData;
  authorName: string;
}

const BookCover = ({ coverData, authorName }: BookCoverProps) => {
  return (
    <div className="w-full h-full relative flex items-center justify-center bg-white book-page">
      {/* Left-side gradient */}
      <div className="absolute left-0 top-0 w-[20px] h-full bg-gradient-to-r from-gray-400/40 to-transparent"></div>
      
      <CoverCanvas 
        coverData={coverData} 
        width={600}
        height={800}
      />
      
      <div className="absolute bottom-8 w-full text-center">
        <p className="text-white text-shadow font-medium">By {authorName}</p>
      </div>
    </div>
  );
};

export default BookCover;
