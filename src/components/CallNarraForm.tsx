
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

  const submitFormDirectly = (phone: string) => {
    return new Promise<boolean>((resolve) => {
      try {
        console.log("Submitting directly to Synthflow form:", SYNTHFLOW_WEBHOOK_URL);
        
        // Create a form element to submit directly
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = SYNTHFLOW_WEBHOOK_URL;
        form.target = '_blank'; // Open in new tab to avoid navigation
        form.style.display = 'none';
        
        // Add the phone input field
        const input = document.createElement('input');
        input.type = 'text';
        input.name = 'Phone';
        input.value = phone;
        form.appendChild(input);
        
        // Add the form to the document, submit it, and clean up
        document.body.appendChild(form);
        
        // Submit the form
        form.submit();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(form);
          resolve(true);
        }, 1000);
      } catch (error) {
        console.error("Error with direct form submission:", error);
        resolve(false);
      }
    });
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
      console.log("Normalized phone number:", normalized);
      
      // First try direct form submission
      const directSubmissionResult = await submitFormDirectly(normalized);
      
      if (directSubmissionResult) {
        toast({
          title: "Success",
          description: "Your call is being initiated. Expect a call soon!",
        });
        setPhoneNumber("");
        onSuccess?.(normalized);
        setIsLoading(false);
        return;
      }
      
      // If direct submission fails, try the Edge Function
      console.log("Direct form submission failed, trying Edge Function:", EDGE_FUNCTION_URL);
      
      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Phone: normalized }),
      });
      
      console.log("Edge Function response status:", response.status);
      
      const result = await response.json();
      console.log("Edge Function response:", result);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Your call is being initiated. Expect a call soon!",
        });
        setPhoneNumber("");
        onSuccess?.(normalized);
      } else {
        // If Edge Function recommends direct submission
        if (result.useDirectSubmission) {
          console.log("Edge Function suggests direct submission, trying again...");
          const secondAttemptResult = await submitFormDirectly(normalized);
          
          if (secondAttemptResult) {
            toast({
              title: "Success",
              description: "Your call is being initiated. Expect a call soon!",
            });
            setPhoneNumber("");
            onSuccess?.(normalized);
            return;
          }
        }
        
        throw new Error(result.error || "Failed to initiate call");
      }
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
          {isLoading ? "Calling..." : buttonText || (
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
          )}
        </Button>
      </div>
    </form>
  );
};

export default CallNarraForm;
