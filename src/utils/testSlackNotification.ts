
import { supabase } from "@/integrations/supabase/client";

/**
 * Test function to verify Slack notification functionality
 * @param forceRefresh If true, bypass cache and force a fresh request
 */
export async function testSlackConnection(forceRefresh: boolean = false): Promise<any> {
  try {
    const { data, error } = await supabase.functions.invoke('slack-notification', {
      body: {
        activity_type: 'test_connection',
        timestamp: forceRefresh ? new Date().toISOString() : undefined
      },
      // Add cache control to ensure we get fresh results on force refresh
      headers: forceRefresh ? { 'Cache-Control': 'no-cache' } : undefined
    });

    if (error) {
      console.error('Error testing Slack connection:', error);
      return { success: false, error: error.message };
    }

    return data;
  } catch (error) {
    console.error('Failed to test Slack connection:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
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
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
