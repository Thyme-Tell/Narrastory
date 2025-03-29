import React, { useState, FormEvent } from "react";
import { normalizePhoneNumber } from "@/utils/phoneUtils";
import { ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Edge Function URL for initiating the call
const EDGE_FUNCTION_URL = "/api/synthflow-proxy";
// Fallback direct URL
const SYNTHFLOW_FORM_URL = "https://workflow.synthflow.ai/forms/PnhLacw4fc58JJlHzm3r2";

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
      
      // Submit the phone number to our edge function
      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: normalized }),
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("Response from edge function:", result);
      
      if (result.success) {
        if (result.redirectUrl) {
          // If we get a redirect URL, navigate to it
          console.log("Redirecting to:", result.redirectUrl);
          window.location.href = result.redirectUrl;
        } else {
          // Otherwise, show success message
          toast({
            title: "Success",
            description: "We're calling you now!",
          });
          
          onSuccess?.(normalized);
          setPhoneNumber("");
        }
      } else {
        throw new Error(result.error || "Failed to initiate call");
      }
    } catch (error) {
      console.error("Error:", error);
      
      // As a fallback, redirect directly to Synthflow form
      const normalized = normalizePhoneNumber(phoneNumber);
      console.log("Using direct Synthflow fallback for:", normalized);
      window.location.href = `${SYNTHFLOW_FORM_URL}?Phone=${encodeURIComponent(normalized)}`;
      
      let errorMessage = "Something went wrong. Redirecting you to our call system...";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Note",
        description: errorMessage,
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
