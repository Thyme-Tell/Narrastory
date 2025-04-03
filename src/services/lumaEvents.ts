
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
    online_meeting_link?: string;
    address?: {
      street_address?: string;
      city?: string;
      postal_code?: string;
      country?: string;
    };
  };
  cover_url?: string;
  api_url: string;
  url: string;
  capacity?: number;
  num_remaining_spots?: number;
  host?: {
    name: string;
    avatar_url?: string;
  };
  geo_address_info?: {
    formatted_address: string;
    lat: number;
    lng: number;
  };
  timezone: string;
}

interface LumaApiResponse {
  events: LumaApiEvent[];
}

import { LUMA_API_KEY } from "@/config/constants";

// This function fetches events from the Luma API
export async function fetchLumaEvents(): Promise<LumaEvent[]> {
  try {
    console.log("Attempting to fetch Luma events");
    console.log("API Key present:", !!LUMA_API_KEY);
    console.log("API Key value:", LUMA_API_KEY ? LUMA_API_KEY.substring(0, 3) + "..." : "not set");
    
    // Check if we have a valid API key
    if (!LUMA_API_KEY || LUMA_API_KEY.trim() === '') {
      console.log("No valid Luma API key found, returning mock data");
      return getMockEvents();
    }
    
    console.log("Making API request to Luma");
    // Make the API request with proper headers
    const response = await fetch('https://api.lu.ma/public/v1/calendar/upcoming-events', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${LUMA_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log("Luma API response status:", response.status);

    // Log the raw response for debugging
    const responseText = await response.text();
    console.log("Raw API response:", responseText);
    
    // Parse the response
    const data: LumaApiResponse = JSON.parse(responseText);
    console.log("Parsed Luma API response:", data);
    
    if (!response.ok) {
      console.error(`Luma API error (${response.status}):`, responseText);
      throw new Error(`Luma API responded with status: ${response.status}`);
    }
    
    if (!data.events || !Array.isArray(data.events)) {
      console.error('Invalid response format from Luma API:', data);
      throw new Error('Invalid response format from Luma API');
    }
    
    if (data.events.length === 0) {
      console.log("No events returned from Luma API, using mock data");
      return getMockEvents();
    }
    
    console.log(`Successfully retrieved ${data.events.length} events from Luma API`);
    
    // Map Luma API events to our internal event format
    return data.events.map((event: LumaApiEvent) => ({
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
  } catch (error) {
    console.error("Error fetching Luma events:", error);
    // Fallback to mock data on error
    console.log("Returning mock data due to error");
    return getMockEvents();
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
