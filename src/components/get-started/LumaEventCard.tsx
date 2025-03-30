
import React, { useState } from "react";
import { format, parseISO } from "date-fns";
import { Video, Users, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LumaEvent } from "@/services/lumaEvents";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface EventCardProps {
  event: LumaEvent;
}

const LumaEventCard: React.FC<EventCardProps> = ({ event }) => {
  const [isOpen, setIsOpen] = useState(false);
  const eventDate = parseISO(event.startDate);
  const eventEnd = parseISO(event.endDate);
  const formattedDate = format(eventDate, "EEE, MMM d, yyyy");
  const formattedStartTime = format(eventDate, "h:mm a");
  const formattedEndTime = format(eventEnd, "h:mm a");
  const timeDisplay = `${formattedStartTime} - ${formattedEndTime} (ET)`;
  
  const handleRegister = () => {
    window.open(event.registrationUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col rounded-[7px] border-0 bg-gradient-to-b from-[#E4C795] to-[#EBE5D3] hover:shadow-lg transition-shadow">
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-full flex flex-col h-full"
      >
        <CardContent className="p-6 pb-3 flex-grow">
          <h4 className="text-2xl md:text-[32px] font-caslon font-normal mb-2 text-[#674019]">
            {event.title}
          </h4>
          
          <p className="text-lg md:text-xl text-[#674019]/60 font-medium font-uncut-sans mb-4">
            {timeDisplay}
          </p>
          
          <div className="mb-4">
            <div className="bg-white rounded-[50px] py-2 px-4 inline-flex items-center">
              <div className="flex -space-x-4">
                <Avatar className="w-[45px] h-[45px] border-3 border-white bg-[#FAE6CB]">
                  <AvatarFallback>A</AvatarFallback>
                </Avatar>
                <Avatar className="w-[45px] h-[45px] border-3 border-white bg-[#FAE6CB]">
                  <AvatarFallback>B</AvatarFallback>
                </Avatar>
                <Avatar className="w-[45px] h-[45px] border-3 border-white bg-[#FAE6CB]">
                  <AvatarFallback>C</AvatarFallback>
                </Avatar>
                <Avatar className="w-[45px] h-[45px] border-3 border-white bg-[#FAE6CB] flex items-center justify-center">
                  <span className="text-[20px] text-[#5D310E]">+{Math.max(4, event.capacity - 3)}</span>
                </Avatar>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-[#674019]/60 font-medium font-uncut-sans">
            <Video className="h-5 w-5 text-[#674019]" />
            <span className="text-lg">{event.location}</span>
          </div>
          
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-center mt-3 text-[#674019] hover:text-[#674019]/80 transition-colors">
              {isOpen ? (
                <>
                  <span className="text-sm mr-1">Show less</span>
                  <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  <span className="text-sm mr-1">Show more</span>
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>
          </CollapsibleTrigger>
        </CardContent>
        
        <CollapsibleContent className="px-6">
          <div className="text-[#674019] mb-4 text-base">
            {event.description}
          </div>
        </CollapsibleContent>
        
        <CardFooter className="p-6 pt-3">
          <Button 
            className="w-full bg-[#674019] hover:bg-[#5D310E] text-white rounded-[50px] text-base py-5"
            onClick={handleRegister}
            disabled={event.spotsRemaining <= 0}
          >
            {event.spotsRemaining > 0 ? "Register Now" : "Sold Out"}
          </Button>
        </CardFooter>
      </Collapsible>
    </Card>
  );
};

export default LumaEventCard;
