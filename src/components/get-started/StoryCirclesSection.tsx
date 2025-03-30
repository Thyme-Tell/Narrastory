
import React from "react";
import { Calendar, Users, MessageSquare, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { useLumaEvents } from "@/hooks/useLumaEvents";
import LumaEventAccordionItem from "./LumaEventAccordionItem";
import LumaEventCard from "./LumaEventCard";

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
        <h2 className="text-3xl md:text-4xl font-caslon font-thin text-[#242F3F] mb-6 text-center">
          Narra Story Circles
        </h2>
        <p className="text-center text-[#403E43] mb-12 max-w-2xl mx-auto">
          Narra Story Circles are laid-back virtual meetups where we swap stories. Drop by, speak up, and connect. Simple as that. Facilitated by Richard Squires, author of 60+ memoirs who knows how to get good stories flowing.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Event Cards */}
          {isLoading ? (
            <div className="flex justify-center items-center p-8 rounded-[15px] bg-white/50 col-span-1 md:col-span-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#674019]"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 px-4 rounded-[15px] bg-white/50 col-span-1 md:col-span-2">
              <p className="text-[#674019] mb-2">Unable to load upcoming events</p>
              <Button 
                variant="outline"
                onClick={() => window.location.reload()}
                size="sm"
                className="border-[#674019] text-[#674019]"
              >
                Try Again
              </Button>
            </div>
          ) : events && events.length > 0 ? (
            <>
              {/* Desktop view: show cards in two columns */}
              <div className="hidden md:grid md:grid-cols-2 gap-8 col-span-2">
                {events.slice(0, 4).map((event) => (
                  <LumaEventCard key={event.id} event={event} />
                ))}
              </div>
              
              {/* Mobile view: show accordion */}
              <div className="md:hidden col-span-1">
                <Accordion type="single" collapsible className="w-full">
                  {events.slice(0, 3).map((event, index) => (
                    <LumaEventAccordionItem key={event.id} event={event} index={index} />
                  ))}
                </Accordion>
              </div>
            </>
          ) : (
            <div className="text-center py-12 px-4 rounded-[15px] bg-gradient-to-b from-[#F8E3C8] to-[#FBEFE1] col-span-1 md:col-span-2">
              <Calendar className="h-12 w-12 text-[#674019]/50 mx-auto mb-4" />
              <p className="text-[#674019] mb-2 font-caslon text-2xl">No upcoming events at the moment</p>
              <p className="text-[#674019]/60 mb-4">Check back soon for new story circles</p>
            </div>
          )}
          
          {events && events.length > 0 && (
            <div className="text-center mt-6 col-span-1 md:col-span-2">
              <Button 
                variant="outline"
                onClick={() => window.open("https://lu.ma/calendar/cal-Z2lF71wpLrO7F5C", "_blank")}
                className="border-[#674019] text-[#674019] hover:bg-[#674019]/10 rounded-full"
              >
                View All Upcoming Events
              </Button>
            </div>
          )}
          
          {/* Create Your Own Circle card */}
          <div className="bg-gradient-to-b from-[#F8E3C8] to-[#FBEFE1] rounded-[15px] p-6 shadow-sm col-span-1 md:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[32px] font-caslon font-normal text-[#674019]">Create Your Own Circle</h3>
              <div className="bg-white text-[#674019] text-sm font-medium py-1 px-3 rounded-full">Coming Soon</div>
            </div>
            <p className="text-[#674019]/80 mb-4 text-lg">
              Start your own Story Circle with family, friends, or colleagues. 
              Choose your topics, invite participants, and build a collection of stories that matter to you.
            </p>
            <Button
              className="w-full bg-white/80 text-[#674019]/40 cursor-not-allowed rounded-[50px] text-lg py-6"
              disabled
            >
              Create a Circle
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoryCirclesSection;
