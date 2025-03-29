
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
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
  };

  const submitToSynthflowViaForm = (phone: string) => {
    // Create a hidden iframe to handle the form submission without navigating away
    const iframe = document.createElement('iframe');
    iframe.name = 'synthflow-submit-frame';
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    // Create a form element to submit directly
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = SYNTHFLOW_WEBHOOK_URL;
    form.target = 'synthflow-submit-frame';
    
    // Add the phone input field
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'Phone';
    input.value = phone;
    form.appendChild(input);
    
    // Add the form to the document, submit it, and clean up
    document.body.appendChild(form);
    
    // Set up message listener for iframe load
    iframe.onload = () => {
      console.log("Form submission iframe loaded");
      
      // Clean up after some delay to ensure the submission completes
      setTimeout(() => {
        document.body.removeChild(form);
        document.body.removeChild(iframe);
        setIsFormSubmitting(false);
        
        toast({
          title: "Success",
          description: "Your call is being initiated. Expect a call soon!",
        });
        
        onSuccess?.(phone);
      }, 1000);
    };
    
    // Submit the form
    console.log("Submitting form directly to Synthflow");
    form.submit();
  };

  const submitToEdgeFunction = async (phone: string) => {
    try {
      console.log("Falling back to Edge Function proxy:", EDGE_FUNCTION_URL);
      
      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Phone: phone }),
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

      onSuccess?.(phone);
    } catch (error) {
      console.error("Error submitting phone number to Edge Function:", error);
      throw error; // Re-throw to be caught by the main handler
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
      
      // Log the normalized phone number for debugging
      console.log("Normalized phone number:", normalized);
      
      // First try direct form submission (most reliable for webhook forms)
      if (!isFormSubmitting) {
        setIsFormSubmitting(true);
        submitToSynthflowViaForm(normalized);
        setPhoneNumber("");
        setIsLoading(false);
        return;
      }
      
      // If we're already submitting a form, try the Edge Function as backup
      await submitToEdgeFunction(normalized);
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
          disabled={isLoading || isFormSubmitting}
        />
        <Button 
          type="submit"
          className={`${mobileLayout ? 'w-full' : 'absolute right-1 top-1'} rounded-full h-10 text-white text-base flex items-center gap-2 font-light ${buttonClassName}`}
          style={{
            background: "linear-gradient(284.53deg, #101629 30.93%, #2F3546 97.11%)",
          }}
          disabled={isLoading || isFormSubmitting}
        >
          {isLoading || isFormSubmitting ? "Calling..." : buttonText || (
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
