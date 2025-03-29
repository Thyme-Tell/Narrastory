
import React, { useState, FormEvent } from "react";
import { normalizePhoneNumber } from "@/utils/phoneUtils";
import { ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Synthflow form URL
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
      
      // Direct redirect to Synthflow form
      window.location.href = `${SYNTHFLOW_FORM_URL}?Phone=${encodeURIComponent(normalized)}`;
      
      // Call onSuccess callback
      onSuccess?.(normalized);
      
    } catch (error) {
      console.error("Error:", error);
      
      let errorMessage = "Something went wrong. Please try again.";
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
