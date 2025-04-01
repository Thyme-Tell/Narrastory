
import React, { useState } from "react";
import { Calendar, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import FormField from "@/components/FormField";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

interface SeniorLivingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

const SeniorLivingDialog: React.FC<SeniorLivingDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [email, setEmail] = useState("");
  const [month, setMonth] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email is required",
        description: "Please enter your email address.",
        variant: "destructive"
      });
      return;
    }
    
    // Email submission logic
    const subject = "Workshop Request";
    const body = `
Email: ${email}
Preferred Month: ${month}
Note: ${note}
    `;
    
    window.location.href = `mailto:richard@narrastory.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    toast({
      title: "Workshop request submitted",
      description: "We'll get back to you within 1 business day.",
    });
    
    setIsSubmitted(true);
  };
  
  const resetForm = () => {
    setEmail("");
    setMonth("");
    setNote("");
    setIsSubmitted(false);
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl rounded-xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-caslon font-thin text-[#242F3F] mb-2">
            Schedule a Workshop
          </DialogTitle>
          <DialogDescription className="text-[#403E43]">
            Fill out the form below to schedule a Narra workshop for your senior living community.
          </DialogDescription>
        </DialogHeader>
        
        {isSubmitted ? (
          <div className="space-y-6 py-4">
            <div className="bg-[#F8E3C8]/30 rounded-xl p-6 text-center">
              <h3 className="text-xl font-caslon text-[#A33D29] mb-3">Thank You!</h3>
              <p className="text-[#403E43] mb-4">
                Your workshop request has been submitted. We'll get back to you within 1 business day.
              </p>
              <Button 
                onClick={resetForm}
                className="mt-2 bg-[#A33D29] hover:bg-[#A33D29]/90"
              >
                Schedule Another Workshop
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="space-y-4">
              <FormField
                label="Email Address"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required={true}
                placeholder="Enter your email"
              />
              
              <div className="space-y-2 text-left">
                <Label htmlFor="month" className="block text-left">
                  Preferred Month for Workshop *
                </Label>
                <select
                  id="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="flex h-10 w-full rounded-[7px] border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground placeholder:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  required
                >
                  <option value="" disabled>Select a month</option>
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2 text-left">
                <Label htmlFor="note" className="block text-left">
                  Note to Narra Team
                </Label>
                <Textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Any additional information or questions..."
                  className="min-h-[120px]"
                />
              </div>
            </div>
            
            <div className="bg-[#FBF7F1] rounded-xl p-4 border border-[#F8E3C8] text-[#674019]">
              <p className="text-sm mb-1 font-medium">What happens next?</p>
              <p className="text-xs">After submitting this form, we'll get back to you within 1 business day to discuss workshop details and scheduling.</p>
            </div>
            
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button variant="outline" type="button" className="border-[#242F3F]/20 text-[#242F3F]">
                  Cancel
                </Button>
              </DialogClose>
              <Button 
                type="submit"
                className="bg-[#A33D29] hover:bg-[#A33D29]/90"
              >
                <Send className="mr-2 h-4 w-4" />
                Submit Request
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SeniorLivingDialog;
