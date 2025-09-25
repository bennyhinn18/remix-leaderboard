import { createSupabaseServerClient } from '~/utils/supabase.server';
import webpush from 'web-push';
import { create } from 'node:domain';

// Configure web-push with VAPID keys
// In a real application, these would come from environment variables
const VAPID_PUBLIC_KEY =
  process.env.VAPID_PUBLIC_KEY ||
  'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY ||
  'UUxI4O8-FbRouAevSmBQ6o18hgE4nSG3qwvJTfKc-ls';

webpush.setVapidDetails(
  'mailto:support@bytebashblitz.org', // Contact information
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// Send a notification using web-push
async function sendNotification(subscription: any, payload: any) {
  try {
    console.log(`Sending push notification to ${subscription.endpoint}`);

    return await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      JSON.stringify(payload)
    );
  } catch (error: any) {
    console.error('Error sending push notification:', error);

    // Check if subscription is expired or invalid
    if (error.statusCode === 404 || error.statusCode === 410) {
      console.log('Subscription is no longer valid, removing from database');
      // Note: We should delete this subscription from the database
      // But we'll handle that in the main functions
    }

    throw error;
  }
}

// Send a notification to a specific member
export async function sendPushNotificationToMember(
  request: Request,
  memberId: number,
  notification: {
    title: string;
    body: string;
    icon?: string;
    url?: string;
    actionUrl?: string;
    category?: string;
  }
) {
  const response = new Response();
  const supabase = createSupabaseServerClient(request);

  try {
    // Get all the user's push subscriptions
    const { data: subscriptions, error } = await supabase.client
      .from('push_subscriptions')
      .select('*')
      .eq('member_id', memberId);

    if (error) throw error;

    if (!subscriptions || subscriptions.length === 0) {
      return {
        success: false,
        error: 'No push subscriptions found for this member',
      };
    }

    // Send the notification to each subscription
    const sendPromises = subscriptions.map((subscription) => {
      return sendNotification(subscription, {
        title: notification.title,
        body: notification.body,
        icon: notification.icon || '/icons/icon-192x192.png',
        url: notification.url || '/',
        actionUrl: notification.actionUrl,
        category: notification.category,
      });
    });

    await Promise.all(sendPromises);

    return { success: true };
  } catch (error: any) {
    console.error('Error sending push notification:', error);
    return {
      success: false,
      error: error.message || 'Failed to send push notification',
    };
  }
}

// Send a notification to all members with a specific category
export async function sendPushNotificationBroadcast(
  request: Request,
  notification: {
    title: string;
    body: string;
    icon?: string;
    url?: string;
    actionUrl?: string;
    category?: string;
  }
) {
  const response = new Response();
  const supabase = createSupabaseServerClient(request);

  try {
    // Get all push subscriptions
    const { data: subscriptions, error } = await supabase.client
      .from('push_subscriptions')
      .select('*');

    if (error) throw error;

    if (!subscriptions || subscriptions.length === 0) {
      return { success: false, error: 'No push subscriptions found' };
    }

    // Send the notification to each subscription
    const sendPromises = subscriptions.map((subscription) => {
      return sendNotification(subscription, {
        title: notification.title,
        body: notification.body,
        icon: notification.icon || '/icons/icon-192x192.png',
        url: notification.url || '/',
        actionUrl: notification.actionUrl,
        category: notification.category,
      });
    });

    await Promise.all(sendPromises);

    return { success: true };
  } catch (error: any) {
    console.error('Error sending broadcast push notification:', error);
    return {
      success: false,
      error: error.message || 'Failed to send broadcast push notification',
    };
  }
}
