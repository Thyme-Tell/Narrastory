
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCoverData } from "@/hooks/useCoverData";
import { calculateTotalPages } from "@/utils/bookPagination";
import { CoverData } from "./cover/CoverTypes";
import { useIsMobile } from "@/hooks/use-mobile";
import BookProgressHeader from "./book-progress/BookProgressHeader";
import BookProgressOptions from "./book-progress/BookProgressOptions";
import BookProgressBar from "./book-progress/BookProgressBar";
import BookCoverPreview from "./book-progress/BookCoverPreview";
import BookEditorModals from "./book-progress/BookEditorModals";

interface BookProgressProps {
  profileId: string;
}

const MIN_PAGES_REQUIRED = 32;

const BookProgress = ({ profileId }: BookProgressProps) => {
  const [isHidden, setIsHidden] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const { 
    coverData, 
    saveCoverData, 
    isLoading: isCoverLoading, 
    refreshCoverData 
  } = useCoverData(profileId);
  
  const { data: profile } = useQuery({
    queryKey: ["profile", profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", profileId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
      
      return data;
    },
  });

  const { data: stories } = useQuery({
    queryKey: ["stories", profileId],
    queryFn: async () => {
      const { data: storiesData, error: storiesError } = await supabase
        .from("stories")
        .select("id, title, content, created_at, share_token")
        .eq("profile_id", profileId);

      if (storiesError) {
        console.error("Error fetching stories:", storiesError);
        return [];
      }

      return storiesData;
    },
  });

  const currentPageCount = stories ? calculateTotalPages(stories) : 1;
  const progressPercentage = Math.min((currentPageCount / MIN_PAGES_REQUIRED) * 100, 100);

  useEffect(() => {
    if (profileId) {
      console.log('BookProgress: Refreshing cover data for profile:', profileId);
      refreshCoverData();
    }
  }, [profileId, refreshCoverData]);

  const handleOpenCoverEditor = () => {
    refreshCoverData();
    setIsEditorOpen(true);
  };

  const handleCloseCoverEditor = () => {
    setIsEditorOpen(false);
  };

  const handleOpenPreview = () => {
    console.log("Opening book preview, isMobile:", isMobile);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
  };

  const handleSaveCover = async (newCoverData: CoverData) => {
    console.log("Saving new cover data:", newCoverData);
    await saveCoverData(newCoverData);
    refreshCoverData();
  };

  if (isHidden) {
    return null;
  }

  if (!stories?.length) {
    return <BookProgressHeader setIsHidden={setIsHidden} />;
  }

  return (
    <div className="mb-8">
      <nav className="flex text-sm text-atlantic/60 mb-4">
        <a href="/" className="hover:text-atlantic">HOME</a>
        <span className="mx-2">›</span>
        <span className="font-medium text-atlantic">{profile?.first_name?.toUpperCase()} {profile?.last_name?.toUpperCase()}</span>
      </nav>
      
      <div className={`flex ${isMobile ? "flex-col" : "justify-between"} items-center`}>
        <div className={isMobile ? "w-full mb-6" : ""}>
          <h1 className="text-4xl font-rosemartin text-atlantic mb-8">{profile?.first_name} {profile?.last_name}</h1>
          
          {isMobile && (
            <div className="mb-6">
              <BookCoverPreview 
                coverData={coverData}
                isLoading={isCoverLoading}
              />
            </div>
          )}
          
          <div className="flex flex-col space-y-6">
            <BookProgressOptions 
              onEditCover={handleOpenCoverEditor}
              onPreviewBook={handleOpenPreview}
            />

            <BookProgressBar 
              currentPageCount={currentPageCount}
              progressPercentage={progressPercentage}
              minPagesRequired={MIN_PAGES_REQUIRED}
            />
          </div>
        </div>
        
        {!isMobile && (
          <BookCoverPreview 
            coverData={coverData}
            isLoading={isCoverLoading}
          />
        )}
      </div>

      <BookEditorModals
        profileId={profileId}
        isEditorOpen={isEditorOpen}
        isPreviewOpen={isPreviewOpen}
        coverData={coverData}
        onCloseCoverEditor={handleCloseCoverEditor}
        onClosePreview={handleClosePreview}
        onSaveCover={handleSaveCover}
      />
    </div>
  );
};

export default BookProgress;
