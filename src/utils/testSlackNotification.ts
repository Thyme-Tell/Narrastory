
import { supabase } from "@/integrations/supabase/client";

/**
 * Test function to verify Slack notification functionality
 */
export async function testSlackConnection(): Promise<any> {
  try {
    const { data, error } = await supabase.functions.invoke('slack-notification', {
      body: {
        activity_type: 'test_connection'
      }
    });

    if (error) {
      console.error('Error testing Slack connection:', error);
      return { success: false, error: error.message };
    }

    return data;
  } catch (error) {
    console.error('Failed to test Slack connection:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send a test message to Slack
 */
export async function sendTestMessage(message: string): Promise<any> {
  try {
    const { data, error } = await supabase.functions.invoke('slack-notification', {
      body: {
        message,
        activity_type: 'test_message',
        metadata: {
          source: 'Manual Test',
          timestamp: new Date().toISOString()
        }
      }
    });

    if (error) {
      console.error('Error sending test message to Slack:', error);
      return { success: false, error: error.message };
    }

    return data;
  } catch (error) {
    console.error('Failed to send test message to Slack:', error);
    return { success: false, error: error.message };
  }
}
