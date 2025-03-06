
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { useIsMobile } from "@/hooks/use-mobile"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => {
  const isMobile = useIsMobile();
  
  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        `relative ${isMobile ? 'h-3' : 'h-4'} w-full overflow-hidden rounded-full bg-[#DAB577]/20`,
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-[#DAB577] transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
