
import React from "react";

const WelcomeSection: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-caslon font-bold text-atlantic mb-6">
          Welcome to Narra
        </h2>
        <p className="text-base md:text-lg text-[#262626] mb-8">
          Your place to create, share, and preserve your most important stories.
        </p>
        
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h3 className="text-xl md:text-2xl font-caslon font-bold text-atlantic mb-4">
            Get Started with Narra
          </h3>
          <p className="text-sm md:text-base text-[#262626] mb-4">
            Narra helps you create beautiful storybooks from your personal memories and experiences.
            Our intuitive tools make it easy to write, illustrate, and share your stories with loved ones.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;
