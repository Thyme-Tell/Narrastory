
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CoverCanvas from "./CoverCanvas";
import ImageCropper from "@/components/ImageCropper";
import BackgroundTab from "./editor/BackgroundTab";
import TextTab from "./editor/TextTab";
import LayoutTab from "./editor/LayoutTab";
import { CoverData, CoverEditorProps, DEFAULT_COVER_DATA } from "./CoverTypes";

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
  const [activeTab, setActiveTab] = useState("background");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const { toast } = useToast();

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
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <div className="flex h-[80vh]">
            <div className="w-1/3 border-r p-4 overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Edit Book Cover</h2>
              
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="background" className="flex-1">Background</TabsTrigger>
                  <TabsTrigger value="text" className="flex-1">Text</TabsTrigger>
                  <TabsTrigger value="layout" className="flex-1">Layout</TabsTrigger>
                </TabsList>
                
                <TabsContent value="background">
                  <BackgroundTab
                    coverData={coverData}
                    onBackgroundColorChange={handleBackgroundColorChange}
                    onFileUpload={handleFileUpload}
                    onRemoveImage={handleRemoveImage}
                    isUploading={isUploading}
                  />
                </TabsContent>
                
                <TabsContent value="text">
                  <TextTab
                    coverData={coverData}
                    onTextChange={handleTextChange}
                    onTextColorChange={handleTextColorChange}
                    onFontSizeChange={handleFontSizeChange}
                  />
                </TabsContent>
                
                <TabsContent value="layout">
                  <LayoutTab
                    coverData={coverData}
                    onLayoutChange={handleLayoutChange}
                  />
                </TabsContent>
              </Tabs>
              
              <div className="absolute bottom-4 left-4 right-4 flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  Save Cover
                </Button>
              </div>
            </div>
            
            <div className="w-2/3 bg-gray-100 flex items-center justify-center p-6">
              <div className="w-full h-full flex items-center justify-center">
                <CoverCanvas coverData={coverData} />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {uploadedImageUrl && (
        <ImageCropper
          imageUrl={uploadedImageUrl}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          open={isCropperOpen}
        />
      )}
    </>
  );
};

export default CoverEditor;
