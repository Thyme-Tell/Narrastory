
import { Check, Upload, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BackgroundTabProps } from "../CoverTypes";

const BACKGROUND_COLORS = [
  "#CADCDA", "#EEDED2", "#ECDDC3", "#F3E1E1", "#E8E8E8", "#D8E1F0"
];

const BackgroundTab = ({
  coverData,
  onBackgroundColorChange,
  onFileUpload,
  onRemoveImage,
  isUploading
}: BackgroundTabProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label className="block mb-2">Upload Image</Label>
        <div className="flex items-center gap-2 mb-4">
          <Input
            type="file"
            accept="image/*"
            onChange={onFileUpload}
            className="hidden"
            id="cover-image-upload"
            disabled={isUploading}
          />
          <Label 
            htmlFor="cover-image-upload" 
            className={`cursor-pointer flex items-center justify-center gap-2 h-10 px-4 py-2 ${isUploading ? 'bg-gray-400' : 'bg-primary'} text-primary-foreground rounded-md text-sm font-medium ${isUploading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {isUploading ? "Uploading..." : "Upload Image"}
          </Label>
          
          {coverData.backgroundImage && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onRemoveImage}
              disabled={isUploading}
            >
              Remove
            </Button>
          )}
        </div>
        
        {coverData.backgroundImage && (
          <div className="mt-2 mb-4 p-2 border rounded-md">
            <p className="text-xs text-muted-foreground mb-1">Current image:</p>
            <div className="relative w-full aspect-[5/8] max-h-32 overflow-hidden rounded bg-gray-100">
              <img 
                src={coverData.backgroundImage} 
                alt="Current cover background" 
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            </div>
          </div>
        )}
      </div>
      
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
              disabled={isUploading}
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
