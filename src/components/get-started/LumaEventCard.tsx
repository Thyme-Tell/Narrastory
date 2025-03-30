
import React from "react";
import { format } from "date-fns";
import { Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { LumaEvent } from "@/services/lumaEvents";

interface EventCardProps {
  event: LumaEvent;
}

const LumaEventCard: React.FC<EventCardProps> = ({ event }) => {
  const formattedDate = format(new Date(event.startDate), "EEE, MMM d, yyyy");
  const formattedTime = format(new Date(event.startDate), "h:mm a");
  const spotsText = event.spotsRemaining === 1 
    ? "1 spot left" 
    : `${event.spotsRemaining} spots left`;

  const handleRegister = () => {
    window.open(event.registrationUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow">
      {event.imageUrl && (
        <div 
          className="h-32 bg-cover bg-center" 
          style={{ backgroundImage: `url(${event.imageUrl})` }}
        />
      )}
      <CardContent className="p-4 flex-grow">
        <h4 className="text-lg font-medium mb-2 text-[#242F3F]">{event.title}</h4>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#A33D29]" />
            <span>{formattedDate} at {formattedTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#A33D29]" />
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
