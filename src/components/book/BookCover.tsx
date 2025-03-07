
import React from "react";
import { CoverData } from "@/components/cover/CoverTypes";
import CoverCanvas from "@/components/cover/CoverCanvas";

interface BookCoverProps {
  coverData: CoverData;
  authorName: string;
}

const BookCover = ({ coverData, authorName }: BookCoverProps) => {
  return (
    <div className="w-full h-full relative flex items-center justify-center">
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
