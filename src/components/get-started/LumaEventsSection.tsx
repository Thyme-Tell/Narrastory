
import React from "react";
import { useLumaEvents } from "@/hooks/useLumaEvents";
import LumaEventCard from "./LumaEventCard";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar, RefreshCw } from "lucide-react";

const LumaEventsSection: React.FC = () => {
  const { events, isLoading, error, refetch } = useLumaEvents();
  
  // Handle error state
  if (error) {
    return (
      <div className="mt-12">
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error loading events</AlertTitle>
          <AlertDescription>
            We couldn't load the upcoming story circles. Please try again later.
          </AlertDescription>
        </Alert>
        <Button 
          variant="outline" 
          onClick={() => refetch()} 
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div className="mt-12 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 rounded-xl h-72 opacity-40"></div>
          ))}
        </div>
      </div>
    );
  }

  // Handle empty state
  if (events.length === 0) {
    return (
      <div className="mt-12 text-center p-8 bg-[#F6F6F7] rounded-xl">
        <Calendar className="h-12 w-12 mx-auto text-[#A33D29] mb-4" />
        <h3 className="text-xl font-caslon font-thin mb-2 text-[#242F3F]">
          No Upcoming Events
        </h3>
        <p className="text-[#403E43] mb-4">
          We don't have any scheduled story circles at the moment. Check back soon!
        </p>
      </div>
    );
  }

  // Normal state with events
  return (
    <div className="mt-12">
      <h3 className="text-xl md:text-2xl font-caslon font-thin mb-6 text-[#242F3F]">
        Upcoming Story Circles
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {events.map((event) => (
          <LumaEventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
};

export default LumaEventsSection;
