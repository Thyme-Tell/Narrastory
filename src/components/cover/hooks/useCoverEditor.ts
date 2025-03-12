
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CoverData } from "../CoverTypes";

export function useCoverEditor(
  profileId: string, 
  initialCoverData: CoverData | undefined,
  onSave: (coverData: CoverData) => void,
  onClose: () => void
) {
  const [coverData, setCoverData] = useState<CoverData>(
    initialCoverData || {
      backgroundColor: "#CADCDA",
      titleText: "My Stories",
      authorText: "",
      titleColor: "#303441",
      authorColor: "#303441",
      titleSize: 21,
      authorSize: 14,
      layout: 'centered',
      backgroundSettings: {
        position: 'center',
        scale: 1,
        opacity: 1,
        blur: 0
      }
    }
  );
  const [isUploading, setIsUploading] = useState(false);
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(initialCoverData?.backgroundImage || null);
  const [remoteImageUrl, setRemoteImageUrl] = useState<string | null>(initialCoverData?.backgroundImage || null);
  const { toast } = useToast();

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

  useEffect(() => {
    if (profile && (!coverData.authorText || coverData.authorText === "")) {
      const authorName = `${profile.first_name} ${profile.last_name}`.trim();
      setCoverData(prev => ({
        ...prev,
        authorText: authorName
      }));
    }
  }, [profile, coverData.authorText]);

  useEffect(() => {
    return () => {
      if (localImageUrl && localImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(localImageUrl);
      }
    };
  }, [localImageUrl]);

  const handleSave = () => {
    const dataToSave = { ...coverData };
    
    // Always use the remote URL for saving, this is the persistent URL
    dataToSave.backgroundImage = remoteImageUrl;
    
    console.log('Saving cover with data:', dataToSave);
    onSave(dataToSave);
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
    if (localImageUrl && localImageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(localImageUrl);
      setLocalImageUrl(null);
    }
    
    setRemoteImageUrl(null);
    setCoverData({
      ...coverData,
      backgroundImage: null,
    });
  };

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'title' | 'author'
  ) => {
    if (type === 'title') {
      setCoverData({
        ...coverData,
        titleText: e.target.value,
      });
    } else {
      setCoverData({
        ...coverData,
        authorText: e.target.value,
      });
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

  const handleUploadImage = async (file: File) => {
    try {
      setIsUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${profileId}_${Date.now()}.${fileExt}`;
      const filePath = `${profileId}/${fileName}`;
      
      if (localImageUrl && localImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(localImageUrl);
      }
      
      const objectUrl = URL.createObjectURL(file);
      setLocalImageUrl(objectUrl);
      
      // Set the local image for UI preview only
      setCoverData(prev => ({
        ...prev,
        backgroundImage: objectUrl,
        backgroundSettings: {
          ...prev.backgroundSettings,
          position: 'center',
          scale: 1,
          opacity: 1,
          blur: 0
        }
      }));
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('book-covers')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        toast({
          variant: "destructive",
          title: "Upload issue",
          description: "Image will be available for preview but might not be saved permanently.",
        });
        return;
      }
      
      const { data } = supabase.storage
        .from('book-covers')
        .getPublicUrl(filePath);
        
      console.log('Uploaded image URL:', data.publicUrl);
      
      // Store the remote URL for saving later
      setRemoteImageUrl(data.publicUrl);
      
      // Now update the coverData with the remote URL to ensure it's saved
      setCoverData(prev => ({
        ...prev,
        backgroundImage: data.publicUrl
      }));
      
      toast({
        title: "Image uploaded",
        description: "Background image has been uploaded successfully",
      });
      
    } catch (error) {
      console.error("Error in handleUploadImage:", error);
      toast({
        variant: "destructive",
        title: "Upload issue",
        description: "Image will be available for preview but might not be saved permanently.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleBackgroundSettingsChange = (settings: Partial<CoverData['backgroundSettings']>) => {
    setCoverData(prev => ({
      ...prev,
      backgroundSettings: {
        ...prev.backgroundSettings || {
          position: 'center',
          scale: 1,
          opacity: 1,
          blur: 0
        },
        ...settings
      }
    }));
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
    handleLayoutChange,
    handleUploadImage,
    handleBackgroundSettingsChange
  };
}
