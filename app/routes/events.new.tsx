import { useNavigation, useSubmit  } from "@remix-run/react";
import { format } from "date-fns";
import { useState,useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarIcon, Loader2, Plus, X } from "lucide-react";
import { createServerSupabase } from "~/utils/supabase.server";
import {json,LoaderFunctionArgs,redirect,type ActionFunctionArgs} from "@remix-run/node";
import Calendar from "~/components/calendar";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { toast } from "~/hooks/use-toast";
import { cn } from "~/lib/utils";
import { AgendaItem } from "~/types/events";
import { isOrganiser } from "~/utils/currentUser";
export async function loader({ request }: LoaderFunctionArgs) {
  const organiserStatus = await isOrganiser(request)  
if (!organiserStatus) {
  
  return redirect("/events")}
  
  return json({})
}

export async function action({ request }: ActionFunctionArgs) {
  const response = new Response()
  const supabase = createServerSupabase(request, response)
  const formData = await request.formData()
  const intent = formData.get("intent")
  const eventId = formData.get("eventId") as string

  try {
    
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
        type: "weeklybash",
        created_at: now,
        updated_at: now,
      }

      const { error: insertError } = await supabase.from("events").insert([newEvent])

      if (insertError) {
        console.error("Supabase error:", insertError)
        return json({ error: insertError.message }, { status: 500 })
      }

      return redirect("/events")
    }
  catch (error) {
    console.error("Error in action:", error)
    return json({ error: "Failed to process request" }, { status: 500 })
  }
}
export default function NewEvent() {
    const [date, setDate] = useState<Date>();
    const [showAddEvent, setShowAddEvent] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const submit = useSubmit();
    const navigation = useNavigation();
    const [agendaItems, setAgendaItems] = useState<Partial<AgendaItem>[]>([
        { time: "", title: "", description: "", speaker: "" },
    ]);
    const isSubmitting = navigation.state === "submitting";
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const errors: Record<string, string> = {};

        // Client-side validation
        if (!date) errors.date = "Date is required";

        // Validate agenda items
        agendaItems.forEach((item, index) => {
            if (!item.time) errors[`agenda[${index}].time`] = "Time is required";
            if (!item.title) errors[`agenda[${index}].title`] = "Title is required";
            if (!item.description) errors[`agenda[${index}].description`] = "Description is required";
        });

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        const formData = new FormData(e.currentTarget);
        formData.set("date", date?.toISOString() || "");

        // Add agenda items to form data
        agendaItems.forEach((item, index) => {
            formData.append(`agenda[${index}].time`, item.time || "");
            formData.append(`agenda[${index}].title`, item.title || "");
            formData.append(`agenda[${index}].description`, item.description || "");
            if (item.speaker) formData.append(`agenda[${index}].speaker`, item.speaker);
        });

        const result = (await submit(formData, { method: "POST" })) as unknown as { success?: boolean };

        if (result?.success) {
            toast({
                title: "Success!",
                description: "Event created successfully!",
                duration: 3000,
            });
            setShowAddEvent(false);
        }
    };

    const addAgendaItem = () => {
        setAgendaItems([...agendaItems, { time: "", title: "", description: "", speaker: "" }]);
    };

    const removeAgendaItem = (index: number) => {
        setAgendaItems(agendaItems.filter((_, i) => i !== index));
        const newErrors = { ...validationErrors };
        delete newErrors[`agenda[${index}].time`];
        delete newErrors[`agenda[${index}].title`];
        delete newErrors[`agenda[${index}].description`];
        setValidationErrors(newErrors);
    };

    const updateAgendaItem = (index: number, field: keyof AgendaItem, value: string) => {
        const newItems = [...agendaItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setAgendaItems(newItems);
        if (value) {
            const newErrors = { ...validationErrors };
            delete newErrors[`agenda[${index}].${field}`];
            setValidationErrors(newErrors);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4">
                <div>
                    <Label htmlFor="title">Event Title</Label>
                    <Input
                        id="title"
                        name="title"
                        defaultValue="Weekly Bash: BYTE-BASH-BLITZ 👊"
                        required
                        disabled={isSubmitting}
                        aria-invalid={validationErrors.title ? "true" : undefined}
                    />
                    {validationErrors.title && (
                        <p className="text-sm text-red-500 mt-1">{validationErrors.title}</p>
                    )}
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
                                        validationErrors.date && "border-red-500"
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
                        {validationErrors.date && (
                            <p className="text-sm text-red-500 mt-1">{validationErrors.date}</p>
                        )}
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
                    <Button
                        type="button"
                        onClick={addAgendaItem}
                        variant="outline"
                        size="sm"
                        disabled={isSubmitting}
                    >
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
                                        <p className="text-sm text-red-500 mt-1">
                                            {validationErrors[`agenda[${index}].time`]}
                                        </p>
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
                                        <p className="text-sm text-red-500 mt-1">
                                            {validationErrors[`agenda[${index}].title`]}
                                        </p>
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
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.history.back()}
                    disabled={isSubmitting}
                >
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
    );
}