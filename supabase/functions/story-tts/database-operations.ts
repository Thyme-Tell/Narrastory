
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

/**
 * Save or update audio metadata in the database
 */
export async function saveAudioMetadata(
  storyId: string, 
  audioUrl: string, 
  voiceId: string,
  provider: string = 'amazon-polly'
): Promise<void> {
  console.log('Saving audio metadata to database...');
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Check if a record for this story already exists
  const { data: existing, error: checkError } = await supabase
    .from('story_audio')
    .select('id')
    .eq('story_id', storyId)
    .maybeSingle();
    
  if (checkError) {
    throw new Error(`Failed to check existing audio metadata: ${checkError.message}`);
  }
  
  let result;
  
  if (existing) {
    // Update existing record
    result = await supabase
      .from('story_audio')
      .update({
        audio_url: audioUrl,
        voice_id: voiceId,
        provider: provider,
        updated_at: new Date().toISOString()
      })
      .eq('story_id', storyId);
  } else {
    // Insert new record
    result = await supabase
      .from('story_audio')
      .insert({
        story_id: storyId,
        audio_url: audioUrl,
        voice_id: voiceId,
        provider: provider,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
  }
  
  if (result.error) {
    throw new Error(`Failed to save audio metadata: ${result.error.message}`);
  }
  
  console.log('Audio metadata saved successfully');
}
