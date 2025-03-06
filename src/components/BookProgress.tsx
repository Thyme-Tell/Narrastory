import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Book, Eye, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { X } from "lucide-react";
import CoverEditor from "./CoverEditor";
import { useCoverData } from "@/hooks/useCoverData";
import { useAuth } from "@/contexts/AuthContext";

interface BookProgressProps {
  profileId: string;
}

const BookProgress = ({ profileId }: BookProgressProps) => {
  const [isHidden, setIsHidden] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { coverData } = useCoverData(profileId);
  
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

  const hasCustomCover = coverData && Object.keys(coverData).length > 0;
  const coverStyle = hasCustomCover ? {
    backgroundImage: coverData.backgroundImage ? `url(${coverData.backgroundImage})` : undefined,
    backgroundColor: coverData.backgroundColor || undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  } : {};

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
            <Button 
              variant="outline" 
              size="lg" 
              className="w-[200px] justify-start"
              onClick={() => setIsEditorOpen(true)}
            >
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
          <div 
            className="relative w-full rounded-lg shadow-lg overflow-hidden"
            style={coverStyle}
          >
            {!hasCustomCover && (
              <img
                src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets/book-image.png?t=2025-01-27T11%3A42%3A27.791Z"
                alt="Book cover preview"
                className="w-full rounded-lg shadow-lg"
              />
            )}
            
            {hasCustomCover && (
              <div 
                className="w-full aspect-[2/3]" 
              >
                {coverData.title && (
                  <div 
                    className={`absolute w-full text-center p-4 ${
                      coverData.titlePosition === 'top' 
                        ? 'top-8' 
                        : coverData.titlePosition === 'bottom' 
                          ? 'bottom-24' 
                          : 'top-1/3'
                    }`}
                  >
                    <h1 
                      className="text-2xl font-bold font-rosemartin"
                      style={{ color: coverData.titleColor || '#000000' }}
                    >
                      {coverData.title}
                    </h1>
                  </div>
                )}
                
                {coverData.subtitle && (
                  <div 
                    className={`absolute w-full text-center p-4 ${
                      coverData.subtitlePosition === 'top' 
                        ? 'top-16' 
                        : coverData.subtitlePosition === 'bottom' 
                          ? 'bottom-16'
                          : 'top-1/2'
                    }`}
                  >
                    <h2 
                      className="text-lg font-rosemartin"
                      style={{ color: coverData.subtitleColor || '#000000' }}
                    >
                      {coverData.subtitle}
                    </h2>
                  </div>
                )}
                
                {coverData.authorName && (
                  <div className="absolute w-full text-center p-4 bottom-8">
                    <p className="text-sm font-rosemartin">
                      {coverData.authorName}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {isEditorOpen && (
        <CoverEditor
          open={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          profileId={profileId}
          initialCoverData={coverData}
        />
      )}
    </div>
  );
};

export default BookProgress;
