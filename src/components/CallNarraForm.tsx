
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/ui/phone-input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CallNarraFormProps {
  buttonText?: string;
  className?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const CallNarraForm = ({
  buttonText = "Talk with Narra",
  className = "",
  onSuccess,
  onError
}: CallNarraFormProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const validatePhoneNumber = (phone: string) => {
    const digitsOnly = phone.replace(/\D/g, "");
    return digitsOnly.length >= 10 && digitsOnly.length <= 15;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    
    // Validate phone number
    if (!validatePhoneNumber(phoneNumber)) {
      setError("Please enter a valid phone number");
      onError?.("Invalid phone number");
      return;
    }
    
    // Start loading
    setIsLoading(true);
    
    try {
      // Call the Supabase edge function
      const { data, error: callError } = await supabase.functions.invoke('initiate-call', {
        body: { phoneNumber }
      });
      
      if (callError || (data && data.error)) {
        throw new Error(data?.error || data?.details || callError?.message || "Failed to initiate call");
      }
      
      // Success handling
      setSuccess(true);
      setPhoneNumber("");
      
      toast({
        title: "Call initiated!",
        description: "You'll receive a call from Narra shortly.",
      });
      
      onSuccess?.();
      
    } catch (err: any) {
      console.error("Error initiating call:", err);
      setError(err.message || "Something went wrong. Please try again.");
      onError?.(err.message || "Unknown error");
      
      toast({
        title: "Error initiating call",
        description: err.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="relative flex flex-col sm:flex-row gap-2 items-center">
        <PhoneInput
          value={phoneNumber}
          onChange={setPhoneNumber}
          className="w-full h-12 bg-white/67 border border-[rgba(89,89,89,0.32)] rounded-full text-base pl-5 pr-5"
          disabled={isLoading}
          aria-label="Your phone number"
          error={error || undefined}
        />
        
        <Button 
          type="submit"
          className="rounded-full h-10 text-white text-base flex items-center gap-2 font-light w-full sm:w-auto"
          style={{
            background: "linear-gradient(284.53deg, #101629 30.93%, #2F3546 97.11%)",
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <LoadingSpinner className="h-5 w-5 text-white" />
          ) : (
            <>
              {buttonText} 
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
      </form>
      
      {success && (
        <Alert className="mt-2 bg-green-50 text-green-800 border-green-200">
          <AlertDescription>
            Call initiated! You'll receive a call from Narra shortly.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
