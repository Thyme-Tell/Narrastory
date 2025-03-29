
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchLumaEvents } from "@/services/lumaEvents";
import LumaEventCard from "./LumaEventCard";
import { Button } from "@/components/ui/button";

const LumaEventsSection = () => {
  const { data: events, isLoading, error } = useQuery({
    queryKey: ['lumaEvents'],
    queryFn: fetchLumaEvents,
  });

  return (
    <div className="mt-16 bg-[#F6F6F7] rounded-xl p-6 md:p-8">
      <h3 className="text-xl md:text-2xl font-caslon font-thin mb-4 text-[#242F3F] text-center">
        Upcoming Story Circles
      </h3>
      
      {isLoading ? (
        <div className="text-center py-8">Loading events...</div>
      ) : error ? (
        <div className="text-center py-8 text-[#A33D29]">
          Unable to load events. Please try again later.
        </div>
      ) : events && events.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 mt-4">
          {events.slice(0, 3).map((event) => (
            <LumaEventCard key={event.id} event={event} />
          ))}
          
          <div className="text-center mt-6">
            <Button 
              className="bg-[#242F3F] hover:bg-[#242F3F]/90 text-white"
              onClick={() => window.open("https://lu.ma/narra", "_blank")}
            >
              View All Events
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          No upcoming events at the moment. Check back soon!
        </div>
      )}
    </div>
  );
};

export default LumaEventsSection;
