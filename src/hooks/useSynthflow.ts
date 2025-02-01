import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSynthflow = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const synthesizeText = async (text: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Calling synthflow function with text:', text);
      const { data, error: functionError } = await supabase.functions.invoke('synthflow', {
        body: { text },
      });

      if (functionError) {
        console.error('Supabase function error:', functionError);
        throw new Error(functionError.message);
      }

      if (!data) {
        throw new Error('No data received from synthesis');
      }

      console.log('Synthesis successful:', data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to synthesize text';
      console.error('Synthflow error:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    synthesizeText,
    isLoading,
    error,
  };
};