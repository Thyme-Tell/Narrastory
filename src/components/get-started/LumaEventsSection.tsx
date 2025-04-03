
import React, { useEffect } from "react";
import { useLumaEvents } from "@/hooks/useLumaEvents";
import { format, parseISO } from "date-fns";
import { Calendar, Users, Video, Link, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const LumaEventsSection = () => {
  const { events, isLoading, error, refetch } = useLumaEvents();

  // Add more detailed logging
  useEffect(() => {
    console.log('Luma Events:', {
      events,
      isLoading,
      error,
      count: events?.length || 0,
      isMockData: events?.[0]?.id === 'evt-1'
    });
  }, [events, isLoading, error]);

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A33D29]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 px-4">
        <p className="text-[#A33D29] mb-2">Unable to load upcoming events</p>
        <p className="text-sm text-gray-600 mb-4">{error.toString()}</p>
        <Button 
          variant="outline"
          onClick={handleRefresh}
          size="sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 mb-2">No upcoming events at the moment</p>
        <p className="text-sm text-gray-400 mb-4">Check back soon for new story circles</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={() => window.open("https://lu.ma/narra", "_blank")}
            variant="outline"
          >
            Visit Luma Calendar
          </Button>
          <Button 
            onClick={handleRefresh}
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-2">
        <Button 
          onClick={handleRefresh} 
          variant="ghost" 
          size="sm" 
          className="text-gray-500"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>
      <div className="divide-y divide-[#E5E7EB]">
        {events.slice(0, 3).map((event) => {
          const eventDate = parseISO(event.startDate);
          const formattedDate = format(eventDate, "EEE, MMM d");
          const formattedTime = format(eventDate, "h:mm a");
          
          return (
            <div key={event.id} className="p-4 hover:bg-[#F9F5F2] transition-colors">
              <div className="flex flex-col md:flex-row md:items-center">
                {/* Date column */}
                <div className="md:w-1/5 mb-3 md:mb-0">
                  <div className="bg-white p-2 rounded-lg border border-[#E5E7EB] inline-block text-center min-w-[80px]">
                    <div className="text-[#A33D29] font-medium">
                      {format(eventDate, "MMM")}
                    </div>
                    <div className="text-2xl font-bold text-[#242F3F]">
                      {format(eventDate, "dd")}
                    </div>
                  </div>
                </div>
                
                {/* Event details */}
                <div className="md:w-3/5 mb-3 md:mb-0">
                  <h4 className="font-medium text-[#242F3F] text-lg">{event.title}</h4>
                  <div className="text-sm text-gray-500 mt-1 flex items-center">
                    <Calendar className="inline h-4 w-4 mr-1 text-[#A33D29]" /> 
                    {formattedDate} • {formattedTime}
                  </div>
                  <div className="text-sm text-gray-500 mt-1 flex items-center">
                    <Video className="inline h-4 w-4 mr-1 text-[#A33D29]" /> 
                    {event.location}
                  </div>
                  
                  {/* Attendees preview (mock data) */}
                  <div className="flex items-center mt-2">
                    <div className="flex -space-x-2 mr-2">
                      <Avatar className="h-6 w-6 border-2 border-white">
                        <AvatarFallback>A</AvatarFallback>
                      </Avatar>
                      <Avatar className="h-6 w-6 border-2 border-white">
                        <AvatarFallback>B</AvatarFallback>
                      </Avatar>
                      <Avatar className="h-6 w-6 border-2 border-white">
                        <AvatarFallback>C</AvatarFallback>
                      </Avatar>
                    </div>
                    <span className="text-xs text-gray-500">
                      {event.spotsRemaining > 0 ? (
                        <span className="text-[#A33D29]">{event.spotsRemaining} spots left</span>
                      ) : (
                        "Sold out"
                      )}
                    </span>
                  </div>
                </div>
                
                {/* Action button */}
                <div className="md:w-1/5 flex justify-start md:justify-end">
                  <Button 
                    onClick={() => window.open(event.registrationUrl, "_blank")}
                    disabled={event.spotsRemaining <= 0}
                    className={event.spotsRemaining > 0 ? "bg-[#242F3F]" : "bg-gray-300"}
                    size="sm"
                  >
                    {event.spotsRemaining > 0 ? "Register" : "Sold Out"}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
        
        {events.length > 0 && (
          <div className="p-4 text-center">
            <Button 
              variant="outline"
              onClick={() => window.open("https://lu.ma/narra", "_blank")}
              className="w-full md:w-auto"
            >
              View All Events <Link className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LumaEventsSection;
