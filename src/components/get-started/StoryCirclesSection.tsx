
import React from "react";
import { Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLumaEvents } from "@/hooks/useLumaEvents";
import LumaEventCard from "./LumaEventCard";
import { Card } from "@/components/ui/card";

interface StoryCirclesSectionProps {
  storyCirclesRef: React.RefObject<HTMLElement>;
}

const StoryCirclesSection: React.FC<StoryCirclesSectionProps> = ({ storyCirclesRef }) => {
  const { events, isLoading, error } = useLumaEvents();

  return (
    <section 
      ref={storyCirclesRef as React.RefObject<HTMLElement>}
      id="join-story-circle"
      className="container mx-auto px-4 py-16 md:py-24 scroll-mt-24 bg-transparent"
    >
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-caslon font-thin text-[#242F3F] mb-12 md:mb-16 text-center">
          Narra Story Circles
        </h2>
        <p className="text-center text-[#403E43] mb-12 max-w-2xl mx-auto text-sm md:text-base">
          Narra Story Circles are laid-back virtual meetups where we swap stories. Drop by, speak up, and connect. Simple as that. Facilitated by Richard Squires, author of 60+ memoirs who knows how to get good stories flowing.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Display a 2x2 grid of cards */}
          {isLoading ? (
            // Loading placeholders - 2x2 grid
            Array(4).fill(0).map((_, index) => (
              <div key={`loading-${index}`} className="flex justify-center items-center p-8 rounded-[4px] bg-white/50 h-[340px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#674019]"></div>
              </div>
            ))
          ) : error ? (
            // Error state - still maintain grid layout
            <div className="col-span-1 md:col-span-2 text-center py-8 px-4 rounded-[4px] bg-white/50">
              <p className="text-[#674019] mb-2 text-sm">Unable to load upcoming events</p>
              <Button 
                variant="outline"
                onClick={() => window.location.reload()}
                size="sm"
                className="border-[#674019] text-[#674019]"
              >
                Try Again
              </Button>
            </div>
          ) : (
            // Successful events load
            <>
              {/* First 3 event cards */}
              {events && events.length > 0 ? (
                events.slice(0, 3).map((event) => (
                  <LumaEventCard key={event.id} event={event} />
                ))
              ) : (
                // No events placeholder - maintain grid layout
                <div className="col-span-1 md:col-span-2 text-center py-12 px-4 rounded-[4px] bg-gradient-to-b from-[#F8E3C8] to-[#FBEFE1]">
                  <Calendar className="h-8 w-8 text-[#674019]/50 mx-auto mb-4" />
                  <p className="text-[#674019] mb-2 font-caslon text-xl">No upcoming events at the moment</p>
                  <p className="text-[#674019]/60 mb-4 text-sm">Check back soon for new story circles</p>
                </div>
              )}
              
              {/* Create Your Own Circle card - always show in the grid */}
              {events && events.length > 0 && (
                <Card className="bg-gradient-to-b from-[#E4C795] to-[#EBE5D3] rounded-[4px] p-6 shadow-sm h-full border-0 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl md:text-2xl font-caslon font-normal text-[#674019]">Create Your Own Circle</h3>
                      <div className="bg-white text-[#674019] text-xs font-medium py-1 px-3 rounded-full">Coming Soon</div>
                    </div>
                    <p className="text-[#674019]/80 mb-4 text-sm md:text-base">
                      Start your own Story Circle with family, friends, or colleagues. 
                      Choose your topics, invite participants, and build a collection of stories that matter to you.
                    </p>
                  </div>
                  <Button
                    className="w-full bg-white/80 text-[#674019]/40 cursor-not-allowed rounded-[50px] text-sm md:text-base py-5 mt-auto"
                    disabled
                  >
                    Create a Circle
                  </Button>
                </Card>
              )}
            </>
          )}
          
          {/* View all events button - only show when we have events */}
          {events && events.length > 0 && (
            <div className="col-span-1 md:col-span-2 text-center mt-6">
              <Button 
                variant="outline"
                onClick={() => window.open("https://lu.ma/calendar/cal-Z2lF71wpLrO7F5C", "_blank")}
                className="border-[#674019] text-[#674019] hover:bg-[#674019]/10 rounded-full text-sm"
              >
                View All Upcoming Events
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default StoryCirclesSection;
