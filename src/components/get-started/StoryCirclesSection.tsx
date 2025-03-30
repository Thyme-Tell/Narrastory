
import React from "react";
import { Calendar, Users, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { useLumaEvents } from "@/hooks/useLumaEvents";
import LumaEventAccordionItem from "./LumaEventAccordionItem";

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
          Join a community where stories flourish. Share, connect, and preserve memories together.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Left Column - Collapsible Events */}
          <div className="bg-white rounded-[2px] overflow-hidden border border-[#E5E7EB] shadow-sm">
            <div className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A33D29]"></div>
                </div>
              ) : error ? (
                <div className="text-center py-8 px-4">
                  <p className="text-[#A33D29] mb-2">Unable to load upcoming events</p>
                  <Button 
                    variant="outline"
                    onClick={() => window.location.reload()}
                    size="sm"
                  >
                    Try Again
                  </Button>
                </div>
              ) : events && events.length > 0 ? (
                <Accordion type="single" collapsible>
                  {events.slice(0, 3).map((event, index) => (
                    <LumaEventAccordionItem key={event.id} event={event} index={index} />
                  ))}
                </Accordion>
              ) : (
                <div className="text-center py-12 px-4">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No upcoming events at the moment</p>
                  <p className="text-sm text-gray-400 mb-4">Check back soon for new story circles</p>
                </div>
              )}
            </div>
            
            {events && events.length > 0 && (
              <div className="p-4 text-center border-t border-[#E5E7EB]">
                <Button 
                  variant="outline"
                  onClick={() => window.open("https://lu.ma/calendar/cal-Z2lF71wpLrO7F5C", "_blank")}
                  className="w-full md:w-auto text-sm"
                >
                  View All Events
                </Button>
              </div>
            )}
          </div>
          
          {/* Right Column - Only Create Your Own Circle card now */}
          <div className="space-y-6">
            <div className="bg-white rounded-[2px] p-6 border border-[#E5E7EB] shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-medium text-[#242F3F]">Create Your Own Circle</h3>
                <div className="bg-[#F6F8FA] text-[#A33D29] text-xs font-medium py-1 px-2 rounded">Coming Soon</div>
              </div>
              <p className="text-[#403E43] mb-4">
                Start your own Story Circle with family, friends, or colleagues. 
                Choose your topics, invite participants, and build a collection of stories that matter to you.
              </p>
              <Button
                className="w-full bg-gray-200 text-gray-500 cursor-not-allowed"
                disabled
              >
                Create a Circle
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoryCirclesSection;
