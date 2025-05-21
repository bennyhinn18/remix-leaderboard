import { json } from '@remix-run/node';
import { sendFeedbackEmail } from '~/services/email-service';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function action({ request }: { request: Request }) {
  try {
    const body = await request.json();
    const { to, eventId, memberId, memberName, memberEmail, eventName, rating, positives, negatives, improvements } = body;

    // Insert into feedback table
    const { error: insertError } = await supabase
      .from('feedback')
      .insert({
        event_id: eventId,
        member_id: memberId,
        rating,
        positives,
        negatives,
        improvements,
        created_at: new Date(),
      });

    if (insertError) {
      return json({ success: false, error: insertError.message }, { status: 500 });
    }

    // Send email
    const result = await sendFeedbackEmail(
      to,
      eventName,
      rating,
      positives,
      negatives,
      improvements,
      memberName,
      memberEmail
    );

    return json({ success: result.success ?? true });
  } catch (error) {
    return json({ success: false, error: String(error) }, { status: 500 });
  }
}
