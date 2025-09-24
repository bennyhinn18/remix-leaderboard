import { json } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';
import { createSupabaseServerClient } from '~/utils/supabase.server';
// import { requireMemberId } from "~/utils/currentUser";

export async function action({ request }: ActionFunctionArgs) {
  // Ensure user is authenticated
  //   const memberId = await requireMemberId(request);

  // Get form data
  const formData = await request.formData();
  const endpoint = formData.get('endpoint');
  const formMemberId = formData.get('memberId');

  if (!endpoint || typeof endpoint !== 'string') {
    return json({ success: false, error: 'Invalid endpoint' }, { status: 400 });
  }

  if (!formMemberId || typeof formMemberId !== 'string') {
    return json(
      { success: false, error: 'Member ID is required' },
      { status: 400 }
    );
  }

  // Delete the subscription from the database
  const response = new Response();
  const supabase = createSupabaseServerClient(request);

  try {
    const { error } = await supabase.client
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', endpoint)
      .eq('member_id', parseInt(formMemberId));

    if (error) throw error;

    return json({ success: true }, { headers: response.headers });
  } catch (error) {
    console.error('Error removing push subscription:', error);
    return json(
      { success: false, error: 'Failed to remove subscription' },
      { status: 500, headers: response.headers }
    );
  }
}
