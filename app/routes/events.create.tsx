import { json, type ActionFunctionArgs } from "@remix-run/node"
import { createEvent } from "~/utils/events.server"
import type { Event, AgendaItem } from "~/types/events"

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const data = Object.fromEntries(formData)

  // Parse agenda items from JSON string
  const agendaItems = JSON.parse(data.agenda as string) as AgendaItem[]

  const eventData: Omit<Event, "id" | "createdAt" | "attendees"> = {
    title: data.title as string,
    date: new Date(data.date as string),
    location: data.venue as string,
    leadingClan: data.clanName as string,
    status: "upcoming",
    description: `${data.time as string} at ${data.venue as string}`,
    agenda: agendaItems,
    maxCapacity: 50, // Default value
  }

  try {
    const event = await createEvent(eventData)
    return json({ success: true, event })
  } catch (error) {
    return json({ success: false, error: (error as Error).message }, { status: 400 })
  }
}

