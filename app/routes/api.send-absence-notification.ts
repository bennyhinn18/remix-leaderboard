import type { ActionFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export const action: ActionFunction = async ({ request }) => {
  try {
    const formData = await request.formData();
    const to = formData.get('to') as string;
    const from = formData.get('from') as string;
    const eventId = formData.get('eventId') as string;
    const eventTitle = formData.get('eventTitle') as string;
    const date = formData.get('date') as string;
    const reason = formData.get('reason') as string;

    if (!to || !from || !eventId || !eventTitle || !date || !reason) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Send the email using Resend
    await resend.emails.send({
      from: `Byte Bash Blitz <noreply@bytebashblitz.org>`,
      to,
      subject: `Absence Notification for Event: ${eventTitle}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #0C2340; background: #FFFFFF; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(12,35,64,0.1);">
  <!-- Header with warning accent -->
  <div style="background: linear-gradient(135deg, #F8F9FA, #FFFFFF); padding: 25px; text-align: center; border-bottom: 3px solid #F04B2D;">
    <h1 style="color: #0C2340; margin: 0; font-size: 24px; font-weight: 700;">Absence Notification</h1>
    <p style="color: #6B7C93; margin: 8px 0 0; font-size: 15px;">We've received your absence notice</p>
  </div>
  
  <!-- Main content -->
  <div style="padding: 30px;">
    <!-- Event details card -->
    <div style="background: #F8F9FA; border-radius: 8px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #3EC1FF;">
      <div style="display: flex; margin-bottom: 12px;">
        <div style="flex: 1;">
          <p style="color: #6B7C93; margin: 0 0 5px; font-size: 13px; font-weight: 500;">EVENT</p>
          <p style="color: #0C2340; margin: 0; font-size: 17px; font-weight: 600;">${eventTitle}</p>
        </div>
        <div style="flex: 1;">
          <p style="color: #6B7C93; margin: 0 0 5px; font-size: 13px; font-weight: 500;">DATE</p>
          <p style="color: #0C2340; margin: 0; font-size: 17px; font-weight: 600;">${date}</p>
        </div>
      </div>
      <div>
        <p style="color: #6B7C93; margin: 15px 0 5px; font-size: 13px; font-weight: 500;">FROM</p>
        <p style="color: #0C2340; margin: 0; font-size: 17px; font-weight: 600;">${from}</p>
      </div>
    </div>

    <!-- Reason section -->
    <div style="margin-bottom: 25px;">
      <div style="display: flex; align-items: center; margin-bottom: 15px;">
        <div style="width: 8px; height: 24px; background: #F04B2D; border-radius: 4px; margin-right: 12px;"></div>
        <h3 style="color: #0C2340; margin: 0; font-size: 18px; font-weight: 600;">Reason for Absence</h3>
      </div>
      <div style="background: #F8F9FA; padding: 18px; border-radius: 8px;">
        <p style="margin: 0; color: #0C2340; line-height: 1.6;">${reason}</p>
      </div>
    </div>

    <!-- Reference ID -->
    <div style="background: #F0F7FF; padding: 12px; border-radius: 6px; text-align: center;">
      <p style="margin: 0; color: #3EC1FF; font-size: 13px; font-weight: 600;">
        Reference ID: <span style="color: #0C2340;">${eventId}</span>
      </p>
    </div>

    <!-- Footer -->
    <div style="margin-top: 30px; text-align: center; padding-top: 20px; border-top: 1px solid #E1E8F0;">
      <p style="margin: 0; color: #6B7C93; font-size: 12px;">
       BYTE BASH BLITZ
      </p>
    </div>
  </div>
</div>
      `,
    });

    return json({ success: true });
  } catch (error: unknown) {
    console.error('Error sending absence notification email:', error);
    let errorMessage = 'Failed to send email';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return json({ error: errorMessage }, { status: 500 });
  }
};
