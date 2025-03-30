
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
      className="border-b last:border-0 bg-gradient-to-b from-[#E4C795] to-[#EBE5D3] rounded-[7px] mb-4 overflow-hidden border-0"
    >
      <AccordionTrigger className="py-5 px-6 hover:no-underline hover:bg-[#E4C795]/50 rounded-t-[7px]">
        <div className="flex flex-col items-start text-left w-full">
          <h4 className="font-caslon font-normal text-2xl text-[#674019]">{event.title}</h4>
          <div className="text-base text-[#674019]/60 font-medium font-uncut-sans">{timeDisplay}</div>
        </div>
      </AccordionTrigger>
      
      <AccordionContent className="px-6 pb-6 pt-0 bg-transparent rounded-b-[7px]">
        <div className="space-y-4">
          <p className="text-[#674019] mb-4 text-base">{event.description}</p>
          
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
          
          <div className="flex items-center gap-2 text-[#674019]/60 font-medium font-uncut-sans">
            <Video className="h-5 w-5 text-[#674019]" />
            <span className="text-base">{event.location}</span>
          </div>
          
          <Button 
            onClick={handleRegister}
            disabled={event.spotsRemaining <= 0}
            className="bg-[#674019] hover:bg-[#5D310E] text-white rounded-[50px] text-base py-5 px-8 mt-4"
          >
            {event.spotsRemaining > 0 ? "Register Now" : "Sold Out"}
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default LumaEventAccordionItem;
