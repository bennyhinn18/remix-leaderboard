import { json, type ActionFunctionArgs } from '@remix-run/node';
import { createNotification } from '~/services/notifications.server';
import { isOrganiser } from '~/utils/currentUser';

export async function action({ request }: ActionFunctionArgs) {
  // Verify user is an organizer
  const organiserStatus = await isOrganiser(request);

  if (!organiserStatus) {
    return json(
      {
        success: false,
        error: 'Unauthorized. Only organizers can send notifications.',
      },
      { status: 403 }
    );
  }

  try {
    const formData = await request.formData();

    // Validate required fields
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const category = formData.get('category') as string;

    if (!title || !content || !category) {
      return json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get optional fields
    const priority = (formData.get('priority') as string) || 'normal';
    const actionUrl = formData.get('actionUrl') as string;
    const isBroadcast = formData.get('isBroadcast') === 'true';

    // Parse member IDs
    let memberIds: number[] = [];
    const memberIdsString = formData.get('memberIds') as string;

    if (memberIdsString) {
      memberIds = memberIdsString
        .split(',')
        .map((id) => parseInt(id.trim(), 10));
    }

    // Create notification
    const result = await createNotification(request, {
      title,
      content,
      category: category as any,
      priority: priority as any,
      actionUrl,
      isBroadcast,
      memberIds: isBroadcast ? [] : memberIds,
      // Get name of the organizer who created this notification from the session
      createdBy: 'Organizer', // TODO: Get from session
    });

    if (!result.success) {
      return json(
        { success: false, error: 'Failed to create notification' },
        { status: 500 }
      );
    }

    return json({ success: true, notification: result.notification });
  } catch (error) {
    console.error('Error creating notification:', error);
    return json(
      {
        success: false,
        error: 'An error occurred while creating the notification',
      },
      { status: 500 }
    );
  }
}
