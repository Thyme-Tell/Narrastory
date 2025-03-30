
import React from "react";
import { format, parseISO } from "date-fns";
import { Calendar, MapPin, Users, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LumaEvent } from "@/services/lumaEvents";

interface EventCardProps {
  event: LumaEvent;
}

const LumaEventCard: React.FC<EventCardProps> = ({ event }) => {
  const eventDate = parseISO(event.startDate);
  const formattedDate = format(eventDate, "EEE, MMM d, yyyy");
  const formattedTime = format(eventDate, "h:mm a");
  const spotsText = event.spotsRemaining === 1 
    ? "1 spot left" 
    : `${event.spotsRemaining} spots left`;

  const handleRegister = () => {
    window.open(event.registrationUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow border border-[#E5E7EB]">
      <div className="relative">
        {event.imageUrl ? (
          <div 
            className="h-40 bg-cover bg-center" 
            style={{ backgroundImage: `url(${event.imageUrl})` }}
          />
        ) : (
          <div className="h-40 bg-gradient-to-r from-[#F9F5F2] to-[#F6F8FA] flex items-center justify-center">
            <Video className="h-12 w-12 text-[#A33D29]/30" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <div className="bg-white rounded-lg shadow-sm p-2 text-center">
            <div className="text-[#A33D29] text-xs font-medium">
              {format(eventDate, "MMM")}
            </div>
            <div className="text-xl font-bold text-[#242F3F]">
              {format(eventDate, "dd")}
            </div>
          </div>
        </div>
      </div>
      
      <CardContent className="p-4 flex-grow">
        <h4 className="text-lg font-medium mb-2 text-[#242F3F]">{event.title}</h4>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#A33D29]" />
            <span>{formattedDate} at {formattedTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-[#A33D29]" />
            <span>{event.location}</span>
          </div>
          {event.spotsRemaining > 0 && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#A33D29]" />
              <span className="text-[#A33D29] font-medium">{spotsText}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full bg-[#242F3F] hover:bg-[#242F3F]/90 text-white"
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
