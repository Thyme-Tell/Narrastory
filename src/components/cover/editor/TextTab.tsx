
import React from 'react';
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { TextTabProps } from '../CoverTypes';

const TITLE_MAX_LENGTH = 40;
const AUTHOR_MAX_LENGTH = 20;

const TextTab = ({ 
  coverData, 
  onTextChange, 
  onFontSizeChange 
}: TextTabProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label htmlFor="title-text">Title</Label>
            <span className="text-xs text-muted-foreground">
              {(coverData.titleText?.length || 0)}/{TITLE_MAX_LENGTH}
            </span>
          </div>
          <Input
            id="title-text"
            value={coverData.titleText || ""}
            onChange={(e) => {
              if (e.target.value.length <= TITLE_MAX_LENGTH) {
                onTextChange(e, 'title');
              }
            }}
            maxLength={TITLE_MAX_LENGTH}
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
          <div className="flex justify-between items-center mb-2">
            <Label htmlFor="author-text">Author</Label>
            <span className="text-xs text-muted-foreground">
              {(coverData.authorText?.length || 0)}/{AUTHOR_MAX_LENGTH}
            </span>
          </div>
          <Input
            id="author-text"
            value={coverData.authorText || ""}
            onChange={(e) => {
              if (e.target.value.length <= AUTHOR_MAX_LENGTH) {
                onTextChange(e, 'author');
              }
            }}
            maxLength={AUTHOR_MAX_LENGTH}
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
