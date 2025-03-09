
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Immediate check on mount
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    checkIfMobile() // Initial check
    
    // Listen for window resize events
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    mql.addEventListener("change", checkIfMobile)
    
    // In case of inconsistencies, also check based on window.innerWidth directly
    window.addEventListener("resize", checkIfMobile)
    
    return () => {
      mql.removeEventListener("change", checkIfMobile)
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  // If isMobile is undefined (during SSR or initial render), use a fallback detection
  // based on the userAgent as a secondary check
  if (isMobile === undefined && typeof navigator !== 'undefined') {
    const userAgent = navigator.userAgent.toLowerCase()
    const mobileDevice = /iphone|ipad|ipod|android|blackberry|windows phone|opera mini|silk/i.test(userAgent)
    return mobileDevice
  }

  return !!isMobile
}
