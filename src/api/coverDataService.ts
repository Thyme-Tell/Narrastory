
import { supabase } from "@/integrations/supabase/client";
import { CoverData } from "@/components/cover/CoverTypes";

/**
 * Fetches cover data for a specific profile from Supabase
 */
export async function fetchCoverData(profileId: string) {
  console.log('API: Fetching cover data for profile:', profileId);
  
  const { data, error } = await supabase
    .from('book_covers')
    .select('cover_data, updated_at')
    .eq('profile_id', profileId)
    .maybeSingle();

  if (error) {
    console.error('API: Error fetching cover data:', error);
    throw error;
  }

  console.log('API: Received cover data from database:', data);
  return data;
}

/**
 * Saves cover data for a specific profile using Supabase Edge Function
 * @returns Promise resolving to true if save was successful
 */
export async function saveCoverData(profileId: string, coverData: CoverData): Promise<boolean> {
  console.log('API: Saving cover data:', coverData);
  
  const { data, error } = await supabase.functions.invoke('save-cover-data', {
    method: 'POST',
    body: {
      profileId,
      coverData
    },
  });

  if (error) {
    console.error('API: Error from save-cover-data function:', error);
    throw new Error(error.message || 'Failed to save cover data');
  }
  
  console.log('API: Response from save-cover-data function:', data);
  return true;
}
