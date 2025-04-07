
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExitIntentPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ExitIntentPopup: React.FC<ExitIntentPopupProps> = ({ open, onOpenChange }) => {
  const [email, setEmail] = React.useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Downloading guide for:", email);
    toast({
      title: "Success!",
      description: "Your free guide has been sent to your email.",
    });
    setEmail("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-caslon">
            Wait! Download our free guide:
          </DialogTitle>
          <DialogDescription>
            "5 Ways to Boost Family Engagement Through Storytelling"
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 mb-6">
          <img
            src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets/guide-preview.png"
            alt="Guide Preview"
            className="rounded-md shadow-md w-full h-auto"
          />
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid w-full items-center gap-2">
            <label htmlFor="exit-email" className="text-left text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              id="exit-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="your@email.com"
            />
          </div>
          
          <Button
            type="submit"
            className="w-full bg-[#A33D29] hover:bg-[#A33D29]/90 text-white"
          >
            Download Free Guide
            <Download className="ml-2 h-4 w-4" />
          </Button>
          
          <p className="text-xs text-center text-gray-500 mt-2">
            We respect your privacy. You can unsubscribe at any time.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExitIntentPopup;
