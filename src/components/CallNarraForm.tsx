
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePhoneInput } from "@/hooks/usePhoneInput";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ArrowRight } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface CallNarraFormProps {
  className?: string;
  variant?: "default" | "gradient" | "minimal";
  size?: "default" | "small" | "large";
}

const CallNarraForm = ({ className = "", variant = "default", size = "default" }: CallNarraFormProps) => {
  const phone = usePhoneInput("");
  const [isCallInitiated, setIsCallInitiated] = useState(false);
  
  const initiateCall = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Don't proceed if already submitting or invalid
    if (phone.isSubmitting || !phone.isValid) return;
    
    try {
      phone.setIsSubmitting(true);
      
      // Get the normalized phone number
      const phoneNumber = phone.getNormalizedValue();
      
      console.log("Initiating call to:", phoneNumber);
      
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke("synthflow-call", {
        body: { phoneNumber }
      });
      
      if (error) {
        console.error("Error calling synthflow-call function:", error);
        throw new Error(error.message || "Failed to initiate call");
      }
      
      console.log("Call initiated successfully:", data);
      
      // Show success message
      toast({
        title: "Call Initiated",
        description: "You will receive a call from Narra shortly.",
        variant: "default"
      });
      
      // Update UI state
      setIsCallInitiated(true);
      
    } catch (error) {
      console.error("Error initiating call:", error);
      
      // Show error message
      toast({
        title: "Error",
        description: error.message || "Failed to initiate call. Please try again.",
        variant: "destructive"
      });
      
      phone.setError(error.message || "Failed to initiate call");
    } finally {
      phone.setIsSubmitting(false);
    }
  };
  
  const buttonContents = phone.isSubmitting ? (
    <>
      <LoadingSpinner className="h-4 w-4 text-white" />
      <span>Calling...</span>
    </>
  ) : (
    <>
      <span>Talk with</span>
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
    <form onSubmit={initiateCall} className={`relative w-full ${className}`}>
      <div className={`relative ${size === "small" ? "max-w-sm" : size === "large" ? "max-w-lg" : "max-w-md"} mx-auto`}>
        <Input
          type="tel"
          value={phone.value}
          onChange={phone.handleChange}
          onBlur={phone.handleBlur}
          placeholder="Your phone number"
          className={`w-full pr-[150px] h-12 ${
            variant === "minimal" ? "bg-white border-input" :
            variant === "gradient" ? "bg-white/80 border border-[rgba(89,89,89,0.42)]" :
            "bg-white/67 border border-[rgba(89,89,89,0.32)]"
          } rounded-full text-base outline-none ${phone.error && phone.isTouched ? "border-destructive" : ""}`}
          disabled={phone.isSubmitting || isCallInitiated}
        />
        
        <Button 
          type="submit"
          className={`absolute right-1 top-1 rounded-full h-10 text-white text-base flex items-center gap-2 font-light ${
            phone.isSubmitting ? "opacity-90" : ""
          }`}
          style={{
            background: "linear-gradient(284.53deg, #101629 30.93%, #2F3546 97.11%)",
          }}
          disabled={!phone.isValid || phone.isSubmitting || isCallInitiated}
        >
          {isCallInitiated ? 
            <>Call initiated <span className="ml-1">✓</span></> : 
            buttonContents
          }
        </Button>
      </div>
      
      {phone.error && phone.isTouched && (
        <p className="text-sm text-destructive mt-1 text-center">{phone.error}</p>
      )}
      
      {isCallInitiated && (
        <p className="text-sm text-center mt-2 text-emerald-700">
          You'll receive a call shortly. Please answer when your phone rings!
        </p>
      )}
    </form>
  );
};

export default CallNarraForm;
