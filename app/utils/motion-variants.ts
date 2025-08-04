// Framer Motion variant definitions with proper TypeScript types
import type { Variants } from 'framer-motion';

export const itemVariants: Variants = {
  hidden: { 
    y: 20, 
    opacity: 0 
  },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: 'spring' as const,
      stiffness: 100 
    }
  }
};

export const containerVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: 'spring' as const,
      stiffness: 100, 
      damping: 15 
    }
  }
};
