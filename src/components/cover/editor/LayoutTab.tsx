
import { LayoutTabProps } from "../CoverTypes";
import { Label } from "@/components/ui/label";

const LayoutTab = ({ coverData, onLayoutChange }: LayoutTabProps) => {
  return (
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
            onClick={() => onLayoutChange(layout)}
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
  );
};

export default LayoutTab;
