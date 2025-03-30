
import React from "react";
import { format, parseISO } from "date-fns";
import { Calendar, MapPin, Users } from "lucide-react";
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
  const formattedDate = format(eventDate, "EEE, MMM d");
  const formattedTime = format(eventDate, "h:mm a");
  
  const handleRegister = () => {
    window.open(event.registrationUrl, "_blank", "noopener,noreferrer");
  };
  
  return (
    <AccordionItem value={`item-${index}`} className="border-b last:border-0 bg-white">
      <AccordionTrigger className="py-4 px-4 hover:no-underline hover:bg-[#F9F5F2]/50 rounded-[2px]">
        <div className="flex items-center text-left">
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-2 mr-3 text-center w-14">
            <div className="text-[#A33D29] text-xs font-medium">
              {format(eventDate, "MMM")}
            </div>
            <div className="text-xl font-bold text-[#242F3F]">
              {format(eventDate, "dd")}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-[#242F3F] text-base">{event.title}</h4>
            <div className="text-xs text-gray-500">{formattedDate} at {formattedTime}</div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4 pt-0 bg-white rounded-[2px]">
        <div className="ml-[70px]">
          <p className="text-sm text-gray-600 mb-3">{event.description}</p>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-[#A33D29]" />
              <span>{formattedDate} at {formattedTime}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-[#A33D29]" />
              <span>{event.location}</span>
            </div>
            {event.spotsRemaining > 0 ? (
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-[#A33D29]" />
                <span className="text-[#A33D29] font-medium">
                  {event.spotsRemaining === 1 ? "1 spot left" : `${event.spotsRemaining} spots left`}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Users className="h-4 w-4" />
                <span>Sold out</span>
              </div>
            )}
          </div>
          
          {/* Attendees preview */}
          <div className="flex items-center mt-2 mb-4">
            <div className="flex -space-x-2 mr-2">
              <Avatar className="h-6 w-6 border-2 border-white">
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <Avatar className="h-6 w-6 border-2 border-white">
                <AvatarFallback>B</AvatarFallback>
              </Avatar>
              <Avatar className="h-6 w-6 border-2 border-white">
                <AvatarFallback>C</AvatarFallback>
              </Avatar>
            </div>
            <span className="text-xs text-gray-500">
              {Math.min(10, 3 + Math.floor(Math.random() * 7))} people attending
            </span>
          </div>
          
          <Button 
            onClick={handleRegister}
            disabled={event.spotsRemaining <= 0}
            className={event.spotsRemaining > 0 ? "bg-[#242F3F] hover:bg-[#242F3F]/90 text-white w-full sm:w-auto" : "bg-gray-300 text-white w-full sm:w-auto"}
          >
            {event.spotsRemaining > 0 ? "Reserve a Spot" : "Sold Out"}
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default LumaEventAccordionItem;

