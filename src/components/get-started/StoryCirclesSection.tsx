
import React from "react";
import { Users, Book, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StoryCirclesSectionProps {
  storyCirclesRef: React.RefObject<HTMLElement>;
}

const StoryCirclesSection: React.FC<StoryCirclesSectionProps> = ({ storyCirclesRef }) => {
  return (
    <section 
      ref={storyCirclesRef as React.RefObject<HTMLElement>}
      id="join-story-circle"
      className="container mx-auto px-4 py-16 md:py-24 bg-white scroll-mt-32"
    >
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-caslon font-thin text-[#242F3F] mb-12 text-center">
          Narra Story Circles
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#EFF1E9] rounded-xl p-6 md:p-8 shadow-sm">
            <h3 className="text-xl md:text-2xl font-caslon font-thin mb-4 text-[#242F3F]">
              Join a Circle
            </h3>
            <p className="text-sm md:text-base text-[#403E43] mb-6">
              Connect with others who share your interests and experiences. Story Circles offer a supportive environment to share memories and create collective narratives.
            </p>
            <Button className="bg-[#242F3F] hover:bg-[#242F3F]/90 text-white">
              Find a Circle
            </Button>
          </div>
          
          <div className="bg-[#EFF1E9] rounded-xl p-6 md:p-8 shadow-sm">
            <h3 className="text-xl md:text-2xl font-caslon font-thin mb-4 text-[#242F3F]">
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
        
        <div className="mt-12 md:mt-16 bg-[#F6F6F7] rounded-xl p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-caslon font-thin mb-4 text-[#242F3F] text-center">
            Why Join a Story Circle?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <div className="bg-[#242F3F]/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-[#242F3F]" />
              </div>
              <h4 className="font-medium text-[#242F3F] mb-2">Community</h4>
              <p className="text-sm text-[#403E43]">Connect with others who share your experiences and interests</p>
            </div>
            <div className="text-center">
              <div className="bg-[#242F3F]/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Book className="h-8 w-8 text-[#242F3F]" />
              </div>
              <h4 className="font-medium text-[#242F3F] mb-2">Preservation</h4>
              <p className="text-sm text-[#403E43]">Create a lasting record of shared stories and memories</p>
            </div>
            <div className="text-center">
              <div className="bg-[#242F3F]/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="h-8 w-8 text-[#242F3F]" />
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
