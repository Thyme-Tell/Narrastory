
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PlanSelectionScreen from '@/components/subscription/PlanSelectionScreen';
import Cookies from 'js-cookie';
import { useToast } from '@/hooks/use-toast';

const SubscribePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(true);
  
  // Check authentication state on component mount
  useEffect(() => {
    const checkAuth = () => {
      // Get auth data from cookies
      const isAuthorized = Cookies.get('profile_authorized');
      const profileId = Cookies.get('profile_id');
      
      console.log("Subscribe page authentication check:", {
        isAuthorized,
        profileId,
        allCookies: Object.keys(Cookies.get())
      });
      
      // If no auth cookie or explicitly set to "false", redirect to sign in
      if (isAuthorized !== 'true') {
        console.log("Not authenticated, redirecting to sign in");
        toast({
          title: "Authentication Required",
          description: "Please sign in to access subscription options.",
          variant: "destructive",
        });
        navigate('/sign-in?redirect=subscribe', { replace: true });
      }
      
      setIsChecking(false);
    };
    
    // Small delay to ensure cookies have time to be processed
    setTimeout(checkAuth, 100);
  }, [navigate, toast]);
  
  // Show loading or the actual content
  if (isChecking) {
    return <div className="flex items-center justify-center min-h-screen">
      <p>Loading subscription options...</p>
    </div>;
  }
  
  return <PlanSelectionScreen />;
};

export default SubscribePage;
