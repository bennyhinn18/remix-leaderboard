import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation, Outlet } from "react-router-dom"; // using react-router for navigation in CSR
import { parseISO, isAfter, isBefore, startOfDay } from "date-fns";
import { Button } from "~/components/ui/button";
import { Plus, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Alert } from "~/components/ui/alert";
import { useToast } from "~/hooks/use-toast";
import { EventCard } from "~/components/events/event-card";
import { AgendaSection } from "~/components/events/agenda-section";
import { AbsenceModal } from "~/components/events/absence-modal";
import { FeedbackModal } from "~/components/events/feedback-modal";
import { WeekAnnouncement } from "~/components/events/week-announcement";
import { useLocalStorage } from "~/hooks/use-local-storage";

// Import your client-side Supabase client initialization
import { json, useLoaderData } from "@remix-run/react";
import { LoaderFunctionArgs } from "@remix-run/node";
import { initSupabase } from "~/utils/supabase.client";
import { isOrganiser } from "~/utils/currentUser";


// Helper function to determine event status
function getEventStatus(date, time) {
  const eventDate = parseISO(date);
  const today = startOfDay(new Date());
  const [startTime] = time.split("-").map((t) => t.trim());
  const [hours, minutes] = startTime.split(":").map(Number);
  const eventDateTime = new Date(eventDate);
  eventDateTime.setHours(hours, minutes);

  if (isBefore(eventDateTime, today)) return "completed";
  if (isAfter(eventDateTime, today)) return "upcoming";
  return "ongoing";
}
export const loader = async ({ request }: LoaderFunctionArgs) => {
  
  return json({
    isOrganiser:await isOrganiser(request),
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  })
}
export default function Events() {
  const { SUPABASE_URL, SUPABASE_ANON_KEY,isOrganiser } = useLoaderData();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showAgenda, setShowAgenda] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAbsence, setShowAbsence] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [joinedEvents, setJoinedEvents] = useLocalStorage("joinedEvents", []);
  


  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();



  // Fetch events from database on mount
  useEffect(() => {
     if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return
    const supabase = initSupabase(SUPABASE_URL, SUPABASE_ANON_KEY)
    async function fetchEvents() {
      try {
        // Adjust query as needed; here we assume the "events" table exists.
        let { data: eventsData, error } = await supabase
          .from("events")
          .select("*")
          .order("date", { ascending: false });

        if (error) throw error;

        // If you have a method to determine organiser status, call it here.
        // For demonstration, we assume a boolean is returned.
        // You can replace the below with your own logic.
        

        const updatedEvents = (eventsData || []).map((event) => ({
          ...event,
          status: getEventStatus(event.date, event.time),
        })).sort((a, b) => {
          const statusOrder = { ongoing: 0, upcoming: 1, completed: 2 };
          return statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
        });

        setEvents(updatedEvents);
        setSelectedEvent(updatedEvents[0] || null);
      } catch (error) {
        console.error("Error loading events:", error);
        toast({
          title: "Error",
          description: "Failed to load events",
          variant: "destructive",
        });
      }
    }

    fetchEvents();
    // You can add toast or other dependencies if needed
  }, [SUPABASE_URL, SUPABASE_ANON_KEY, toast]);

  // Optimistic join/unjoin functionality
  const handleJoin = useCallback(async (eventId) => {
    const supabase = initSupabase(SUPABASE_URL, SUPABASE_ANON_KEY);
    const isJoined = joinedEvents.includes(eventId);
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    // Optimistic UI Update
    setJoinedEvents(prev => 
      isJoined ? prev.filter(id => id !== eventId) : [...prev, eventId]
    );

    const newAttendees = isJoined 
      ? Math.max((event.attendees || 0) - 1, 0)
      : (event.attendees || 0) + 1;

    // Update DB
    const { error } = await supabase
      .from("events")
      .update({ attendees: newAttendees })
      .eq("id", eventId);

    if (error) {
      // Rollback UI if update fails
      setJoinedEvents(prev => 
        isJoined ? [...prev, eventId] : prev.filter(id => id !== eventId)
      );

      toast({
        title: "Error",
        description: "Failed to update attendance",
        variant: "destructive"
      });
    } else {
      // Fetch updated data to ensure UI consistency
      const { data: updatedEvent, error: fetchError } = await supabase
        .from("events")
        .select("attendees")
        .eq("id", eventId)
        .single();

      if (!fetchError && updatedEvent) {
        setEvents(prevEvents => 
          prevEvents.map(e => 
            e.id === eventId ? { ...e, attendees: updatedEvent.attendees } : e
          )
        );
      }

      toast({
        title: isJoined ? "Left event" : "Joined event",
        description: isJoined 
          ? "You've successfully left the event"
          : "You've successfully joined the event",
        duration: 3000
      });
    }
}, [joinedEvents, events, setJoinedEvents, setEvents, toast]);



  const handleStatusFilter = useCallback((status) => {
    setFilterStatus(status);
    setSelectedEvent(events.find(e => status === "all" ? true : e.status === status));
  }, [events]);

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
    );
  }

  // Filter events based on status
  const filteredEvents = events.filter(event => 
    filterStatus === "all" ? true : event.status === filterStatus
  );

  return (
    <div className="min-h-screen pb-[78px] bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {location.pathname !== "/events/new" && (
          <>
            <div className="flex justify-between items-center">
              <h1 className="text-5xl font-bold text-white text-center w-full mt-6">Weekly Events</h1>
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

            <AnimatePresence mode="popLayout">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <WeekAnnouncement leadingClan={selectedEvent?.leading_clan} isLoading={false} />
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={selectedEvent?.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex flex-col md:flex-row gap-4">
                  <Select value={selectedEvent?.id} onValueChange={id => setSelectedEvent(events.find(e => e.id === id))}>
                    <SelectTrigger className="bg-blue-800/50 border-blue-700 text-white">
                      <SelectValue placeholder="Select event" />
                    </SelectTrigger>
                    <SelectContent className="bg-blue-900 border-blue-700 text-white">
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
                    <SelectContent className="bg-blue-900 border-blue-700 text-white">
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="mt-6 mb-8">
                  {selectedEvent && (
                    <>
                      <EventCard
                        event={selectedEvent}
                        onJoin={() => handleJoin(selectedEvent.id)}
                        onViewAgenda={() => setShowAgenda(!showAgenda)}
                        onCantAttend={() => setShowAbsence(true)}
                        onFeedback={() => setShowFeedback(true)}
                        isJoined={joinedEvents.includes(selectedEvent.id)}
                        isOrganiser={isOrganiser}
                        members={selectedEvent.leading_clan?.members}
                      />
                      <AgendaSection event={selectedEvent} isVisible={showAgenda} />
                      <AbsenceModal event={selectedEvent} isOpen={showAbsence} onClose={() => setShowAbsence(false)} />
                      <FeedbackModal event={selectedEvent} isOpen={showFeedback} onClose={() => setShowFeedback(false)} />
                    </>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </>
        )}

        {location.pathname === "/events/new" && (
          <div id="create-event-section" className="mt-6 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold">Create New Event</h2>
              <Outlet />
            {/* Create Event Form or content goes here */}
          </div>
        )}
      </div>
    </div>
  );
}
