
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

// Get environment variables
const SLACK_WEBHOOK_URL = Deno.env.get('SLACK_WEBHOOK_URL')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Create a Supabase client with the service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Define event types
type EventType = 'user_signup' | 'story_created' | 'call_completed' | 'workshop_request';

interface SlackNotifyPayload {
  eventType: EventType;
  title: string;
  data: Record<string, any>;
}

// Function to format the Slack message based on event type
function formatSlackMessage(payload: SlackNotifyPayload): Record<string, any> {
  const { eventType, title, data } = payload;
  const timestamp = new Date().toISOString();
  
  // Base message structure
  const baseMessage = {
    text: `New Activity: ${title}`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `📢 ${title}`,
          emoji: true
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*When:*\n${new Date().toLocaleString()}`
          }
        ]
      },
      {
        type: "divider"
      }
    ]
  };
  
  // Add event-specific fields
  switch (eventType) {
    case 'user_signup':
      baseMessage.blocks[1].fields.push(
        {
          type: "mrkdwn",
          text: `*User:*\n${data.firstName} ${data.lastName}`
        },
        {
          type: "mrkdwn",
          text: `*Phone:*\n${data.phoneNumber || 'Not provided'}`
        }
      );
      break;
      
    case 'story_created':
      baseMessage.blocks[1].fields.push(
        {
          type: "mrkdwn",
          text: `*Story:*\n${data.title || 'Untitled'}`
        },
        {
          type: "mrkdwn",
          text: `*Creator:*\n${data.creatorName || 'Unknown'}`
        }
      );
      break;
      
    case 'call_completed':
      baseMessage.blocks[1].fields.push(
        {
          type: "mrkdwn",
          text: `*User:*\n${data.userName || 'Guest User'}`
        },
        {
          type: "mrkdwn",
          text: `*Duration:*\n${data.duration || 'Unknown'} seconds`
        }
      );
      break;
      
    case 'workshop_request':
      baseMessage.blocks[1].fields.push(
        {
          type: "mrkdwn",
          text: `*Email:*\n${data.email || 'Not provided'}`
        },
        {
          type: "mrkdwn",
          text: `*Preferred Month:*\n${data.month || 'Not specified'}`
        }
      );
      break;
      
    default:
      // Generic fields for any other event type
      Object.entries(data).forEach(([key, value]) => {
        baseMessage.blocks[1].fields.push({
          type: "mrkdwn",
          text: `*${key}:*\n${value || 'Not provided'}`
        });
      });
  }
  
  return baseMessage;
}

// Main function to handle the request
Deno.serve(async (req) => {
  console.log('Slack notification request received');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Check if the Slack webhook URL is configured
    if (!SLACK_WEBHOOK_URL) {
      console.error('SLACK_WEBHOOK_URL is not configured');
      return new Response(
        JSON.stringify({ error: 'Slack webhook URL is not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Parse the request payload
    const payload = await req.json() as SlackNotifyPayload;
    console.log('Received payload:', JSON.stringify(payload));
    
    // Validate the payload
    if (!payload.eventType || !payload.title) {
      console.error('Invalid payload:', payload);
      return new Response(
        JSON.stringify({ error: 'Invalid payload. eventType and title are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Format the Slack message
    const slackMessage = formatSlackMessage(payload);
    console.log('Formatted Slack message:', JSON.stringify(slackMessage));
    
    // Send the message to Slack
    const slackResponse = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(slackMessage)
    });
    
    // Check if the Slack API request was successful
    if (!slackResponse.ok) {
      const errorText = await slackResponse.text();
      console.error('Error sending message to Slack:', errorText);
      
      // Implement retry logic (simplified version)
      if (slackResponse.status === 429) {
        // Rate limited, retry after some time
        console.log('Rate limited by Slack, retrying after 2 seconds');
        
        // Wait for 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Retry the request
        const retryResponse = await fetch(SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(slackMessage)
        });
        
        if (!retryResponse.ok) {
          console.error('Retry failed:', await retryResponse.text());
          throw new Error(`Failed to send message to Slack after retry: ${retryResponse.status}`);
        }
      } else {
        throw new Error(`Failed to send message to Slack: ${slackResponse.status}`);
      }
    }
    
    console.log('Message sent to Slack successfully');
    
    // Return success response
    return new Response(
      JSON.stringify({ success: true, message: 'Notification sent to Slack' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error processing Slack notification:', error);
    
    // Log error to Supabase for debugging
    try {
      await supabase
        .from('error_logs')
        .insert([{
          source: 'slack-notify',
          error_message: error.message,
          error_stack: error.stack,
          timestamp: new Date().toISOString()
        }])
        .select();
    } catch (logError) {
      console.error('Failed to log error to Supabase:', logError);
    }
    
    // Return error response
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
