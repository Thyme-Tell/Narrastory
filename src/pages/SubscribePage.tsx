
import React from 'react';
import { useParams } from 'react-router-dom';
import PlanSelectionScreen from '@/components/subscription/PlanSelectionScreen';
import { useAuth } from '@/contexts/AuthContext';

const SubscribePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  return <PlanSelectionScreen />;
};

export default SubscribePage;
