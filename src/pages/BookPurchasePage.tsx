
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookPurchaseFlow } from '@/components/book-purchase/BookPurchaseFlow';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BookPurchasePage: React.FC = () => {
  const { profileId } = useParams<{ profileId: string }>();
  const navigate = useNavigate();
  
  // These would typically come from your API or props
  const sampleBook = {
    id: "sample-book-123",
    title: "My Family Stories",
    price: 29.99
  };
  
  const handleComplete = () => {
    // Redirect back to the book preview or wherever appropriate
    navigate(`/book-preview/${profileId}`);
  };
  
  const handleGoBack = () => {
    navigate(-1);
  };
  
  if (!profileId) {
    return (
      <div className="container max-w-md mx-auto py-12">
        <div className="text-center">
          <p>Profile ID is required. Please go back and try again.</p>
          <Button 
            onClick={() => navigate('/')}
            className="mt-4"
          >
            Go Home
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-md mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          className="mr-2" 
          size="sm"
          onClick={handleGoBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
      
      <BookPurchaseFlow
        profileId={profileId}
        bookId={sampleBook.id}
        bookTitle={sampleBook.title}
        bookPrice={sampleBook.price}
        onComplete={handleComplete}
        onCancel={handleGoBack}
      />
    </div>
  );
};

export default BookPurchasePage;
