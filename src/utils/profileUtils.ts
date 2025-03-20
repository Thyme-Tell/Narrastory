
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  found: boolean;
  profile?: {
    id: string;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    synthflow_voice_id?: string;
    elevenlabs_voice_id?: string;
    phone_number?: string;
  };
  stories?: {
    count: number;
    has_stories: boolean;
    recent: Array<{
      id: string;
      title: string | null;
      summary: string | null;
      content: string;
      created_at: string;
    }>;
  };
  synthflow_context?: {
    user_id: string;
    user_name: string;
    user_first_name: string;
    user_last_name: string;
    user_email: string;
    user_phone?: string;
    has_stories: boolean;
    story_count: number;
    recent_story_titles: string;
    recent_story_summaries: string;
  };
  message?: string;
  error?: string;
}

/**
 * Lookup a user profile by phone number
 * @param phoneNumber The phone number to lookup
 * @returns UserProfile information including recent stories
 */
export const lookupUserProfileByPhone = async (phoneNumber: string): Promise<UserProfile> => {
  try {
    if (!phoneNumber || phoneNumber.trim() === '') {
      console.error('Empty phone number provided to lookupUserProfileByPhone');
      return {
        found: false,
        error: 'Phone number is required'
      };
    }

    console.log('Looking up profile for phone number:', phoneNumber);
    
    const { data, error } = await supabase.functions.invoke('get-user-profile', {
      method: 'POST',
      body: JSON.stringify({
        phone_number: phoneNumber
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (error) {
      console.error('Error looking up profile:', error);
      return {
        found: false,
        error: error.message
      };
    }

    if (!data) {
      console.error('No data returned from profile lookup');
      return {
        found: false,
        error: 'No data returned from profile lookup'
      };
    }

    console.log('Profile lookup response:', data);
    
    // Check if the response indicates a "found" profile
    if (data.found === false) {
      console.log('Profile not found for phone number:', phoneNumber);
      return {
        found: false,
        message: data.message || 'Profile not found',
        synthflow_context: data.synthflow_context
      };
    }
    
    return data as UserProfile;
  } catch (err) {
    console.error('Exception in profile lookup:', err);
    return {
      found: false,
      error: err instanceof Error ? err.message : String(err)
    };
  }
};

/**
 * Get a formatted list of recent story titles for a user
 * @param profileId The profile ID to lookup
 * @returns A comma-separated list of story titles, or 'none' if no stories
 */
export const getRecentStoryTitles = async (profileId: string): Promise<string> => {
  try {
    if (!profileId) {
      console.error('Empty profileId provided to getRecentStoryTitles');
      return 'none';
    }

    const { data: stories, error } = await supabase
      .from('stories')
      .select('title')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (error) {
      console.error('Error fetching stories:', error);
      return 'none';
    }
    
    if (!stories || stories.length === 0) {
      return 'none';
    }
    
    return stories
      .map(story => story.title || 'Untitled story')
      .join(', ');
      
  } catch (err) {
    console.error('Error getting story titles:', err);
    return 'none';
  }
};

/**
 * Get a formatted list of recent story titles for a user by phone number
 * @param phoneNumber The phone number to lookup
 * @returns A comma-separated list of story titles, or 'none' if no stories
 */
export const getRecentStoryTitlesByPhone = async (phoneNumber: string): Promise<string> => {
  try {
    if (!phoneNumber) {
      console.error('Empty phoneNumber provided to getRecentStoryTitlesByPhone');
      return 'none';
    }

    // First get the profile ID by phone number
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone_number', phoneNumber);
      
    if (profileError || !profiles || profiles.length === 0) {
      console.error('Error finding profile by phone:', profileError || 'No profile found');
      return 'none';
    }
    
    // Use the first profile if multiple are found
    if (profiles.length > 1) {
      console.warn(`Multiple profiles (${profiles.length}) found for phone: ${phoneNumber}. Using the first one.`);
    }
    
    return getRecentStoryTitles(profiles[0].id);
      
  } catch (err) {
    console.error('Error getting story titles by phone:', err);
    return 'none';
  }
};
