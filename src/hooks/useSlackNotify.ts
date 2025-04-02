
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

type EventType = 'user_signup' | 'story_created' | 'call_completed' | 'workshop_request';

interface NotifyParams {
  eventType: EventType;
  title: string;
  data: Record<string, any>;
}

export const useSlackNotify = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendNotification = async ({ eventType, title, data }: NotifyParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: responseData, error: functionError } = await supabase.functions.invoke('slack-notify', {
        body: { eventType, title, data },
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      return responseData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send notification';
      setError(errorMessage);
      console.error('Error sending Slack notification:', errorMessage);
      
      // Show toast notification for error
      toast({
        title: "Notification Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToStoryCreations = () => {
    const channel = supabase
      .channel('story-events')
      .on(
        'postgres_changes',
        {
          event: 'INSERT', 
          schema: 'public',
          table: 'stories',
        },
        async (payload) => {
          const newStory = payload.new;
          
          // Get the user's name if available
          let creatorName = 'Unknown';
          if (newStory.profile_id) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', newStory.profile_id)
              .single();
              
            if (profileData) {
              creatorName = `${profileData.first_name} ${profileData.last_name}`.trim() || 'Unknown';
            }
          }
          
          await sendNotification({
            eventType: 'story_created',
            title: 'New Story Created',
            data: {
              title: newStory.title || 'Untitled Story',
              creatorName,
              storyId: newStory.id,
              timestamp: new Date().toISOString()
            }
          });
        }
      )
      .subscribe();
      
    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel);
    };
  };

  return {
    sendNotification,
    subscribeToStoryCreations,
    isLoading,
    error,
  };
};
