import { useState, useEffect } from 'react'

/**
 * Custom hook to detect if the current device is mobile
 * @param breakpoint - The breakpoint in pixels (default: 768)
 * @returns boolean indicating if the screen is mobile-sized
 */
export function useMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }

    // Check on mount
    checkIfMobile()

    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile)

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('resize', checkIfMobile)
    }
  }, [breakpoint])

  return isMobile
}

/**
 * Custom hook to detect specific screen sizes
 * @returns object with boolean values for different screen sizes
 */
export function useScreenSize() {
  const [screenSize, setScreenSize] = useState({
    isXs: false,    // < 480px
    isSm: false,    // < 640px
    isMd: false,    // < 768px
    isLg: false,    // < 1024px
    isXl: false,    // < 1280px
    is2Xl: false,   // < 1536px
  })

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth
      setScreenSize({
        isXs: width < 480,
        isSm: width < 640,
        isMd: width < 768,
        isLg: width < 1024,
        isXl: width < 1280,
        is2Xl: width < 1536,
      })
    }

    // Check on mount
    updateScreenSize()

    // Add event listener for window resize
    window.addEventListener('resize', updateScreenSize)

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('resize', updateScreenSize)
    }
  }, [])

  return screenSize
}
