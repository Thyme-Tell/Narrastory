
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

/**
 * Save or update audio metadata in the database
 */
export async function saveAudioMetadata(
  storyId: string, 
  audioUrl: string, 
  voiceId: string,
  provider?: string
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
    // Update existing record - simplified to avoid using updated_at
    const updateData: any = {
      audio_url: audioUrl,
      voice_id: voiceId
    };
    
    // Only add provider if it's supported by the schema
    if (provider) {
      try {
        // Try to check if the provider column exists
        const { error: schemaError } = await supabase
          .from('story_audio')
          .select('provider')
          .limit(1);
          
        if (!schemaError) {
          updateData.provider = provider;
        } else {
          console.log('Provider column does not exist in schema, skipping...');
        }
      } catch (e) {
        console.log('Error checking provider column, skipping:', e);
      }
    }
    
    result = await supabase
      .from('story_audio')
      .update(updateData)
      .eq('story_id', storyId);
  } else {
    // Insert new record - simplified to avoid using updated_at
    const insertData: any = {
      story_id: storyId,
      audio_url: audioUrl,
      voice_id: voiceId,
      created_at: new Date().toISOString()
    };
    
    // Only add provider if it's supported by the schema
    if (provider) {
      try {
        // Try to check if the provider column exists
        const { error: schemaError } = await supabase
          .from('story_audio')
          .select('provider')
          .limit(1);
          
        if (!schemaError) {
          insertData.provider = provider;
        } else {
          console.log('Provider column does not exist in schema, skipping...');
        }
      } catch (e) {
        console.log('Error checking provider column, skipping:', e);
      }
    }
    
    result = await supabase
      .from('story_audio')
      .insert(insertData);
  }
  
  if (result.error) {
    throw new Error(`Failed to save audio metadata: ${result.error.message}`);
  }
  
  console.log('Audio metadata saved successfully');
}
