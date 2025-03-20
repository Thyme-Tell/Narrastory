
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
