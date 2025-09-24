import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X, Download } from 'lucide-react';
import { Button } from '~/components/ui/button';

export function ServiceWorkerUpdater() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newVersion, setNewVersion] = useState('');

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    let refreshing = false;

    // Register service worker
    navigator.serviceWorker.register('/service-worker.js').then((registration) => {
      console.log('[SW] Registered successfully');
      
      // Check for updates every 30 seconds
      const checkForUpdates = () => {
        registration.update().catch((error) => {
          console.log('[SW] Update check failed:', error);
        });
      };
      
      // Check for updates periodically
      const updateInterval = setInterval(checkForUpdates, 30000);
      
      // Clean up interval on unmount
      return () => clearInterval(updateInterval);
    }).catch((error) => {
      console.log('[SW] Registration failed:', error);
    });

    // Listen for service worker messages
    const handleMessage = (event: MessageEvent) => {
      if (!event.data) return;
      
      const { type, version } = event.data;
      
      if (type === 'SW_UPDATED') {
        console.log('[SW] New version available:', version);
        setNewVersion(version);
        setShowUpdatePrompt(true);
      }
    };

    // Listen for page refresh (happens when SW updates)
    const handleControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      console.log('[SW] Controller changed, reloading page');
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);
    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    
    try {
      // Tell the service worker to skip waiting and activate
      const registration = await navigator.serviceWorker.getRegistrations();
      if (registration.length > 0) {
        const reg = registration[0];
        if (reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      }
      
      // Reload the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('[SW] Update failed:', error);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
    // Set a flag to not show again for this session (client-side only)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('updateDismissed', 'true');
    }
  };

  // Don't show if user already dismissed for this session (client-side only)
  if (typeof window !== 'undefined' && sessionStorage.getItem('updateDismissed') === 'true') {
    return null;
  }

  return (
    <AnimatePresence>
      {showUpdatePrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-50"
        >
          <div className="bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-lg border border-blue-500/30 rounded-xl p-4 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-sm">
                  New Update Available!
                </h3>
                <p className="text-blue-100 text-xs mt-1">
                  Version {newVersion} is ready. Update now for the latest features and fixes.
                </p>
                <div className="flex gap-2 mt-3">
                  <Button
                    onClick={handleUpdate}
                    disabled={isUpdating}
                    size="sm"
                    className="bg-white text-blue-600 hover:bg-blue-50 text-xs h-7 px-3"
                  >
                    {isUpdating ? (
                      <>
                        <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Now'
                    )}
                  </Button>
                  <Button
                    onClick={handleDismiss}
                    variant="ghost"
                    size="sm"
                    className="text-blue-100 hover:text-white hover:bg-white/10 text-xs h-7 px-3"
                  >
                    Later
                  </Button>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 text-blue-200 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}