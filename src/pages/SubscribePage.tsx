
import React from 'react';
import { useParams } from 'react-router-dom';
import PlanSelectionScreen from '@/components/subscription/PlanSelectionScreen';

const SubscribePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  return <PlanSelectionScreen />;
};

export default SubscribePage;
