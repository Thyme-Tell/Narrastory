
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCoverData } from "@/hooks/useCoverData";
import { Story } from "@/types/supabase";
import { CoverData } from "./cover/CoverTypes";
import { useNavigate } from "react-router-dom";
import BookProgressHeader from "./book-progress/BookProgressHeader";
import BookCoverPreview from "./book-progress/BookCoverPreview";
import BookEditorModals from "./book-progress/BookEditorModals";
import BookProgressInfo from "./book-progress/BookProgressInfo";
import BookProgressStats from "./book-progress/BookProgressStats";
import BookProgressActions from "./book-progress/BookProgressActions";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { calculateTotalPages } from "@/utils/bookPagination";

interface BookProgressProps {
  profileId: string;
  onExpandToggle?: (expanded: boolean) => void;
}

export function BookProgress({ profileId, onExpandToggle }: BookProgressProps) {
  const [isHidden, setIsHidden] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  
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

  const { data: stories = [] } = useQuery({
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

      return storiesData as Story[];
    },
  });

  useEffect(() => {
    if (profileId) {
      console.log('BookProgress: Refreshing cover data for profile:', profileId);
      refreshCoverData();
    }
  }, [profileId, refreshCoverData]);

  // Handle expansion state change and propagate to parent
  const handleExpansionChange = (open: boolean) => {
    setIsExpanded(open);
    if (onExpandToggle) {
      onExpandToggle(open);
    }
  };

  const handleOpenCoverEditor = () => {
    refreshCoverData();
    setIsEditorOpen(true);
  };

  const handleCloseCoverEditor = () => {
    setIsEditorOpen(false);
  };

  const handleSaveCover = async (newCoverData: CoverData) => {
    console.log("Saving new cover data:", newCoverData);
    await saveCoverData(newCoverData);
    refreshCoverData();
  };

  const handlePreviewBook = () => {
    navigate(`/book-preview/${profileId}`);
  };

  const scrollToTableOfContents = () => {
    const tocElement = document.querySelector('[data-toc-container]');
    if (tocElement) {
      tocElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (isHidden) {
    return null;
  }

  if (!stories?.length) {
    return <BookProgressHeader setIsHidden={setIsHidden} />;
  }
  
  // Calculate total page count
  const totalPageCount = calculateTotalPages(stories);

  return (
    <div className="mb-0"> {/* Removed mb-8 to eliminate space */}
      <Collapsible 
        open={isExpanded} 
        onOpenChange={handleExpansionChange}
        className="w-full border rounded-lg bg-white/90 shadow overflow-hidden transition-all duration-300 ease-in-out"
      >
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-16 overflow-hidden rounded flex-shrink-0">
              <BookCoverPreview 
                coverData={coverData}
                isLoading={isCoverLoading}
                compact={true}
              />
            </div>
            <div>
              <h3 className="font-serif text-lg leading-tight">{coverData.titleText || "My Stories"}</h3>
              <p className="text-sm text-muted-foreground">
                {profile?.first_name} {profile?.last_name} • {stories.length} {stories.length === 1 ? 'story' : 'stories'} 
                {/* Added page count to collapsed view */}
                <span className="ml-1 inline-flex items-center">
                  <BookOpen className="h-3.5 w-3.5 mr-1 text-[#155B4A]" />
                  {totalPageCount} pages
                </span>
              </p>
            </div>
          </div>
          
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
              {isExpanded ? 
                <ChevronUp className="h-4 w-4" /> : 
                <ChevronDown className="h-4 w-4" />
              }
              <span className="sr-only">Toggle book details</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent>
          <div className="px-4 pb-4 border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
              <div>
                <BookProgressInfo 
                  coverData={coverData}
                  profileFirstName={profile?.first_name}
                  profileLastName={profile?.last_name}
                  onOpenCoverEditor={handleOpenCoverEditor}
                />
                
                <BookProgressStats 
                  stories={stories}
                  scrollToTableOfContents={scrollToTableOfContents}
                />
              </div>

              <div className="space-y-4">
                <div className="bg-muted/30 rounded-lg p-4 flex items-center justify-center" style={{ minHeight: "320px" }}>
                  <BookCoverPreview 
                    coverData={coverData}
                    isLoading={isCoverLoading}
                  />
                </div>
                
                <BookProgressActions 
                  onPreviewBook={handlePreviewBook}
                  onOpenCoverEditor={handleOpenCoverEditor}
                />
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <BookEditorModals
        profileId={profileId}
        isEditorOpen={isEditorOpen}
        isPreviewOpen={false}
        coverData={coverData}
        onCloseCoverEditor={handleCloseCoverEditor}
        onClosePreview={() => {}}
        onSaveCover={handleSaveCover}
      />
    </div>
  );
}
