
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { useSubscriptionService } from '@/hooks/useSubscriptionService';
import { useToast } from '@/hooks/use-toast';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';

interface BookPurchaseContextProps {
  bookId?: string;
  bookTitle: string;
  bookPrice: number;
  isUsingCredits: boolean;
  remainingCredits: number;
  isPurchasing: boolean;
  setUsingCredits: (useCredits: boolean) => void;
  startPurchase: () => Promise<void>;
  purchaseWithCredits: () => Promise<boolean>;
  purchaseWithPayment: () => Promise<boolean>;
}

const BookPurchaseContext = createContext<BookPurchaseContextProps | undefined>(undefined);

export const useBookPurchase = () => {
  const context = useContext(BookPurchaseContext);
  if (!context) {
    throw new Error('useBookPurchase must be used within a BookPurchaseProvider');
  }
  return context;
};

interface BookPurchaseProviderProps {
  children: ReactNode;
  profileId: string;
  bookId?: string;
  bookTitle: string;
  bookPrice: number;
}

export const BookPurchaseProvider: React.FC<BookPurchaseProviderProps> = ({
  children,
  profileId,
  bookId,
  bookTitle,
  bookPrice
}) => {
  const [isUsingCredits, setUsingCredits] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  
  const { toast } = useToast();
  const { bookCredits } = useSubscription(profileId);
  const { useBookCredits, isUsingCredits: isProcessingCredits } = useSubscriptionService(profileId);
  const { createFirstBookCheckout, createAdditionalBookCheckout, isLoading: isCheckoutLoading } = useStripeCheckout();

  // Determine if this is a first book or additional book
  const isFirstBook = !bookId; // If no bookId, assume it's the first book

  const startPurchase = async () => {
    setIsPurchasing(true);
    if (isUsingCredits) {
      return await purchaseWithCredits();
    } else {
      return await purchaseWithPayment();
    }
  };

  const purchaseWithCredits = async (): Promise<boolean> => {
    if (bookCredits <= 0) {
      toast({
        title: "Insufficient Credits",
        description: "You don't have enough book credits. Please purchase with payment method.",
        variant: "destructive",
      });
      setUsingCredits(false);
      return false;
    }

    try {
      useBookCredits({
        profileId,
        bookId,
        amount: 1
      });
      
      toast({
        title: "Book Purchased Successfully",
        description: `You've used 1 credit to purchase "${bookTitle}".`,
      });
      
      return true;
    } catch (error) {
      console.error("Error using book credits:", error);
      toast({
        title: "Credit Usage Failed",
        description: "There was an error using your book credit. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsPurchasing(false);
    }
  };

  const purchaseWithPayment = async (): Promise<boolean> => {
    try {
      toast({
        title: "Processing Payment",
        description: "Setting up checkout...",
      });
      
      if (isFirstBook) {
        await createFirstBookCheckout(profileId);
      } else {
        await createAdditionalBookCheckout(profileId);
      }
      
      return true;
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast({
        title: "Checkout Failed",
        description: "There was an error setting up the payment. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <BookPurchaseContext.Provider
      value={{
        bookId,
        bookTitle,
        bookPrice,
        isUsingCredits,
        remainingCredits: bookCredits,
        isPurchasing: isPurchasing || isProcessingCredits || isCheckoutLoading,
        setUsingCredits,
        startPurchase,
        purchaseWithCredits,
        purchaseWithPayment
      }}
    >
      {children}
    </BookPurchaseContext.Provider>
  );
};
