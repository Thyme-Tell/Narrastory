
import { Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { BackgroundTabProps } from "../CoverTypes";

const BACKGROUND_COLORS = [
  "#CADCDA", "#EEDED2", "#ECDDC3"
];

const BackgroundTab = ({
  coverData,
  onBackgroundColorChange,
  onRemoveImage
}: BackgroundTabProps) => {
  return (
    <div className="space-y-4">
      {coverData.backgroundImage && (
        <div>
          <Label className="block mb-2">Background Image</Label>
          <div className="flex items-center gap-2 mb-4">
            <button 
              className="h-10 px-4 py-2 bg-destructive text-destructive-foreground rounded-md text-sm font-medium"
              onClick={onRemoveImage}
            >
              Remove Image
            </button>
          </div>
        </div>
      )}
      
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
