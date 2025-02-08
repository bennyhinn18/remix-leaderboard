import { json, type ActionFunctionArgs } from "@remix-run/node"
import { createTransport } from "nodemailer"

export async function action({ request }: ActionFunctionArgs) {
  // Validate environment variables
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    return json({ error: "Email configuration is missing. Please contact the administrator." }, { status: 500 })
  }

  // Validate request method
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 })
  }

  try {
    const formData = await request.formData()

    // Validate required fields
    const requiredFields = ["to", "from", "eventId", "eventTitle", "date", "reason"]
    const missingFields = requiredFields.filter((field) => !formData.get(field))

    if (missingFields.length > 0) {
      return json({ error: `Missing required fields: ${missingFields.join(", ")}` }, { status: 400 })
    }

    // Get form data
    const to = formData.get("to") as string
    const from = formData.get("from") as string
    const eventId = formData.get("eventId") as string
    const eventTitle = formData.get("eventTitle") as string
    const date = formData.get("date") as string
    const reason = formData.get("reason") as string

    // Create email transporter
    const transporter = createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

    // Send email
    await transporter.sendMail({
      from: `"Event System" <${process.env.EMAIL_USER}>`,
      to: "michalnithesh@gmail.com", // Hardcoded recipient
      replyTo: from,
      subject: `Absence Notification - ${eventTitle}`,
      html: `
        <h2>Absence Notification</h2>
        <p><strong>Event:</strong> ${eventTitle}</p>
        <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
        <p><strong>From:</strong> ${from}</p>
        <p><strong>Reason:</strong></p>
        <p>${reason}</p>
      `,
    })

    return json({ success: true })
  } catch (error) {
    console.error("Error sending email:", error)
    return json(
      {
        error: "Failed to send notification. Please try again later.",
      },
      { status: 500 },
    )
  }
}

