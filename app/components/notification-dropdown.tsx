import { useState, useEffect, useRef } from 'react';
import { useFetcher } from '@remix-run/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  X,
  Check,
  ChevronRight,
  CheckCheck,
  Info,
  Calendar,
  Trophy,
  Settings,
} from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface NotificationDropdownProps {
  memberId?: number;
  notifications: any[];
  unreadCount: number;
}

export function NotificationDropdown({
  memberId,
  notifications,
  unreadCount,
}: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fetcher = useFetcher();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllAsRead = () => {
    if (!memberId) return;

    fetcher.submit(
      { memberId: memberId.toString() },
      { method: 'post', action: '/api/notifications/mark-all-read' }
    );
  };

  const handleReadNotification = (id: number) => {
    fetcher.submit(
      { id: id.toString() },
      { method: 'post', action: '/api/notifications/mark-read' }
    );
  };

  const handleDismissNotification = (id: number) => {
    fetcher.submit(
      { id: id.toString() },
      { method: 'post', action: '/api/notifications/dismiss' }
    );
  };

  // Get icon based on notification category
  const getIcon = (category: string) => {
    switch (category) {
      case 'announcement':
        return <Info className="w-5 h-5 text-blue-400" />;
      case 'event':
        return <Calendar className="w-5 h-5 text-purple-400" />;
      case 'points':
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      default:
        return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  // Get badge color based on priority
  const getBadgeStyles = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'high':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'normal':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'low':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 max-h-[70vh] overflow-auto bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50"
          >
            <div className="p-3 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-900 z-10">
              <h3 className="font-medium">Notifications</h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-blue-400"
                  >
                    <CheckCheck className="h-3 w-3 mr-1" />
                    Mark all as read
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-blue-400"
                  asChild
                >
                  <a href="/notification-preferences">
                    <Settings className="h-3 w-3 mr-1" />
                    Settings
                  </a>
                </Button>
              </div>
            </div>

            <div className="divide-y divide-gray-800">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-400">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-gray-500 opacity-50" />
                  <p>No notifications yet</p>
                  <p className="text-xs mt-1">You'll see updates here</p>
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 ${!item.read_at ? 'bg-gray-800/30' : ''}`}
                  >
                    <div className="flex gap-3">
                      <div className="p-2 rounded-full bg-gray-800">
                        {getIcon(item.notification.category)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-sm truncate">
                            {item.notification.title}
                          </h4>
                          <Badge
                            variant="outline"
                            className={`text-[10px] py-0 h-4 ${getBadgeStyles(
                              item.notification.priority
                            )}`}
                          >
                            {item.notification.priority}
                          </Badge>
                        </div>

                        <p className="text-sm text-gray-400 line-clamp-2 mt-1">
                          {item.notification.content}
                        </p>

                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(
                              new Date(item.notification.created_at),
                              { addSuffix: true }
                            )}
                          </span>

                          <div className="flex gap-1">
                            {!item.read_at && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleReadNotification(item.id)}
                              >
                                <Check className="h-3 w-3 text-blue-400" />
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleDismissNotification(item.id)}
                            >
                              <X className="h-3 w-3 text-gray-400" />
                            </Button>

                            {item.notification.action_url && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => {
                                  handleReadNotification(item.id);
                                  setIsOpen(false);
                                  window.location.href =
                                    item.notification.action_url;
                                }}
                              >
                                <ChevronRight className="h-3 w-3 text-blue-400" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
