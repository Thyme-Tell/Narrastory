
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useQueryClient } from "@tanstack/react-query";

interface StoryMediaUploadProps {
  storyId: string;
  onUploadComplete?: () => void;
}

interface StoryMedia {
  id: string;
  story_id: string;
  file_path: string;
  file_name: string;
  content_type: string;
  created_at: string;
  caption: string | null;
}

const StoryMediaUpload = ({ storyId, onUploadComplete }: StoryMediaUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploading(true);
      setProgress(0);

      // Check if user is authenticated
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "You must be logged in to upload files",
        });
        setUploading(false);
        return;
      }

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      console.log('Uploading to story-media bucket:', filePath);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('story-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true, // Changed to true to allow overwriting
        });

      if (uploadError) {
        console.error('Storage upload error details:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful, file path:', filePath);
      
      // Set progress to 50% after storage upload
      setProgress(50);

      // Create media record in database with the specific story_id
      const { data: newMedia, error: dbError } = await supabase
        .from('story_media')
        .insert({
          story_id: storyId, // Ensure we're using the correct storyId
          file_path: filePath,
          file_name: file.name,
          content_type: file.type,
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error details:', dbError);
        throw dbError;
      }

      // Set progress to 100% after database update
      setProgress(100);

      // Get the current media items from the cache
      const previousData = queryClient.getQueryData<StoryMedia[]>(["story-media", storyId]) || [];

      // Update the cache with the new media item
      queryClient.setQueryData<StoryMedia[]>(["story-media", storyId], [newMedia, ...previousData]);

      toast({
        title: "Success",
        description: "Media uploaded successfully",
      });

      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error: any) {
      console.error('Error uploading media:', error);
      
      let errorMessage = "Failed to upload media";
      
      if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      
      if (error.statusCode) {
        errorMessage += ` (Status: ${error.statusCode})`;
      }
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-start mb-5 mt-[20px]">
        <input
          type="file"
          id={`media-${storyId}`} // Make the ID unique per story
          className="hidden"
          onChange={handleFileUpload}
          accept="image/*,video/*,audio/*"
          disabled={uploading}
        />
        <label htmlFor={`media-${storyId}`}>
          <Button
            variant="ghost"
            className="cursor-pointer text-[#A33D29] hover:text-[#A33D29]/90 hover:bg-transparent p-0"
            disabled={uploading}
            asChild
          >
            <span className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {uploading ? "Uploading..." : "Add Photos and Videos"}
            </span>
          </Button>
        </label>
      </div>
      {uploading && (
        <div className="space-y-2">
          <Progress value={progress} className="w-full h-2" />
          <p className="text-sm text-muted-foreground text-center">
            {Math.round(progress)}% uploaded
          </p>
        </div>
      )}
    </div>
  );
};

export default StoryMediaUpload;
