
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CoverData, CoverEditorProps, DEFAULT_COVER_DATA } from "./CoverTypes";
import EditorControlPanel from "./editor/EditorControlPanel";
import CoverPreview from "./editor/CoverPreview";
import ImageCropperDialog from "./editor/ImageCropperDialog";
import { useIsMobile } from "@/hooks/use-mobile";

const CoverEditor = ({ 
  profileId, 
  open, 
  onClose, 
  onSave,
  initialCoverData 
}: CoverEditorProps) => {
  const [coverData, setCoverData] = useState<CoverData>(
    initialCoverData || DEFAULT_COVER_DATA
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (initialCoverData) {
      setCoverData(initialCoverData);
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    setUploadedImageUrl(fileUrl);
    setIsCropperOpen(true);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setIsCropperOpen(false);
    setIsUploading(true);

    try {
      const fileExt = 'jpg';
      const fileName = `book-cover-${profileId}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('book-covers')
        .upload(fileName, croppedBlob, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('book-covers')
        .getPublicUrl(fileName);

      setCoverData({
        ...coverData,
        backgroundImage: data.publicUrl,
      });

      toast({
        title: "Image uploaded",
        description: "Your background image has been uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "There was an error uploading your image",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setCoverData({
      ...coverData,
      backgroundImage: undefined,
    });
  };

  const handleCropCancel = () => {
    setIsCropperOpen(false);
    setUploadedImageUrl(null);
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

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white">
          <DialogTitle className="sr-only">Edit Book Cover</DialogTitle>
          <div className={`flex flex-col ${isMobile ? "h-[100vh]" : "h-[90vh]"} bg-white`}>
            {/* Preview section - top 60% */}
            <div className="w-full" style={{ height: "60%" }}>
              <CoverPreview coverData={coverData} isLoading={isUploading} />
            </div>
            
            {/* Controls section - bottom 40% */}
            <div className="w-full" style={{ height: "40%" }}>
              <EditorControlPanel
                coverData={coverData}
                onSave={handleSave}
                onCancel={onClose}
                onBackgroundColorChange={handleBackgroundColorChange}
                onFileUpload={handleFileUpload}
                onRemoveImage={handleRemoveImage}
                isUploading={isUploading}
                onTextChange={handleTextChange}
                onTextColorChange={handleTextColorChange}
                onFontSizeChange={handleFontSizeChange}
                onLayoutChange={handleLayoutChange}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <ImageCropperDialog
        imageUrl={uploadedImageUrl}
        open={isCropperOpen}
        onComplete={handleCropComplete}
        onCancel={handleCropCancel}
      />
    </>
  );
};

export default CoverEditor;
