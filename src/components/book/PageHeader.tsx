
import React from "react";
import { format } from "date-fns";
import { Story } from "@/types/supabase";

interface PageHeaderProps {
  story: Story;
  pageNumber: number;
}

const PageHeader = ({ story, pageNumber }: PageHeaderProps) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-baseline">
        <h2 className="text-2xl font-semibold">
          {story.title || "Untitled Story"}
        </h2>
        <span className="text-sm text-gray-500">
          {format(new Date(story.created_at), "MMMM d, yyyy")}
        </span>
      </div>
      <div className="text-right text-sm text-gray-400">Page {pageNumber}</div>
    </div>
  );
};

export default PageHeader;
