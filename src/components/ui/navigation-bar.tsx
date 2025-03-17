
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationBarProps extends React.HTMLAttributes<HTMLDivElement> {
  leftButtonText?: string;
  centerButtonText?: string;
  rightButtonText?: string;
  onLeftButtonClick?: () => void;
  onCenterButtonClick?: () => void;
  onRightButtonClick?: () => void;
  className?: string;
}

const NavigationBar = ({
  leftButtonText = "Previous",
  centerButtonText = "Continue",
  rightButtonText = "Next",
  onLeftButtonClick,
  onCenterButtonClick,
  onRightButtonClick,
  className,
  ...props
}: NavigationBarProps) => {
  return (
    <div
      className={cn(
        "w-[90%] max-w-[90%] px-4 flex justify-center book-page-background rounded-lg",
        className
      )}
      {...props}
    >
      <div className="w-full flex gap-2 justify-between">
        <Button
          onClick={onLeftButtonClick}
          className="flex-1 min-w-[80px] h-11 bg-[rgb(249,250,251)] text-[rgb(55,65,81)] border border-[rgb(229,231,235)] hover:bg-[rgb(243,244,246)] transition-all duration-200 ease-in-out hover:scale-[1.02] font-normal text-base tracking-[-0.01em] rounded-lg"
          style={{
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
          variant="outline"
        >
          {leftButtonText}
        </Button>

        <Button
          onClick={onCenterButtonClick}
          className="flex-1 min-w-[80px] h-11 bg-[rgb(31,41,55)] text-white border-none hover:bg-[rgb(17,24,39)] transition-all duration-200 ease-in-out hover:scale-[1.02] font-normal text-base tracking-[-0.01em] rounded-lg"
          style={{
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          {centerButtonText}
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>

        <Button
          onClick={onRightButtonClick}
          className="flex-1 min-w-[80px] h-11 bg-[rgb(249,250,251)] text-[rgb(55,65,81)] border border-[rgb(229,231,235)] hover:bg-[rgb(243,244,246)] transition-all duration-200 ease-in-out hover:scale-[1.02] font-normal text-base tracking-[-0.01em] rounded-lg"
          style={{
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
          variant="outline"
        >
          {rightButtonText}
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default NavigationBar;
