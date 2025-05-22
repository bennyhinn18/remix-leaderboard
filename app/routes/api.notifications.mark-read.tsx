import { ActionFunctionArgs, json } from '@remix-run/node';
import { markNotificationAsRead } from '~/services/notifications.server';
// import { requireMemberId } from "~/utils/currentUser";

export async function action({ request }: ActionFunctionArgs) {
  // Ensure the user is authenticated and we have a memberId
  // await requireMemberId(request);

  // Get the notification ID from the form data
  const formData = await request.formData();
  const id = formData.get('id');

  if (!id || typeof id !== 'string') {
    return json(
      { success: false, error: 'Missing notification ID' },
      { status: 400 }
    );
  }

  // Mark the notification as read
  const result = await markNotificationAsRead(request, parseInt(id));

  if (!result.success) {
    return json({ success: false, error: result.error }, { status: 500 });
  }

  return json({ success: true });
}
