
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    // Initial server-side compatible check
    if (typeof window !== 'undefined') {
      return window.innerWidth < MOBILE_BREAKPOINT
    }
    return false
  })

  React.useEffect(() => {
    // Function to check device width
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Initial check
    checkIfMobile()
    
    // Set up resize listener
    window.addEventListener("resize", checkIfMobile)
    
    // Media query observer for better responsiveness
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const handleMqlChange = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    
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
