import { useState, useEffect } from 'react';
import { useFetcher } from '@remix-run/react';
import { motion } from 'framer-motion';
import {
  Bell,
  AlertCircle,
  Calendar,
  Trophy,
  Info,
  Send,
  UsersRound,
  User,
} from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { safeFetcherData } from '~/types/fetcher';
import { Textarea } from '~/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '~/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Checkbox } from '~/components/ui/checkbox';
import { Badge } from '~/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface NotificationManagerProps {
  allMembers: any[];
  recentNotifications: any[];
}

export function NotificationManager({
  allMembers,
  recentNotifications,
}: NotificationManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [isBroadcast, setIsBroadcast] = useState(false);
  const [notificationData, setNotificationData] = useState({
    title: '',
    content: '',
    category: 'announcement',
    priority: 'normal',
    actionUrl: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentTab, setCurrentTab] = useState('create');

  const fetcher = useFetcher();
  const isSubmitting = fetcher.state !== 'idle';
  const fetcherData = safeFetcherData(fetcher.data);
  const isSuccess = fetcherData?.success;

  // Reset form when dialog opens/closes or on successful submission
  useEffect(() => {
    if (!isDialogOpen || isSuccess) {
      setNotificationData({
        title: '',
        content: '',
        category: 'announcement',
        priority: 'normal',
        actionUrl: '',
      });
      setSelectedMembers([]);
      setIsBroadcast(false);
      setErrors({});
      if (isSuccess) {
        // Close dialog after successful submission with a slight delay
        const timer = setTimeout(() => setIsDialogOpen(false), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [isDialogOpen, isSuccess]);

  // Handle form submission
  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};

    // Validate form
    if (!notificationData.title) {
      newErrors.title = 'Title is required';
    }

    if (!notificationData.content) {
      newErrors.content = 'Content is required';
    }

    if (!isBroadcast && selectedMembers.length === 0) {
      newErrors.members =
        'Please select at least one member or enable broadcast';
    }

    // If there are errors, display them and don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clear any previous errors and submit the form
    setErrors({});

    fetcher.submit(
      {
        ...notificationData,
        memberIds: selectedMembers.join(','),
        isBroadcast: isBroadcast.toString(),
      },
      { method: 'post', action: '/api/notifications/create' }
    );
  };

  // Toggle member selection
  const toggleMember = (memberId: number) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  // Select all members
  const selectAllMembers = () => {
    setSelectedMembers(allMembers.map((member) => member.id));
  };

  // Deselect all members
  const deselectAllMembers = () => {
    setSelectedMembers([]);
  };

  // Get icon based on notification category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'announcement':
        return <Info className="h-5 w-5" />;
      case 'event':
        return <Calendar className="h-5 w-5" />;
      case 'points':
        return <Trophy className="h-5 w-5" />;
      case 'system':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  // Get badge color based on priority
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return (
          <Badge className="bg-red-500/10 text-red-400 border-red-500/30">
            Urgent
          </Badge>
        );
      case 'high':
        return (
          <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30">
            High
          </Badge>
        );
      case 'normal':
        return (
          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30">
            Normal
          </Badge>
        );
      case 'low':
        return (
          <Badge className="bg-gray-500/10 text-gray-400 border-gray-500/30">
            Low
          </Badge>
        );
      default:
        return (
          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30">
            Normal
          </Badge>
        );
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsDialogOpen(true)}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
      >
        <Bell className="h-4 w-4" />
        Manage Notifications
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-900 border border-gray-800 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-400" />
              Notification Manager
            </DialogTitle>
            <DialogDescription>
              Create and manage notifications for your community members
            </DialogDescription>
          </DialogHeader>

          <Tabs
            defaultValue="create"
            value={currentTab}
            onValueChange={setCurrentTab}
          >
            <TabsList className="bg-gray-800 border-gray-700">
              <TabsTrigger value="create">Create Notification</TabsTrigger>
              <TabsTrigger value="recent">Recent Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="border-none p-0 mt-4">
              <fetcher.Form
                method="post"
                action="/api/notifications/create"
                className="space-y-4"
              >
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">
                      Notification Title
                    </label>
                    <Input
                      placeholder="Enter notification title"
                      className="bg-gray-800 border-gray-700"
                      value={notificationData.title}
                      onChange={(e) =>
                        setNotificationData({
                          ...notificationData,
                          title: e.target.value,
                        })
                      }
                    />
                    {errors.title && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.title}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-1">
                      Content
                    </label>
                    <Textarea
                      placeholder="Enter notification content"
                      className="bg-gray-800 border-gray-700 min-h-[100px]"
                      value={notificationData.content}
                      onChange={(e) =>
                        setNotificationData({
                          ...notificationData,
                          content: e.target.value,
                        })
                      }
                    />
                    {errors.content && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.content}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium block mb-1">
                        Category
                      </label>
                      <Select
                        value={notificationData.category}
                        onValueChange={(value) =>
                          setNotificationData({
                            ...notificationData,
                            category: value,
                          })
                        }
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="announcement">
                            Announcement
                          </SelectItem>
                          <SelectItem value="event">Event</SelectItem>
                          <SelectItem value="points">Points</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-1">
                        Priority
                      </label>
                      <Select
                        value={notificationData.priority}
                        onValueChange={(value) =>
                          setNotificationData({
                            ...notificationData,
                            priority: value,
                          })
                        }
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-1">
                      Action URL (Optional)
                    </label>
                    <Input
                      placeholder="e.g., /events/123"
                      className="bg-gray-800 border-gray-700"
                      value={notificationData.actionUrl}
                      onChange={(e) =>
                        setNotificationData({
                          ...notificationData,
                          actionUrl: e.target.value,
                        })
                      }
                    />
                    <p className="text-gray-500 text-xs mt-1">
                      Link that will be opened when the notification is clicked
                    </p>
                  </div>

                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <UsersRound className="h-4 w-4" />
                        Recipients
                      </label>
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs border-gray-700"
                          onClick={selectAllMembers}
                        >
                          Select All
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs border-gray-700"
                          onClick={deselectAllMembers}
                        >
                          Deselect All
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Checkbox
                        id="broadcast"
                        checked={isBroadcast}
                        onCheckedChange={(checked) =>
                          setIsBroadcast(checked === true)
                        }
                      />
                      <label
                        htmlFor="broadcast"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Send to all members (Broadcast)
                      </label>
                    </div>

                    {!isBroadcast && (
                      <div className="max-h-40 overflow-y-auto pr-2 space-y-1">
                        {allMembers.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center space-x-2 p-1.5 rounded hover:bg-gray-700/50"
                          >
                            <Checkbox
                              id={`member-${member.id}`}
                              checked={selectedMembers.includes(member.id)}
                              onCheckedChange={() => toggleMember(member.id)}
                            />
                            <label
                              htmlFor={`member-${member.id}`}
                              className="flex items-center gap-2 text-sm cursor-pointer flex-1"
                            >
                              {member.avatar_url ? (
                                <img
                                  src={member.avatar_url}
                                  alt={member.name}
                                  className="h-6 w-6 rounded-full"
                                />
                              ) : (
                                <User className="h-4 w-4 text-gray-400" />
                              )}
                              <span>{member.name}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    )}

                    {!isBroadcast && selectedMembers.length > 0 && (
                      <p className="text-sm text-gray-400 mt-2">
                        {selectedMembers.length} member
                        {selectedMembers.length !== 1 ? 's' : ''} selected
                      </p>
                    )}

                    {errors.members && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.members}
                      </p>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="border-gray-700"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-1">
                        <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-20 border-t-white rounded-full"></div>
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Send className="h-4 w-4" />
                        Send Notification
                      </span>
                    )}
                  </Button>
                </DialogFooter>

                {isSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-500/10 text-green-400 border border-green-500/30 rounded-md p-3 text-center"
                  >
                    Notification sent successfully!
                  </motion.div>
                )}

                {fetcherData?.error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 text-red-400 border border-red-500/30 rounded-md p-3 text-center"
                  >
                    {fetcherData.error}
                  </motion.div>
                )}
              </fetcher.Form>
            </TabsContent>

            <TabsContent
              value="recent"
              className="border-none p-0 mt-4 max-h-[60vh] overflow-y-auto"
            >
              {recentNotifications.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Bell className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>No notifications sent yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="bg-gray-800 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-full bg-gray-700">
                            {getCategoryIcon(notification.category)}
                          </div>
                          <h3 className="font-medium">{notification.title}</h3>
                        </div>
                        {getPriorityBadge(notification.priority)}
                      </div>

                      <p className="text-gray-300 text-sm mb-3">
                        {notification.content}
                      </p>

                      <div className="flex justify-between text-xs text-gray-400">
                        <span>
                          Sent{' '}
                          {formatDistanceToNow(
                            new Date(notification.created_at),
                            { addSuffix: true }
                          )}
                        </span>
                        {notification.is_broadcast ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] py-0 h-4 bg-blue-500/10 border-blue-500/30"
                          >
                            Broadcast
                          </Badge>
                        ) : (
                          <span>
                            Sent to {notification.recipient_count || '...'}{' '}
                            members
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
