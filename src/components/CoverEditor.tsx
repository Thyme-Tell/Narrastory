
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CoverData, useCoverData } from "@/hooks/useCoverData";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Image, Palette, Text, Layout } from "lucide-react";
import ImageCropper from "./ImageCropper";

interface CoverEditorProps {
  open: boolean;
  onClose: () => void;
  profileId: string;
  initialCoverData?: CoverData;
}

const CoverEditor = ({ open, onClose, profileId, initialCoverData }: CoverEditorProps) => {
  const { coverData: savedCoverData, updateCoverData, uploadCoverImage, isLoading } = useCoverData(profileId);
  const [coverData, setCoverData] = useState<CoverData>(initialCoverData || savedCoverData || {});
  const [activeTab, setActiveTab] = useState("design");
  const [imageToUpload, setImageToUpload] = useState<File | null>(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (initialCoverData) {
      setCoverData(initialCoverData);
    } else if (savedCoverData && Object.keys(savedCoverData).length > 0) {
      setCoverData(savedCoverData);
    }
  }, [initialCoverData, savedCoverData]);

  const handleSave = () => {
    updateCoverData(coverData);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageToUpload(e.target.files[0]);
      setTempImageUrl(URL.createObjectURL(e.target.files[0]));
      setCropperOpen(true);
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    const file = new File([croppedBlob], imageToUpload?.name || "cover-image.jpg", {
      type: croppedBlob.type,
    });
    
    const uploadedUrl = await uploadCoverImage(file);
    if (uploadedUrl) {
      setCoverData({
        ...coverData,
        backgroundImage: uploadedUrl,
      });
    }
    
    setCropperOpen(false);
    setImageToUpload(null);
    setTempImageUrl(null);
  };

  const handleInputChange = (key: keyof CoverData, value: any) => {
    setCoverData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Book Cover</DialogTitle>
          </DialogHeader>
          
          <div className="flex h-[70vh]">
            <div className="w-2/3 p-4 bg-gray-100 flex items-center justify-center rounded-l-md overflow-hidden">
              {/* Cover Preview */}
              <div 
                className="relative shadow-lg transition-all duration-300 ease-in-out"
                style={{
                  width: '300px',
                  height: '450px',
                  backgroundColor: coverData.backgroundColor || '#f0f0f0',
                  backgroundImage: coverData.backgroundImage ? `url(${coverData.backgroundImage})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
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
            </div>
            
            <div className="w-1/3 border-l">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="design" className="w-1/3">
                    <Palette className="w-4 h-4 mr-2" />
                    Design
                  </TabsTrigger>
                  <TabsTrigger value="text" className="w-1/3">
                    <Text className="w-4 h-4 mr-2" />
                    Text
                  </TabsTrigger>
                  <TabsTrigger value="layout" className="w-1/3">
                    <Layout className="w-4 h-4 mr-2" />
                    Layout
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="design" className="p-4 space-y-4">
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="background-color">Background Color</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="background-color"
                            type="color"
                            value={coverData.backgroundColor || '#ffffff'}
                            onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                            className="w-12 h-10 p-1"
                          />
                          <Input
                            type="text"
                            value={coverData.backgroundColor || '#ffffff'}
                            onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="background-image">Background Image</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="background-image"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <Button 
                            variant="outline" 
                            onClick={() => document.getElementById('background-image')?.click()}
                            className="w-full"
                          >
                            <Image className="w-4 h-4 mr-2" />
                            Upload Image
                          </Button>
                        </div>
                        
                        {coverData.backgroundImage && (
                          <div className="mt-2 relative">
                            <img 
                              src={coverData.backgroundImage} 
                              alt="Current background" 
                              className="w-full h-20 object-cover rounded-md" 
                            />
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              className="absolute top-1 right-1"
                              onClick={() => handleInputChange('backgroundImage', null)}
                            >
                              Remove
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="text" className="p-4 space-y-4">
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={coverData.title || ''}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          placeholder="Book Title"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="title-color">Title Color</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="title-color"
                            type="color"
                            value={coverData.titleColor || '#000000'}
                            onChange={(e) => handleInputChange('titleColor', e.target.value)}
                            className="w-12 h-10 p-1"
                          />
                          <Input
                            type="text"
                            value={coverData.titleColor || '#000000'}
                            onChange={(e) => handleInputChange('titleColor', e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="subtitle">Subtitle</Label>
                        <Input
                          id="subtitle"
                          value={coverData.subtitle || ''}
                          onChange={(e) => handleInputChange('subtitle', e.target.value)}
                          placeholder="Book Subtitle"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="subtitle-color">Subtitle Color</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="subtitle-color"
                            type="color"
                            value={coverData.subtitleColor || '#000000'}
                            onChange={(e) => handleInputChange('subtitleColor', e.target.value)}
                            className="w-12 h-10 p-1"
                          />
                          <Input
                            type="text"
                            value={coverData.subtitleColor || '#000000'}
                            onChange={(e) => handleInputChange('subtitleColor', e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="author">Author Name</Label>
                        <Input
                          id="author"
                          value={coverData.authorName || ''}
                          onChange={(e) => handleInputChange('authorName', e.target.value)}
                          placeholder="Author Name"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="layout" className="p-4 space-y-4">
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title-position">Title Position</Label>
                        <select
                          id="title-position"
                          value={coverData.titlePosition || 'center'}
                          onChange={(e) => handleInputChange('titlePosition', e.target.value)}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="top">Top</option>
                          <option value="center">Center</option>
                          <option value="bottom">Bottom</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="subtitle-position">Subtitle Position</Label>
                        <select
                          id="subtitle-position"
                          value={coverData.subtitlePosition || 'center'}
                          onChange={(e) => handleInputChange('subtitlePosition', e.target.value)}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="top">Top</option>
                          <option value="center">Center</option>
                          <option value="bottom">Bottom</option>
                        </select>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              
              <div className="p-4 flex justify-end gap-2 border-t">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {cropperOpen && tempImageUrl && (
        <ImageCropper
          imageUrl={tempImageUrl}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setCropperOpen(false);
            setImageToUpload(null);
            setTempImageUrl(null);
          }}
          open={cropperOpen}
        />
      )}
    </>
  );
};

export default CoverEditor;
