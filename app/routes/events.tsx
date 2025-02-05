import { type LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData, useFetcher, json } from "@remix-run/react"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Button } from "~/components/ui/button"
import { Plus } from "lucide-react"
import { EventCard } from "~/components/events/event-card"
import { AgendaSection } from "~/components/events/agenda-section"
import { AbsenceModal } from "~/components/events/absence-modal"
import { FeedbackModal } from "~/components/events/feedback-modal"
import { AddEventForm } from "~/components/events/add-event-form"
import type { Event } from "~/types/events"
import { motion, AnimatePresence } from "framer-motion"
import { getEvents, registerForEvent } from "~/utils/events.server"

export const loader = async () => {
  const events = await getEvents()
  return new Response(JSON.stringify({ events }), {
    headers: { "Content-Type": "application/json" },
  })
}

export const action = async ({ request }: LoaderFunctionArgs) => {
  const formData = await request.formData()
  const { eventId, userId } = Object.fromEntries(formData)

  if (typeof eventId !== "string" || typeof userId !== "string") {
    throw new Error("Invalid form data")
  }
  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  })
  await registerForEvent(eventId, userId)
  return json({ success: true })
}

export default function EventsPage() {
  const { events: initialEvents } = useLoaderData<typeof loader>()
  const fetcher = useFetcher()

  const [selectedEvent, setSelectedEvent] = useState<Event>(initialEvents[0])
  const [showAgenda, setShowAgenda] = useState(false)
  const [showAbsence, setShowAbsence] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [allEvents, setAllEvents] = useState<Event[]>(initialEvents)
  const [joinedEvents, setJoinedEvents] = useState<Set<string>>(new Set())
  const [showJoinSuccess, setShowJoinSuccess] = useState(false)

  const handleEventChange = (eventId: string) => {
    const event = allEvents.find((e) => e.id === eventId)
    if (event) {
      setSelectedEvent(event)
      setShowAgenda(false)
    }
  }

  const handleJoin = () => {
    fetcher.submit(
      {
        eventId: selectedEvent.id,
        userId: "current-user-id", // Replace with actual user ID
      },
      { method: "post" },
    )

    setJoinedEvents(new Set([...joinedEvents, selectedEvent.id]))
    setAllEvents(
      allEvents.map((event) => (event.id === selectedEvent.id ? { ...event, attendees: event.attendees + 1 } : event)),
    )
    setShowJoinSuccess(true)
    setTimeout(() => setShowJoinSuccess(false), 3000)
  }

  const handleAddEvent = async (newEvent: Partial<Event>) => {
    const event: Event = {
      ...newEvent,
      id: `wb-${Date.now()}`,
      createdAt: new Date(),
      date: newEvent.date || new Date(),
      leadingClan: newEvent.leadingClan!,
      agenda: newEvent.agenda || [],
      status: "upcoming",
      attendees: 0,
      title: newEvent.title || "Untitled Event",
    }
    setAllEvents([event, ...allEvents])
    setSelectedEvent(event)
    setShowAddEvent(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <h1 className="text-3xl font-bold text-white">Weekly Bash Events</h1>
          <Button
            onClick={() => setShowAddEvent(true)}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <Select onValueChange={handleEventChange} defaultValue={selectedEvent.id}>
            <SelectTrigger className="w-full md:w-[300px] bg-blue-800/50 border-blue-700 text-white">
              <SelectValue placeholder="Select event" />
            </SelectTrigger>
            <SelectContent className="bg-blue-900 text-white border-blue-700">
              {allEvents.map((event) => (
                <SelectItem key={event.id} value={event.id} className="hover:bg-blue-800 focus:bg-blue-800">
                  {event.title} - {event.date.toLocaleDateString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <EventCard
            event={selectedEvent}
            onViewAgenda={() => setShowAgenda(!showAgenda)}
            onJoin={handleJoin}
            onCantAttend={() => setShowAbsence(true)}
            isJoined={joinedEvents.has(selectedEvent.id)}
          />
        </motion.div>

        <AnimatePresence>
          {showJoinSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg"
            >
              Successfully joined the event! 🎉
            </motion.div>
          )}
        </AnimatePresence>

        <AgendaSection event={selectedEvent} isVisible={showAgenda} />

        {selectedEvent.status === "completed" && (
          <motion.div className="mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Button
              variant="outline"
              onClick={() => setShowFeedback(true)}
              className="w-full border-blue-400 text-white hover:bg-blue-800"
            >
              Provide Feedback
            </Button>
          </motion.div>
        )}

        <AbsenceModal event={selectedEvent} isOpen={showAbsence} onClose={() => setShowAbsence(false)} />

        <FeedbackModal event={selectedEvent} isOpen={showFeedback} onClose={() => setShowFeedback(false)} />

        <AddEventForm isOpen={showAddEvent} onClose={() => setShowAddEvent(false)} onSubmit={handleAddEvent} />
      </div>
    </div>
  )
}

