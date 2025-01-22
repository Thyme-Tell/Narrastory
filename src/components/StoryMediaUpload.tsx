import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface StoryMediaUploadProps {
  storyId: string;
  onUploadComplete?: () => void;
}

const StoryMediaUpload = ({ storyId, onUploadComplete }: StoryMediaUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploading(true);

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('story-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create media record in database
      const { error: dbError } = await supabase
        .from('story_media')
        .insert({
          story_id: storyId,
          file_path: filePath,
          file_name: file.name,
          content_type: file.type,
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Media uploaded successfully",
      });

      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error('Error uploading media:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload media",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex justify-center mb-5 mt-[20px]">
      <input
        type="file"
        id="media"
        className="hidden"
        onChange={handleFileUpload}
        accept="image/*,video/*,audio/*"
        disabled={uploading}
      />
      <label htmlFor="media">
        <Button
          variant="outline"
          className="cursor-pointer"
          disabled={uploading}
          asChild
        >
          <span>
            {uploading ? "Uploading..." : "Add Photos and Videos"}
          </span>
        </Button>
      </label>
    </div>
  );
};

export default StoryMediaUpload;