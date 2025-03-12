
import React, { useRef } from "react";
import { BackgroundTabProps } from "../CoverTypes";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { HexColorPicker } from "react-colorful";
import { Loader2, Upload, X } from "lucide-react";

const BackgroundTab = ({
  coverData,
  onBackgroundColorChange,
  onRemoveImage,
  onUploadImage,
  onBackgroundSettingsChange,
  isUploading
}: BackgroundTabProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadImage(file);
    }
  };

  const handlePositionChange = (position: 'center' | 'fill' | 'fit' | 'stretch') => {
    onBackgroundSettingsChange({ position });
  };

  return (
    <div className="p-4 space-y-6">
      <Tabs defaultValue="color" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="color">Solid Color</TabsTrigger>
          <TabsTrigger value="image">Image</TabsTrigger>
        </TabsList>

        <TabsContent value="color" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="background-color">Background Color</Label>
            <div className="flex justify-center">
              <HexColorPicker
                color={coverData.backgroundColor || "#CADCDA"}
                onChange={onBackgroundColorChange}
              />
            </div>
            <div className="flex items-center mt-2">
              <Input
                id="background-color"
                value={coverData.backgroundColor || "#CADCDA"}
                onChange={(e) => onBackgroundColorChange(e.target.value)}
                className="font-mono"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="image" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Background Image</Label>
            
            {coverData.backgroundImage ? (
              <div className="space-y-4">
                <div className="relative border rounded-md overflow-hidden h-40">
                  <img
                    src={coverData.backgroundImage}
                    alt="Background"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={onRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant={coverData.backgroundSettings?.position === 'center' ? "default" : "outline"}
                        onClick={() => handlePositionChange('center')}
                        className="text-xs h-8"
                      >
                        Center
                      </Button>
                      <Button 
                        variant={coverData.backgroundSettings?.position === 'fill' ? "default" : "outline"}
                        onClick={() => handlePositionChange('fill')}
                        className="text-xs h-8"
                      >
                        Fill
                      </Button>
                      <Button 
                        variant={coverData.backgroundSettings?.position === 'fit' ? "default" : "outline"}
                        onClick={() => handlePositionChange('fit')}
                        className="text-xs h-8"
                      >
                        Fit
                      </Button>
                      <Button 
                        variant={coverData.backgroundSettings?.position === 'stretch' ? "default" : "outline"}
                        onClick={() => handlePositionChange('stretch')}
                        className="text-xs h-8"
                      >
                        Stretch
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Scale</Label>
                      <span className="text-xs text-gray-500">
                        {((coverData.backgroundSettings?.scale || 1) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Slider
                      value={[coverData.backgroundSettings?.scale || 1]}
                      min={0.1}
                      max={2}
                      step={0.1}
                      onValueChange={(value) => onBackgroundSettingsChange({ scale: value[0] })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Opacity</Label>
                      <span className="text-xs text-gray-500">
                        {((coverData.backgroundSettings?.opacity || 1) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Slider
                      value={[coverData.backgroundSettings?.opacity || 1]}
                      min={0.1}
                      max={1}
                      step={0.1}
                      onValueChange={(value) => onBackgroundSettingsChange({ opacity: value[0] })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Blur</Label>
                      <span className="text-xs text-gray-500">
                        {(coverData.backgroundSettings?.blur || 0).toFixed(0)}px
                      </span>
                    </div>
                    <Slider
                      value={[coverData.backgroundSettings?.blur || 0]}
                      min={0}
                      max={20}
                      step={1}
                      onValueChange={(value) => onBackgroundSettingsChange({ blur: value[0] })}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border border-dashed rounded-md p-8 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => fileInputRef.current?.click()}>
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Uploading image...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-1">Click to upload an image</p>
                    <p className="text-xs text-gray-400">PNG, JPG, WEBP (max 10MB)</p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BackgroundTab;
