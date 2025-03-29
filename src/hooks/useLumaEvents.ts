
import { useQuery } from "@tanstack/react-query";
import { fetchLumaEvents, LumaEvent } from "@/services/lumaEvents";
import { toast } from "@/hooks/use-toast";

export function useLumaEvents() {
  const { 
    data: events, 
    isLoading, 
    error, 
    refetch,
    isError
  } = useQuery({
    queryKey: ["lumaEvents"],
    queryFn: async () => {
      try {
        const result = await fetchLumaEvents();
        console.log("Events fetched successfully:", result);
        return result;
      } catch (err) {
        console.error("Error in queryFn:", err);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: (attempt) => Math.min(attempt > 1 ? 2000 : 1000, 30 * 1000),
    meta: {
      onError: (error: Error) => {
        console.error("Failed to fetch Luma events:", error);
        toast({
          title: "Error loading events",
          description: "We couldn't load the upcoming story circles. Please try again later.",
          variant: "destructive",
        });
      }
    }
  });

  return {
    events: events || [],
    isLoading,
    error,
    isError,
    refetch
  };
}
