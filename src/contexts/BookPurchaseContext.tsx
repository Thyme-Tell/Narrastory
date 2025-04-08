
import React, { createContext, useContext, useState } from 'react';

interface BookPurchaseContextProps {
  profileId: string;
  bookId: string;
  bookPrice: number;
  onComplete?: () => void;
  onCancel?: () => void;
}

interface BookPurchaseContextValue {
  profileId: string;
  bookId: string;
  bookPrice: number;
  isPurchaseInProgress: boolean;
  purchaseError: string | null;
  remainingCredits: number; // Added this property
  completePurchase: () => Promise<void>;
  cancelPurchase: () => void;
}

const BookPurchaseContext = createContext<BookPurchaseContextValue | undefined>(undefined);

export const BookPurchaseProvider: React.FC<BookPurchaseContextProps & { children: React.ReactNode }> = ({
  profileId,
  bookId,
  bookPrice,
  onComplete,
  onCancel,
  children
}) => {
  const [isPurchaseInProgress, setIsPurchaseInProgress] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  // Default value for remaining credits
  const [remainingCredits] = useState(1);

  const completePurchase = async () => {
    setIsPurchaseInProgress(true);
    setPurchaseError(null);
    
    try {
      // Placeholder for future implementation
      console.log('Book purchase functionality to be implemented');
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setPurchaseError('There was an error processing your purchase. Please try again later.');
    } finally {
      setIsPurchaseInProgress(false);
    }
  };

  const cancelPurchase = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const value: BookPurchaseContextValue = {
    profileId,
    bookId,
    bookPrice,
    isPurchaseInProgress,
    purchaseError,
    remainingCredits, // Added this property to the context value
    completePurchase,
    cancelPurchase
  };

  return (
    <BookPurchaseContext.Provider value={value}>
      {children}
    </BookPurchaseContext.Provider>
  );
};

export const useBookPurchase = () => {
  const context = useContext(BookPurchaseContext);
  if (context === undefined) {
    throw new Error('useBookPurchase must be used within a BookPurchaseProvider');
  }
  return context;
};
