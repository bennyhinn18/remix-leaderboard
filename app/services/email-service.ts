import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendFeedbackEmail(
  to: string,
  eventName: string,
  rating: number,
  positives: string,
  negatives: string,
  improvements?: string,
  memberName?: string,
  memberEmail?: string
) {
  try {
    const result = await resend.emails.send({
      from: 'Byte Bash Blitz <noreply@bytebashblitz.org>',
      to: [to],
      subject: `Feedback for ${eventName}`,
      html: `
        <h2>Event Feedback: ${eventName}</h2>
        <p><strong>From:</strong> ${memberName ?? 'Anonymous'} (${memberEmail ?? 'No email'})</p>
        <p><strong>Rating:</strong> ${rating}/5</p>
        <p><strong>Positives:</strong> ${positives}</p>
        <p><strong>Negatives:</strong> ${negatives}</p>
        <p><strong>Suggestions:</strong> ${improvements || 'None'}</p>
      `,
    });
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}
