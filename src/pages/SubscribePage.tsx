
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PlanSelectionScreen from '@/components/subscription/PlanSelectionScreen';
import Cookies from 'js-cookie';
import { useToast } from '@/hooks/use-toast';

const SubscribePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check authentication state on component mount
  useEffect(() => {
    const isAuthorized = Cookies.get('profile_authorized') === 'true';
    const profileId = Cookies.get('profile_id');
    
    console.log("Subscribe page authentication check:", {
      isAuthorized,
      profileId,
      allCookies: Object.keys(Cookies.get())
    });
    
    // If auth state is explicitly false (not just undefined/missing), redirect to sign in
    if (isAuthorized === false) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access subscription options.",
        variant: "destructive",
      });
      navigate('/sign-in?redirect=subscribe', { replace: true });
    }
  }, [navigate, toast]);
  
  return <PlanSelectionScreen />;
};

export default SubscribePage;
