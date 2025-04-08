
import React from 'react';
import { useParams } from 'react-router-dom';
import LifetimeCheckout from '@/components/subscription/LifetimeCheckout';

const LifetimeCheckoutPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  return <LifetimeCheckout />;
};

export default LifetimeCheckoutPage;
