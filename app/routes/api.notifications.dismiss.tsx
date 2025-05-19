import { ActionFunctionArgs, json } from "@remix-run/node";
import { dismissNotification } from "~/services/notifications.server";


export async function action({ request }: ActionFunctionArgs) {
  // Ensure the user is authenticated and we have a memberId
  // await requireMemberId(request);
  
  // Get the notification ID from the form data
  const formData = await request.formData();
  const id = formData.get("id");
  
  if (!id || typeof id !== "string") {
    return json({ success: false, error: "Missing notification ID" }, { status: 400 });
  }
  
  // Dismiss the notification
  const result = await dismissNotification(request, parseInt(id));
  
  if (!result.success) {
    return json({ success: false, error: result.error }, { status: 500 });
  }
  
  return json({ success: true });
}
