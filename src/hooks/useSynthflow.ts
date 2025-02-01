import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSynthflow = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const synthesizeText = async (text: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('synthflow', {
        body: { text },
      });

      if (error) throw error;

      return data;
    } catch (err) {
      setError(err.message);
      console.error('Synthflow error:', err);
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