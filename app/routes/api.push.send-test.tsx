import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { createServerSupabase } from "~/utils/supabase.server";
// import { requireMemberId } from "~/utils/currentUser";
import { isOrganiser } from "~/utils/currentUser";
import { sendPushNotificationToMember } from "~/services/push-notifications.server";

export async function action({ request }: ActionFunctionArgs) {
  // Ensure user is authenticated and an organizer
//   const memberId = await requireMemberId(request);
  const organiserStatus = await isOrganiser(request);
  
  if (!organiserStatus) {
    return json({ success: false, error: "Unauthorized" }, { status: 403 });
  }
  
  // Get form data
  const formData = await request.formData();
  const targetMemberId = formData.get("memberId");
  
  if (!targetMemberId || typeof targetMemberId !== "string") {
    return json({ success: false, error: "Member ID is required" }, { status: 400 });
  }
  
  try {
    const result = await sendPushNotificationToMember(request, parseInt(targetMemberId), {
      title: "Test Notification",
      body: "This is a test push notification from Byte Bash Blitz!",
      url: "/notifications",
      category: "system"
    });
    
    if (!result.success) {
      return json({ success: false, error: result.error }, { status: 500 });
    }
    
    return json({ success: true });
  } catch (error) {
    console.error("Error sending test push notification:", error);
    return json(
      { success: false, error: "Failed to send test notification" },
      { status: 500 }
    );
  }
}
