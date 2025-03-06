
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BackgroundTab from "./BackgroundTab";
import TextTab from "./TextTab";
import LayoutTab from "./LayoutTab";
import { CoverData } from "../CoverTypes";
import { useIsMobile } from "@/hooks/use-mobile";

interface EditorControlPanelProps {
  coverData: CoverData;
  onSave: () => void;
  onCancel: () => void;
  onBackgroundColorChange: (color: string) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  isUploading: boolean;
  onTextChange: (e: React.ChangeEvent<HTMLInputElement>, type: 'title' | 'author') => void;
  onTextColorChange: (color: string, type: 'title' | 'author') => void;
  onFontSizeChange: (value: number[], type: 'title' | 'author') => void;
  onLayoutChange: (layout: 'centered' | 'top' | 'bottom') => void;
}

const EditorControlPanel = ({
  coverData,
  onSave,
  onCancel,
  onBackgroundColorChange,
  onFileUpload,
  onRemoveImage,
  isUploading,
  onTextChange,
  onTextColorChange,
  onFontSizeChange,
  onLayoutChange,
}: EditorControlPanelProps) => {
  const [activeTab, setActiveTab] = useState("background");
  const isMobile = useIsMobile();

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header with tabs */}
      <div className="px-4 pt-4 pb-2 border-b">
        <h2 className="text-lg font-semibold mb-3">Edit Cover</h2>
        <Tabs 
          defaultValue="background" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="background">Background</TabsTrigger>
            <TabsTrigger value="text">Text</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
          </TabsList>
        
          {/* Content area - scrollable, adjusted for more space */}
          <div className={`overflow-y-auto px-4 py-4 ${isMobile ? 'max-h-[calc(75vh-120px)]' : 'h-[calc(90vh-180px)]'}`}>
            <TabsContent value="background" className="m-0 h-auto">
              <BackgroundTab
                coverData={coverData}
                onBackgroundColorChange={onBackgroundColorChange}
                onFileUpload={onFileUpload}
                onRemoveImage={onRemoveImage}
                isUploading={isUploading}
              />
            </TabsContent>
            
            <TabsContent value="text" className="m-0 h-auto">
              <TextTab
                coverData={coverData}
                onTextChange={onTextChange}
                onTextColorChange={onTextColorChange}
                onFontSizeChange={onFontSizeChange}
              />
            </TabsContent>
            
            <TabsContent value="layout" className="m-0 h-auto">
              <LayoutTab
                coverData={coverData}
                onLayoutChange={onLayoutChange}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
      
      {/* Fixed footer with actions */}
      <div className="px-4 py-3 flex justify-end gap-2 border-t mt-auto">
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
