
import React, { useState } from "react";
import { ArrowRight, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

// Narra phone number
const NARRA_PHONE_NUMBER = "+15072003303";

interface CallNarraFormProps {
  className?: string;
  buttonClassName?: string;
  buttonText?: React.ReactNode;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  mobileLayout?: boolean;
}

export const CallNarraForm: React.FC<CallNarraFormProps> = ({
  className = "",
  buttonClassName = "",
  buttonText,
  onSuccess,
  onError,
  mobileLayout = false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCallNarra = () => {
    try {
      setIsLoading(true);
      
      // Open phone dialer with Narra's number
      window.location.href = `tel:${NARRA_PHONE_NUMBER}`;
      
      // Call onSuccess callback
      onSuccess?.();
      
      toast({
        title: "Calling Narra",
        description: "Your phone will now dial Narra.",
      });
    } catch (error) {
      console.error("Error:", error);
      
      let errorMessage = "Something went wrong. Please try dialing +1 (507) 200-3303 directly.";
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
    <div className={className}>
      <Button 
        onClick={handleCallNarra}
        className={`w-full rounded-full h-12 text-white text-base flex items-center justify-center gap-2 font-light ${buttonClassName}`}
        style={{
          background: "linear-gradient(284.53deg, #101629 30.93%, #2F3546 97.11%)",
        }}
        disabled={isLoading}
      >
        {isLoading ? "Calling..." : buttonText || (
          <>
            <Phone className="mr-2 h-5 w-5" />
            Talk with 
            <img 
              src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets//narra-icon-white.svg" 
              alt="Narra Icon" 
              className="w-5 h-5 relative -top-[2px] mx-1"
            />
            <span className="font-light">Narra</span> 
            <ArrowRight className="h-4 w-4 ml-1" />
          </>
        )}
      </Button>
      <p className="text-sm text-center text-muted-foreground mt-2">
        <a href={`tel:${NARRA_PHONE_NUMBER}`} className="text-[#A33D29] hover:underline">
          +1 (507) 200-3303
        </a>
      </p>
    </div>
  );
};

export default CallNarraForm;
