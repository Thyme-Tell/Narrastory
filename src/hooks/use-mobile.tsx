
import * as React from "react"

const MOBILE_BREAKPOINT = 750 // Updated from 768 to 750

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    // Initial server-side compatible check
    if (typeof window !== 'undefined') {
      // Use both width and user agent detection for reliability
      const windowWidth = window.innerWidth < MOBILE_BREAKPOINT;
      const userAgent = window.navigator.userAgent;
      const isMobileDevice = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      return windowWidth || isMobileDevice;
    }
    return false
  })

  React.useEffect(() => {
    // Function to check device width and user agent
    const checkIfMobile = () => {
      const windowWidth = window.innerWidth < MOBILE_BREAKPOINT;
      const userAgent = window.navigator.userAgent;
      const isMobileDevice = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      setIsMobile(windowWidth || isMobileDevice);
      
      // Add debug information to console
      console.log("Mobile detection:", { 
        width: window.innerWidth, 
        isMobileByWidth: windowWidth,
        userAgent,
        isMobileByUA: isMobileDevice,
        finalResult: windowWidth || isMobileDevice
      });
    }
    
    // Initial check
    checkIfMobile()
    
    // Set up resize listener
    window.addEventListener("resize", checkIfMobile)
    
    // Media query observer for better responsiveness
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const handleMqlChange = (e: MediaQueryListEvent) => {
      // When media query changes, recheck everything
      checkIfMobile();
    }
    
    // Modern browsers
    if (mql.addEventListener) {
      mql.addEventListener('change', handleMqlChange)
    } 
    // Safari < 14
    else if ('addListener' in mql) {
      // @ts-ignore - older API
      mql.addListener(handleMqlChange)
    }
    
    return () => {
      window.removeEventListener("resize", checkIfMobile)
      
      if (mql.removeEventListener) {
        mql.removeEventListener('change', handleMqlChange)
      } 
      // Safari < 14
      else if ('removeListener' in mql) {
        // @ts-ignore - older API
        mql.removeListener(handleMqlChange)
      }
    }
  }, [])

  return isMobile
}
