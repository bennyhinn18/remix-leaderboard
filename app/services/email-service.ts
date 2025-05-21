import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendFeedbackEmail(
  to: string,
  eventName: string,
  rating: number,
  fullname: string,
  positives: string,
  negatives: string,
  improvements?: string
) {
  try {
    const result = await resend.emails.send({
      from: 'Byte Bash Blitz <noreply@bytebashblitz.org>',
      to: [to],
      subject: `Feedback for ${eventName}`,
      html: `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #0C2340; background: #FFFFFF;">
  <!-- Header - now rectangular and shorter -->
  <div style="background: linear-gradient(90deg, #3EC1FF, #A2D4FF); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: #FFFFFF; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">FEEDBACK RECEIVED</h1>
    <p style="color: rgba(255,255,255,0.95); margin: 6px 0 0; font-size: 16px; font-weight: 500;">${eventName}</p>
  </div>
  
  <!-- Main content card -->
  <div style="background: #FFFFFF; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #E1E8F0; border-top: none; box-shadow: 0 4px 12px rgba(12,35,64,0.05);">
    <!-- Rating badge with orange accent -->
    <div style="display: flex; align-items: center; margin-bottom: 25px; position: relative;">
      <div style="background: #FFFFFF; padding: 12px 16px; border-radius: 8px; margin-right: 15px; border: 2px solid #3EC1FF; box-shadow: 0 2px 8px rgba(62,193,255,0.2); position: relative;">
        <span style="font-size: 28px; font-weight: 700; color: #F04B2D;">${rating}</span>
        <span style="color: #0C2340; opacity: 0.6;">/5</span>
      </div>
      <div>
        <p style="font-weight: 700; margin: 0; color: #0C2340; font-size: 18px;">${fullname}</p>
        <p style="margin: 4px 0 0; color: #6B7C93; font-size: 14px; letter-spacing: 0.3px;">Event Participant</p>
      </div>
    </div>

    <!-- Feedback sections with colored accents -->
    <div style="margin-bottom: 25px;">
      <div style="display: flex; align-items: center; margin-bottom: 12px;">
        <div style="width: 8px; height: 24px; background: #3EC1FF; border-radius: 4px; margin-right: 12px;"></div>
        <h3 style="color: #0C2340; margin: 0; font-size: 18px; font-weight: 600;">What Went Well</h3>
      </div>
      <div style="background: #F8FBFE; padding: 16px; border-radius: 8px; border-left: 3px solid #3EC1FF; box-shadow: 0 2px 6px rgba(12,35,64,0.05);">
        <p style="margin: 0; color: #0C2340; line-height: 1.5;">${positives}</p>
      </div>
    </div>

    <div style="margin-bottom: 25px;">
      <div style="display: flex; align-items: center; margin-bottom: 12px;">
        <div style="width: 8px; height: 24px; background: #F04B2D; border-radius: 4px; margin-right: 12px;"></div>
        <h3 style="color: #0C2340; margin: 0; font-size: 18px; font-weight: 600;">Areas for Improvement</h3>
      </div>
      <div style="background: #F8FBFE; padding: 16px; border-radius: 8px; border-left: 3px solid #F04B2D; box-shadow: 0 2px 6px rgba(12,35,64,0.05);">
        <p style="margin: 0; color: #0C2340; line-height: 1.5;">${negatives}</p>
      </div>
    </div>

    <div style="margin-bottom: 10px;">
      <div style="display: flex; align-items: center; margin-bottom: 12px;">
        <div style="width: 8px; height: 24px; background: #A2D4FF; border-radius: 4px; margin-right: 12px;"></div>
        <h3 style="color: #0C2340; margin: 0; font-size: 18px; font-weight: 600;">Suggestions</h3>
      </div>
      <div style="background: #F8FBFE; padding: 16px; border-radius: 8px; border-left: 3px solid #A2D4FF; box-shadow: 0 2px 6px rgba(12,35,64,0.05);">
        <p style="margin: 0; color: #0C2340; line-height: 1.5;">${
          improvements || 'No specific suggestions provided'
        }</p>
      </div>
    </div>

    <!-- Footer with subtle branding -->
    <div style="margin-top: 35px; text-align: center; padding-top: 20px; border-top: 1px solid #E1E8F0;">
      <div style="display: inline-block; padding: 8px 16px; background: #F8FBFE; border-radius: 20px; margin-bottom: 10px;">
        <p style="margin: 0; color: #3EC1FF; font-size: 12px; font-weight: 600; letter-spacing: 0.5px;">BYTE BASH BLITZ</p>
      </div>
      <p style="margin: 5px 0 0; color: #6B7C93; font-size: 11px;">This feedback was submitted via our event platform</p>
    </div>
  </div>
</div>
`,
    });
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}
