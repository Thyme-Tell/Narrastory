
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { CoverData } from "../CoverTypes";

const TEXT_COLORS = [
  "#000000", "#333333", "#555555", "#777777", "#999999",
  "#A33D29", "#732626", "#9B87F5", "#7E69AB", "#0C2340"
];

interface TextTabProps {
  coverData: CoverData;
  onTextChange: (e: React.ChangeEvent<HTMLInputElement>, type: 'title' | 'author') => void;
  onTextColorChange: (color: string, type: 'title' | 'author') => void;
  onFontSizeChange: (value: number[], type: 'title' | 'author') => void;
}

const TextTab = ({
  coverData,
  onTextChange,
  onTextColorChange,
  onFontSizeChange
}: TextTabProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title-text" className="block mb-2">Title</Label>
        <Input
          id="title-text"
          value={coverData.titleText || ''}
          onChange={(e) => onTextChange(e, 'title')}
          placeholder="Enter book title"
        />
      </div>
      
      <div>
        <Label htmlFor="author-text" className="block mb-2">Author</Label>
        <Input
          id="author-text"
          value={coverData.authorText || ''}
          onChange={(e) => onTextChange(e, 'author')}
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
              onClick={() => onTextColorChange(color, 'title')}
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
              onClick={() => onTextColorChange(color, 'author')}
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
          onValueChange={(value) => onFontSizeChange(value, 'title')}
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
          onValueChange={(value) => onFontSizeChange(value, 'author')}
        />
      </div>
    </div>
  );
};

export default TextTab;
