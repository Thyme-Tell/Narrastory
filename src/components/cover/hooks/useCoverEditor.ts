
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CoverData } from "../CoverTypes";

const TITLE_MAX_LENGTH = 40;
const AUTHOR_MAX_LENGTH = 30;

export function useCoverEditor(
  profileId: string, 
  initialCoverData: CoverData | undefined,
  onSave: (coverData: CoverData) => void,
  onClose: () => void
) {
  console.log("useCoverEditor initialized with initialCoverData:", initialCoverData);
  
  // Initialize with the provided initialCoverData or fallback to defaults
  const [coverData, setCoverData] = useState<CoverData>(() => {
    if (initialCoverData) {
      return {
        ...initialCoverData,
        // Ensure title and author text lengths are within limits
        titleText: initialCoverData.titleText?.slice(0, TITLE_MAX_LENGTH) || "My Stories",
        authorText: initialCoverData.authorText?.slice(0, AUTHOR_MAX_LENGTH) || ""
      };
    }
    
    return {
      backgroundColor: "#CADCDA",
      titleText: "My Stories",
      authorText: "",
      titleColor: "#303441",
      authorColor: "#303441",
      titleSize: 21,
      authorSize: 14,
      layout: 'centered',
    };
  });

  // When initialCoverData changes (e.g., after a refresh), update the state
  useEffect(() => {
    if (initialCoverData) {
      console.log("initialCoverData changed, updating editor state:", initialCoverData);
      setCoverData({
        ...initialCoverData,
        titleText: initialCoverData.titleText?.slice(0, TITLE_MAX_LENGTH) || "My Stories",
        authorText: initialCoverData.authorText?.slice(0, AUTHOR_MAX_LENGTH) || ""
      });
    }
  }, [initialCoverData]);
  
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Fetch profile data to get the author name
  const { data: profile } = useQuery({
    queryKey: ["profile", profileId],
    queryFn: async () => {
      if (!profileId) return null;
      
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

  // Set author name from profile when available and only if author text is not already set
  useEffect(() => {
    if (profile && (!coverData.authorText || coverData.authorText === "")) {
      const authorName = `${profile.first_name} ${profile.last_name}`.trim();
      // Ensure author name doesn't exceed max length
      const trimmedAuthorName = authorName.slice(0, AUTHOR_MAX_LENGTH);
      
      setCoverData(prev => ({
        ...prev,
        authorText: trimmedAuthorName
      }));
    }
  }, [profile, coverData.authorText]);

  const handleSave = () => {
    onSave(coverData);
    onClose();
    toast({
      title: "Cover saved",
      description: "Your book cover has been updated successfully",
    });
  };

  const handleBackgroundColorChange = (color: string) => {
    setCoverData({
      ...coverData,
      backgroundColor: color,
    });
  };

  const handleTextColorChange = (color: string, type: 'title' | 'author') => {
    if (type === 'title') {
      setCoverData({
        ...coverData,
        titleColor: color,
      });
    } else {
      setCoverData({
        ...coverData,
        authorColor: color,
      });
    }
  };

  const handleRemoveImage = () => {
    setCoverData({
      ...coverData,
      backgroundImage: undefined,
    });
  };

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'title' | 'author'
  ) => {
    const value = e.target.value;
    
    if (type === 'title') {
      if (value.length <= TITLE_MAX_LENGTH) {
        setCoverData({
          ...coverData,
          titleText: value,
        });
      }
    } else {
      if (value.length <= AUTHOR_MAX_LENGTH) {
        setCoverData({
          ...coverData,
          authorText: value,
        });
      }
    }
  };

  const handleFontSizeChange = (value: number[], type: 'title' | 'author') => {
    if (type === 'title') {
      setCoverData({
        ...coverData,
        titleSize: value[0],
      });
    } else {
      setCoverData({
        ...coverData,
        authorSize: value[0],
      });
    }
  };

  const handleLayoutChange = (layout: 'centered' | 'top' | 'bottom') => {
    setCoverData({
      ...coverData,
      layout,
    });
  };

  return {
    coverData,
    isUploading,
    handleSave,
    handleBackgroundColorChange,
    handleTextColorChange,
    handleRemoveImage,
    handleTextChange,
    handleFontSizeChange,
    handleLayoutChange
  };
}
