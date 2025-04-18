import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BackgroundTab from "./BackgroundTab";
import TextTab from "./TextTab";
import LayoutTab from "./LayoutTab";
import { CoverData, BackgroundType, DropzoneProps } from "../CoverTypes";
import { useIsMobile } from "@/hooks/use-mobile";

interface EditorControlPanelProps {
  coverData: CoverData;
  onSave: () => void;
  onCancel: () => void;
  onBackgroundColorChange: (color: string) => void;
  onBackgroundTypeChange: (type: BackgroundType) => void;
  onRemoveImage: () => void;
  onUploadImage: (imageUrl: string) => void;
  isUploading: boolean;
  onTextChange: (e: React.ChangeEvent<HTMLInputElement>, type: 'title' | 'author') => void;
  onTextColorChange: (color: string, type: 'title' | 'author') => void;
  onFontSizeChange: (value: number[], type: 'title' | 'author') => void;
  onLayoutChange: (layout: 'centered' | 'top' | 'bottom') => void;
  dropzoneProps: DropzoneProps;
}

const EditorControlPanel = ({
  coverData,
  onSave,
  onCancel,
  onBackgroundColorChange,
  onBackgroundTypeChange,
  onRemoveImage,
  onUploadImage,
  isUploading,
  onTextChange,
  onTextColorChange,
  onFontSizeChange,
  onLayoutChange,
  dropzoneProps,
}: EditorControlPanelProps) => {
  const [activeTab, setActiveTab] = useState("text");
  const isMobile = useIsMobile();

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header with tabs */}
      <div className="px-4 pt-4 pb-2 border-b">
        <h2 className="text-lg font-semibold mb-3">Edit Cover</h2>
        <Tabs 
          defaultValue="text" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="text">Text</TabsTrigger>
            <TabsTrigger value="background">Background</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Content area - scrollable */}
      <div className={`flex-1 overflow-y-auto px-4 py-4 ${isMobile ? 'pb-24' : ''}`}>
        {activeTab === "background" && (
          <BackgroundTab
            coverData={coverData}
            onBackgroundColorChange={onBackgroundColorChange}
            onBackgroundTypeChange={onBackgroundTypeChange}
            onRemoveImage={onRemoveImage}
            onUploadImage={onUploadImage}
            dropzoneProps={dropzoneProps}
          />
        )}
        
        {activeTab === "text" && (
          <TextTab
            coverData={coverData}
            onTextChange={onTextChange}
            onFontSizeChange={onFontSizeChange}
            onTextColorChange={onTextColorChange}
          />
        )}
        
        {activeTab === "layout" && (
          <LayoutTab
            coverData={coverData}
            onLayoutChange={onLayoutChange}
          />
        )}
      </div>
      
      {/* Fixed footer with actions - always visible */}
      <div className="px-4 py-3 flex justify-end gap-2 border-t mt-auto bg-white fixed bottom-0 left-0 right-0 z-50 shadow-md">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSave}>
          Save Cover
        </Button>
      </div>
    </div>
  );
};

export default EditorControlPanel;
