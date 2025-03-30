
import React from "react";
import { format, parseISO } from "date-fns";
import { Video, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LumaEvent } from "@/services/lumaEvents";

interface EventCardProps {
  event: LumaEvent;
}

const LumaEventCard: React.FC<EventCardProps> = ({ event }) => {
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
    <Card className="overflow-hidden h-full flex flex-col rounded-[15px] border-0 bg-gradient-to-b from-[#F8E3C8] to-[#FBEFE1] hover:shadow-lg transition-shadow">
      <CardContent className="p-6 pb-0 flex-grow">
        <h4 className="text-[32px] md:text-[40px] font-caslon font-normal mb-2 text-[#674019]">
          {event.title}
        </h4>
        
        <p className="text-xl md:text-[25px] text-[#674019]/60 font-medium font-uncut-sans mb-6">
          {timeDisplay}
        </p>
        
        <div className="mb-4">
          <div className="bg-white rounded-[50px] py-2 px-4 inline-flex items-center">
            <div className="flex -space-x-4">
              <Avatar className="w-[55px] h-[55px] border-3 border-white bg-[#FAE6CB]">
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <Avatar className="w-[55px] h-[55px] border-3 border-white bg-[#FAE6CB]">
                <AvatarFallback>B</AvatarFallback>
              </Avatar>
              <Avatar className="w-[55px] h-[55px] border-3 border-white bg-[#FAE6CB]">
                <AvatarFallback>C</AvatarFallback>
              </Avatar>
              <Avatar className="w-[55px] h-[55px] border-3 border-white bg-[#FAE6CB] flex items-center justify-center">
                <span className="text-[28px] text-[#5D310E]">+{Math.max(4, event.capacity - 3)}</span>
              </Avatar>
            </div>
          </div>
        </div>
        
        <p className="text-xl md:text-[25px] text-[#674019]/60 font-medium font-uncut-sans mt-auto">
          {event.location}
        </p>
      </CardContent>
      
      <CardFooter className="p-6 pt-4">
        <Button 
          className="w-full bg-[#674019] hover:bg-[#5D310E] text-white rounded-[50px] text-lg py-6"
          onClick={handleRegister}
          disabled={event.spotsRemaining <= 0}
        >
          {event.spotsRemaining > 0 ? "Register Now" : "Sold Out"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LumaEventCard;
