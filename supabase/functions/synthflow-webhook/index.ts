
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';
import { normalizePhoneNumber } from '../_shared/phoneUtils.ts';

// Get environment variables
const SYNTHFLOW_API_KEY = Deno.env.get('SYNTHFLOW_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Create a Supabase client with the service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Get profile by phone number, create if not exists
 * @param phoneNumber The phone number to lookup
 * @returns The profile object or null if error
 */
async function getOrCreateProfile(phoneNumber: string) {
  if (!phoneNumber) {
    console.error('No phone number provided');
    return null;
  }
  
  // Normalize the phone number for matching
  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  console.log('Looking up profile with normalized phone:', normalizedPhone);
  
  // Find the user profile by phone number
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email, synthflow_voice_id, elevenlabs_voice_id, phone_number')
    .eq('phone_number', normalizedPhone)
    .maybeSingle();
    
  if (profileError) {
    console.error('Error querying profile:', profileError);
    return null;
  }
  
  // If profile exists, return it
  if (profile) {
    console.log('Found existing profile:', profile);
    return profile;
  }
  
  // Create a new profile if one doesn't exist
  console.log('Creating new profile for phone:', normalizedPhone);
  const { data: newProfile, error: createProfileError } = await supabase
    .from('profiles')
    .insert([
      {
        first_name: 'Guest',
        last_name: 'User', // Default last_name
        phone_number: normalizedPhone,
        password: Math.random().toString(36).substring(2, 10) // Simple random password
      }
    ])
    .select()
    .single();
    
  if (createProfileError) {
    console.error('Error creating profile:', createProfileError);
    return null;
  }
  
  console.log('Created new profile:', newProfile);
  return newProfile;
}

/**
 * Get recent stories for a profile
 * @param profileId The profile ID
 * @returns Array of stories or empty array if none/error
 */
async function getRecentStories(profileId: string) {
  if (!profileId) {
    return [];
  }
  
  const { data: stories, error: storiesError } = await supabase
    .from('stories')
    .select('id, title, summary, content, created_at')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
    .limit(5);
    
  if (storiesError) {
    console.error('Error fetching stories:', storiesError);
    return [];
  }
  
  return stories || [];
}

/**
 * Generate Synthflow context object from profile and stories
 * @param profile Profile object
 * @param stories Array of stories
 * @returns Formatted context object for Synthflow
 */
function generateSynthflowContext(profile, stories) {
  const hasStories = stories && stories.length > 0;
  
  return {
    user_id: profile.id,
    user_name: `${profile.first_name} ${profile.last_name || "User"}`,
    user_first_name: profile.first_name,
    user_last_name: profile.last_name || "User",
    user_email: profile.email || "",
    user_phone: profile.phone_number || "",
    has_stories: hasStories,
    story_count: hasStories ? stories.length : 0,
    recent_story_titles: hasStories 
      ? stories.map(s => s.title || 'Untitled story').join(', ')
      : 'none',
    recent_story_summaries: hasStories 
      ? stories.map(s => s.summary || 'No summary available').join(', ')
      : 'none'
  };
}

/**
 * Save a story to the database
 * @param profileId Profile ID to associate with the story
 * @param storyContent Story content text
 * @param summary Optional summary text
 * @returns Saved story or null if error
 */
async function saveStory(profileId: string, storyContent: string, summary: string = '') {
  if (!profileId || !storyContent) {
    console.error('Missing required parameters for saveStory:', { hasProfileId: !!profileId, hasContent: !!storyContent });
    return null;
  }
  
  // Process the story content
  const lines = storyContent.split('\n').filter((line: string) => line.trim() !== '');
  // Use the first line as the title if it exists
  const title = lines.length > 0 ? lines[0].trim() : 'Phone Call Story';
  // Use the rest as the content
  const content = lines.length > 1 ? lines.slice(1).join('\n').trim() : storyContent;
  
  // Use the provided summary or "" if none
  const storySummary = summary.trim();
  
  console.log('Processed story:', { 
    title, 
    content_preview: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
    summary: storySummary ? storySummary.substring(0, 100) + (storySummary.length > 100 ? '...' : '') : 'None provided'
  });
  
  // Insert the story into the database
  const { data: story, error: storyError } = await supabase
    .from('stories')
    .insert([
      {
        profile_id: profileId,
        title: title,
        content: content,
        summary: storySummary || null
      },
    ])
    .select()
    .single();
    
  if (storyError) {
    console.error('Error inserting story:', storyError);
    return null;
  }
  
  console.log('Successfully stored story:', story.id);
  return story;
}

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
    // Clone the request to be able to read the body multiple times
    const clonedReq = req.clone();
    
    // Try to read the body as text first
    let bodyText = '';
    try {
      bodyText = await clonedReq.text();
      console.log('Raw request body:', bodyText);
    } catch (e) {
      console.error('Error reading request body as text:', e);
    }
    
    // If the body is empty, check if data is in the URL (querystring)
    if (!bodyText || bodyText.trim() === '') {
      console.log('Request body is empty, checking URL parameters');
      const url = new URL(req.url);
      const params = url.searchParams;
      
      // Check if we have parameters in the URL
      if (params.has('generated_story') || params.has('phone_number') || params.has('story_content')) {
        console.log('Found data in URL parameters');
        const urlData = {};
        
        // Extract parameters we care about
        for (const [key, value] of params.entries()) {
          if (['generated_story', 'story_content', 'phone_number', 'summary', 'user_id', 'profile_id'].includes(key)) {
            urlData[key] = value;
          }
        }
        
        bodyText = JSON.stringify(urlData);
        console.log('Constructed body from URL parameters:', bodyText);
      } else {
        console.log('No relevant data in URL parameters');
        return new Response(
          JSON.stringify({ 
            error: "Empty request body and no URL parameters found",
            content_type: req.headers.get('content-type') || 'none'
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }
    
    // Parse the body text into an object
    let payload = {};
    try {
      if (bodyText) {
        // Try parsing as JSON first
        try {
          payload = JSON.parse(bodyText);
          console.log('Successfully parsed body as JSON:', JSON.stringify(payload));
        } catch (jsonError) {
          console.log('Failed to parse body as JSON, trying to extract data manually');
          
          // Fallback: Try to extract data using regex
          payload = {};
          
          // Extract phone number
          const phoneMatch = bodyText.match(/"phone_number"\s*:\s*"([^"]*)"/);
          if (phoneMatch && phoneMatch[1]) {
            payload.phone_number = phoneMatch[1];
          } else {
            // Try URL-encoded form data format
            const phoneFormMatch = bodyText.match(/phone_number=([^&]*)/);
            if (phoneFormMatch && phoneFormMatch[1]) {
              payload.phone_number = decodeURIComponent(phoneFormMatch[1]);
            }
          }
          
          // Extract generated story
          const storyMatch = bodyText.match(/"generated_story"\s*:\s*"([^"]*)"/);
          if (storyMatch && storyMatch[1]) {
            payload.generated_story = storyMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
          } else {
            // Try URL-encoded form data format
            const storyFormMatch = bodyText.match(/generated_story=([^&]*)/);
            if (storyFormMatch && storyFormMatch[1]) {
              payload.generated_story = decodeURIComponent(storyFormMatch[1]);
            }
          }
          
          // Extract story_content as an alternative to generated_story
          const contentMatch = bodyText.match(/"story_content"\s*:\s*"([^"]*)"/);
          if (contentMatch && contentMatch[1]) {
            payload.story_content = contentMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
          } else {
            // Try URL-encoded form data format
            const contentFormMatch = bodyText.match(/story_content=([^&]*)/);
            if (contentFormMatch && contentFormMatch[1]) {
              payload.story_content = decodeURIComponent(contentFormMatch[1]);
            }
          }
          
          // Extract summary
          const summaryMatch = bodyText.match(/"summary"\s*:\s*"([^"]*)"/);
          if (summaryMatch && summaryMatch[1]) {
            payload.summary = summaryMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
          } else {
            // Try URL-encoded form data format
            const summaryFormMatch = bodyText.match(/summary=([^&]*)/);
            if (summaryFormMatch && summaryFormMatch[1]) {
              payload.summary = decodeURIComponent(summaryFormMatch[1]);
            }
          }
          
          console.log('Extracted data from non-JSON body:', payload);
        }
      }
    } catch (error) {
      console.error('Error processing request body:', error);
      return new Response(
        JSON.stringify({ 
          error: "Error processing request body", 
          details: error.message,
          body_received: bodyText.substring(0, 200) + (bodyText.length > 200 ? '...' : '')
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log('Final processed payload:', JSON.stringify(payload));
    
    // Determine if this is a story-save request based on having story content
    const storyContent = payload.generated_story || payload.story_content || '';
    const phoneNumber = payload.phone_number || payload.phone || payload.caller_number || payload.from || '';
    const summary = payload.summary || '';
    
    if (storyContent) {
      // HANDLE STORY SAVE FLOW
      console.log('Processing story save request');
      
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
      
      // Get or create profile by phone number
      const profile = await getOrCreateProfile(phoneNumber);
      
      if (!profile) {
        console.error('Could not get or create profile for phone number:', phoneNumber);
        return new Response(
          JSON.stringify({ 
            error: 'Error processing profile', 
            phone_number: phoneNumber 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      // Save the story
      const story = await saveStory(profile.id, storyContent, summary);
      
      if (!story) {
        return new Response(
          JSON.stringify({ error: 'Error saving story' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
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
      // HANDLE WEBHOOK INFO FLOW - Get caller information
      console.log('Processing webhook info request for caller information');
      
      // Extract the caller's phone number from various possible fields
      const callerPhoneNumber = phoneNumber;
                                
      if (!callerPhoneNumber) {
        console.error('No phone number provided in the webhook payload');
        return new Response(
          JSON.stringify({ 
            user_name: "Guest User",
            user_email: "",
            user_id: "",
            user_first_name: "Guest",
            user_last_name: "User",
            has_stories: false,
            story_count: 0,
            recent_story_titles: "none",
            recent_story_summaries: "none"
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }
      
      // Get or create profile by phone number
      const profile = await getOrCreateProfile(callerPhoneNumber);
      
      if (!profile) {
        console.error('Could not get or create profile for caller:', callerPhoneNumber);
        return new Response(
          JSON.stringify({ 
            user_name: "Guest User",
            user_email: "",
            user_id: "",
            user_first_name: "Guest",
            user_last_name: "User",
            has_stories: false,
            story_count: 0,
            recent_story_titles: "none",
            recent_story_summaries: "none"
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }
      
      // Get user's recent stories
      const recentStories = await getRecentStories(profile.id);
      
      // Generate Synthflow context
      const userContext = generateSynthflowContext(profile, recentStories);
      
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
