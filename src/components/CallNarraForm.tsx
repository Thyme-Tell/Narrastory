
import React, { useState } from "react";
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
  };

  const submitDirectlyToSynthflow = async (phone: string) => {
    try {
      console.log("Submitting data using the edge function");
      
      // Use the edge function to post the data
      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Phone: phone }),
      });
      
      if (!response.ok) {
        const result = await response.json();
        console.log("Edge function response:", result);
        
        if (result.useDirectSubmission) {
          // If the edge function recommends direct submission, use an actual form submission
          console.log("Using direct form submission as recommended by edge function");
          return await submitHiddenForm(phone);
        }
        
        throw new Error(result.error || "Failed to initiate call");
      }
      
      return true;
    } catch (error) {
      console.error("Edge function error:", error);
      // Try direct form submission as a last resort
      return await submitHiddenForm(phone);
    }
  };

  const submitHiddenForm = async (phone: string) => {
    return new Promise<boolean>((resolve) => {
      try {
        console.log("Submitting directly using hidden form");
        
        // Create the form data
        const formData = new FormData();
        formData.append('Phone', phone);
        
        // Fetch API with POST method
        fetch(SYNTHFLOW_WEBHOOK_URL, {
          method: 'POST',
          body: formData,
          mode: 'no-cors' // This is crucial for cross-origin form submissions
        }).then(() => {
          // We can't actually check the response with no-cors
          // So we assume it succeeded
          resolve(true);
        }).catch((error) => {
          console.error("Direct form fetch error:", error);
          resolve(false);
        });
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
      
      // Try submitting directly to Synthflow
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
