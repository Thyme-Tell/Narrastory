
import React from "react";
import { format, parseISO } from "date-fns";
import { Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LumaEvent } from "@/services/lumaEvents";

interface LumaEventAccordionItemProps {
  event: LumaEvent;
  index: number;
}

const LumaEventAccordionItem: React.FC<LumaEventAccordionItemProps> = ({ event, index }) => {
  const eventDate = parseISO(event.startDate);
  const eventEnd = parseISO(event.endDate);
  const formattedDate = format(eventDate, "EEE, MMM d");
  const formattedStartTime = format(eventDate, "h:mm a");
  const formattedEndTime = format(eventEnd, "h:mm a");
  const timeDisplay = `${formattedStartTime} - ${formattedEndTime} (ET)`;
  
  const handleRegister = () => {
    window.open(event.registrationUrl, "_blank", "noopener,noreferrer");
  };
  
  return (
    <AccordionItem 
      value={`item-${index}`} 
      className="border-b last:border-0 bg-gradient-to-b from-[#E4C795] to-[#EBE5D3] rounded-[4px] mb-4 overflow-hidden border-0"
    >
      <AccordionTrigger className="py-4 px-6 hover:no-underline hover:bg-[#E4C795]/50 rounded-t-[4px]">
        <div className="flex flex-col items-start text-left w-full">
          <h3 className="font-caslon font-normal text-lg text-[#674019]">{event.title}</h3>
          <div className="text-xs text-[#674019]/60 font-medium font-uncut-sans">{timeDisplay}</div>
        </div>
      </AccordionTrigger>
      
      <AccordionContent className="px-6 pb-6 pt-2 bg-transparent rounded-b-[4px]">
        <div className="space-y-4">
          <p className="text-[#674019] mb-4 text-sm">{event.description}</p>
          
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
          
          <div className="flex items-center gap-2 text-[#674019]/60 font-medium font-uncut-sans">
            <Video className="h-4 w-4 text-[#674019]" />
            <span className="text-sm">{event.location}</span>
          </div>
          
          <Button 
            onClick={handleRegister}
            disabled={event.spotsRemaining <= 0}
            className="bg-[#674019] hover:bg-[#5D310E] text-white rounded-[50px] text-sm py-5 px-8 mt-4"
          >
            {event.spotsRemaining > 0 
              ? `Save Your Spot (${event.spotsRemaining} available)` 
              : "Sold Out"}
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default LumaEventAccordionItem;
