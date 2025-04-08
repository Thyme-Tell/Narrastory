
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SubscriptionDashboard from '@/components/subscription/SubscriptionDashboard';
import { useAuth } from '@/contexts/AuthContext';

const SubscriptionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  // Using user?.id instead of profileId
  const profileId = user?.id;
  
  // Redirect if not authenticated or trying to access someone else's subscription
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/sign-in');
    } else if (id && id !== profileId) {
      navigate(`/subscription/${profileId}`);
    }
  }, [isAuthenticated, id, profileId, navigate]);
  
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center mb-8">
        <Button 
          variant="ghost" 
          className="mr-2" 
          size="sm"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold font-serif">Subscription Management</h1>
      </div>
      
      <SubscriptionDashboard profileId={id || profileId || ''} />
    </div>
  );
};

export default SubscriptionPage;
