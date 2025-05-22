import { json } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';
import { createServerSupabase } from '~/utils/supabase.server';
// import { requireMemberId } from "~/utils/currentUser";

export async function action({ request }: ActionFunctionArgs) {
  //   // Ensure user is authenticated
  //   const memberId = await requireMemberId(request);

  // Get form data
  const formData = await request.formData();
  const subscriptionString = formData.get('subscription');
  const formMemberId = formData.get('memberId');

  if (!subscriptionString || typeof subscriptionString !== 'string') {
    return json(
      { success: false, error: 'Invalid subscription data' },
      { status: 400 }
    );
  }

  if (!formMemberId || typeof formMemberId !== 'string') {
    return json(
      { success: false, error: 'Member ID is required' },
      { status: 400 }
    );
  }

  // Parse the subscription JSON
  let subscription;
  try {
    subscription = JSON.parse(subscriptionString);
  } catch (error) {
    return json(
      { success: false, error: 'Invalid subscription format' },
      { status: 400 }
    );
  }

  // Verify that the subscription contains required fields
  if (
    !subscription.endpoint ||
    !subscription.keys ||
    !subscription.keys.p256dh ||
    !subscription.keys.auth
  ) {
    return json(
      { success: false, error: 'Invalid subscription object' },
      { status: 400 }
    );
  }

  // Store the subscription in the database
  const response = new Response();
  const supabase = createServerSupabase(request, response);

  try {
    // Check if this endpoint already exists
    const { data: existingData, error: checkError } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('endpoint', subscription.endpoint)
      .limit(1);

    if (checkError) throw checkError;

    if (existingData && existingData.length > 0) {
      // Update the existing subscription
      const { error: updateError } = await supabase
        .from('push_subscriptions')
        .update({
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          member_id: parseInt(formMemberId),
          updated_at: new Date().toISOString(),
        })
        .eq('endpoint', subscription.endpoint);

      if (updateError) throw updateError;
    } else {
      // Create a new subscription
      const { error: insertError } = await supabase
        .from('push_subscriptions')
        .insert({
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          member_id: parseInt(formMemberId),
        });

      if (insertError) throw insertError;
    }

    return json({ success: true }, { headers: response.headers });
  } catch (error) {
    console.error('Error storing push subscription:', error);
    return json(
      { success: false, error: 'Failed to store subscription' },
      { status: 500, headers: response.headers }
    );
  }
}
