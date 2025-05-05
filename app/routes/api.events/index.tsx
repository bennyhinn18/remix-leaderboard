import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { createServerSupabase } from "~/utils/supabase.server";
import { parseISO, isAfter, isBefore, startOfDay } from "date-fns";

function getEventStatus(date: string, time: string) {
  const eventDate = parseISO(date);
  const today = startOfDay(new Date());
  const [startTime] = time.split("-").map((t) => t.trim());
  const [hours, minutes] = startTime.split(":").map(Number);

  const eventDateTime = new Date(eventDate);
  eventDateTime.setHours(hours, minutes);

  if (isBefore(eventDateTime, today)) {
    return "completed";
  } else if (isAfter(eventDateTime, today)) {
    return "upcoming";
  } else {
    return "ongoing";
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const response = new Response();
  const supabase = createServerSupabase(request, response);
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const limit = url.searchParams.get("limit") ? parseInt(url.searchParams.get("limit") as string, 10) : 10;
    const fields = url.searchParams.get("fields") || "id,title,time,date,venue";
    console.log("Fetching events with fields:", fields);
    let query = supabase
      .from("events")
      .select(fields)
      .in("type", ["weeklybash", "others"])
      .limit(limit);
    const { data: events, error } = await query.order("date", { ascending: false }) as { data: { date: string; time: string; [key: string]: any }[] | null, error: any };
    if (error) throw error;
    
    // Update event statuses dynamically
    const updatedEvents = events?.map((event: { date: string; time: string; [key: string]: any }) => (
      { ...event, status: getEventStatus(event.date, event.time) }
    )) || [];
    
    if (status && status !== "all") {
      return json(updatedEvents.filter(event => event.status === status));
    }
    
    return json(updatedEvents);
  } catch (error) {
    console.error("Error fetching events:", error);
    return json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
