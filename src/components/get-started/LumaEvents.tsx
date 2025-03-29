
import React, { useState, useEffect } from "react";
import { Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface LumaEvent {
  id: string;
  name: string;
  start_at: string;
  url: string;
  cover_url?: string;
  description?: string;
  location?: {
    type: string;
    name?: string;
  };
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  }).format(date);
};

const LumaEvents: React.FC = () => {
  const [events, setEvents] = useState<LumaEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        // In a real implementation, this would be a call to your backend that has the API key
        // For demo purposes, we're mocking the response with sample data
        // Replace this with actual API call when you have your backend set up
        
        // Simulating API response delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Sample data - replace with actual API call
        const sampleEvents: LumaEvent[] = [
          {
            id: "evt-1",
            name: "Introductory Story Circle Session",
            start_at: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
            url: "https://lu.ma/narrastory-intro",
            cover_url: "https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets//narra-horizontal.svg",
            description: "Join our welcoming community to learn how story circles work and share your first memories.",
            location: {
              type: "online",
              name: "Zoom"
            }
          },
          {
            id: "evt-2",
            name: "Family History Circle",
            start_at: new Date(Date.now() + 86400000 * 10).toISOString(), // 10 days from now
            url: "https://lu.ma/narrastory-family",
            description: "A special circle dedicated to preserving and sharing family stories across generations.",
            location: {
              type: "online",
              name: "Google Meet"
            }
          },
          {
            id: "evt-3",
            name: "Community Stories Workshop",
            start_at: new Date(Date.now() + 86400000 * 17).toISOString(), // 17 days from now
            url: "https://lu.ma/narrastory-community",
            description: "Learn storytelling techniques and share stories that have shaped your community.",
            location: {
              type: "in_person",
              name: "Community Center"
            }
          }
        ];
        
        setEvents(sampleEvents);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch Lu.ma events:", err);
        setError("Failed to load upcoming events. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl md:text-2xl font-caslon font-thin mb-6 text-[#242F3F] text-center">
        Upcoming Story Circle Events
      </h3>
      
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <Skeleton className="h-6 w-2/3 mb-2" />
              <Skeleton className="h-4 w-1/3 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-9 w-32" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <p className="text-center text-gray-500 p-6 bg-gray-50 rounded-lg">
          No upcoming events at the moment. Check back soon!
        </p>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
              <h4 className="font-medium text-[#242F3F] text-lg mb-1">{event.name}</h4>
              <div className="flex items-center text-gray-600 mb-3">
                <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="text-sm">{formatDate(event.start_at)}</span>
              </div>
              
              {event.description && (
                <p className="text-sm text-gray-700 mb-4 line-clamp-2">{event.description}</p>
              )}
              
              <div className="text-sm text-gray-600 mb-4">
                <span className="font-medium">Location:</span> {event.location?.name || 'TBA'} 
                ({event.location?.type === 'online' ? 'Virtual' : 'In Person'})
              </div>
              
              <a href={event.url} target="_blank" rel="noopener noreferrer">
                <Button className="bg-[#242F3F] hover:bg-[#242F3F]/90 text-white">
                  Join Event <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </a>
            </div>
          ))}
        </div>
      )}
      
      <div className="text-center mt-6">
        <a 
          href="https://lu.ma/narrastory" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-atlantic hover:text-atlantic/80 font-medium inline-flex items-center"
        >
          View all events <ExternalLink className="h-4 w-4 ml-1" />
        </a>
      </div>
    </div>
  );
};

export default LumaEvents;
