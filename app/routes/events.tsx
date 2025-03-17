"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useLoaderData, useNavigation, useSubmit, useNavigate, useActionData, Outlet, useLocation } from "@remix-run/react"
import { json, type LoaderFunctionArgs ,type ActionFunctionArgs} from "@remix-run/node"
import { createServerSupabase } from "~/utils/supabase.server"
import { EventCard } from "~/components/events/event-card"
import { AgendaSection } from "~/components/events/agenda-section"
import { AbsenceModal } from "~/components/events/absence-modal"
import { FeedbackModal } from "~/components/events/feedback-modal"
import { Button } from "~/components/ui/button"
import { Plus, AlertCircle, CalendarIcon, Loader2, X, ArrowLeft } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Alert } from "~/components/ui/alert"
import { useToast } from "~/hooks/use-toast"
import { cn } from "~/lib/utils"
import { parseISO, isAfter, isBefore, startOfDay } from "date-fns"
import { isOrganiser } from "~/utils/currentUser"
import { WeekAnnouncement } from "~/components/events/week-announcement"
import { useLocalStorage } from "~/hooks/use-local-storage"

export async function loader({ request }: LoaderFunctionArgs) {
  const response = new Response()
  const supabase = createServerSupabase(request,response)
  const { data: { user } } = await supabase.auth.getUser()

  try {
    const { data: events } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: false })

      const organiserStatus = await isOrganiser(request)

    return json({
      events: events || [],
      isOrganiser: organiserStatus || false,
      userId: user?.id
    })
  } catch (error) {
    console.error("Error loading events:", error)
    throw json({ error: "Failed to load events" }, { status: 500 })
  }
}
export async function action({ request }: ActionFunctionArgs) {
  const response = new Response()
  const supabase = createServerSupabase(request, response)
  const formData = await request.formData()
  const intent = formData.get("intent")
  const eventId = formData.get("eventId") as string

  try {
    if (intent === "join" || intent === "unjoin") {
      const { data: event, error: fetchError } = await supabase
        .from("events")
        .select("attendees")
        .eq("id", eventId)
        .single()

      if (fetchError) throw fetchError

      const newAttendees = intent === "join" 
        ? (event.attendees || 0) + 1 
        : Math.max((event.attendees || 0) - 1, 0)

      const { error: updateError } = await supabase
        .from("events")
        .update({ attendees: newAttendees })
        .eq("id", eventId)

      if (updateError) throw updateError

      return json({ success: true })
    }
    return json({ success: false })
  } catch (error) {
    console.error("Action error:", error)
    return json({ error: "Failed to update attendance" }, { status: 500 })
  }
}
function getEventStatus(date: string, time: string) {
  const eventDate = parseISO(date)
  const today = startOfDay(new Date())
  const [startTime] = time.split("-").map((t) => t.trim())
  const [hours, minutes] = startTime.split(":").map(Number)
  const eventDateTime = new Date(eventDate)
  eventDateTime.setHours(hours, minutes)

  if (isBefore(eventDateTime, today)) return "completed"
  if (isAfter(eventDateTime, today)) return "upcoming"
  return "ongoing"
}

