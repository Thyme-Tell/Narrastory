
import React from "react";
import { Calendar, Users, Video, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import LumaEventsSection from "./LumaEventsSection";
import { Badge } from "@/components/ui/badge";

interface StoryCirclesSectionProps {
  storyCirclesRef: React.RefObject<HTMLElement>;
}

const StoryCirclesSection: React.FC<StoryCirclesSectionProps> = ({ storyCirclesRef }) => {
  return (
    <section 
      ref={storyCirclesRef as React.RefObject<HTMLElement>}
      id="join-story-circle"
      className="container mx-auto px-4 py-16 md:py-24 bg-white scroll-mt-24"
    >
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-caslon font-thin text-[#242F3F] mb-6 text-center">
          Narra Story Circles
        </h2>
        <p className="text-center text-[#403E43] mb-12 max-w-2xl mx-auto">
          Join a community where stories flourish. Share, connect, and preserve memories together.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-[#F6F8FA] rounded-xl p-6 md:p-8 shadow-sm border border-[#E5E7EB] hover:shadow-md transition-shadow">
            <h3 className="text-xl md:text-2xl font-caslon font-thin mb-4 text-[#242F3F] flex items-center">
              <Users className="mr-2 h-5 w-5 text-[#A33D29]" />
              Join a Circle
            </h3>
            <p className="text-sm md:text-base text-[#403E43] mb-6">
              Connect with others who share your interests and experiences. Story Circles offer a supportive environment to share memories and create collective narratives.
            </p>
            <Button className="bg-[#242F3F] hover:bg-[#242F3F]/90 text-white">
              Find a Circle
            </Button>
          </div>
          
          <div className="bg-[#F6F8FA] rounded-xl p-6 md:p-8 shadow-sm border border-[#E5E7EB] hover:shadow-md transition-shadow">
            <h3 className="text-xl md:text-2xl font-caslon font-thin mb-4 text-[#242F3F] flex items-center">
              <MessageSquare className="mr-2 h-5 w-5 text-[#A33D29]" />
              Create a Circle
            </h3>
            <p className="text-sm md:text-base text-[#403E43] mb-6">
              Start your own Story Circle with family, friends, or colleagues. Customize topics and invite participants to build a shared story collection.
            </p>
            <Button className="bg-[#242F3F] hover:bg-[#242F3F]/90 text-white">
              Start a Circle
            </Button>
          </div>
        </div>
        
        {/* Calendar-style Events Section */}
        <div className="bg-[#F6F8FA] rounded-xl overflow-hidden border border-[#E5E7EB] mb-16">
          <div className="flex justify-between items-center p-4 border-b border-[#E5E7EB]">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-[#242F3F] mr-2" />
              <h3 className="text-lg md:text-xl font-caslon font-medium text-[#242F3F]">
                Upcoming Story Circles
              </h3>
            </div>
            <Button 
              variant="outline" 
              onClick={() => window.open("https://lu.ma/narra", "_blank")}
              className="text-sm"
            >
              See All
            </Button>
          </div>
          
          {/* We'll replace the existing LumaEventsSection with a redesigned implementation */}
          <LumaEventsSection />
        </div>
        
        <div className="bg-[#F6F8FA] rounded-xl p-6 md:p-8 border border-[#E5E7EB]">
          <h3 className="text-xl md:text-2xl font-caslon font-thin mb-6 text-[#242F3F] text-center">
            Why Join a Story Circle?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-white rounded-lg border border-[#E5E7EB]">
              <div className="bg-[#F9F5F2] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-[#A33D29]" />
              </div>
              <h4 className="font-medium text-[#242F3F] mb-2">Community</h4>
              <p className="text-sm text-[#403E43]">Connect with others who share your experiences and interests</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-[#E5E7EB]">
              <div className="bg-[#F9F5F2] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-[#A33D29]" />
              </div>
              <h4 className="font-medium text-[#242F3F] mb-2">Preservation</h4>
              <p className="text-sm text-[#403E43]">Create a lasting record of shared stories and memories</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-[#E5E7EB]">
              <div className="bg-[#F9F5F2] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Video className="h-8 w-8 text-[#A33D29]" />
              </div>
              <h4 className="font-medium text-[#242F3F] mb-2">Growth</h4>
              <p className="text-sm text-[#403E43]">Discover new perspectives and deepen your own storytelling</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoryCirclesSection;
