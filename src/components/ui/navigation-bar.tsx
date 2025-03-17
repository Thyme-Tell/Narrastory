
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
        "w-full max-w-full px-4 flex justify-center rounded-lg",
        className
      )}
      {...props}
    >
      <div className="w-full flex justify-between">
        <Button
          onClick={onLeftButtonClick}
          className="flex-1 min-w-[80px] h-11 bg-transparent text-[rgb(55,65,81)] border border-[#242F3F] hover:bg-[#242F3F]/5 transition-all duration-200 ease-in-out hover:scale-[1.02] font-normal text-[11pt] tracking-[-0.01em] rounded-[3px] px-[6px] py-[2.75px]"
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
          className="flex-1 mx-2 min-w-[100px] h-11 bg-[rgb(31,41,55)] text-white border-none hover:bg-[rgb(17,24,39)] transition-all duration-200 ease-in-out hover:scale-[1.02] font-normal text-[11pt] tracking-[-0.01em] rounded-lg px-[8px] py-[2.75px] truncate"
          style={{
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          <span className="truncate">{centerButtonText}</span>
          <ChevronRight className="ml-1 h-3 w-3 flex-shrink-0" />
        </Button>

        <Button
          onClick={onRightButtonClick}
          className="flex-1 min-w-[80px] h-11 bg-transparent text-[rgb(55,65,81)] border border-[#242F3F] hover:bg-[#242F3F]/5 transition-all duration-200 ease-in-out hover:scale-[1.02] font-normal text-[11pt] tracking-[-0.01em] rounded-[3px] px-[6px] py-[2.75px]"
          style={{
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
          variant="outline"
        >
          {rightButtonText}
          <ArrowRight className="ml-1 h-3 w-3 flex-shrink-0" />
        </Button>
      </div>
    </div>
  );
};

export default NavigationBar;
