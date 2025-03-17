
import React from "react";
import NavigationBar from "./navigation-bar";
import { useToast } from "@/hooks/use-toast";

const NavigationBarExample = () => {
  const { toast } = useToast();

  const handleLeftClick = () => {
    toast({
      title: "Previous clicked",
      description: "You clicked the previous button",
    });
  };

  const handleCenterClick = () => {
    toast({
      title: "Continue clicked",
      description: "You clicked the continue button",
    });
  };

  const handleRightClick = () => {
    toast({
      title: "Next clicked",
      description: "You clicked the next button",
    });
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Navigation Bar Example</h1>
      
      <div className="border rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Default Navigation Bar</h2>
        <NavigationBar
          onLeftButtonClick={handleLeftClick}
          onCenterButtonClick={handleCenterClick}
          onRightButtonClick={handleRightClick}
        />
      </div>

      <div className="border rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Custom Text Navigation Bar</h2>
        <NavigationBar
          leftButtonText="Back"
          centerButtonText="Save"
          rightButtonText="Complete"
          onLeftButtonClick={handleLeftClick}
          onCenterButtonClick={handleCenterClick}
          onRightButtonClick={handleRightClick}
        />
      </div>
    </div>
  );
};

export default NavigationBarExample;
