
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchLumaEvents, LumaEvent } from "@/services/lumaEvents";
import { toast } from "@/hooks/use-toast";
import { useEffect } from "react";

export function useLumaEvents() {
  const queryClient = useQueryClient();
  
  // Force a cache invalidation when the component mounts
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["lumaEvents"] });
  }, [queryClient]);
  
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
        console.log("Executing Luma events query function");
        const result = await fetchLumaEvents();
        console.log("Events fetched successfully:", result);
        return result;
      } catch (err) {
        console.error("Error in queryFn:", err);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Reduced retries for faster feedback during debugging
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
