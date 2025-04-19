import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

const SocialProof = () => {
  return (
    <section className="py-16 md:py-24 bg-white/50">
      <div className="max-w-6xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-caslon font-thin text-[#262626]">
            What Our Community Says
          </h2>
          <p className="text-xl text-[#2F3546]">
            Join hundreds of families who have preserved their stories with Narra
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 space-y-4">
              <Quote className="h-8 w-8 text-[#A33D29]" />
              <p className="text-[#2F3546] italic">
                "The Write Your Life program helped me capture my mother's stories in a way that felt natural and meaningful. The process was so easy, and the final book is a treasure our family will cherish forever."
              </p>
              <div className="pt-4">
                <p className="font-semibold text-[#262626]">Joan Gray</p>
                <p className="text-sm text-[#2F3546]">Towerlight Resident</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 space-y-4">
              <Quote className="h-8 w-8 text-[#A33D29]" />
              <p className="text-[#2F3546] italic">
                "As someone who never thought they could write their life story, the guided process made it achievable. The digital platform was intuitive, and the support from the Narra team was exceptional."
              </p>
              <div className="pt-4">
                <p className="font-semibold text-[#262626]">Michael Chen</p>
                <p className="text-sm text-[#2F3546]">Program Participant</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 space-y-4">
              <Quote className="h-8 w-8 text-[#A33D29]" />
              <p className="text-[#2F3546] italic">
                "The combination of technology and personal guidance made this experience truly unique. My family can now access our stories anytime, anywhere, and the physical book is a beautiful keepsake."
              </p>
              <div className="pt-4">
                <p className="font-semibold text-[#262626]">Sarah Johnson</p>
                <p className="text-sm text-[#2F3546]">Program Participant</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center space-y-8">
          <h3 className="text-2xl font-caslon font-thin text-[#262626]">
            Trusted By
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            <img 
              src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets/partner1.png" 
              alt="Partner Organization 1" 
              className="h-12 w-auto opacity-70"
            />
            <img 
              src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets/partner2.png" 
              alt="Partner Organization 2" 
              className="h-12 w-auto opacity-70"
            />
            <img 
              src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets/partner3.png" 
              alt="Partner Organization 3" 
              className="h-12 w-auto opacity-70"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof; 