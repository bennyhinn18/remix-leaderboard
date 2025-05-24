import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '@remix-run/react';
import React, { useEffect, useState } from 'react';

/**
 * PageTransition component that wraps children with animated transitions
 * and displays loading states during navigation.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const navigation = useNavigation();
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);

  useEffect(() => {
    // Only apply transition effect for major route changes, not data fetching
    if (
      navigation.state === 'loading' &&
      navigation.location &&
      navigation.location.pathname !== window.location.pathname.split('?')[0]
    ) {
      setIsPageTransitioning(true);
    } else {
      // Small delay to ensure smooth animation
      const timer = setTimeout(() => {
        setIsPageTransitioning(false);
      }, 200); // Faster transition for a more responsive feel
      return () => clearTimeout(timer);
    }
  }, [navigation.state, navigation.location]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={navigation.location?.pathname || 'initial'}
        initial={{ opacity: 0.95 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0.95 }}
        transition={{ duration: 0.2 }}
        className="min-h-screen"
      >
        {/* Apply a subtle effect when transitioning between major route changes */}
        <div
          className={
            isPageTransitioning
              ? 'blur-[1px] transition-all duration-200'
              : 'transition-all duration-200'
          }
        >
          {children}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
