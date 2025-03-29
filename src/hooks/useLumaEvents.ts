
import { useQuery } from "@tanstack/react-query";
import { fetchLumaEvents, LumaEvent } from "@/services/lumaEvents";
import { toast } from "@/hooks/use-toast";

export function useLumaEvents() {
  const { 
    data: events, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ["lumaEvents"],
    queryFn: fetchLumaEvents,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    onError: (error) => {
      console.error("Failed to fetch Luma events:", error);
      toast({
        title: "Error loading events",
        description: "We couldn't load the upcoming story circles. Please try again later.",
        variant: "destructive",
      });
    }
  });

  return {
    events: events || [],
    isLoading,
    error,
    refetch
  };
}
