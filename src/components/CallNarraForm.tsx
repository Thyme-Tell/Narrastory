
import React, { useState, useRef } from "react";
import { normalizePhoneNumber } from "@/utils/phoneUtils";
import { ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Define the Synthflow webhook URL for direct form submission
const SYNTHFLOW_WEBHOOK_URL = "https://workflow.synthflow.ai/forms/PnhLacw4fc58JJlHzm3r2";
// Fallback to the Edge Function if direct submission fails
const EDGE_FUNCTION_URL = "/api/synthflow-proxy";

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
  const formRef = useRef<HTMLFormElement>(null);
  const hiddenFormRef = useRef<HTMLFormElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
  };

  const submitDirectlyToSynthflow = async (phone: string) => {
    try {
      // Create a FormData object for direct submission
      const formData = new FormData();
      formData.append('Phone', phone);

      // First attempt: Use the Edge Function
      console.log("Attempting to use Edge Function for submission");
      try {
        const response = await fetch(EDGE_FUNCTION_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ Phone: phone }),
        });
        
        const result = await response.json();
        console.log("Edge function response:", result);
        
        if (result.success) {
          console.log("Call initiated successfully via Edge Function");
          return true;
        }
        
        if (result.useDirectSubmission) {
          console.log("Edge function suggests direct submission");
          // Use the hidden form for direct submission
          if (hiddenFormRef.current) {
            console.log("Submitting via hidden form");
            const phoneInput = hiddenFormRef.current.querySelector('input[name="Phone"]') as HTMLInputElement;
            if (phoneInput) {
              phoneInput.value = phone;
              hiddenFormRef.current.submit();
              return true;
            }
          }
          
          // Fallback to fetch with no-cors if hidden form submission fails
          console.log("Hidden form not available, using fetch with no-cors");
          await fetch(SYNTHFLOW_WEBHOOK_URL, {
            method: 'POST',
            body: formData,
            mode: 'no-cors',
          });
          
          return true;
        }
      } catch (error) {
        console.error("Edge function error:", error);
        // Continue to direct form submission fallback
      }
      
      // Second attempt: Direct form submission
      console.log("Attempting direct form submission");
      if (hiddenFormRef.current) {
        console.log("Submitting via hidden form");
        const phoneInput = hiddenFormRef.current.querySelector('input[name="Phone"]') as HTMLInputElement;
        if (phoneInput) {
          phoneInput.value = phone;
          hiddenFormRef.current.submit();
          return true;
        }
      }
      
      // Third attempt: Use fetch with no-cors as last resort
      console.log("Using fetch with no-cors as last resort");
      await fetch(SYNTHFLOW_WEBHOOK_URL, {
        method: 'POST',
        body: formData,
        mode: 'no-cors',
      });
      
      return true;
    } catch (error) {
      console.error("All submission methods failed:", error);
      return false;
    }
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
      
      // Try submitting to Synthflow
      const submissionResult = await submitDirectlyToSynthflow(normalized);
      
      if (submissionResult) {
        toast({
          title: "Success",
          description: "Your call is being initiated. Expect a call soon!",
        });
        setPhoneNumber("");
        onSuccess?.(normalized);
      } else {
        throw new Error("Failed to initiate call through all available methods");
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
    <>
      {/* Visible form for user interaction */}
      <form onSubmit={handleSubmit} className={className} ref={formRef}>
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

      {/* Hidden form for direct submission to Synthflow */}
      <form 
        ref={hiddenFormRef}
        action={SYNTHFLOW_WEBHOOK_URL}
        method="POST"
        target="_blank"
        style={{ display: 'none' }}
      >
        <input type="hidden" name="Phone" />
      </form>
    </>
  );
};

export default CallNarraForm;
