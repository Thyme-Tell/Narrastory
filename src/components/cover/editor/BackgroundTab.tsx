import { Check, Image as ImageIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { BackgroundTabProps } from "../CoverTypes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

const BACKGROUND_COLORS = [
  "#CADCDA", "#EEDED2", "#ECDDC3"
];

const BackgroundTab = ({
  coverData,
  onBackgroundColorChange,
  onBackgroundTypeChange,
  onRemoveImage,
  onUploadImage
}: BackgroundTabProps) => {
  const handleDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onUploadImage(reader.result);
        }
      };
      
      reader.readAsDataURL(file);
    }
  }, [onUploadImage]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    onDrop: handleDrop
  });

  return (
    <div className="space-y-8">
      <Tabs 
        defaultValue={coverData.backgroundType} 
        onValueChange={(value) => onBackgroundTypeChange(value as 'color' | 'image')}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="color">Color</TabsTrigger>
          <TabsTrigger value="image">Image</TabsTrigger>
        </TabsList>

        <TabsContent value="color" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="image" className="space-y-4">
          {coverData.backgroundImage ? (
            <div>
              <Label className="block mb-2">Current Image</Label>
              <div className="flex gap-3 mb-4">
                <button 
                  className="flex-1 h-10 px-4 py-2 bg-destructive text-destructive-foreground rounded-md text-sm font-medium"
                  onClick={onRemoveImage}
                >
                  Remove Image
                </button>
                <div 
                  {...getRootProps()}
                  className="flex-1 h-10 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium flex items-center justify-center cursor-pointer"
                >
                  <input {...getInputProps()} />
                  Replace Image
                </div>
              </div>
              <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden">
                <img 
                  src={coverData.backgroundImage} 
                  alt="Cover background" 
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary bg-primary/10' : 'border-muted'
              }`}
            >
              <input {...getInputProps()} />
              <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                {isDragActive
                  ? "Drop the image here"
                  : "Drag and drop an image here, or click to select"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Supports: JPG, PNG, WebP
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BackgroundTab;
