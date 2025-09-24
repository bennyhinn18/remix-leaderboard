import { json, redirect } from '@remix-run/node';
import {
  useLoaderData,
  Form,
  useActionData,
  useNavigation,
} from '@remix-run/react';
import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node';
import { createSupabaseServerClient} from '~/utils/supabase.server';
import { PushNotificationManager } from '~/components/push-notification-manager';
import { PageTransition } from '~/components/page-transition';
import { Button } from '~/components/ui/button';
import { Switch } from '~/components/ui/switch';
import { Label } from '~/components/ui/label';
import { Card } from '~/components/ui/card';
import {
  Bell,
  MessageSquare,
  Settings,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { MainNav } from '~/components/main-nav';
import iconImage from '~/assets/bashers.png';
import { getUserNotifications } from '~/services/notifications.server';
import { useState, useEffect } from 'react';

export async function loader({ request }: LoaderFunctionArgs) {
  const response = new Response();
  const supabase = createSupabaseServerClient(request);

  try {
    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.client.auth.getUser();

    if (!user) {
      return redirect('/login');
    }

    // Get the member profile
    const { data: member } = await supabase.client
      .from('members')
      .select('*, clan:clans(*)')
      .eq('github_username', user.user_metadata?.user_name)
      .single();

    if (!member) {
      return redirect('/login');
    }

    // Get user notifications
    let notifications: Array<any> = [];
    let unreadCount = 0;

    if (member?.id) {
      const notificationsResult = await getUserNotifications(
        request,
        member.id
      );
      if (notificationsResult.success) {
        notifications = notificationsResult.notifications;
        unreadCount = notificationsResult.unreadCount;
      }
    }

    // Get notification preferences (you'd need to create this table)
    const { data: preferences } = await supabase.client
      .from('notification_preferences')
      .select('*')
      .eq('member_id', member.id)
      .single();

    return json(
      {
        user,
        member,
        notifications,
        unreadCount,
        preferences: preferences || {
          push_enabled: true,
          email_enabled: true,
          in_app_enabled: true,
          announcement_notifications: true,
          event_notifications: true,
          points_notifications: true,
          system_notifications: true,
        },
      },
      {
        headers: response.headers,
      }
    );
  } catch (error) {
    console.error('Error in notification preferences loader:', error);
    return redirect('/');
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const response = new Response();
  const supabase = createSupabaseServerClient(request);

  try {
    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.client.auth.getUser();

    if (!user) {
      return json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get the member profile
    const { data: member } = await supabase.client
      .from('members')
      .select('id')
      .eq('github_username', user.user_metadata?.user_name)
      .single();

    if (!member) {
      return json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      );
    }

    const formData = await request.formData();

    // Process form data
    const preferences = {
      member_id: member.id,
      push_enabled: formData.get('push_enabled') === 'on',
      email_enabled: formData.get('email_enabled') === 'on',
      in_app_enabled: formData.get('in_app_enabled') === 'on',
      announcement_notifications:
        formData.get('announcement_notifications') === 'on',
      event_notifications: formData.get('event_notifications') === 'on',
      points_notifications: formData.get('points_notifications') === 'on',
      system_notifications: formData.get('system_notifications') === 'on',
      updated_at: new Date().toISOString(),
    };

    // Check if preferences already exist
    const { data: existingPrefs } = await supabase.client
      .from('notification_preferences')
      .select('id')
      .eq('member_id', member.id)
      .maybeSingle();

    let result;

    if (existingPrefs) {
      // Update existing preferences
      result = await supabase.client
        .from('notification_preferences')
        .update(preferences)
        .eq('member_id', member.id);
    } else {
      // Insert new preferences
      result = await supabase.client
        .from('notification_preferences')
        .insert(preferences);
    }

    if (result.error) {
      console.error('Error saving preferences:', result.error);
      return json(
        { success: false, error: result.error.message },
        { status: 500 }
      );
    }

    return json(
      {
        success: true,
        message: 'Notification preferences updated successfully',
      },
      {
        headers: response.headers,
      }
    );
  } catch (error) {
    console.error('Error saving notification preferences:', error);
    return json(
      {
        success: false,
        error: 'Failed to save notification preferences',
      },
      {
        status: 500,
        headers: response.headers,
      }
    );
  }
}

export default function NotificationPreferences() {
  const { member, notifications, unreadCount, preferences } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const [formState, setFormState] = useState({
    push_enabled: preferences.push_enabled,
    in_app_enabled: preferences.in_app_enabled,
    announcement_notifications: preferences.announcement_notifications,
    event_notifications: preferences.event_notifications,
    points_notifications: preferences.points_notifications,
    system_notifications: preferences.system_notifications,
  });

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Handle toggle changes
  const handleToggleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormState((prev) => ({
        ...prev,
        [field]: e.target.checked,
      }));
    };

  // Show success message when the form is successfully submitted
  useEffect(() => {
    if (actionData?.success) {
      setShowSuccessMessage(true);
      const timer = setTimeout(() => setShowSuccessMessage(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [actionData]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <header className="bg-black/20 backdrop-blur-lg">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img
                  src={`${iconImage}`}
                  alt="Byte Bash Logo"
                  className="h-10 w-10"
                />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                  Byte Bash Blitz
                </h1>
              </div>
              <MainNav
                user={member}
                notifications={notifications}
                unreadCount={unreadCount}
              />
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" asChild>
                <a href="/">
                  <ChevronLeft className="h-5 w-5" />
                </a>
              </Button>
              <h1 className="text-2xl font-bold">Notification Preferences</h1>
            </div>
          </div>

          {/* Success/Error Messages */}
          {showSuccessMessage && (
            <div className="bg-green-500/20 text-green-400 p-3 rounded-md flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Preferences saved successfully!
            </div>
          )}

          {actionData && 'error' in actionData && (
            <div className="bg-red-500/20 text-red-400 p-3 rounded-md flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {actionData.error}
            </div>
          )}

          {/* Push Notification Manager */}
          <div className="mt-6">
            <PushNotificationManager memberId={member.id} />
          </div>

          <Form method="post">
            {/* Notification Channels */}
            <Card className="p-5 bg-white/5 border border-white/10">
              <h2 className="text-lg font-medium mb-4 flex items-center">
                <Bell className="w-5 h-5 mr-2 text-blue-400" />
                Notification Channels
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-blue-400" />
                    <Label htmlFor="push-toggle">Push Notifications</Label>
                  </div>
                  <Switch
                    id="push-toggle"
                    name="push_enabled"
                    checked={formState.push_enabled}
                    onCheckedChange={(checked: boolean) =>
                      setFormState((prev) => ({
                        ...prev,
                        push_enabled: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-green-400" />
                    <Label htmlFor="in-app-toggle">In-App Notifications</Label>
                  </div>
                  <Switch
                    id="in-app-toggle"
                    name="in_app_enabled"
                    checked={formState.in_app_enabled}
                    onCheckedChange={(checked: boolean) =>
                      setFormState((prev) => ({
                        ...prev,
                        in_app_enabled: checked,
                      }))
                    }
                  />
                </div>
              </div>
            </Card>

            {/* Notification Types */}
            <Card className="p-5 bg-white/5 border border-white/10 mt-4">
              <h2 className="text-lg font-medium mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-purple-400" />
                Notification Types
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="announcements-toggle">Announcements</Label>
                  <Switch
                    id="announcements-toggle"
                    name="announcement_notifications"
                    checked={formState.announcement_notifications}
                    onCheckedChange={(checked: boolean) =>
                      setFormState((prev) => ({
                        ...prev,
                        announcement_notifications: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="events-toggle">Events</Label>
                  <Switch
                    id="events-toggle"
                    name="event_notifications"
                    checked={formState.event_notifications}
                    onCheckedChange={(checked: boolean) =>
                      setFormState((prev) => ({
                        ...prev,
                        event_notifications: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="points-toggle">Points & Achievements</Label>
                  <Switch
                    id="points-toggle"
                    name="points_notifications"
                    checked={formState.points_notifications}
                    onCheckedChange={(checked: boolean) =>
                      setFormState((prev) => ({
                        ...prev,
                        points_notifications: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="system-toggle">System Updates</Label>
                  <Switch
                    id="system-toggle"
                    name="system_notifications"
                    checked={formState.system_notifications}
                    onCheckedChange={(checked: boolean) =>
                      setFormState((prev) => ({
                        ...prev,
                        system_notifications: checked,
                      }))
                    }
                  />
                </div>
              </div>
            </Card>

            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Preferences'
                )}
              </Button>
            </div>
          </Form>
        </main>
      </div>
    </PageTransition>
  );
}
