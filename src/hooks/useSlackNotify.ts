
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendNotification,
    isLoading,
    error,
  };
};
