import React, { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";

interface PurchaseSectionProps {
  ref?: React.Ref<HTMLElement>;
}

const PurchaseSection = forwardRef<HTMLElement, PurchaseSectionProps>((props, ref) => {
  const navigate = useNavigate();

  const handlePurchaseClick = async () => {
    try {
      // TODO: Implement Stripe checkout session creation
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price: 49900, // $499 in cents
          productName: 'Write Your Life Program',
        }),
      });

      const { sessionId } = await response.json();
      
      // Redirect to Stripe Checkout
      const stripe = await loadStripe(process.env.VITE_STRIPE_PUBLISHABLE_KEY);
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({
          sessionId,
        });
        
        if (error) {
          console.error('Stripe checkout error:', error);
          // Handle error appropriately
        }
      }
    } catch (error) {
      console.error('Error initiating checkout:', error);
      // Handle error appropriately
    }
  };

  const inclusions = [
    "Complete Write Your Life program access",
    "Professional story capture sessions",
    "Digital story preservation",
    "Family collaboration features",
    "Physical book option",
    "Lifetime access to digital content",
    "Priority support"
  ];

  return (
    <section ref={ref} className="py-16 md:py-24 bg-white/50">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-caslon font-thin text-[#262626]">
            Start Your Story Today
          </h2>
          <p className="text-xl text-[#2F3546]">
            Join the Write Your Life program and preserve your family's legacy
          </p>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 space-y-8">
            <div className="text-center">
              <p className="text-4xl font-caslon font-thin text-[#262626]">
                $499
              </p>
              <p className="text-[#2F3546]">One-time payment</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-caslon font-thin text-[#262626]">
                Program Inclusions:
              </h3>
              <ul className="space-y-3">
                {inclusions.map((inclusion, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#A33D29] mt-1" />
                    <span className="text-[#2F3546]">{inclusion}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-center space-y-4">
              <Button 
                onClick={handlePurchaseClick}
                className="bg-[#A33D29] hover:bg-[#A33D29]/90 text-white text-lg px-8 py-6 rounded-full w-full md:w-auto"
              >
                Join Write Your Life Program
              </Button>
              <p className="text-sm text-[#2F3546]">
                30-day money-back guarantee
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <h3 className="text-xl font-caslon font-thin text-[#262626]">
            Questions?
          </h3>
          <p className="text-[#2F3546]">
            Contact us at{" "}
            <a href="mailto:support@narrastory.com" className="text-[#A33D29] hover:underline">
              support@narrastory.com
            </a>
          </p>
        </div>
      </div>
    </section>
  );
});

PurchaseSection.displayName = "PurchaseSection";

export default PurchaseSection; 