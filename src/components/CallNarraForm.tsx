
import React, { useState } from "react";
import { ArrowRight, Phone, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";

// Narra phone number
const NARRA_PHONE_NUMBER = "+15072003303";
const FORMATTED_NARRA_PHONE = "+1 (507) 200-3303";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(NARRA_PHONE_NUMBER);
    toast({
      title: "Phone number copied",
      description: "Narra's number has been copied to your clipboard.",
    });
  };

  const handleCallNarra = () => {
    try {
      setIsLoading(true);
      
      if (isMobile) {
        // For mobile, open phone dialer directly with Narra's number
        window.location.href = `tel:${NARRA_PHONE_NUMBER}`;
        
        // Call onSuccess callback
        onSuccess?.();
        
        toast({
          title: "Calling Narra",
          description: "Your phone will now dial Narra.",
        });
      } else {
        // For desktop/iPad, open the dialog
        setIsDialogOpen(true);
      }
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
      
      {/* Phone Dialog for Desktop/iPad */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-caslon font-thin text-[#242F3F] mb-2">Call Narra</DialogTitle>
            <DialogDescription className="text-[#403E43]">
              Call Narra to share your story through a casual conversation.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 bg-[#EFF1E9] rounded-xl">
            <div className="flex items-center justify-center w-16 h-16 bg-[#242F3F]/10 rounded-full mb-4">
              <Phone className="h-8 w-8 text-[#242F3F]" />
            </div>
            <p className="text-xl font-caslon font-thin text-[#242F3F] mb-1">Narra's Phone Number</p>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-2xl font-semibold text-[#A33D29]">{FORMATTED_NARRA_PHONE}</p>
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleCopyNumber}
                className="rounded-full border-[#242F3F]/20 hover:bg-[#242F3F]/10"
              >
                <Copy className="h-4 w-4 text-[#242F3F]" />
                <span className="sr-only">Copy phone number</span>
              </Button>
            </div>
            <p className="text-center text-sm text-[#403E43] mt-4 opacity-80">
              Call this number from your phone to start your conversation with Narra.
            </p>
          </div>
          <div className="flex flex-col space-y-2 mt-2">
            <Button 
              className="w-full bg-[#242F3F] hover:bg-[#242F3F]/90 rounded-[4px]"
              onClick={() => {
                window.location.href = `tel:${NARRA_PHONE_NUMBER}`;
                setIsDialogOpen(false);
              }}
            >
              <Phone className="mr-2 h-4 w-4" />
              Call Now
            </Button>
            <Button 
              variant="outline"
              className="w-full border-[#242F3F]/20 text-[#242F3F] hover:bg-[#242F3F]/10 rounded-[4px]"
              onClick={() => setIsDialogOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CallNarraForm;
