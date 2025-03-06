import { Check, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BackgroundTabProps } from "../CoverTypes";

const BACKGROUND_COLORS = [
  "#f8f9fa", "#F6F4EB", "#F3E1E1", "#E8D0D0", "#DED0B6"
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
            className="cursor-pointer flex items-center justify-center gap-2 h-10 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium"
          >
            <Upload className="h-4 w-4" />
            {isUploading ? "Uploading..." : "Upload Image"}
          </Label>
          
          {coverData.backgroundImage && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onRemoveImage}
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
