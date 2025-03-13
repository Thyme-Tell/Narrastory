
import React from 'react';
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { TextTabProps } from '../CoverTypes';

const TextTab = ({ 
  coverData, 
  onTextChange, 
  onFontSizeChange 
}: TextTabProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title-text" className="mb-2">Title</Label>
          <Input
            id="title-text"
            value={coverData.titleText || ""}
            onChange={(e) => onTextChange(e, 'title')}
            placeholder="Enter book title"
          />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label htmlFor="title-size">Title Size: {coverData.titleSize}px</Label>
          </div>
          <Slider
            id="title-size"
            defaultValue={[coverData.titleSize || 21]}
            min={12}
            max={36}
            step={1}
            onValueChange={(value) => onFontSizeChange(value, 'title')}
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="author-text" className="mb-2">Author</Label>
          <Input
            id="author-text"
            value={coverData.authorText || ""}
            onChange={(e) => onTextChange(e, 'author')}
            placeholder="Enter author name"
          />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label htmlFor="author-size">Author Size: {coverData.authorSize}px</Label>
          </div>
          <Slider
            id="author-size"
            defaultValue={[coverData.authorSize || 14]}
            min={10}
            max={24}
            step={1}
            onValueChange={(value) => onFontSizeChange(value, 'author')}
          />
        </div>
      </div>
    </div>
  );
};

export default TextTab;