export default function EventsRoute() {
  const { events: initialEvents, isOrganiser, userId } = useLoaderData<typeof loader>()
  const [events, setEvents] = useState(initialEvents.map(event => ({
    ...event,
    status: getEventStatus(event.date, event.time)
  })))
  const [selectedEvent, setSelectedEvent] = useState(events[0])
  const [showAgenda, setShowAgenda] = useState(false)
  const [filterStatus, setFilterStatus] = useState("all")
  const submit = useSubmit()
  const { toast } = useToast()
  const [joinedEvents, setJoinedEvents] = useLocalStorage<string[]>("joinedEvents", [])
  const navigate = useNavigate()
  const location=useLocation()
  const actionData = useActionData<typeof action>()
  const handleJoin = useCallback(async (eventId: string) => {
    const isJoined = joinedEvents.includes(eventId)
    const event = events.find(e => e.id === eventId)
    
    
    if (!event) return

    // Optimistic update
    setJoinedEvents(prev => isJoined 
      ? prev.filter(id => id !== eventId)
      : [...prev, eventId]
    )

    submit(
      { intent: isJoined ? "unjoin" : "join", eventId },
      { method: "POST", replace: true }
    )

    toast({
      title: isJoined ? "Left event" : "Joined event",
      description: isJoined 
        ? "You've successfully left the event"
        : "You've successfully joined the event",
      duration: 3000
    })
  }, [joinedEvents, submit, toast, setJoinedEvents, events])

  // Add useEffect for actionData errors
  useEffect(() => {
    if (actionData?.error) {
      toast({
        title: "Error",
        description: actionData.error,
        variant: "destructive"
      })
    }
  }, [actionData, toast])
  useEffect(() => {
    const updatedEvents = initialEvents.map(event => ({
      ...event,
      status: getEventStatus(event.date, event.time)
    })).sort((a, b) => {
      const statusOrder = { ongoing: 0, upcoming: 1, completed: 2 }
      return statusOrder[a.status] - statusOrder[b.status]
    })
    
    setEvents(updatedEvents)
    setSelectedEvent(updatedEvents[0])
  }, [initialEvents])
 
  const filteredEvents = events.filter(event => 
    filterStatus === "all" ? true : event.status === filterStatus
  )

  const handleStatusFilter = useCallback((status: string) => {
    setFilterStatus(status)
    setSelectedEvent(events.find(e => status === "all" ? e : e.status === status))
  }, [events])

  if (!events.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-4 flex flex-col items-center justify-center">
        <Alert variant="destructive" className="mb-6 max-w-2xl">
          <AlertCircle className="h-6 w-6 mr-2" />
          <div>
            <h3 className="text-lg">No events found</h3>
            <p className="text-sm">There are no events available at the moment.</p>
          </div>
        </Alert>
        {isOrganiser && (
          <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white">
            <Plus className="mr-2" />
            Create First Event
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {location.pathname !== "/events/new" && (
          <>
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-white">Weekly Events</h1>
              {isOrganiser && (
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={() => navigate("/events/new")}
          >
            <Plus className="mr-2" />
            Add Event
          </Button>
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <Select value={selectedEvent?.id} onValueChange={id => 
          setSelectedEvent(events.find(e => e.id === id))
              }>
          <SelectTrigger className="bg-blue-800/50 border-blue-700 text-white">
            <SelectValue placeholder="Select event" />
          </SelectTrigger>
          <SelectContent className="bg-blue-900 border-blue-700">
            {filteredEvents.map(event => (
              <SelectItem key={event.id} value={event.id} className="hover:bg-blue-800">
                {event.title} - {new Date(event.date).toLocaleDateString()}
              </SelectItem>
            ))}
          </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={handleStatusFilter}>
          <SelectTrigger className="bg-blue-800/50 border-blue-700 text-white">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent className="bg-blue-900 border-blue-700">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="ongoing">Ongoing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
              </Select>
            </div>
            <AnimatePresence mode="wait">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <WeekAnnouncement leadingClan={selectedEvent.leading_clan} isLoading={false} />
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
          key={selectedEvent?.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
              >
          {selectedEvent && (
            <>
              <EventCard
                event={selectedEvent}
                onJoin={() => handleJoin(selectedEvent.id)}
                onViewAgenda={() => setShowAgenda(!showAgenda)}
                isJoined={joinedEvents.includes(selectedEvent.id)}
                isOrganiser={isOrganiser}
              />
              <AgendaSection 
                event={selectedEvent} 
                isVisible={showAgenda}
              />
            </>
          )}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      {location.pathname === "/events/new" && (
        <div id="create-event-section" className="mt-6 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold">Create New Event</h2>
          {/* Create Event Form or content goes here */}
          <Outlet />
        </div>
      )}
      </div>
    </div>
    
  )
}