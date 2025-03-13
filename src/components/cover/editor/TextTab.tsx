
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { TextTabProps } from "../CoverTypes";

const TextTab = ({ 
  coverData, 
  onTextChange, 
  onFontSizeChange 
}: TextTabProps) => {
  return (
    <div className="space-y-6">
      <div>
        <Label className="block mb-2">Title</Label>
        <Input
          value={coverData.titleText || ""}
          onChange={(e) => onTextChange(e, 'title')}
          placeholder="Book title"
          className="mb-4"
        />
        
        <div>
          <Label className="block mb-2">
            Title Size: {coverData.titleSize}pt 
            <span className="text-xs text-muted-foreground ml-2">(36-42pt equivalent)</span>
          </Label>
          <Slider
            value={[coverData.titleSize || 20]}
            min={18}
            max={24}
            step={1}
            onValueChange={(value) => onFontSizeChange(value, 'title')}
          />
        </div>
      </div>
      
      <div>
        <Label className="block mb-2">Author</Label>
        <Input
          value={coverData.authorText || ""}
          onChange={(e) => onTextChange(e, 'author')}
          placeholder="Author name"
          className="mb-4"
        />
        
        <div>
          <Label className="block mb-2">
            Author Size: {coverData.authorSize}pt
            <span className="text-xs text-muted-foreground ml-2">(18-24pt equivalent)</span>
          </Label>
          <Slider
            value={[coverData.authorSize || 14]}
            min={12}
            max={16}
            step={1}
            onValueChange={(value) => onFontSizeChange(value, 'author')}
          />
        </div>
      </div>
    </div>
  );
};

export default TextTab;
