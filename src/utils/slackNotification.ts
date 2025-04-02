
import { supabase } from "@/integrations/supabase/client";

interface SlackNotificationParams {
  message: string;
  activityType: string;
  channel?: string;
  metadata?: Record<string, any>;
}

/**
 * Sends a notification to Slack about app activity
 * 
 * @param params - Notification parameters
 * @returns Promise with the response from the edge function
 */
export async function sendSlackNotification(params: SlackNotificationParams): Promise<any> {
  try {
    const { message, activityType, channel = '#app-activity', metadata = {} } = params;
    
    const { data, error } = await supabase.functions.invoke('slack-notification', {
      body: {
        message,
        activity_type: activityType,
        channel,
        timestamp: new Date().toISOString(),
        metadata
      }
    });

    if (error) {
      console.error('Error sending Slack notification:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to send Slack notification:', error);
    // Don't throw, just log - we don't want UI to break if notification fails
    return { success: false, error: error.message };
  }
}

/**
 * Helper function to notify about new user signups
 */
export function notifyUserSignup(firstName: string, lastName: string, phoneNumber: string): Promise<any> {
  return sendSlackNotification({
    activityType: 'user_signup',
    message: `A new user has signed up: ${firstName} ${lastName}`,
    metadata: {
      name: `${firstName} ${lastName}`,
      phone: phoneNumber
    }
  });
}

/**
 * Helper function to notify about new stories
 */
export function notifyStoryCreated(storyTitle: string, authorName: string, profileId: string): Promise<any> {
  return sendSlackNotification({
    activityType: 'story_created',
    message: `A new story "${storyTitle}" was created`,
    metadata: {
      title: storyTitle,
      author: authorName,
      profileId
    }
  });
}

/**
 * Helper function to notify about shared stories
 */
export function notifyStoryShared(storyTitle: string, authorName: string, shareToken: string): Promise<any> {
  return sendSlackNotification({
    activityType: 'story_shared',
    message: `A story "${storyTitle}" was shared using share token`,
    metadata: {
      title: storyTitle,
      author: authorName,
      shareToken
    }
  });
}

/**
 * Helper function to notify about book progress
 */
export function notifyBookProgress(userName: string, progress: number, profileId: string): Promise<any> {
  return sendSlackNotification({
    activityType: 'book_progress',
    message: `${userName} made progress on their book (${progress}% complete)`,
    metadata: {
      user: userName,
      progress: progress.toString(),
      profileId
    }
  });
}
