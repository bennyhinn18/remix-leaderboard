import { createServerSupabase } from "~/utils/supabase.server";
import { sendPushNotificationToMember, sendPushNotificationBroadcast } from "~/services/push-notifications.server";

type NotificationCategory = 'announcement' | 'event' | 'points' | 'system';
type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

interface CreateNotificationParams {
  title: string;
  content: string;
  category: NotificationCategory;
  priority?: NotificationPriority;
  imageUrl?: string;
  actionUrl?: string;
  createdBy?: string;
  memberIds?: number[]; // Specific members to notify, if empty and isBroadcast=true, notify all
  isBroadcast?: boolean;
}

export async function createNotification(request: Request, params: CreateNotificationParams) {
  const response = new Response();
  const supabase = createServerSupabase(request, response);
  
  try {
    // First, insert the notification
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        title: params.title,
        content: params.content,
        category: params.category,
        priority: params.priority || 'normal',
        image_url: params.imageUrl,
        action_url: params.actionUrl,
        created_by: params.createdBy,
        is_broadcast: !!params.isBroadcast
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // If it's a broadcast and no specific members are provided, get all member IDs
    if (params.isBroadcast && (!params.memberIds || params.memberIds.length === 0)) {
      const { data: members, error: membersError } = await supabase
        .from('members')
        .select('id');
      
      if (membersError) throw membersError;
      
      // Create notification links for all members
      const memberNotifications = members.map(member => ({
        notification_id: notification.id,
        member_id: member.id
      }));
      
      const { error: insertError } = await supabase
        .from('member_notifications')
        .insert(memberNotifications);
      
      if (insertError) throw insertError;
      
      // Send push notification broadcast
      if (params.priority === 'high' || params.priority === 'urgent') {
        await sendPushNotificationBroadcast(request, {
          title: params.title,
          body: params.content,
          icon: params.imageUrl,
          url: params.actionUrl || '/',
          category: params.category
        });
      }
    } 
    // If specific member IDs are provided, create notifications for them
    else if (params.memberIds && params.memberIds.length > 0) {
      const memberNotifications = params.memberIds.map(memberId => ({
        notification_id: notification.id,
        member_id: memberId
      }));
      
      const { error: insertError } = await supabase
        .from('member_notifications')
        .insert(memberNotifications);
      
      if (insertError) throw insertError;
      
      // Send push notifications to each member
      if (params.priority === 'high' || params.priority === 'urgent') {
        for (const memberId of params.memberIds) {
          await sendPushNotificationToMember(request, memberId, {
            title: params.title,
            body: params.content,
            icon: params.imageUrl,
            url: params.actionUrl || '/',
            category: params.category
          });
        }
      }
    }
    
    return { success: true, notification };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error };
  }
}

export async function getUserNotifications(request: Request, memberId: number) {
  const response = new Response();
  const supabase = createServerSupabase(request, response);
  
  try {
    // Get user's notifications with join to get notification details
    const { data, error } = await supabase
      .from('member_notifications')
      .select(`
        id,
        read_at,
        dismissed_at,
        notification:notifications (
          id,
          title,
          content,
          category,
          priority,
          image_url,
          action_url,
          created_at,
          created_by
        )
      `)
      .eq('member_id', memberId)
      .is('dismissed_at', null) // Only get not dismissed
      .order('read_at', { ascending: true, nullsFirst: true }) // Unread first
      .order('notification(created_at)', { ascending: false }); // Newest first
    
    if (error) throw error;
    
    return { 
      success: true, 
      notifications: data || [],
      unreadCount: data ? data.filter(n => !n.read_at).length : 0
    };
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    return { success: false, error, notifications: [], unreadCount: 0 };
  }
}

export async function markNotificationAsRead(request: Request, memberNotificationId: number) {
  const response = new Response();
  const supabase = createServerSupabase(request, response);
  
  try {
    const { error } = await supabase
      .from('member_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', memberNotificationId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error };
  }
}

export async function dismissNotification(request: Request, memberNotificationId: number) {
  const response = new Response();
  const supabase = createServerSupabase(request, response);
  
  try {
    const { error } = await supabase
      .from('member_notifications')
      .update({ dismissed_at: new Date().toISOString() })
      .eq('id', memberNotificationId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error dismissing notification:', error);
    return { success: false, error };
  }
}

export async function markAllNotificationsAsRead(request: Request, memberId: number) {
  const response = new Response();
  const supabase = createServerSupabase(request, response);
  
  try {
    const { error } = await supabase
      .from('member_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('member_id', memberId)
      .is('read_at', null);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, error };
  }
}
