
import React, { useState } from "react";
import { Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLumaEvents } from "@/hooks/useLumaEvents";
import LumaEventCard from "./LumaEventCard";
import { Card } from "@/components/ui/card";
import SeniorLivingDialog from "./SeniorLivingDialog";

interface StoryCirclesSectionProps {
  storyCirclesRef: React.RefObject<HTMLElement>;
}

const StoryCirclesSection: React.FC<StoryCirclesSectionProps> = ({ storyCirclesRef }) => {
  const { events, isLoading, error } = useLumaEvents();
  const [isSeniorLivingDialogOpen, setSeniorLivingDialogOpen] = useState(false);

  return (
    <section 
      ref={storyCirclesRef as React.RefObject<HTMLElement>}
      id="join-story-circle"
      className="container mx-auto px-4 py-16 md:py-24 scroll-mt-24 bg-transparent"
    >
      <div className="max-w-5xl mx-auto">
        {/* Temporarily commented out Narra Story Circles section */}
        {/* <h2 className="text-3xl md:text-4xl font-caslon font-thin text-[#242F3F] mb-6 md:mb-6 text-center">
          Narra Story Circles
        </h2>
        <p className="text-center text-[#403E43] mb-12 max-w-2xl mx-auto text-sm md:text-base">
          Narra Story Circles are laid-back virtual meetups where we swap stories. Drop by, speak up, and connect. Simple as that. Facilitated by Richard Squires, author of 60+ memoirs, who knows how to get good stories flowing.
        </p>
        
        First row - 3 events 
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {isLoading ? (
            // Loading placeholders - 3 cards in the first row
            Array(3).fill(0).map((_, index) => (
              <div key={`loading-${index}`} className="flex justify-center items-center p-8 rounded-[4px] bg-white/50 h-[340px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#674019]"></div>
              </div>
            ))
          ) : error ? (
            // Error state - full width
            <div className="col-span-1 md:col-span-3 text-center py-8 px-4 rounded-[4px] bg-white/50">
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
            // Show up to 3 events in the first row
            <>
              {events && events.length > 0 ? (
                events.slice(0, 3).map((event) => (
                  <LumaEventCard key={event.id} event={event} />
                ))
              ) : (
                // No events placeholder - full width
                <div className="col-span-1 md:col-span-3 text-center py-12 px-4 rounded-[4px] bg-gradient-to-b from-[#F8E3C8] to-[#FBEFE1]">
                  <Calendar className="h-8 w-8 text-[#674019]/50 mx-auto mb-4" />
                  <p className="text-[#674019] mb-2 font-caslon text-xl">No upcoming events at the moment</p>
                  <p className="text-[#674019]/60 mb-4 text-sm">Check back soon for new story circles</p>
                </div>
              )}
            </>
          )}
        </div> */}
        
        {/* Second row - For Senior Living Communities */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
          {/* For Senior Living Communities */}
          <Card 
            className="bg-gradient-to-b from-[#F8E3C8] to-[#FBEFE1] rounded-[4px] p-6 shadow-sm h-full border-0 flex flex-col justify-between cursor-pointer hover:shadow-md transition-all"
            onClick={() => setSeniorLivingDialogOpen(true)}
          >
            <div className="flex flex-col h-full">
              <div className="flex-grow">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl md:text-2xl font-caslon font-normal text-[#674019]">For Senior Living Communities</h3>
                </div>
                <div className="bg-white text-[#A33D29] text-xs font-medium py-1 px-3 rounded-full w-fit mb-6">Special Programs</div>
                
                <p className="text-[#674019]/80 mb-4 text-sm md:text-base">
                  Enable your residents to write their memoirs without the hurdles of using technology. 
                  With Narra, their voice is all they need.
                </p>
              </div>
              
              <div className="mt-auto pt-6">
                <Button
                  className="w-full bg-white text-[#A33D29] hover:bg-white/90 rounded-[50px] text-sm md:text-base py-5"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSeniorLivingDialogOpen(true);
                  }}
                >
                  <Users className="mr-2 h-5 w-5" />
                  Learn More
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Senior Living Dialog */}
      <SeniorLivingDialog 
        open={isSeniorLivingDialogOpen} 
        onOpenChange={setSeniorLivingDialogOpen} 
      />
    </section>
  );
};

export default StoryCirclesSection;
