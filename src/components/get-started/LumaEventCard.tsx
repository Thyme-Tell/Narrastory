
import React, { useState } from "react";
import { format, parseISO } from "date-fns";
import { Video, ChevronDown, ChevronUp } from "lucide-react";
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
    <Card className="overflow-hidden flex flex-col rounded-[4px] border-0 bg-gradient-to-b from-[#E4C795] to-[#EBE5D3] hover:shadow-lg transition-shadow h-full">
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-full flex flex-col h-full"
      >
        <CardContent className="p-6 pb-3 flex-grow">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-caslon font-normal text-[#674019]">
              {event.title}
            </h3>
            
            {/* Circular chevron button */}
            <CollapsibleTrigger asChild>
              <button 
                className="flex items-center justify-center bg-white rounded-full h-7 w-7 text-[#674019] hover:bg-white/90 transition-colors focus:outline-none"
                aria-label={isOpen ? "Hide details" : "Show details"}
              >
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </CollapsibleTrigger>
          </div>
          
          <p className="text-sm text-[#674019]/60 font-medium font-uncut-sans mb-4">
            {timeDisplay}
          </p>
        </CardContent>
        
        <CollapsibleContent className="px-6 pt-0">
          <div className="mb-4">
            <div className="bg-white rounded-[50px] py-2 px-4 inline-flex items-center">
              <div className="flex -space-x-4">
                <Avatar className="w-[30px] h-[30px] border-3 border-white bg-[#FAE6CB]">
                  <AvatarFallback className="text-xs">A</AvatarFallback>
                </Avatar>
                <Avatar className="w-[30px] h-[30px] border-3 border-white bg-[#FAE6CB]">
                  <AvatarFallback className="text-xs">B</AvatarFallback>
                </Avatar>
                <Avatar className="w-[30px] h-[30px] border-3 border-white bg-[#FAE6CB]">
                  <AvatarFallback className="text-xs">C</AvatarFallback>
                </Avatar>
                <Avatar className="w-[30px] h-[30px] border-3 border-white bg-[#FAE6CB] flex items-center justify-center">
                  <span className="text-[14px] text-[#5D310E]">+{Math.max(4, event.capacity - 3)}</span>
                </Avatar>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-[#674019]/60 font-medium font-uncut-sans">
            <Video className="h-4 w-4 text-[#674019]" />
            <span className="text-sm">{event.location}</span>
          </div>
          
          <div className="text-[#674019] mt-4 mb-4 text-sm">
            {event.description}
          </div>
        </CollapsibleContent>
        
        <CardFooter className="p-6 pt-3 mt-auto">
          <Button 
            className="w-full bg-[#674019] hover:bg-[#5D310E] text-white rounded-[50px] text-sm py-5"
            onClick={handleRegister}
            disabled={event.spotsRemaining <= 0}
          >
            {event.spotsRemaining > 0 
              ? (
                <>
                  Save Your Spot <span className="hidden sm:inline-block md:hidden lg:inline-block">({event.spotsRemaining} available)</span><span className="inline-block sm:hidden md:inline-block lg:hidden">({event.spotsRemaining})</span>
                </>
              ) 
              : "Sold Out"}
          </Button>
        </CardFooter>
      </Collapsible>
    </Card>
  );
};

export default LumaEventCard;
