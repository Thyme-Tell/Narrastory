import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CoverData, BackgroundType } from "../CoverTypes";

export function useCoverEditor(
  profileId: string, 
  initialCoverData: CoverData | undefined,
  onSave: (coverData: CoverData) => void,
  onClose: () => void
) {
  const defaultCoverData: CoverData = {
    backgroundType: 'color',
    backgroundColor: "#CADCDA",
    titleText: "My Stories",
    authorText: "",
    titleColor: "#303441",
    authorColor: "#303441",
    titleSize: 21,
    authorSize: 14,
    layout: 'centered',
  };

  const [coverData, setCoverData] = useState<CoverData>(() => {
    // Merge initial data with defaults, ensuring all properties are set
    return {
      ...defaultCoverData,
      ...initialCoverData,
    };
  });
  
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

  // Set author name from profile when available
  useEffect(() => {
    if (profile && (!coverData.authorText || coverData.authorText === "")) {
      const authorName = `${profile.first_name} ${profile.last_name}`.trim();
      setCoverData(prev => ({
        ...prev,
        authorText: authorName
      }));
    }
  }, [profile, coverData.authorText]);

  // Update cover data when initialCoverData changes
  useEffect(() => {
    if (initialCoverData) {
      setCoverData(prev => ({
        ...prev,
        ...initialCoverData,
      }));
    }
  }, [initialCoverData]);

  const handleSave = () => {
    onSave(coverData);
    onClose();
    toast({
      title: "Cover saved",
      description: "Your book cover has been updated successfully",
    });
  };

  const handleBackgroundColorChange = (color: string) => {
    setCoverData(prev => ({
      ...prev,
      backgroundColor: color,
      backgroundType: 'color',
    }));
  };

  const handleBackgroundTypeChange = (type: BackgroundType) => {
    setCoverData(prev => ({
      ...prev,
      backgroundType: type,
    }));
  };

  const handleUploadImage = (imageUrl: string) => {
    setCoverData(prev => ({
      ...prev,
      backgroundImage: imageUrl,
      backgroundType: 'image',
    }));
  };

  const handleTextColorChange = (color: string, type: 'title' | 'author') => {
    setCoverData(prev => ({
      ...prev,
      ...(type === 'title' ? { titleColor: color } : { authorColor: color }),
    }));
  };

  const handleRemoveImage = () => {
    setCoverData(prev => ({
      ...prev,
      backgroundImage: undefined,
      backgroundType: 'color',
    }));
  };

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'title' | 'author'
  ) => {
    setCoverData(prev => ({
      ...prev,
      ...(type === 'title' ? { titleText: e.target.value } : { authorText: e.target.value }),
    }));
  };

  const handleFontSizeChange = (value: number[], type: 'title' | 'author') => {
    setCoverData(prev => ({
      ...prev,
      ...(type === 'title' ? { titleSize: value[0] } : { authorSize: value[0] }),
    }));
  };

  const handleLayoutChange = (layout: 'centered' | 'top' | 'bottom') => {
    setCoverData(prev => ({
      ...prev,
      layout,
    }));
  };

  return {
    coverData,
    isUploading,
    setIsUploading,
    handleSave,
    handleBackgroundColorChange,
    handleBackgroundTypeChange,
    handleUploadImage,
    handleTextColorChange,
    handleRemoveImage,
    handleTextChange,
    handleFontSizeChange,
    handleLayoutChange
  };
}
