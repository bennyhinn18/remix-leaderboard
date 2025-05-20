import { json } from '@remix-run/node';
import { sendFeedbackEmail } from '~/services/email-service';

export async function action({ request }: { request: Request }) {
  try {
    const body = await request.json();
    const { to, eventName, rating, positives, negatives, improvements } = body;

    const result = await sendFeedbackEmail(
      to,
      eventName,
      rating,
      positives,
      negatives,
      improvements
    );


    return json({ success: result.success ?? true }); // fallback to true if not explicitly returned
  } catch (error) {
    return json({ success: false, error: String(error) }, { status: 500 });
  }
}
