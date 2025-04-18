
import React, { useState } from "react";
import { Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SeniorLivingDialog from "./SeniorLivingDialog";

interface StoryCirclesSectionProps {
  storyCirclesRef: React.RefObject<HTMLElement>;
}

const StoryCirclesSection: React.FC<StoryCirclesSectionProps> = ({ storyCirclesRef }) => {
  const [isSeniorLivingDialogOpen, setSeniorLivingDialogOpen] = useState(false);

  const handleRegisterClick = () => {
    window.open("https://lu.ma/calendar/cal-Z2lF71wpLrO7F5C", "_blank");
  };

  return (
    <section 
      ref={storyCirclesRef as React.RefObject<HTMLElement>}
      id="join-story-circle"
      className="container mx-auto px-4 py-16 md:py-24 scroll-mt-24 bg-transparent"
    >
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-caslon font-thin text-[#242F3F] mb-6 md:mb-6 text-center">
          Narra Story Circles
        </h2>
        <p className="text-center text-[#403E43] mb-12 max-w-2xl mx-auto text-sm md:text-base">
          Narra Story Circles help you accomplish your dream of writing your book. These laid-back virtual meetups are led by Richard Squires, Narra co-founder and author of 60+ memoirs. He'll offer inspiration, guidance, support, and, most importantly, dedicated time for storytelling. You'll also have the chance to share your stories, celebrate your progress, and connect with others on the same journey. Drop by, share, and be part of the Narra community. Simple as that.
        </p>
        
        {/* Regular Story Circles Schedule */}
        <div className="bg-white/50 rounded-lg p-6 mb-8 text-center">
          <h3 className="text-xl font-medium text-[#242F3F] mb-2">Regular Story Circle Times</h3>
          <p className="text-[#403E43]">Join us every Tuesday and Friday from 1-2 pm (ET)</p>
          
          <div className="mt-4">
            <Button 
              onClick={handleRegisterClick}
              className="bg-[#242F3F] hover:bg-[#354658]"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Register for a Circle
            </Button>
          </div>
        </div>
        
        {/* Upcoming events section */}
        <div className="mb-12">
          <h3 className="text-xl md:text-2xl font-medium text-[#242F3F] mb-4 text-center">Upcoming Story Circles</h3>
          <div className="bg-white/50 rounded-lg p-4 border border-gray-200 shadow-sm">
            <iframe 
              src="https://lu.ma/embed/calendar/cal-Z2lF71wpLrO7F5C/events"
              width="100%" 
              height="600px" 
              frameBorder="0" 
              style={{ border: '1px solid #bfcbda88', borderRadius: '4px' }}
              allowFullScreen
            ></iframe>
          </div>
        </div>
        
        {/* Themed Story Circles - Coming Soon - Redesigned without a card */}
        <div className="mb-12">
          <h3 className="text-xl md:text-2xl font-medium text-[#242F3F] mb-2 text-center">Themed Story Circles</h3>
          <p className="text-center text-[#A33D29] font-medium mb-4">Coming Soon</p>
          
          <div className="text-center text-[#403E43] max-w-3xl mx-auto mb-8">
            Join a themed Story Circle for deeper inspiration and connection. Each circle focuses on a specific topic, bringing together storytellers who are creating similar types of keepsakes. Themes include Cultural Heritage & Ancestry, Homes & Neighborhoods, Travel & Adventure, Hobbies & Passions, Resilience & Courage, and more.
          </div>
        </div>
        
        {/* Create Your Own Circle - Redesigned without a card */}
        <div className="mb-8 max-w-3xl mx-auto text-center">
          <h3 className="text-xl md:text-2xl font-medium text-[#242F3F] mb-4">Create Your Own Circle</h3>
          <p className="text-[#403E43] mb-6">
            Want to start a Story Circle with your family, friends, or community? We can help you set up and facilitate a private circle.
          </p>
          <Button 
            onClick={() => window.open("mailto:hello@narrastory.com?subject=Private%20Story%20Circle%20Request", "_blank")}
            variant="outline"
            className="border-[#242F3F] text-[#242F3F] hover:bg-[#242F3F] hover:text-white"
          >
            <Users className="mr-2 h-4 w-4" />
            Contact Us to Get Started
          </Button>
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
