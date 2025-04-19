import React, { forwardRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";

interface FAQSectionProps {
  ref?: React.Ref<HTMLElement>;
}

interface FAQItem {
  question: string;
  answer: string;
}

const FAQSection = forwardRef<HTMLElement, FAQSectionProps>((props, ref) => {
  const faqs: FAQItem[] = [
    {
      question: "How does the Write Your Life program work?",
      answer: "The program begins with an initial consultation to understand your story and goals. We then conduct professional story capture sessions, either in-person or virtually, where we guide you through sharing your memories. Your stories are digitally preserved and organized, with options for family collaboration. Finally, we create a beautiful physical book of your stories."
    },
    {
      question: "How long does the program take?",
      answer: "The program typically takes 4-6 weeks from start to finish, depending on the number of stories you'd like to capture and your availability for sessions. We work at your pace to ensure a comfortable and meaningful experience."
    },
    {
      question: "What if I'm not a good writer?",
      answer: "You don't need to be a writer to participate! Our professional story capture process is designed to make it easy for anyone to share their stories. We guide you through the process and help organize your memories into a cohesive narrative."
    },
    {
      question: "Can family members participate?",
      answer: "Absolutely! We encourage family participation. Family members can contribute their own stories, add comments to your stories, and help review the final content. This collaborative approach helps create a richer family legacy."
    },
    {
      question: "What happens to my stories after the program?",
      answer: "Your stories are securely stored in your Narra account, where you and your family can access them anytime. You'll also receive a physical book of your stories. We maintain strict privacy and security measures to protect your family's legacy."
    },
    {
      question: "Is there a refund policy?",
      answer: "Yes, we offer a 30-day money-back guarantee. If you're not completely satisfied with the program, we'll refund your payment in full."
    }
  ];

  return (
    <section ref={ref} className="py-16 md:py-24 bg-white/50">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-caslon font-thin text-[#262626]">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-[#2F3546]">
            Everything you need to know about the Write Your Life program
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer">
                    <h3 className="text-lg font-caslon font-thin text-[#262626]">
                      {faq.question}
                    </h3>
                    <ChevronDown className="h-5 w-5 text-[#A33D29] transform group-open:rotate-180 transition-transform" />
                  </summary>
                  <p className="mt-4 text-[#2F3546]">
                    {faq.answer}
                  </p>
                </details>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <p className="text-[#2F3546]">
            Still have questions? Contact us at{" "}
            <a href="mailto:support@narrastory.com" className="text-[#A33D29] hover:underline">
              support@narrastory.com
            </a>
          </p>
        </div>
      </div>
    </section>
  );
});

FAQSection.displayName = "FAQSection";

export default FAQSection; 