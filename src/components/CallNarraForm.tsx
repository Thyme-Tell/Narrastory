
import React, { useState, useRef, FormEvent } from "react";
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
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
  };

  // Client-side submission directly to Synthflow - this is used as a fallback
  const clientSideSubmit = async (phone: string): Promise<boolean> => {
    try {
      console.log("Attempting client-side submission...");
      
      // Create FormData for the submission
      const formData = new FormData();
      formData.append('Phone', phone);
      
      // Use fetch with no-cors to avoid CORS issues
      // Note: This won't return a useful response due to no-cors mode
      // but it will still submit the data
      await fetch(SYNTHFLOW_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: formData
      });
      
      console.log("Client-side submission completed");
      return true;
    } catch (error) {
      console.error("Client-side submission failed:", error);
      return false;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
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
      // Normalize the phone number
      const normalized = normalizePhoneNumber(phoneNumber);
      console.log("Normalized phone number:", normalized);
      
      // First attempt: Use the Edge Function
      console.log("Attempting to use Edge Function");
      let success = false;
      
      try {
        const response = await fetch(EDGE_FUNCTION_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ Phone: normalized }),
        });
        
        const result = await response.json();
        console.log("Edge function response:", result);
        
        if (result.success) {
          success = true;
          console.log("Call initiated successfully via Edge Function");
        } else if (result.useClientFallback) {
          // Edge function suggests client-side fallback
          console.log("Using client-side fallback as suggested by edge function");
          success = await clientSideSubmit(normalized);
        }
      } catch (error) {
        console.error("Edge function error:", error);
        // If Edge Function fails, try client-side submission as fallback
        success = await clientSideSubmit(normalized);
      }
      
      if (success) {
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
      {/* Main form for user interaction */}
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
      
      {/* Hidden iframe to receive form responses without page navigation */}
      <iframe 
        ref={iframeRef}
        name="synthflow-form-target" 
        style={{ display: 'none' }} 
        title="Synthflow form target"
      />
    </>
  );
};

export default CallNarraForm;
