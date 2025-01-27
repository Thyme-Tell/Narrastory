import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface BookProgressProps {
  profileId: string;
}

const BookProgress = ({ profileId }: BookProgressProps) => {
  const { data: stories } = useQuery({
    queryKey: ["stories", profileId],
    queryFn: async () => {
      const { data: storiesData, error: storiesError } = await supabase
        .from("stories")
        .select("content")
        .eq("profile_id", profileId);

      if (storiesError) {
        console.error("Error fetching stories:", storiesError);
        return [];
      }

      return storiesData;
    },
  });

  const calculatePages = (stories: { content: string }[] | undefined) => {
    if (!stories) return 0;
    
    const totalCharacters = stories.reduce((acc, story) => {
      return acc + (story.content?.length || 0);
    }, 0);

    // Using 1500 characters per page as a conservative estimate
    return Math.ceil(totalCharacters / 1500);
  };

  const currentPages = calculatePages(stories);
  const requiredPages = 25;
  const remainingPages = Math.max(0, requiredPages - currentPages);

  return (
    <div className="mb-6 rounded-lg bg-white/50 p-6 shadow-sm">
      <div className="flex items-center gap-6">
        <img
          src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets/hand-heart.png?t=2025-01-27T11%3A17%3A37.419Z"
          alt="Hand holding a heart"
          className="h-16 w-16 object-contain"
        />
        <div>
          <h2 className="text-xl font-semibold text-atlantic mb-2">Keep it up!</h2>
          <p className="text-atlantic">
            You have {currentPages} {currentPages === 1 ? 'page' : 'pages'} in your book.
            {remainingPages > 0 ? (
              ` You need ${remainingPages} more ${remainingPages === 1 ? 'page' : 'pages'} to order your book.`
            ) : (
              " You have enough pages to order your book!"
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookProgress;