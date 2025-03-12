
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareUrl: string | null;
  storyTitle?: string | null;
}

const ShareDialog = ({ open, onOpenChange, shareUrl, storyTitle = "My Story" }: ShareDialogProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Reset copy state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setIsCopied(false);
    }
  }, [open]);

  const copyShareLink = async () => {
    if (!shareUrl) {
      toast({
        title: "Error",
        description: "Share link not available",
        variant: "destructive",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      toast({
        title: "Success",
        description: "Share link copied to clipboard",
      });
      
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleNativeShare = async () => {
    if (!shareUrl) {
      toast({
        title: "Error",
        description: "Share link not available",
        variant: "destructive",
      });
      return;
    }

    try {
      await navigator.share({
        title: storyTitle || "My Story",
        text: "Check out my story on Narra",
        url: shareUrl,
      });
      toast({
        title: "Success",
        description: "Story shared successfully",
      });
      onOpenChange(false); // Close dialog after successful share
    } catch (err) {
      // AbortError is thrown when user cancels the share dialog, so we don't show an error
      if ((err as Error).name !== 'AbortError') {
        console.error("Error sharing:", err);
        toast({
          title: "Error",
          description: "Failed to share story",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Share Story</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              value={shareUrl || ""}
              readOnly
              className="flex-1"
            />
            <Button onClick={copyShareLink}>
              {isCopied ? "Copied" : "Copy"}
            </Button>
          </div>
          
          {isMobile && navigator.share && (
            <Button 
              onClick={handleNativeShare} 
              className="w-full" 
              variant="outline"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share with apps
            </Button>
          )}
          
          <p className="text-sm text-muted-foreground">
            Anyone with this link can view this story
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
