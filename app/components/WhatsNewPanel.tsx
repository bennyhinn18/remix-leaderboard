// Add to your imports at the top of the file
import {
  X,
  AlertCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Bell,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@remix-run/react';
import { Badge } from '~/components/ui/badge';

export default function WhatsNewPanel() {
  const [isVisible, setIsVisible] = useState(false);
  // Changed default to true so it starts minimized
  const [isMinimized, setIsMinimized] = useState(true);

  // Current app version/update ID - update this when you make changes
  const currentVersion = 'v1.4.5';

  // Latest updates - newest first
  const updates = [
    {
      version: 'v1.4.5',
      date: 'May 22, 2025',
      title: 'Email Setup for Absent & Feedback in Events',
      description:
        'If members fail to attend an event, you can now send them an email directly from the Events page. After completing the event, you can also send feedbacks.',
      link: '/events',
    },
    {
      version: 'v1.4.0',
      date: 'May 20, 2025',
      title: 'Discord in Leaderboard is Live',
      description:
        'You can now filter by Discord on the leaderboard, also minor fixes',
      link: '/leaderboard',
    },
    {
      version: 'v1.3.5',
      date: 'May 19, 2025',
      title: 'Resources Page Launched',
      description:
        'Explore curated learning resources and tools to boost your progress. Find guides, links, and more on the new Resources page!',
      link: '/resources',
    },
    {
      version: 'v1.3.0',
      date: 'May 17, 2025',
      title: 'LeetCode Added to Leaderboard',
      description:
        'You can now track and compare LeetCode stats on the leaderboard. Filter by LeetCode to see top performers!',
      link: '/leaderboard',
    },
    {
      version: 'v1.2.5',
      date: 'May 10, 2025',
      title: 'New Leaderboard Filters Active',
      description: 'The Github and Duolingo filters are now live! ',
      link: '/leaderboard',
    },
    {
      version: 'v1.2.0',
      date: 'May 5, 2025',
      title: 'Improved Notifications',
      description:
        'Notifications are now more interactive and provide quick actions.',
      link: null,
    },
    {
      version: 'v1.1.5',
      date: 'May 2, 2025',
      title: 'Legacy Bashers Hall of Fame',
      description:
        "We've added a special page to honor our Legacy Bashers! Check out their profiles and achievements in the new Hall of Fame.",
      link: '/legacy-bashers',
    },
    {
      version: 'v1.1.0',
      date: 'April 25, 2025',
      title: 'Points History Graph',
      description:
        'You can now view your points history as an interactive graph on your profile page.',
      link: null,
    },
    {
      version: 'v1.0.5',
      date: 'April 18, 2025',
      title: 'Enhanced Find Me Feature',
      description:
        "The 'Find Me' button now shows directional arrows to help you locate yourself on the leaderboard.",
      link: '/leaderboard',
    },
  ];

  useEffect(() => {
    // Check if the user has dismissed this version
    const lastDismissedVersion = localStorage.getItem(
      'whatsNewDismissedVersion'
    );

    // Only show if user hasn't dismissed the current version
    if (lastDismissedVersion !== currentVersion) {
      setIsVisible(true);

      // Check if there's a saved minimized preference
      const minimizedPref = localStorage.getItem('whatsNewMinimized');
      // If there's a saved preference, use it; otherwise keep the default (minimized)
      if (minimizedPref !== null) {
        setIsMinimized(minimizedPref === 'true');
      }
    }
  }, []);

  const dismissPanel = () => {
    // Save the current version as dismissed
    localStorage.setItem('whatsNewDismissedVersion', currentVersion);
    setIsVisible(false);
    // Clear minimized state when dismissed
    localStorage.removeItem('whatsNewMinimized');
  };

  const toggleMinimize = () => {
    const newMinimizedState = !isMinimized;
    setIsMinimized(newMinimizedState);
    localStorage.setItem('whatsNewMinimized', newMinimizedState.toString());
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isMinimized ? (
        <motion.div
          key="minimized"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed bottom-32 right-6 z-50 "
        >
          <button
            onClick={toggleMinimize}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors"
          >
            <Bell className="w-4 h-4 animate-pulse" />
            <span>What&apos;s New</span>
            <ChevronUp className="w-4 h-4" />
          </button>
        </motion.div>
      ) : (
        <motion.div
          key="expanded"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-lg border border-blue-500/20 rounded-xl p-4 mb-6"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">
                What&apos;s New
              </h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleMinimize}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Minimize"
                title="Minimize for later"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
              <button
                onClick={dismissPanel}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Dismiss"
                title="Dismiss until next update"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {updates.slice(0, 3).map((update) => (
              <div key={update.version} className="bg-white/5 rounded-lg p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{update.title}</span>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-xs bg-blue-500/10 border-blue-500/20 text-blue-400"
                    >
                      {update.version}
                    </Badge>
                    <span className="text-xs text-gray-400">{update.date}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-300 mb-2">
                  {update.description}
                </p>
                {update.link && (
                  <Link
                    to={update.link}
                    className="inline-flex items-center text-xs font-medium text-blue-400 hover:text-blue-300"
                  >
                    Check it out
                    <ArrowRight className="ml-1 w-3 h-3" />
                  </Link>
                )}
              </div>
            ))}

            {updates.length > 3 && (
              <div className="text-center mt-2">
                <button
                  className="text-sm text-blue-400 hover:text-blue-300"
                  onClick={() => {
                    /* You could show more updates here */
                  }}
                >
                  Show older updates
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
