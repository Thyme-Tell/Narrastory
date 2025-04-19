import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { TextTabProps } from "../CoverTypes";
import { Check } from "lucide-react";

const TEXT_COLORS = {
  light: { name: "Light", value: "#FFFFFF" },
  dark: { name: "Dark", value: "#000000" }
};

const TextTab = ({ 
  coverData, 
  onTextChange, 
  onFontSizeChange,
  onTextColorChange
}: TextTabProps) => {
  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div>
          <Label>Title Text</Label>
          <Input
            value={coverData.titleText || ""}
            onChange={(e) => onTextChange(e, 'title')}
            placeholder="Enter title text..."
            className="mb-4"
          />
          <div className="flex gap-2 mb-4">
            <button
              className={`flex-1 h-10 rounded-md flex items-center justify-center border ${
                coverData.titleColor === TEXT_COLORS.light.value
                  ? 'border-primary bg-white text-black'
                  : 'border-muted hover:border-muted-foreground bg-white text-black'
              }`}
              onClick={() => onTextColorChange(TEXT_COLORS.light.value, 'title')}
            >
              Light Text
              {coverData.titleColor === TEXT_COLORS.light.value && (
                <Check className="h-4 w-4 ml-2" />
              )}
            </button>
            <button
              className={`flex-1 h-10 rounded-md flex items-center justify-center border ${
                coverData.titleColor === TEXT_COLORS.dark.value
                  ? 'border-primary bg-black text-white'
                  : 'border-muted hover:border-muted-foreground bg-black text-white'
              }`}
              onClick={() => onTextColorChange(TEXT_COLORS.dark.value, 'title')}
            >
              Dark Text
              {coverData.titleColor === TEXT_COLORS.dark.value && (
                <Check className="h-4 w-4 ml-2" />
              )}
            </button>
          </div>
          <div>
            <Label className="block mb-2">Title Size: {coverData.titleSize}pt</Label>
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
          <Label>Author Text</Label>
          <Input
            value={coverData.authorText || ""}
            onChange={(e) => onTextChange(e, 'author')}
            placeholder="Enter author text..."
            className="mb-4"
          />
          <div className="flex gap-2 mb-4">
            <button
              className={`flex-1 h-10 rounded-md flex items-center justify-center border ${
                coverData.authorColor === TEXT_COLORS.light.value
                  ? 'border-primary bg-white text-black'
                  : 'border-muted hover:border-muted-foreground bg-white text-black'
              }`}
              onClick={() => onTextColorChange(TEXT_COLORS.light.value, 'author')}
            >
              Light Text
              {coverData.authorColor === TEXT_COLORS.light.value && (
                <Check className="h-4 w-4 ml-2" />
              )}
            </button>
            <button
              className={`flex-1 h-10 rounded-md flex items-center justify-center border ${
                coverData.authorColor === TEXT_COLORS.dark.value
                  ? 'border-primary bg-black text-white'
                  : 'border-muted hover:border-muted-foreground bg-black text-white'
              }`}
              onClick={() => onTextColorChange(TEXT_COLORS.dark.value, 'author')}
            >
              Dark Text
              {coverData.authorColor === TEXT_COLORS.dark.value && (
                <Check className="h-4 w-4 ml-2" />
              )}
            </button>
          </div>
          <div>
            <Label className="block mb-2">Author Size: {coverData.authorSize}pt</Label>
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
    </div>
  );
};

export default TextTab;
