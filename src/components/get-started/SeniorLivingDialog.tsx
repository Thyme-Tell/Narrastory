
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email is required",
        description: "Please enter your email address.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Email submission to mia@narrastory.com
      const response = await fetch("https://formsubmit.co/ajax/mia@narrastory.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          email,
          preferredMonth: month,
          note,
          _subject: "Workshop Request from Narra Website"
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to submit form");
      }
      
      // First close the dialog
      onOpenChange(false);
      
      // Then show the toast that stays until manually closed
      toast({
        title: "Workshop request submitted",
        description: "We'll get back to you within 1 business day to discuss workshop details and scheduling.",
        duration: 0, // Duration of 0 means the toast stays until manually closed
      });
      
      // Reset form for next time
      resetForm();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again or contact us directly",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setEmail("");
    setMonth("");
    setNote("");
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
                Preferred Month for Workshop
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
                placeholder="Any additional information or questions, including specific dates or goals you have in mind for an activity with Narra..."
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
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Request
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SeniorLivingDialog;
