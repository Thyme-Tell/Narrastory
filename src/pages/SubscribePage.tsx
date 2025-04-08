
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PlanSelectionScreen from '@/components/subscription/PlanSelectionScreen';
import { useAuth } from '@/contexts/AuthContext';

const SubscribePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // If there's no ID in the URL but we have a user, redirect to the user's subscription page
  React.useEffect(() => {
    if (!id && user?.id) {
      navigate(`/subscribe/${user.id}`);
    }
  }, [id, user, navigate]);
  
  return <PlanSelectionScreen />;
};

export default SubscribePage;
