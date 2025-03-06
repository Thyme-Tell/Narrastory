
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Check, Upload } from "lucide-react";
import CoverCanvas from "./CoverCanvas";
import ImageCropper from "@/components/ImageCropper";

interface CoverEditorProps {
  profileId: string;
  open: boolean;
  onClose: () => void;
  onSave: (coverData: CoverData) => void;
  initialCoverData?: CoverData;
}

export interface CoverData {
  backgroundImage?: string;
  backgroundColor?: string;
  titleText?: string;
  authorText?: string;
  titleColor?: string;
  authorColor?: string;
  titleSize?: number;
  authorSize?: number;
  titlePosition?: { x: number; y: number };
  authorPosition?: { x: number; y: number };
  layout?: 'centered' | 'top' | 'bottom';
}

const DEFAULT_COVER_DATA: CoverData = {
  backgroundColor: "#f8f9fa",
  titleText: "My Stories",
  authorText: "",
  titleColor: "#333333",
  authorColor: "#666666",
  titleSize: 36,
  authorSize: 24,
  layout: 'centered',
};

const BACKGROUND_COLORS = [
  "#f8f9fa", "#e9ecef", "#dee2e6", "#ced4da", "#adb5bd", 
  "#F6F4EB", "#FFF8E3", "#F5EEE6", "#F3E1E1", "#EAD7D1",
  "#E8D0D0", "#E5D2C4", "#DED0B6", "#BBADA0", "#F0E4D8"
];

const TEXT_COLORS = [
  "#000000", "#333333", "#555555", "#777777", "#999999",
  "#A33D29", "#732626", "#9B87F5", "#7E69AB", "#0C2340"
];

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
                
                <TabsContent value="background" className="space-y-4">
                  <div>
                    <Label className="block mb-2">Upload Image</Label>
                    <div className="flex items-center gap-2 mb-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="cover-image-upload"
                        disabled={isUploading}
                      />
                      <Label 
                        htmlFor="cover-image-upload" 
                        className="cursor-pointer flex items-center justify-center gap-2 h-10 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium"
                      >
                        <Upload className="h-4 w-4" />
                        {isUploading ? "Uploading..." : "Upload Image"}
                      </Label>
                      
                      {coverData.backgroundImage && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setCoverData({...coverData, backgroundImage: undefined})}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="block mb-2">Background Color</Label>
                    <div className="grid grid-cols-5 gap-2">
                      {BACKGROUND_COLORS.map((color) => (
                        <button
                          key={color}
                          className={`w-full aspect-square rounded-md flex items-center justify-center border ${
                            coverData.backgroundColor === color 
                              ? 'border-primary' 
                              : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => handleBackgroundColorChange(color)}
                        >
                          {coverData.backgroundColor === color && (
                            <Check className="h-4 w-4 text-black" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="text" className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title-text" className="block mb-2">Title</Label>
                      <Input
                        id="title-text"
                        value={coverData.titleText || ''}
                        onChange={(e) => handleTextChange(e, 'title')}
                        placeholder="Enter book title"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="author-text" className="block mb-2">Author</Label>
                      <Input
                        id="author-text"
                        value={coverData.authorText || ''}
                        onChange={(e) => handleTextChange(e, 'author')}
                        placeholder="Enter author name"
                      />
                    </div>
                    
                    <div>
                      <Label className="block mb-2">Title Color</Label>
                      <div className="grid grid-cols-5 gap-2">
                        {TEXT_COLORS.map((color) => (
                          <button
                            key={color}
                            className={`w-full aspect-square rounded-md flex items-center justify-center border ${
                              coverData.titleColor === color 
                                ? 'border-primary' 
                                : 'border-transparent'
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => handleTextColorChange(color, 'title')}
                          >
                            {coverData.titleColor === color && (
                              <Check className="h-4 w-4 text-white" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="block mb-2">Author Color</Label>
                      <div className="grid grid-cols-5 gap-2">
                        {TEXT_COLORS.map((color) => (
                          <button
                            key={color}
                            className={`w-full aspect-square rounded-md flex items-center justify-center border ${
                              coverData.authorColor === color 
                                ? 'border-primary' 
                                : 'border-transparent'
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => handleTextColorChange(color, 'author')}
                          >
                            {coverData.authorColor === color && (
                              <Check className="h-4 w-4 text-white" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="block mb-2">
                        Title Size: {coverData.titleSize}px
                      </Label>
                      <Slider
                        defaultValue={[coverData.titleSize || 36]}
                        min={16}
                        max={72}
                        step={1}
                        onValueChange={(value) => handleFontSizeChange(value, 'title')}
                      />
                    </div>
                    
                    <div>
                      <Label className="block mb-2">
                        Author Size: {coverData.authorSize}px
                      </Label>
                      <Slider
                        defaultValue={[coverData.authorSize || 24]}
                        min={12}
                        max={48}
                        step={1}
                        onValueChange={(value) => handleFontSizeChange(value, 'author')}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="layout" className="space-y-4">
                  <div>
                    <Label className="block mb-2">Text Position</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['centered', 'top', 'bottom'] as const).map((layout) => (
                        <button
                          key={layout}
                          className={`p-4 border rounded-md ${
                            coverData.layout === layout 
                              ? 'border-primary bg-primary/10' 
                              : 'border-gray-200'
                          }`}
                          onClick={() => handleLayoutChange(layout)}
                        >
                          <div className={`h-20 bg-gray-200 rounded flex flex-col justify-${
                            layout === 'centered' ? 'center' : layout
                          } items-center p-2`}>
                            <div className="h-2 w-16 bg-gray-400 rounded"></div>
                            <div className="h-1 w-12 bg-gray-300 rounded mt-1"></div>
                          </div>
                          <p className="text-center mt-2 text-sm capitalize">{layout}</p>
                        </button>
                      ))}
                    </div>
                  </div>
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
