
import React, { createContext, useContext, useState } from 'react';
import { useSubscriptionService } from '@/hooks/useSubscriptionService';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface BookPurchaseContextType {
  isUsingCredits: boolean;
  remainingCredits: number;
  togglePaymentMethod: () => void;
  completePurchase: () => Promise<void>;
  isPurchaseInProgress: boolean;
  purchaseError: string | null;
}

interface BookPurchaseProviderProps {
  children: React.ReactNode;
  profileId: string;
  bookId: string;
  bookPrice: number;
  onComplete?: () => void;
  onCancel?: () => void;
}

const BookPurchaseContext = createContext<BookPurchaseContextType | null>(null);

export const BookPurchaseProvider: React.FC<BookPurchaseProviderProps> = ({
  children,
  profileId,
  bookId,
  bookPrice,
  onComplete,
  onCancel
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { status, useBookCredits } = useSubscriptionService(profileId);
  
  const [isUsingCredits, setIsUsingCredits] = useState(status.bookCredits > 0);
  const [isPurchaseInProgress, setIsPurchaseInProgress] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  
  const togglePaymentMethod = () => {
    setIsUsingCredits(!isUsingCredits);
  };
  
  const completePurchase = async (): Promise<void> => {
    setIsPurchaseInProgress(true);
    setPurchaseError(null);
    
    try {
      if (isUsingCredits) {
        // Process the purchase using book credits
        if (status.bookCredits <= 0) {
          throw new Error('Insufficient book credits');
        }
        
        const result = await useBookCredits({
          profileId,
          bookId,
          amount: 1
        });
        
        if (!result.success) {
          throw new Error(result.message || 'Failed to use book credits');
        }
        
        // Show success toast
        toast({
          title: 'Book Purchase Complete',
          description: `You've successfully purchased this book using 1 credit. You have ${result.remainingCredits} credit(s) remaining.`,
          variant: 'default',
        });
        
        // Complete the purchase process
        if (onComplete) {
          onComplete();
        }
      } else {
        // Redirect to payment page (this will be implemented later)
        console.log('Redirecting to payment page...');
        toast({
          title: 'Payment Method Coming Soon',
          description: 'Credit card payment functionality is coming soon. Please use book credits for now.',
          variant: 'default',
        });
        
        // For now, just simulate success after a delay
        setTimeout(() => {
          if (onComplete) {
            onComplete();
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setPurchaseError(error.message || 'An unexpected error occurred');
      toast({
        title: 'Purchase Failed',
        description: error.message || 'An unexpected error occurred during the purchase process.',
        variant: 'destructive',
      });
      return;
    } finally {
      setIsPurchaseInProgress(false);
    }
  };
  
  return (
    <BookPurchaseContext.Provider value={{
      isUsingCredits,
      remainingCredits: status.bookCredits,
      togglePaymentMethod,
      completePurchase,
      isPurchaseInProgress,
      purchaseError
    }}>
      {children}
    </BookPurchaseContext.Provider>
  );
};

export const useBookPurchase = () => {
  const context = useContext(BookPurchaseContext);
  if (!context) {
    throw new Error('useBookPurchase must be used within a BookPurchaseProvider');
  }
  return context;
};
