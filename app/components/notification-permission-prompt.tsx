import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, AlertCircle } from 'lucide-react';
import { Button } from '~/components/ui/button';

export function NotificationPermissionPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only run on client side after mount
    if (!isMounted || typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    const currentPermission = Notification.permission;
    setPermission(currentPermission);

    // Show prompt if permission is default and user hasn't dismissed it
    const dismissed = sessionStorage.getItem('notificationPromptDismissed');
    if (currentPermission === 'default' && dismissed !== 'true') {
      // Show after a delay to not overwhelm the user
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 5000);

      return () => clearTimeout(timer);
    }

    // Listen for service worker messages about notification failures
    if ('serviceWorker' in navigator) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'NOTIFICATION_FAILED') {
          console.log('[Client] Notification failed:', event.data.error);
          // Could show a toast or banner here
        }
      };

      navigator.serviceWorker.addEventListener('message', handleMessage);
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      };
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      setShowPrompt(false);
      
      if (result === 'granted') {
        // Test notification
        new Notification('Notifications Enabled!', {
          body: 'You\'ll now receive updates from Byte Bash Blitz',
          icon: '/icons/icon-192x192.png',
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setShowPrompt(false);
    }
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    sessionStorage.setItem('notificationPromptDismissed', 'true');
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!isMounted || typeof window === 'undefined' || !('Notification' in window)) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-32 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-40"
        >
          <div className="bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-lg border border-blue-500/30 rounded-xl p-4 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-sm">
                  Stay in the Loop!
                </h3>
                <p className="text-blue-100 text-xs mt-1">
                  Get notified about events, achievements, and app updates.
                </p>
                <div className="flex gap-2 mt-3">
                  <Button
                    onClick={requestPermission}
                    size="sm"
                    className="bg-white text-blue-600 hover:bg-blue-50 text-xs h-7 px-3"
                  >
                    Allow Notifications
                  </Button>
                  <Button
                    onClick={dismissPrompt}
                    variant="ghost"
                    size="sm"
                    className="text-blue-100 hover:text-white hover:bg-white/10 text-xs h-7 px-3"
                  >
                    Not Now
                  </Button>
                </div>
              </div>
              <button
                onClick={dismissPrompt}
                className="flex-shrink-0 text-blue-200 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                {isMounted ? <X className="w-4 h-4" /> : <span className="w-4 h-4 inline-block">×</span>}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Simple debug component to show notification status
export function NotificationDebugInfo() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, [isMounted]);

  // Only show in development and after mount
  if (!isMounted || process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (typeof window === 'undefined' || !('Notification' in window)) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-red-900/80 text-white text-xs p-2 rounded-lg">
        <AlertCircle className="w-3 h-3 inline mr-1" />
        Notifications not supported
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/80 text-white text-xs p-2 rounded-lg">
      <div className="flex items-center gap-2">
        <Bell className={`w-3 h-3 ${
          permission === 'granted' ? 'text-green-400' : 
          permission === 'denied' ? 'text-red-400' : 'text-yellow-400'
        }`} />
        <span>Notifications: {permission}</span>
      </div>
    </div>
  );
}