import { LUMA_API_KEY } from "@/config/constants";

// Define our event types
export interface LumaEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  imageUrl?: string;
  registrationUrl: string;
  capacity: number;
  spotsRemaining: number;
}

// Interface for Luma API response
interface LumaApiEvent {
  id: string;
  name: string;
  description: string;
  start_at: string;
  end_at: string;
  location: {
    name: string;
    type: string;
  };
  cover_url?: string;
  api_url: string;
  url: string;
  capacity?: number;
  num_remaining_spots?: number;
}

// This function fetches events from the Luma API
export async function fetchLumaEvents(): Promise<LumaEvent[]> {
  // Moved specificEvent definition outside the try block so it's accessible in catch block
  const specificEvent: LumaEvent = {
    id: "vfr6gipv",
    title: "Storytelling Workshop - Narra",
    description: "Join us for an interactive storytelling workshop where you'll learn techniques to craft compelling personal narratives.",
    startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(), // 1.5 hours duration
    location: "Online via Zoom",
    imageUrl: "https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets//narrafamily.jpg",
    registrationUrl: "https://lu.ma/vfr6gipv",
    capacity: 25,
    spotsRemaining: 12
  };
  
  try {
    console.log("Attempting to fetch Luma events with API key present:", !!LUMA_API_KEY);
    
    // Check if we're in development mode (no API key)
    if (!LUMA_API_KEY) {
      console.log("No Luma API key found, returning mock data plus specific event");
      return [...getMockEvents(), specificEvent];
    }
    
    // Make the API request with proper CORS headers
    const response = await fetch('https://api.lu.ma/public/v1/calendar/upcoming-events', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${LUMA_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log("Luma API response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Luma API error (${response.status}):`, errorText);
      throw new Error(`Luma API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Luma API response data:", data);
    
    if (!data.events || !Array.isArray(data.events)) {
      console.error('Invalid response format from Luma API:', data);
      console.log("Returning mock data plus specific event due to invalid API response");
      return [...getMockEvents(), specificEvent];
    }
    
    if (data.events.length === 0) {
      console.log("No events returned from Luma API, returning mock data plus specific event");
      return [...getMockEvents(), specificEvent];
    }
    
    // Map Luma API events to our internal event format and add the specific event
    const apiEvents = data.events.map((event: LumaApiEvent) => ({
      id: event.id,
      title: event.name,
      description: event.description || '',
      startDate: event.start_at,
      endDate: event.end_at,
      location: event.location.name || (event.location.type === 'online' ? 'Online' : 'TBD'),
      imageUrl: event.cover_url,
      registrationUrl: event.url,
      capacity: event.capacity || 0,
      spotsRemaining: event.num_remaining_spots || 0
    }));
    
    // Add the specific event if it's not already in the list
    const eventExists = apiEvents.some(event => event.registrationUrl.includes("vfr6gipv"));
    
    return eventExists ? apiEvents : [...apiEvents, specificEvent];
  } catch (error) {
    console.error("Error fetching Luma events:", error);
    // Fallback to mock data plus specific event on error
    console.log("Returning mock data plus specific event due to error");
    return [...getMockEvents(), specificEvent];
  }
}

// Fallback function for mock data (used when API key is not available)
function getMockEvents(): LumaEvent[] {
  return [
    {
      id: "evt-1",
      title: "Family Stories Circle",
      description: "Join us to share and preserve your family's legacy through stories passed down through generations.",
      startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // 2 hours duration
      location: "Online via Zoom",
      imageUrl: "https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets//narrafamily.jpg",
      registrationUrl: "https://lu.ma/narra-family-stories",
      capacity: 20,
      spotsRemaining: 8
    },
    {
      id: "evt-2",
      title: "Cultural Heritage Stories",
      description: "Explore and document cultural traditions, celebrations, and heritage through collaborative storytelling.",
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(), // 1.5 hours duration
      location: "Online via Zoom",
      imageUrl: "https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets//narra-icon-white.svg",
      registrationUrl: "https://lu.ma/narra-heritage",
      capacity: 15,
      spotsRemaining: 4
    },
    {
      id: "evt-3",
      title: "Community Narratives",
      description: "Connect with neighbors to document local history, landmarks, and community stories for future generations.",
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // 2 hours duration
      location: "Community Center, San Francisco",
      registrationUrl: "https://lu.ma/narra-community",
      capacity: 30,
      spotsRemaining: 15
    }
  ];
}
