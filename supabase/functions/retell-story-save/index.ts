
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

// Get environment variables
const RETELL_API_KEY = Deno.env.get('RETELL_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SLACK_BOT_TOKEN = Deno.env.get('SLACK_BOT_TOKEN');

// Create a Supabase client with the service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Main server function
Deno.serve(async (req) => {
  console.log('Retell story save endpoint received a request');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse request body
    const payload = await req.json();
    console.log('Request payload:', JSON.stringify(payload));
    
    // Extract necessary data from payload
    const { profile_id, story_content, call_id, user_id, metadata, retell_llm_dynamic_variables, summary } = payload;
    
    // Get the profile ID from all possible sources
    let finalProfileId = profile_id || user_id;
    
    // Try to get profile ID from different places based on Retell's structure
    if (!finalProfileId) {
      // Check retell_llm_dynamic_variables first (most likely place based on docs)
      if (retell_llm_dynamic_variables && retell_llm_dynamic_variables.user_id) {
        finalProfileId = retell_llm_dynamic_variables.user_id;
      }
      // Then check metadata
      else if (metadata && metadata.user_id) {
        finalProfileId = metadata.user_id;
      }
      // Try to get from call data if we have call_id
      else if (call_id) {
        try {
          const callData = await fetchCallDetails(call_id);
          if (callData.retell_llm_dynamic_variables && callData.retell_llm_dynamic_variables.user_id) {
            finalProfileId = callData.retell_llm_dynamic_variables.user_id;
          } 
          else if (callData.metadata && callData.metadata.user_id) {
            finalProfileId = callData.metadata.user_id;
          }
        } catch (error) {
          console.error('Error fetching call details:', error);
        }
      }
    }
    
    if (!finalProfileId || !story_content) {
      console.error('Missing required fields in request', { finalProfileId, hasContent: !!story_content });
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields',
          fields_received: Object.keys(payload),
          profile_id_found: finalProfileId,
          content_length: story_content ? story_content.length : 0
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Process the story content
    const lines = story_content.split('\n').filter((line: string) => line.trim() !== '');
    // Use the first line as the title if it exists
    const title = lines.length > 0 ? lines[0].trim() : 'Phone Call Story';
    // Use the rest as the content
    const content = lines.length > 1 ? lines.slice(1).join('\n').trim() : story_content;
    
    // Use the provided summary or null
    const storySummary = summary ? summary.trim() : null;
    
    console.log('Processed story:', { 
      title, 
      content: content.substring(0, 100) + '...',
      summary: storySummary ? storySummary.substring(0, 100) + '...' : 'None provided'
    });
    
    // Encrypt sensitive content before storing
    const { data: encryptedTitle, error: titleEncryptError } = await supabase.rpc(
      'encrypt_text',
      { text_to_encrypt: title }
    );
    
    if (titleEncryptError) {
      console.error('Error encrypting title:', titleEncryptError);
      // Continue with original title as fallback
    }
    
    const { data: encryptedContent, error: contentEncryptError } = await supabase.rpc(
      'encrypt_text',
      { text_to_encrypt: content }
    );
    
    if (contentEncryptError) {
      console.error('Error encrypting content:', contentEncryptError);
      // Continue with original content as fallback
    }
    
    let encryptedSummary = null;
    if (storySummary) {
      const { data: encSummary, error: summaryEncryptError } = await supabase.rpc(
        'encrypt_text',
        { text_to_encrypt: storySummary }
      );
      
      if (summaryEncryptError) {
        console.error('Error encrypting summary:', summaryEncryptError);
        // Continue with original summary as fallback
      } else {
        encryptedSummary = encSummary;
      }
    }
    
    // Insert the story into the database
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .insert([
        {
          profile_id: finalProfileId,
          title: encryptedTitle || title,
          content: encryptedContent || content,
          summary: encryptedSummary || storySummary
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
    
    // Get user info for the notification
    if (SLACK_BOT_TOKEN) {
      try {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("id", finalProfileId)
          .single();
        
        if (profileData) {
          // Send notification to Slack
          await sendSlackNotification({
            channel: '#app-activity',
            activityType: 'story_created',
            message: `A new story "${title}" was created via phone call`,
            metadata: {
              title: title,
              author: `${profileData.first_name} ${profileData.last_name}`,
              profileId: finalProfileId,
              source: 'Retell Phone Call'
            }
          });
        }
      } catch (notificationError) {
        console.error('Error sending Slack notification:', notificationError);
        // Don't fail the request if notification fails
      }
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
    
  } catch (error) {
    console.error('Error processing story save:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Function to fetch call details from Retell API
async function fetchCallDetails(callId: string) {
  try {
    const response = await fetch(`https://api.retellai.com/v1/calls/${callId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RETELL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch call details: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching call details:', error);
    throw error;
  }
}

// Function to send message to Slack
async function sendSlackNotification({
  channel = '#app-activity',
  activityType,
  message,
  metadata = {}
}: {
  channel: string;
  activityType: string;
  message: string;
  metadata?: Record<string, any>;
}): Promise<any> {
  try {
    if (!SLACK_BOT_TOKEN) {
      console.warn('No SLACK_BOT_TOKEN found, skipping notification');
      return;
    }
    
    const timestamp = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
    
    let blocks;
    
    // Format based on activity type
    if (activityType === 'story_created') {
      blocks = [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '📝 New Story Created via Retell',
            emoji: true
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Title:* ${metadata.title || 'Untitled'}`
            },
            {
              type: 'mrkdwn',
              text: `*Created by:* ${metadata.author || 'Unknown'}`
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: message
          }
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `🕒 ${timestamp}`
            }
          ]
        }
      ];
    } else {
      // Generic format
      blocks = [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `📣 ${activityType.charAt(0).toUpperCase() + activityType.slice(1).replace(/_/g, ' ')}`,
            emoji: true
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: message
          }
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `🕒 ${timestamp}`
            }
          ]
        }
      ];
    }
    
    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Bearer ${SLACK_BOT_TOKEN}`
      },
      body: JSON.stringify({
        channel,
        blocks
      })
    });
    
    const data = await response.json();
    
    if (!data.ok) {
      console.error('Error sending message to Slack:', data.error);
      return { success: false, error: data.error };
    }
    
    return { success: true, ts: data.ts };
  } catch (error) {
    console.error('Error in sendSlackNotification:', error);
    return { success: false, error: error.message };
  }
}
