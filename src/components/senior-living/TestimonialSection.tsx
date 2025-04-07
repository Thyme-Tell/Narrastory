
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const TestimonialSection: React.FC = () => {
  return (
    <section className="py-16 max-w-5xl mx-auto">
      <Card className="bg-[#242F3F] text-white border-none shadow-lg overflow-hidden">
        <CardContent className="p-8 md:p-12">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6">
              {/* Quote mark */}
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#A33D29]">
                <path d="M14.4 24H8V32H16V40H8C5.87827 40 3.84344 39.1571 2.34315 37.6569C0.842855 36.1566 0 34.1217 0 32V24C0 21.8783 0.842855 19.8434 2.34315 18.3431C3.84344 16.8429 5.87827 16 8 16H14.4C15.4609 16 16.4783 16.4214 17.2284 17.1716C17.9786 17.9217 18.4 18.9391 18.4 20C18.4 21.0609 17.9786 22.0783 17.2284 22.8284C16.4783 23.5786 15.4609 24 14.4 24ZM38.4 24H32V32H40V40H32C29.8783 40 27.8434 39.1571 26.3431 37.6569C24.8429 36.1566 24 34.1217 24 32V24C24 21.8783 24.8429 19.8434 26.3431 18.3431C27.8434 16.8429 29.8783 16 32 16H38.4C39.4609 16 40.4783 16.4214 41.2284 17.1716C41.9786 17.9217 42.4 18.9391 42.4 20C42.4 21.0609 41.9786 22.0783 41.2284 22.8284C40.4783 23.5786 39.4609 24 38.4 24Z" fill="currentColor"/>
              </svg>
            </div>
            
            <blockquote className="text-xl md:text-2xl italic font-caslon mb-8">
              "Narra has transformed our reminiscence activities. Residents love sharing their stories, and families treasure the keepsakes."
            </blockquote>
            
            <div className="flex items-center flex-col">
              <img 
                src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets/testimonial-avatar.png" 
                alt="Sarah M." 
                className="w-16 h-16 rounded-full mb-3 bg-white p-1"
              />
              <p className="font-semibold text-lg">Sarah M.</p>
              <p className="text-white/80">Activity Director, Sunrise Senior Living</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default TestimonialSection;
