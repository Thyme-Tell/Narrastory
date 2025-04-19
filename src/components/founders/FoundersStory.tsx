import React, { forwardRef } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface FoundersStoryProps {
  ref?: React.Ref<HTMLElement>;
}

const FoundersStory = forwardRef<HTMLElement, FoundersStoryProps>((props, ref) => {
  return (
    <section ref={ref} className="py-16 md:py-24">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-caslon font-thin text-[#262626]">
            Our Story
          </h2>
          <p className="text-xl text-[#2F3546]">
            How two passionate individuals came together to revolutionize family storytelling
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-2xl font-caslon font-thin text-[#262626]">
                Richard Squires
              </h3>
              <p className="text-[#2F3546]">
                A seasoned memoir writer with over 20 years of experience helping individuals preserve their life stories. Richard's passion for storytelling and his deep understanding of the emotional value of family narratives led him to develop the "Write Your Life" methodology.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-2xl font-caslon font-thin text-[#262626]">
                Mia Peroff
              </h3>
              <p className="text-[#2F3546]">
                A technology innovator with a background in user experience design. Mia recognized the need for a more accessible and engaging way to capture and preserve family stories, leading to the creation of Narra's digital platform.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center space-y-6">
          <h3 className="text-2xl font-caslon font-thin text-[#262626]">
            Our Mission
          </h3>
          <p className="text-xl text-[#2F3546] max-w-3xl mx-auto">
            We believe that every family's story is worth preserving. Our mission is to make the process of capturing and sharing these stories as simple and meaningful as possible, combining the art of memoir writing with the power of modern technology.
          </p>
        </div>
      </div>
    </section>
  );
});

FoundersStory.displayName = "FoundersStory";

export default FoundersStory; 