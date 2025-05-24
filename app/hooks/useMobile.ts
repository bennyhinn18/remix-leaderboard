import { useEffect, useState } from 'react';

export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768); // Adjust breakpoint as needed
    };

    checkMobile(); // Initial check
    window.addEventListener('resize', checkMobile); // Listen for resize events

    return () => window.removeEventListener('resize', checkMobile); // Cleanup
  }, []);

  return isMobile;
};
