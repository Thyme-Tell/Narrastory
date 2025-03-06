
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
      <CoverCanvas 
        coverData={coverWithAuthor} 
        width={600}
        height={800}
      />
    </div>
  );
};

export default BookCover;
