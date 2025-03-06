
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Book, Eye, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { X } from "lucide-react";
import CoverEditor, { CoverData } from "./cover/CoverEditor";
import CoverCanvas from "./cover/CoverCanvas";
import { useCoverData } from "@/hooks/useCoverData";

interface BookProgressProps {
  profileId: string;
}

const BookProgress = ({ profileId }: BookProgressProps) => {
  const [isHidden, setIsHidden] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const { coverData, saveCoverData, isLoading: isCoverLoading } = useCoverData(profileId);
  
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
        .select("content")
        .eq("profile_id", profileId);

      if (storiesError) {
        console.error("Error fetching stories:", storiesError);
        return [];
      }

      return storiesData;
    },
  });

  const handleOpenCoverEditor = () => {
    setIsEditorOpen(true);
  };

  const handleCloseCoverEditor = () => {
    setIsEditorOpen(false);
  };

  const handleSaveCover = async (newCoverData: CoverData) => {
    await saveCoverData(newCoverData);
  };

  if (isHidden) {
    return null;
  }

  if (!stories?.length) {
    return (
      <div className="mb-6 rounded-lg bg-white/50 shadow-sm relative overflow-hidden">
        <button 
          onClick={() => setIsHidden(true)}
          className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full bg-white/50 text-atlantic/70 hover:text-atlantic z-10"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>
        <div className="flex flex-col">
          <img
            src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets/book-image.png?t=2025-01-27T11%3A42%3A27.791Z"
            alt="Book illustration"
            className="w-full h-32 object-cover"
          />
          <div className="p-6">
            <h2 className="text-xl font-semibold text-atlantic mb-2 text-left">Share your first story</h2>
            <p className="text-atlantic mb-4 text-left">
              Call <a href="tel:+15072003303" className="text-[#A33D29] hover:underline">+1 (507) 200-3303</a><br />
              One phone call, one memory at a time.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <nav className="flex text-sm text-atlantic/60 mb-4">
        <a href="/" className="hover:text-atlantic">HOME</a>
        <span className="mx-2">›</span>
        <span className="font-medium text-atlantic">{profile?.first_name?.toUpperCase()} {profile?.last_name?.toUpperCase()}</span>
      </nav>
      
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-rosemartin text-atlantic mb-8">{profile?.first_name} {profile?.last_name}</h1>
          <div className="space-y-3">
            <Button variant="outline" size="lg" className="w-[200px] justify-start" onClick={handleOpenCoverEditor}>
              <Book className="mr-2" />
              Edit Cover
            </Button>
            <Button variant="outline" size="lg" className="w-[200px] justify-start">
              <Eye className="mr-2" />
              Preview Book
            </Button>
            <Button variant="outline" size="lg" className="w-[200px] justify-start">
              <ShoppingCart className="mr-2" />
              Order Book
            </Button>
          </div>
        </div>
        
        <div className="w-[300px]">
          {isCoverLoading ? (
            <div className="w-full h-[450px] bg-gray-200 rounded-lg animate-pulse"></div>
          ) : coverData ? (
            <div className="rounded-lg shadow-lg overflow-hidden">
              <CoverCanvas 
                coverData={coverData} 
                width={300}
                height={450}
              />
            </div>
          ) : (
            <img
              src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets/book-image.png?t=2025-01-27T11%3A42%3A27.791Z"
              alt="Book cover preview"
              className="w-full rounded-lg shadow-lg"
            />
          )}
        </div>
      </div>

      <CoverEditor
        profileId={profileId}
        open={isEditorOpen}
        onClose={handleCloseCoverEditor}
        onSave={handleSaveCover}
        initialCoverData={coverData || undefined}
      />
    </div>
  );
};

export default BookProgress;
