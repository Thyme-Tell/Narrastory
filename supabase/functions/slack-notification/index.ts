
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

// Get environment variables
const SLACK_BOT_TOKEN = Deno.env.get('SLACK_BOT_TOKEN')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Create a Supabase client with the service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Slack message formatting function
function formatSlackMessage(
  activityType: string,
  message: string,
  timestamp: string,
  metadata: Record<string, any> = {}
): any {
  // Format based on activity type
  switch (activityType) {
    case 'user_signup':
      return {
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '🎉 New User Signup',
              emoji: true
            }
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Name:* ${metadata.name || 'Unknown'}`
              },
              {
                type: 'mrkdwn',
                text: `*Phone:* ${metadata.phone || 'Not provided'}`
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
        ]
      };
    case 'story_created':
      return {
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '📝 New Story Created',
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
        ]
      };
    case 'story_shared':
      return {
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '🔗 Story Shared',
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
                text: `*Shared by:* ${metadata.author || 'Unknown'}`
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
        ]
      };
    case 'book_progress':
      return {
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '📚 Book Progress Update',
              emoji: true
            }
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*User:* ${metadata.user || 'Unknown'}`
              },
              {
                type: 'mrkdwn',
                text: `*Progress:* ${metadata.progress || '0'}%`
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
        ]
      };
    default:
      // Generic activity format
      return {
        blocks: [
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
        ]
      };
  }
}

// Function to send message to Slack
async function sendToSlack(channel: string, payload: any): Promise<any> {
  const response = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': `Bearer ${SLACK_BOT_TOKEN}`
    },
    body: JSON.stringify({
      channel: channel,
      ...payload
    })
  });

  const data = await response.json();
  
  if (!data.ok) {
    console.error('Error sending message to Slack:', data.error);
    throw new Error(`Slack API Error: ${data.error}`);
  }
  
  return data;
}

// Main server function
Deno.serve(async (req) => {
  console.log('Slack notification endpoint received a request');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse request body
    const payload = await req.json();
    console.log('Request payload:', payload);
    
    // Extract necessary data from payload
    const { 
      channel = '#app-activity',
      message,
      activity_type,
      timestamp = new Date().toISOString(),
      metadata = {}
    } = payload;
    
    if (!message || !activity_type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: message and activity_type are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Format timestamp for display
    const formattedTimestamp = new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
    
    // Format the Slack message
    const slackPayload = formatSlackMessage(
      activity_type,
      message,
      formattedTimestamp,
      metadata
    );
    
    // Send to Slack
    const slackResponse = await sendToSlack(channel, slackPayload);
    console.log('Successfully sent message to Slack:', slackResponse.ts);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        slack_timestamp: slackResponse.ts,
        message: 'Notification sent to Slack successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
    
  } catch (error) {
    console.error('Error processing slack notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
