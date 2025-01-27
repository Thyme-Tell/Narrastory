import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

interface BookProgressProps {
  profileId: string;
}

const BookProgress = ({ profileId }: BookProgressProps) => {
  const [isHidden, setIsHidden] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [hasOrderedBook, setHasOrderedBook] = useState(false);
  const { toast } = useToast();
  
  const { data: stories } = useQuery({
    queryKey: ["stories", profileId],
    queryFn: async () => {
      const { data: storiesData, error: storiesError } = await supabase
        .from("stories")
        .select("content")
        .eq("profile_id", profileId);

      if (storiesError) {
        console.error("Error fetching stories:", storiesError);
        return [];
      }

      return storiesData;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", profileId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const calculatePages = (stories: { content: string }[] | undefined) => {
    if (!stories) return 0;
    
    const totalCharacters = stories.reduce((acc, story) => {
      return acc + (story.content?.length || 0);
    }, 0);

    // Using 1500 characters per page as a conservative estimate
    return Math.ceil(totalCharacters / 1500);
  };

  const handleOrderBook = async () => {
    try {
      const { error } = await supabase.functions.invoke('send-book-order-email', {
        body: {
          profileId,
          userEmail: profile?.email,
        },
      });

      if (error) throw error;
      
      setShowSuccessDialog(true);
      setHasOrderedBook(true);
    } catch (error) {
      console.error('Error ordering book:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem ordering your book. Please try again.",
      });
    }
  };

  const currentPages = calculatePages(stories);
  const requiredPages = 25;
  const remainingPages = Math.max(0, requiredPages - currentPages);
  const progressPercentage = Math.min((currentPages / requiredPages) * 100, 100);

  if (isHidden) {
    return null;
  }

  if (!stories?.length) {
    return (
      <div className="mb-6 rounded-lg bg-white/50 p-6 shadow-sm text-center">
        <h2 className="text-2xl font-semibold text-atlantic mb-2">Share your first story</h2>
        <p className="text-atlantic mb-2">Call <a href="tel:+15072003303" className="text-[#A33D29] hover:underline">+1 (507) 200-3303</a></p>
        <p className="text-atlantic text-sm">One phone call, one memory at a time.</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 rounded-lg bg-white/50 shadow-sm relative">
        <button 
          onClick={() => setIsHidden(true)}
          className="absolute top-4 right-4 text-atlantic/70 hover:text-atlantic z-10"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>
        <div className="flex flex-col">
          <div className="w-full h-64 relative">
            <img
              src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets/book-image.png?t=2025-01-27T11%3A42%3A27.791Z"
              alt="Book progress illustration"
              className="w-full h-full object-cover rounded-t-lg"
            />
          </div>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-atlantic mb-2 text-left">
              {currentPages < 3 ? "Wonderful start!" : "Great progress!"}
            </h2>
            <p className="text-atlantic mb-4 text-left">
              You've completed {currentPages} {currentPages === 1 ? 'page' : 'pages'} of your story. 
              {currentPages < requiredPages && (
                <> Just {remainingPages} more {remainingPages === 1 ? 'page' : 'pages'} until your book is ready to print!</>
              )}
            </p>
            <Progress value={progressPercentage} className="h-2" />
            {currentPages >= requiredPages && (
              <div className="mt-4">
                <Button 
                  className="w-full bg-[#A33D29] hover:bg-[#A33D29]/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  size="lg"
                  onClick={handleOrderBook}
                  disabled={hasOrderedBook}
                >
                  {hasOrderedBook ? "Your book has been requested" : "Order Book"}
                </Button>
              </div>
            )}
          </div>
        </div>
        <button 
          onClick={() => setIsHidden(true)}
          className="w-full text-center p-4 text-sm text-atlantic/70 hover:text-atlantic"
        >
          {currentPages >= requiredPages ? "Remind me later" : "Dismiss"}
        </button>
      </div>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              Book Request Received
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-atlantic">
              You have successfully requested a book. We'll reach out to you directly through email and/or a call.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BookProgress;