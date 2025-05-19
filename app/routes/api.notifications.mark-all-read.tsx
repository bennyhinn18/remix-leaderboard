import { ActionFunctionArgs, json } from "@remix-run/node";
import { markAllNotificationsAsRead } from "~/services/notifications.server";
import { getCurrentUser } from "~/utils/currentUser";

export async function action({ request }: ActionFunctionArgs) {
  // Ensure the user is authenticated and we have a memberId
  const memberId = await getCurrentUser(request);
  
  // Mark all notifications as read for this member
  const result = await markAllNotificationsAsRead(request, memberId?.member_id);
  
  if (!result.success) {
    return json({ success: false, error: result.error }, { status: 500 });
  }
  
  return json({ success: true });
}
