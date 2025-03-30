
import React from "react";
import { format, parseISO } from "date-fns";
import { Calendar, MapPin, Users, Link, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LumaEvent } from "@/services/lumaEvents";

interface LumaEventCardProps {
  event: LumaEvent;
}

const LumaEventCard: React.FC<LumaEventCardProps> = ({ event }) => {
  const eventDate = parseISO(event.startDate);
  const formattedDate = format(eventDate, "EEE, MMM d");
  const formattedTime = format(eventDate, "h:mm a");
  
  const handleRegister = () => {
    window.open(event.registrationUrl, "_blank", "noopener,noreferrer");
  };
  
  return (
    <div className="bg-white rounded-[2px] border border-[#E5E7EB] overflow-hidden">
      <div className="flex p-4">
        {/* Date Column */}
        <div className="flex-shrink-0 mr-4">
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-2 text-center w-14">
            <div className="text-[#A33D29] text-xs font-medium">
              {format(eventDate, "MMM")}
            </div>
            <div className="text-xl font-bold text-[#242F3F]">
              {format(eventDate, "dd")}
            </div>
          </div>
        </div>
        
        {/* Event Details */}
        <div className="flex-grow">
          <h3 className="font-medium text-[#242F3F] text-lg mb-1">{event.title}</h3>
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{event.description}</p>
          
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center text-gray-600">
              <Clock className="h-4 w-4 text-[#A33D29] mr-2" />
              <span>{formattedDate} • {formattedTime}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <MapPin className="h-4 w-4 text-[#A33D29] mr-2" />
              <span>{event.location}</span>
            </div>
          </div>
          
          {/* Attendance Information */}
          <div className="flex items-center mt-4 mb-4">
            <div className="flex -space-x-2 mr-2">
              <Avatar className="h-6 w-6 border-2 border-white">
                <AvatarFallback className="bg-[#F3F4F6] text-[#6B7280] text-xs">A</AvatarFallback>
              </Avatar>
              <Avatar className="h-6 w-6 border-2 border-white">
                <AvatarFallback className="bg-[#F3F4F6] text-[#6B7280] text-xs">B</AvatarFallback>
              </Avatar>
              <Avatar className="h-6 w-6 border-2 border-white">
                <AvatarFallback className="bg-[#F3F4F6] text-[#6B7280] text-xs">C</AvatarFallback>
              </Avatar>
            </div>
            <span className="text-sm text-gray-500">
              {event.spotsRemaining > 0 ? (
                <span className="text-[#A33D29] font-medium">
                  {event.spotsRemaining === 1 ? "1 spot left" : `${event.spotsRemaining} spots left`}
                </span>
              ) : "Sold out"}
            </span>
          </div>
          
          {/* Action Buttons */}
          <Button 
            onClick={handleRegister}
            disabled={event.spotsRemaining <= 0}
            className={event.spotsRemaining > 0 ? "bg-[#242F3F] hover:bg-[#242F3F]/90 text-white w-full" : "bg-gray-300 text-white w-full"}
          >
            {event.spotsRemaining > 0 ? "Join Event" : "Sold Out"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LumaEventCard;
