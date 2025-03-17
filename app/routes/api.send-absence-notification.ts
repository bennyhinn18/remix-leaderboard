import { json } from "@remix-run/node"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export const action = async ({ request }: { request: Request }) => {
  const formData = await request.formData()
  const email = formData.get("from") as string
  const reason = formData.get("reason") as string
  const eventTitle = formData.get("eventTitle") as string
  const date = formData.get("date") as string

  if (!email || !reason) {
    return json({ success: false, error: "Missing required fields" }, { status: 400 })
  }

  try {
    await resend.emails.send({
      from: "no-reply@yourdomain.com",
      to: "michalnithesh.cs22@stellamarycoe.edu.in",
      subject: `Absence Notification for ${eventTitle}`,
      html: `
        <p><strong>From:</strong> ${email}</p>
        <p><strong>Event:</strong> ${eventTitle}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Reason:</strong> ${reason}</p>
      `,
    })

    return json({ success: true })
  } catch (error) {
    console.error(error)
    return json({ success: false, error: "Failed to send email" }, { status: 500 })
  }
}
