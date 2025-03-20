
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';
import { normalizePhoneNumber } from '../_shared/phoneUtils.ts';

// Get environment variables
const SYNTHFLOW_API_KEY = Deno.env.get('SYNTHFLOW_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Create a Supabase client with the service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Main server function
Deno.serve(async (req) => {
  console.log('Synthflow webhook received a request');
  console.log('Request method:', req.method);
  console.log('Request headers:', Object.fromEntries(req.headers.entries()));
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse request body with better error handling
    let payload;
    const contentType = req.headers.get('content-type') || '';
    console.log('Content-Type header:', contentType);
    
    // Clone the request to be able to debug it
    const clonedReq = req.clone();
    const bodyText = await clonedReq.text();
    console.log('Raw request body:', bodyText);
    
    if (!bodyText || bodyText.trim() === '') {
      console.log('Empty request body received');
      return new Response(
        JSON.stringify({ 
          error: "Empty request body",
          content_type: contentType
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    try {
      // Try to parse as JSON
      payload = JSON.parse(bodyText);
      console.log('Parsed payload:', JSON.stringify(payload));
    } catch (parseError) {
      console.error('JSON parse error:', parseError.message);
      
      // If it's not valid JSON but has content, try to extract data using regex
      // This can help with malformed or non-standard JSON
      if (bodyText.includes('phone_number') || bodyText.includes('generated_story')) {
        console.log('Attempting to extract data from non-JSON body');
        payload = {};
        
        // Extract phone number
        const phoneMatch = bodyText.match(/"phone_number"\s*:\s*"([^"]*)"/);
        if (phoneMatch && phoneMatch[1]) {
          payload.phone_number = phoneMatch[1];
        }
        
        // Extract generated story
        const storyMatch = bodyText.match(/"generated_story"\s*:\s*"([^"]*)"/);
        if (storyMatch && storyMatch[1]) {
          payload.generated_story = storyMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
        }
        
        // Extract summary
        const summaryMatch = bodyText.match(/"summary"\s*:\s*"([^"]*)"/);
        if (summaryMatch && summaryMatch[1]) {
          payload.summary = summaryMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
        }
        
        console.log('Extracted payload:', payload);
      } else {
        return new Response(
          JSON.stringify({ 
            error: "Invalid JSON in request body", 
            message: parseError.message,
            received_content: bodyText.substring(0, 200) + (bodyText.length > 200 ? '...' : '')
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }
    
    console.log('Final processed payload:', JSON.stringify(payload));

    // Determine if this is a story-save request or a webhook info request
    const isStorySaveRequest = payload.generated_story || payload.story_content;
    
    if (isStorySaveRequest) {
      // HANDLE STORY SAVE FLOW
      console.log('Processing story save request');
      
      // Extract story content from Synthflow's format
      const storyContent = payload.generated_story || payload.story_content || '';
      const phoneNumber = payload.phone_number || '';
      
      if (!storyContent) {
        console.error('No story content found in the payload', payload);
        return new Response(
          JSON.stringify({ 
            error: 'No story content found in the payload', 
            payload_received: payload 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      // Get the profile ID
      let profileId = payload.profile_id || payload.user_id;
      
      // If no profile ID but we have a phone number, look up by phone
      if (!profileId && phoneNumber) {
        console.log('Looking up profile by phone number:', phoneNumber);
        const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);
        console.log('Normalized phone number:', normalizedPhoneNumber);
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('phone_number', normalizedPhoneNumber)
          .maybeSingle();
          
        if (profileError) {
          console.error('Error looking up profile:', profileError);
        } else if (profile) {
          console.log('Found profile by phone number:', profile);
          profileId = profile.id;
        } else {
          console.log('No profile found for phone number:', normalizedPhoneNumber);
        }
      }
      
      // Check if we have a profile ID and story content
      if (!profileId) {
        console.error('Could not determine profile ID', { 
          phoneNumber,
          hasProfileId: !!profileId
        });
        return new Response(
          JSON.stringify({ 
            error: 'Could not determine profile ID',
            phone_number_received: phoneNumber,
            payload_keys: Object.keys(payload)
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      // Process the story content
      const lines = storyContent.split('\n').filter((line: string) => line.trim() !== '');
      // Use the first line as the title if it exists
      const title = lines.length > 0 ? lines[0].trim() : 'Phone Call Story';
      // Use the rest as the content
      const content = lines.length > 1 ? lines.slice(1).join('\n').trim() : storyContent;
      
      console.log('Processed story:', { 
        title, 
        content_preview: content.substring(0, 100) + (content.length > 100 ? '...' : '')
      });
      
      // Insert the story into the database
      const { data: story, error: storyError } = await supabase
        .from('stories')
        .insert([
          {
            profile_id: profileId,
            title: title,
            content: content,
          },
        ])
        .select()
        .single();
        
      if (storyError) {
        console.error('Error inserting story:', storyError);
        return new Response(
          JSON.stringify({ error: 'Error saving story', details: storyError }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      console.log('Successfully stored story:', story.id);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          story_id: story.id,
          message: 'Story successfully saved' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    } else {
      // HANDLE WEBHOOK INFO FLOW
      console.log('Processing webhook info request');
      
      // Extract the caller's phone number from the Synthflow format
      const callerPhoneNumber = payload?.phone || payload?.caller_number || payload?.from || '';
                                
      if (!callerPhoneNumber) {
        console.error('No phone number provided in the webhook payload');
        return new Response(
          JSON.stringify({ 
            error: "No phone number provided",
            payload_fields: Object.keys(payload || {}).join(', ')
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      // Normalize the phone number for matching
      const normalizedCallerNumber = normalizePhoneNumber(callerPhoneNumber);
      console.log('Normalized caller number:', normalizedCallerNumber);
      
      // Find the user profile by phone number
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, synthflow_voice_id, elevenlabs_voice_id')
        .eq('phone_number', normalizedCallerNumber)
        .maybeSingle();
        
      if (profileError) {
        console.error('Error querying profile:', profileError);
        return new Response(
          JSON.stringify({ error: 'Error querying profile', details: profileError }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      // If no profile found, return a default response
      if (!profile) {
        console.log('No profile found for phone number:', normalizedCallerNumber);
        return new Response(
          JSON.stringify({
            user_name: "Guest",
            user_email: "",
            user_id: "",
            user_first_name: "Guest",
            user_last_name: "",
            has_stories: false,
            story_count: 0,
            recent_story_titles: "none"
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      }
      
      console.log('Found profile:', profile);
      
      // Get user's recent stories to reference in the call
      const { data: recentStories, error: storiesError } = await supabase
        .from('stories')
        .select('id, title')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (storiesError) {
        console.error('Error fetching stories:', storiesError);
      }
      
      console.log('Recent stories:', recentStories);
      
      // Format response for Synthflow with user info
      const userContext = {
        user_id: profile.id,
        user_name: `${profile.first_name} ${profile.last_name}`,
        user_email: profile.email,
        user_first_name: profile.first_name,
        user_last_name: profile.last_name,
        has_stories: recentStories && recentStories.length > 0,
        story_count: recentStories ? recentStories.length : 0,
        recent_story_titles: recentStories && recentStories.length > 0 
          ? recentStories.map((s: any) => s.title || 'Untitled story').join(', ')
          : 'none'
      };
      
      console.log('Returning user context:', userContext);
      
      // Return the user context in the format expected by Synthflow
      return new Response(
        JSON.stringify(userContext),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }
    
  } catch (error) {
    console.error('Error processing Synthflow webhook:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
