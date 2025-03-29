
import { useQuery } from "@tanstack/react-query";

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

// This function fetches events from the Luma API
export async function fetchLumaEvents(): Promise<LumaEvent[]> {
  try {
    // In a real implementation, this would call the actual Luma API
    // For now, we'll return mock data to demonstrate the UI
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
  } catch (error) {
    console.error("Error fetching Luma events:", error);
    throw error;
  }
}
