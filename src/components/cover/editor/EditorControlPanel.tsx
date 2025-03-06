
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
    <div className={`${isMobile ? "w-full" : "w-1/3 border-r"} p-4 overflow-y-auto relative`}>
      <h2 className="text-xl font-semibold mb-4">Edit Book Cover</h2>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-4">
          <TabsTrigger value="background" className="flex-1">Background</TabsTrigger>
          <TabsTrigger value="text" className="flex-1">Text</TabsTrigger>
          <TabsTrigger value="layout" className="flex-1">Layout</TabsTrigger>
        </TabsList>
        
        <TabsContent value="background">
          <BackgroundTab
            coverData={coverData}
            onBackgroundColorChange={onBackgroundColorChange}
            onFileUpload={onFileUpload}
            onRemoveImage={onRemoveImage}
            isUploading={isUploading}
          />
        </TabsContent>
        
        <TabsContent value="text">
          <TextTab
            coverData={coverData}
            onTextChange={onTextChange}
            onTextColorChange={onTextColorChange}
            onFontSizeChange={onFontSizeChange}
          />
        </TabsContent>
        
        <TabsContent value="layout">
          <LayoutTab
            coverData={coverData}
            onLayoutChange={onLayoutChange}
          />
        </TabsContent>
      </Tabs>
      
      <div className={`${isMobile ? "fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg" : "absolute bottom-4 left-4 right-4"} flex justify-end gap-2`}>
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
