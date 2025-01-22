import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface StoryMediaProps {
  storyId: string;
}

const StoryMedia = ({ storyId }: StoryMediaProps) => {
  const { data: mediaItems } = useQuery({
    queryKey: ["story-media", storyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("story_media")
        .select("*")
        .eq("story_id", storyId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (!mediaItems?.length) return null;

  return (
    <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {mediaItems.map((media) => {
        const { data } = supabase.storage
          .from("story-media")
          .getPublicUrl(media.file_path);

        if (media.content_type.startsWith("image/")) {
          return (
            <img
              key={media.id}
              src={data.publicUrl}
              alt={media.file_name}
              className="rounded-lg object-cover aspect-square w-full"
            />
          );
        }

        // For other media types, show a placeholder with filename
        return (
          <div
            key={media.id}
            className="rounded-lg bg-muted p-4 flex items-center justify-center aspect-square"
          >
            <a
              href={data.publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-center break-words hover:underline"
            >
              {media.file_name}
            </a>
          </div>
        );
      })}
    </div>
  );
};

export default StoryMedia;