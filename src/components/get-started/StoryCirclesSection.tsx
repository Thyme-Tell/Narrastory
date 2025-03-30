
import React from "react";
import { Calendar, Users, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
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
      className="container mx-auto px-4 py-16 md:py-24 scroll-mt-24"
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
          <div className="bg-white rounded-xl overflow-hidden border border-[#E5E7EB] shadow-sm">
            <div className="flex items-center p-4 border-b border-[#E5E7EB]">
              <Calendar className="h-5 w-5 text-[#6366F1] mr-2" />
              <h3 className="text-lg md:text-xl font-medium text-[#242F3F]">
                Upcoming Story Circles
              </h3>
            </div>
            
            <div className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6366F1]"></div>
                </div>
              ) : error ? (
                <div className="text-center py-8 px-4">
                  <p className="text-red-500 mb-2">Unable to load upcoming events</p>
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
                  onClick={() => window.open("https://lu.ma/narra", "_blank")}
                  className="w-full md:w-auto text-sm"
                >
                  View All Events
                </Button>
              </div>
            )}
          </div>
          
          {/* Right Column - About Story Circles */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-[#E5E7EB] shadow-sm">
              <h3 className="text-xl font-medium mb-4 text-[#242F3F]">What are Story Circles?</h3>
              <p className="text-[#403E43] mb-4">
                Story Circles are intimate gatherings where people come together to share and preserve 
                their stories. These guided sessions create a supportive environment for storytelling, 
                memory sharing, and connection.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="flex items-start">
                  <div className="bg-[#EEF1FF] rounded-full p-2 mr-3 mt-1">
                    <Users className="h-4 w-4 text-[#6366F1]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-[#242F3F] text-sm">Community</h4>
                    <p className="text-xs text-gray-600">Connect with people who share your experiences</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-[#EEF1FF] rounded-full p-2 mr-3 mt-1">
                    <MessageSquare className="h-4 w-4 text-[#6366F1]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-[#242F3F] text-sm">Preservation</h4>
                    <p className="text-xs text-gray-600">Create lasting records of shared memories</p>
                  </div>
                </div>
              </div>
              <Button 
                className="w-full bg-[#6366F1] hover:bg-[#6366F1]/90 text-white"
                onClick={() => window.open("https://lu.ma/narra", "_blank")}
              >
                Join a Circle
              </Button>
            </div>
            
            <div className="bg-[#F7F9FF] rounded-xl p-6 border border-[#E5E7EB] shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-medium text-[#242F3F]">Create Your Own Circle</h3>
                <div className="bg-[#EEF1FF] text-[#6366F1] text-xs font-medium py-1 px-2 rounded">Coming Soon</div>
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
