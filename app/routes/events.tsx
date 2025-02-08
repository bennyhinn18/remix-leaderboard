"use client"

import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node"
import { useLoaderData, useNavigation, useSubmit, useNavigate, useFetcher } from "@remix-run/react"
import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "~/utils/supabase.server"
import { EventCard } from "~/components/event-card"
import { AgendaSection } from "~/components/agenda-section"
import { AbsenceModal } from "~/components/absence-modal"
import { FeedbackModal } from "~/components/feedback-modal"
import { Button } from "~/components/ui/button"
import { Plus, AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { useToast } from "~/hooks/use-toast"
import type { Database } from "~/types/events"
import { AddEventForm } from "./events.add"
import { WeekAnnouncement } from "~/components/week-announcement"
import { AttendeesList } from "~/components/attendees-list"

type Event = Database["public"]["Tables"]["events"]["Row"]

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url)
    const status = url.searchParams.get("status")

    let query = supabase.from("events").select("*")

    if (status) {
      query = query.eq("status", status)
    }

    const { data: events, error } = await query.order("date", { ascending: true })

    if (error) throw error

    return json({
      events,
      status: status || "all",
    })
  } catch (error) {
    console.error("Error loading events:", error)
    throw new Error("Failed to load events")
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const intent = formData.get("intent")
  const eventId = formData.get("eventId") as string

  try {
    if (intent === "join") {
      const { data: event, error: fetchError } = await supabase
        .from("events")
        .select("attendees")
        .eq("id", eventId)
        .single()

      if (fetchError) throw new Error("Failed to fetch event")

      const { error } = await supabase
        .from("events")
        .update({
          attendees: (event.attendees || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", eventId)

      if (error) throw error

      return json({ success: true })
    }

    return json({ success: false })
  } catch (error) {
    console.error("Error in action:", error)
    return json({ error: "Failed to process request" }, { status: 500 })
  }
}

export default function EventsRoute() {
  const { events, status } = useLoaderData<typeof loader>()
  const navigation = useNavigation()
  const submit = useSubmit()
  const navigate = useNavigate()
  const fetcher = useFetcher()
  const { toast } = useToast()

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(events[0] ?? null)
  const [showAgenda, setShowAgenda] = useState(false)
  const [showAbsence, setShowAbsence] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [filterStatus, setFilterStatus] = useState(status)

  const isLoading = navigation.state === "loading" || navigation.state === "submitting"

  useEffect(() => {
    if (events.length > 0 && !selectedEvent) {
      setSelectedEvent(events[0])
    }
  }, [events, selectedEvent])

  const handleEventChange = useCallback(
    (eventId: string) => {
      const event = events.find((e) => e.id === eventId)
      if (event) {
        setSelectedEvent(event)
        setShowAgenda(false)
      }
    },
    [events],
  )

  const handleJoin = useCallback(
    (eventId: string) => {
      submit({ intent: "join", eventId }, { method: "POST", replace: true })

      toast({
        title: "Success!",
        description: "You've successfully joined the event.",
        duration: 3000,
      })
    },
    [submit, toast],
  )

  const handleStatusFilter = useCallback(
    (newStatus: string) => {
      setFilterStatus(newStatus)
      navigate(`/events?status=${newStatus}`)
    },
    [navigate],
  )

  if (!events.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No events found</AlertTitle>
            <AlertDescription>There are no events available at the moment.</AlertDescription>
          </Alert>
          <Button
            onClick={() => setShowAddEvent(true)}
            className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create First Event
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
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

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <WeekAnnouncement isLoading={true} />
            </motion.div>
          ) : selectedEvent?.leading_clan ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <WeekAnnouncement leadingClan={selectedEvent.leading_clan} isLoading={false} />
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="grid gap-4 mb-6 mt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Select onValueChange={handleEventChange} defaultValue={selectedEvent?.id} disabled={isLoading}>
              <SelectTrigger className="w-full md:w-[300px] bg-blue-800/50 border-blue-700 text-white">
                <SelectValue placeholder="Select event" />
              </SelectTrigger>
              <SelectContent className="bg-blue-900 text-white border-blue-700">
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id} className="hover:bg-blue-800 focus:bg-blue-800">
                    {event.title} - {new Date(event.date).toLocaleDateString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={handleStatusFilter} defaultValue={filterStatus} disabled={isLoading}>
              <SelectTrigger className="w-full md:w-[200px] bg-blue-800/50 border-blue-700 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-blue-900 text-white border-blue-700">
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedEvent && (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <EventCard
                event={selectedEvent}
                onViewAgenda={() => setShowAgenda(!showAgenda)}
                onJoin={() => handleJoin(selectedEvent.id)}
                onCantAttend={() => setShowAbsence(true)}
                isJoined={false}
                disabled={isLoading}
              />
            </motion.div>

            <AgendaSection event={selectedEvent} isVisible={showAgenda} isLoading={isLoading} />

            {selectedEvent.status === "completed" && (
              <motion.div className="mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Button
                  variant="outline"
                  onClick={() => setShowFeedback(true)}
                  className="w-full border-blue-400 text-white hover:bg-blue-800"
                  disabled={isLoading}
                >
                  Provide Feedback
                </Button>
              </motion.div>
            )}

            <AttendeesList event={selectedEvent} />

            <AbsenceModal event={selectedEvent} isOpen={showAbsence} onClose={() => setShowAbsence(false)} />

            <FeedbackModal event={selectedEvent} isOpen={showFeedback} onClose={() => setShowFeedback(false)} />
          </>
        )}

        <AddEventForm isOpen={showAddEvent} onClose={() => setShowAddEvent(false)} />
      </div>
    </div>
  )
}

