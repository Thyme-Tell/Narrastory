
import { Check, Upload, Trash2, Image } from "lucide-react";
import { Label } from "@/components/ui/label";
import { BackgroundTabProps } from "../CoverTypes";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BACKGROUND_COLORS = [
  "#CADCDA", "#EEDED2", "#ECDDC3"
];

const BackgroundTab = ({
  coverData,
  onBackgroundColorChange,
  onRemoveImage,
  onUploadImage,
  onBackgroundSettingsChange,
  isUploading
}: BackgroundTabProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = async (file: File) => {
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image file (JPG, PNG, or WEBP)');
      return;
    }
    
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size should not exceed 10MB');
      return;
    }
    
    try {
      await onUploadImage(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Image Upload Section */}
      <div>
        <Label className="block mb-2">Background Image</Label>
        {coverData.backgroundImage ? (
          <div className="space-y-4">
            <div className="relative h-40 bg-gray-100 rounded-md overflow-hidden">
              <img 
                src={coverData.backgroundImage} 
                alt="Book cover background" 
                className="w-full h-full object-cover"
              />
              <Button 
                variant="destructive" 
                size="sm" 
                className="absolute top-2 right-2"
                onClick={onRemoveImage}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
            
            {/* Image Settings Controls */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm">Position</Label>
                <Select
                  value={coverData.backgroundSettings?.position || 'center'}
                  onValueChange={(value) => onBackgroundSettingsChange({ position: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="fill">Fill</SelectItem>
                    <SelectItem value="fit">Fit</SelectItem>
                    <SelectItem value="stretch">Stretch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <div className="flex justify-between">
                  <Label className="text-sm">Scale</Label>
                  <span className="text-sm text-gray-500">
                    {Math.round((coverData.backgroundSettings?.scale || 1) * 100)}%
                  </span>
                </div>
                <Slider
                  value={[coverData.backgroundSettings?.scale || 1]}
                  min={0.5}
                  max={2}
                  step={0.05}
                  onValueChange={(value) => onBackgroundSettingsChange({ scale: value[0] })}
                  className="mt-2"
                />
              </div>
              
              <div>
                <div className="flex justify-between">
                  <Label className="text-sm">Opacity</Label>
                  <span className="text-sm text-gray-500">
                    {Math.round((coverData.backgroundSettings?.opacity || 1) * 100)}%
                  </span>
                </div>
                <Slider
                  value={[coverData.backgroundSettings?.opacity || 1]}
                  min={0.1}
                  max={1}
                  step={0.05}
                  onValueChange={(value) => onBackgroundSettingsChange({ opacity: value[0] })}
                  className="mt-2"
                />
              </div>
              
              <div>
                <div className="flex justify-between">
                  <Label className="text-sm">Blur</Label>
                  <span className="text-sm text-gray-500">
                    {Math.round((coverData.backgroundSettings?.blur || 0) * 10)}px
                  </span>
                </div>
                <Slider
                  value={[coverData.backgroundSettings?.blur || 0]}
                  min={0}
                  max={2}
                  step={0.1}
                  onValueChange={(value) => onBackgroundSettingsChange({ blur: value[0] })}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
              isDragging ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isUploading ? (
              <div className="flex flex-col items-center justify-center">
                <div className="h-10 w-10 rounded-full border-2 border-t-transparent border-primary animate-spin mb-2"></div>
                <p className="text-sm text-gray-600">Uploading image...</p>
              </div>
            ) : (
              <>
                <Image className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 mb-1">Drag & drop an image here or click to browse</p>
                <p className="text-xs text-gray-500">JPG, PNG, or WEBP (max 10MB)</p>
              </>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
              disabled={isUploading}
            />
          </div>
        )}
      </div>
      
      {/* Background Color Section */}
      <div>
        <Label className="block mb-2">Background Color</Label>
        <div className="grid grid-cols-3 gap-3">
          {BACKGROUND_COLORS.map((color) => (
            <button
              key={color}
              className={`w-full aspect-square rounded-md flex items-center justify-center border ${
                coverData.backgroundColor === color 
                  ? 'border-primary' 
                  : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => onBackgroundColorChange(color)}
            >
              {coverData.backgroundColor === color && (
                <Check className="h-4 w-4 text-black" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BackgroundTab;
