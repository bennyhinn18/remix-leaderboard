import { AlertTriangle, X, Bug, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export type ToastVariant = 'error' | 'warning' | 'info' | 'success' | 'network';

export interface ErrorToastProps {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  onDismiss: (id: string) => void;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({
  id,
  title,
  description,
  variant = 'error',
  duration = 5000,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch by only showing after client mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (duration > 0 && isMounted) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, isMounted]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(id), 300); // Wait for animation
  };

  const getVariantStyles = () => {
    // Only render icons on client side to prevent hydration mismatch
    const IconComponent = !isMounted ? null : (() => {
      switch (variant) {
        case 'error':
          return <AlertTriangle className="w-5 h-5 text-red-200" />;
        case 'warning':
          return <AlertTriangle className="w-5 h-5 text-yellow-200" />;
        case 'info':
          return <Bug className="w-5 h-5 text-blue-200" />;
        case 'success':
          return <Wifi className="w-5 h-5 text-green-200" />;
        case 'network':
          return <WifiOff className="w-5 h-5 text-orange-200" />;
        default:
          return <AlertTriangle className="w-5 h-5 text-gray-200" />;
      }
    })();

    switch (variant) {
      case 'error':
        return {
          bg: 'bg-red-600/90',
          border: 'border-red-500/50',
          icon: IconComponent,
        };
      case 'warning':
        return {
          bg: 'bg-yellow-600/90',
          border: 'border-yellow-500/50',
          icon: IconComponent,
        };
      case 'info':
        return {
          bg: 'bg-blue-600/90',
          border: 'border-blue-500/50',
          icon: IconComponent,
        };
      case 'success':
        return {
          bg: 'bg-green-600/90',
          border: 'border-green-500/50',
          icon: IconComponent,
        };
      case 'network':
        return {
          bg: 'bg-orange-600/90',
          border: 'border-orange-500/50',
          icon: IconComponent,
        };
      default:
        return {
          bg: 'bg-gray-600/90',
          border: 'border-gray-500/50',
          icon: IconComponent,
        };
    }
  };

  const styles = getVariantStyles();

  // Don't render anything on server to prevent hydration mismatch
  if (!isMounted || !isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`
        ${styles.bg} ${styles.border} 
        backdrop-blur-lg border rounded-lg p-4 shadow-lg 
        max-w-sm w-full pointer-events-auto
      `}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {styles.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-white">
            {title}
          </h4>
          {description && (
            <p className="mt-1 text-sm text-gray-200">
              {description}
            </p>
          )}
        </div>

        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray-300 hover:text-white transition-colors"
        >
          {isMounted ? <X className="w-4 h-4" /> : <span className="w-4 h-4 inline-block">×</span>}
        </button>
      </div>

      {/* Progress bar for duration */}
      {duration > 0 && (
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
          className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-lg"
        />
      )}
    </motion.div>
  );
};

// Toast container component
interface ErrorToastContainerProps {
  toasts: ErrorToastProps[];
  onDismiss: (id: string) => void;
}

export const ErrorToastContainer: React.FC<ErrorToastContainerProps> = ({
  toasts,
  onDismiss,
}) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ErrorToast
            key={toast.id}
            {...toast}
            onDismiss={onDismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
