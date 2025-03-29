
import React, { useState } from "react";
import { normalizePhoneNumber } from "@/utils/phoneUtils";
import { ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Define the Synthflow webhook URL for direct form submission
const SYNTHFLOW_WEBHOOK_URL = "https://workflow.synthflow.ai/forms/PnhLacw4fc58JJlHzm3r2";
// Fallback to the Edge Function if direct submission fails
const EDGE_FUNCTION_URL = "https://pohnhzxqorelllbfnqyj.supabase.co/functions/v1/start-narra-call";

interface CallNarraFormProps {
  className?: string;
  phoneInputClassName?: string;
  buttonClassName?: string;
  buttonText?: React.ReactNode;
  onSuccess?: (phone: string) => void;
  onError?: (error: string) => void;
  mobileLayout?: boolean;
}

export const CallNarraForm: React.FC<CallNarraFormProps> = ({
  className = "",
  phoneInputClassName = "",
  buttonClassName = "",
  buttonText,
  onSuccess,
  onError,
  mobileLayout = false
}) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter your phone number.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const normalized = normalizePhoneNumber(phoneNumber);
      
      // Log the normalized phone number for debugging
      console.log("Normalized phone number:", normalized);
      
      // Create the payload with the expected field name "Phone"
      const webhookPayload = {
        Phone: normalized
      };
      
      console.log("Sending webhook payload to Synthflow:", webhookPayload);
      
      // Try direct submission with no-cors mode first
      try {
        console.log("Attempting direct submission with no-cors mode");
        await fetch(SYNTHFLOW_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'no-cors', // Use no-cors mode to bypass CORS restrictions
          body: JSON.stringify(webhookPayload),
        });
        
        // Because no-cors doesn't return a readable response, we just assume it worked
        console.log("Direct submission with no-cors completed");
        
        toast({
          title: "Success",
          description: "Your call is being initiated. Expect a call soon!",
        });
        
        onSuccess?.(normalized);
        setPhoneNumber("");
        return;
      } catch (directError) {
        // If direct submission fails, fall back to the edge function
        console.error("Direct submission failed, falling back to Edge Function:", directError);
      }
      
      // Fallback: Use the Edge Function as a proxy
      console.log("Falling back to Edge Function proxy:", EDGE_FUNCTION_URL);
      
      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Phone: normalized }),
      });
      
      console.log("Edge Function response status:", response.status);
      
      // Try to parse response text for debugging
      const responseText = await response.text();
      console.log("Edge Function response:", responseText);
      
      if (!response.ok) {
        throw new Error(`Failed to submit phone number: ${responseText || response.statusText}`);
      }

      toast({
        title: "Success",
        description: "Your call is being initiated. Expect a call soon!",
      });

      onSuccess?.(normalized);
      setPhoneNumber("");
      
    } catch (error) {
      console.error("Error submitting phone number:", error);
      
      let errorMessage = "Something went wrong. Please try again later.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const defaultButton = (
    <>
      Talk with 
      <img 
        src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets//narra-icon-white.svg" 
        alt="Narra Icon" 
        className="w-5 h-5 relative -top-[2px]"
      />
      <span className="font-light">Narra</span> 
      <ArrowRight className="h-4 w-4" />
    </>
  );

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className={`relative w-full ${mobileLayout ? 'flex flex-col' : ''}`}>
        <Input
          type="tel"
          value={phoneNumber}
          onChange={handleChange}
          placeholder={inputFocused ? "" : "Your phone number"}
          className={`w-full h-12 bg-white/67 border border-[rgba(89,89,89,0.32)] rounded-full text-base ${
            mobileLayout ? 'mb-2 pr-5 text-center' : 'pr-[150px]'
          } outline-none ${phoneInputClassName}`}
          onFocus={() => setInputFocused(true)}
          onBlur={() => !phoneNumber && setInputFocused(false)}
          disabled={isLoading}
        />
        <Button 
          type="submit"
          className={`${mobileLayout ? 'w-full' : 'absolute right-1 top-1'} rounded-full h-10 text-white text-base flex items-center gap-2 font-light ${buttonClassName}`}
          style={{
            background: "linear-gradient(284.53deg, #101629 30.93%, #2F3546 97.11%)",
          }}
          disabled={isLoading}
        >
          {isLoading ? "Calling..." : buttonText || defaultButton}
        </Button>
      </div>
    </form>
  );
};

export default CallNarraForm;
