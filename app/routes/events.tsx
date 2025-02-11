"use client"

import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node"
import { useLoaderData, useNavigation, useSubmit, useNavigate, useActionData } from "@remix-run/react"
import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createServerSupabase } from "~/utils/supabase.server"
import { EventCard } from "~/components/event-card"
import { AgendaSection } from "~/components/agenda-section"
import { AbsenceModal } from "~/components/absence-modal"
import { FeedbackModal } from "~/components/feedback-modal"
import { Button } from "~/components/ui/button"
import { Plus, AlertCircle, CalendarIcon, Loader2, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { useToast } from "~/hooks/use-toast"
import type { AgendaItem, Database } from "~/types/events"
import { WeekAnnouncement } from "~/components/week-announcement"
// import { AttendeesList } from "~/components/attendees-list"
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog"
import { Popover, PopoverTrigger, PopoverContent } from "@radix-ui/react-popover"
import { Label } from "~/components/ui/label"
import { format } from "date-fns"
import Calendar from "~/components/calendar"
import { Input } from "~/components/ui/input"
import { DialogHeader } from "~/components/ui/dialog"
import { cn } from "~/lib/utils"

type Event = Database["public"]["Tables"]["events"]["Row"]

export async function loader({ request }: LoaderFunctionArgs) {
  const response = new Response()
  const supabase = createServerSupabase(request, response)

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
  const response = new Response()
  const supabase = createServerSupabase(request, response)
  const formData = await request.formData()
  const intent = formData.get("intent")
  const eventId = formData.get("eventId") as string

  try {
    if (intent === "join") {
      const { data: event, error: fetchError } = await supabase
        .from("events")
        .select("attendees, absentees")
        .eq("id", eventId)
        .single()

      if (fetchError) throw new Error("Failed to fetch event")

      const { error: updateError } = await supabase
        .from("events")
        .update({
          attendees: (event.attendees || 0) + 1,
          absentees: (event.absentees || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", eventId)

      if (updateError) throw updateError

      return json({ success: true })
    } else {
      // Validate required fields
      const requiredFields = ["title", "date", "time", "venue", "clanName", "clanScore"]
      for (const field of requiredFields) {
        if (!formData.get(field)) {
          return json({ error: `${field} is required` }, { status: 400 })
        }
      }

      // Parse agenda items
      const agendaItems: AgendaItem[] = []
      let i = 0
      while (formData.get(`agenda[${i}].time`)) {
        agendaItems.push({
          time: formData.get(`agenda[${i}].time`) as string,
          title: formData.get(`agenda[${i}].title`) as string,
          description: formData.get(`agenda[${i}].description`) as string,
          speaker: (formData.get(`agenda[${i}].speaker`) as string) || undefined,
        })
        i++
      }

      const dateStr = formData.get("date") as string
      const date = new Date(dateStr)
      const formattedDate = format(date, "yyyy-MM-dd")
      const now = new Date().toISOString()

      const newEvent = {
        title: formData.get("title") as string,
        date: formattedDate,
        time: formData.get("time") as string,
        venue: formData.get("venue") as string,
        leading_clan: {
          name: formData.get("clanName") as string,
          avatar: "/placeholder.svg?height=50&width=50",
          score: Number(formData.get("clanScore")) || 0,
        },
        agenda: agendaItems,
        status: "upcoming",
        attendees: 0,
        created_at: now,
        updated_at: now,
      }

      const { error: insertError } = await supabase.from("events").insert([newEvent])

      if (insertError) {
        console.error("Supabase error:", insertError)
        return json({ error: insertError.message }, { status: 500 })
      }

      return json({ success: true, message: "Event created successfully!" })
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
  const { toast } = useToast()
  

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(events[0] ?? null)
  const [showAgenda, setShowAgenda] = useState(false)
  const [showAbsence, setShowAbsence] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [filterStatus, setFilterStatus] = useState(status)
  const [showAddEvent, setShowAddEvent] = useState(false)
  const actionData = useActionData<typeof action>()
  const [date, setDate] = useState<Date>()
  const [agendaItems, setAgendaItems] = useState<Partial<AgendaItem>[]>([
    { time: "", title: "", description: "", speaker: "" },
  ])
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

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
        duration: 5000,
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

  const isSubmitting = navigation.state === "submitting"

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const errors: Record<string, string> = {}

    // Client-side validation
    if (!date) errors.date = "Date is required"

    // Validate agenda items
    agendaItems.forEach((item, index) => {
      if (!item.time) errors[`agenda[${index}].time`] = "Time is required"
      if (!item.title) errors[`agenda[${index}].title`] = "Title is required"
      if (!item.description) errors[`agenda[${index}].description`] = "Description is required"
    })

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    const formData = new FormData(e.currentTarget)
    formData.set("date", date?.toISOString() || "")

    // Add agenda items to form data
    agendaItems.forEach((item, index) => {
      formData.append(`agenda[${index}].time`, item.time || "")
      formData.append(`agenda[${index}].title`, item.title || "")
      formData.append(`agenda[${index}].description`, item.description || "")
      if (item.speaker) formData.append(`agenda[${index}].speaker`, item.speaker)
    })

    const result = await submit(formData, { method: "POST" }) as unknown as { success?: boolean }

    if (result?.success) {
      toast({
        title: "Success!",
        description: "Event created successfully!",
        duration: 3000,
      })
      setShowAddEvent(false)
    }
  }

  const addAgendaItem = () => {
    setAgendaItems([...agendaItems, { time: "", title: "", description: "", speaker: "" }])
  }

  const removeAgendaItem = (index: number) => {
    setAgendaItems(agendaItems.filter((_, i) => i !== index))
    const newErrors = { ...validationErrors }
    delete newErrors[`agenda[${index}].time`]
    delete newErrors[`agenda[${index}].title`]
    delete newErrors[`agenda[${index}].description`]
    setValidationErrors(newErrors)
  }

  const updateAgendaItem = (index: number, field: keyof AgendaItem, value: string) => {
    const newItems = [...agendaItems]
    newItems[index] = { ...newItems[index], [field]: value }
    setAgendaItems(newItems)
    if (value) {
      const newErrors = { ...validationErrors }
      delete newErrors[`agenda[${index}].${field}`]
      setValidationErrors(newErrors)
    }
  }

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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 pt-8 pb-[78px] px-4">
      <div className="max-w-4xl mx-auto ">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <h1 className="text-3xl font-bold text-white">Weekly Bash Events</h1>
          <Button
            onClick={() => setShowAddEvent(true)}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2 text-white" />
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
                    <div className="flex flex-col md:flex-row">
                      <span className="truncate">
                        {event.title.length > 20 ? `${event.title.substring(0, 20)}...` : event.title} -
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                    </div>
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

            {/* <AttendeesList event={selectedEvent} /> */}

            <AbsenceModal event={selectedEvent} isOpen={showAbsence} onClose={() => setShowAbsence(false)} />

            <FeedbackModal event={selectedEvent} isOpen={showFeedback} onClose={() => setShowFeedback(false)} />

            <div className="mt-8">
          <Dialog open={showAddEvent} onOpenChange={() => setShowAddEvent(false)}>
          <DialogContent className="max-w-full p-8 max-h-[90vh] overflow-y-auto bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white">
            <DialogHeader className="flex flex-col items-center text-xl ">
              <DialogTitle>Add New Event</DialogTitle>
            </DialogHeader>

            {actionData && "error" in actionData && actionData.error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-md mb-4"
              >
                {actionData.error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue="Weekly Bash:  BYTE-BASH-BLITZ 👊"
                    required
                    disabled={isSubmitting}
                    aria-invalid={validationErrors.title ? "true" : undefined}
                  />
                  {validationErrors.title && <p className="text-sm text-red-500 mt-1">{validationErrors.title}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isSubmitting}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground",
                            validationErrors.date && "border-red-500",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
                        <Calendar
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                          disabled={(date: Date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                    {validationErrors.date && <p className="text-sm text-red-500 mt-1">{validationErrors.date}</p>}
                  </div>
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      name="time"
                      placeholder="e.g., 09:30 - 03:00 IST"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="venue">Venue</Label>
                  <Input
                    id="venue"
                    name="venue"
                    defaultValue="Center for Innovation, Stella Mary's College of Engineering"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="grid gap-4">
                <h3 className="font-semibold">Leading Clan Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clanName">Clan Name</Label>
                    <Input id="clanName" name="clanName" required disabled={isSubmitting} />
                  </div>
                  <div>
                    <Label htmlFor="clanScore">Clan Score</Label>
                    <Input id="clanScore" name="clanScore" type="number" required disabled={isSubmitting} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Agenda</h3>
                  <Button type="button" onClick={addAgendaItem} variant="outline" size="sm" disabled={isSubmitting}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>

                <AnimatePresence>
                  {agendaItems.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid gap-4 p-4 border rounded-lg relative"
                    >
                      {agendaItems.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2"
                          onClick={() => removeAgendaItem(index)}
                          disabled={isSubmitting}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Time Slot</Label>
                          <Input
                            value={item.time}
                            onChange={(e) => updateAgendaItem(index, "time", e.target.value)}
                            placeholder="e.g., 19:00 - 19:30"
                            required
                            disabled={isSubmitting}
                            aria-invalid={validationErrors[`agenda[${index}].time`] ? "true" : undefined}
                          />
                          {validationErrors[`agenda[${index}].time`] && (
                            <p className="text-sm text-red-500 mt-1">{validationErrors[`agenda[${index}].time`]}</p>
                          )}
                        </div>
                        <div>
                          <Label>Title</Label>
                          <Input
                            value={item.title}
                            onChange={(e) => updateAgendaItem(index, "title", e.target.value)}
                            required
                            disabled={isSubmitting}
                            aria-invalid={validationErrors[`agenda[${index}].title`] ? "true" : undefined}
                          />
                          {validationErrors[`agenda[${index}].title`] && (
                            <p className="text-sm text-red-500 mt-1">{validationErrors[`agenda[${index}].title`]}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label>Description</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateAgendaItem(index, "description", e.target.value)}
                          required
                          disabled={isSubmitting}
                          aria-invalid={validationErrors[`agenda[${index}].description`] ? "true" : undefined}
                        />
                        {validationErrors[`agenda[${index}].description`] && (
                          <p className="text-sm text-red-500 mt-1">
                            {validationErrors[`agenda[${index}].description`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label>Speaker (optional)</Label>
                        <Input
                          value={item.speaker}
                          onChange={(e) => updateAgendaItem(index, "speaker", e.target.value)}
                          disabled={isSubmitting}
                        />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowAddEvent(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="min-w-[100px]">
                  {isSubmitting ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </motion.div>
                  ) : (
                    "Create Event"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
          </>
        )}
      </div>
    </div>
  )
}