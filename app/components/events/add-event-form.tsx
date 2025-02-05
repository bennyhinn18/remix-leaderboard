"use client"

import { useState } from "react"
import { useFetcher } from "@remix-run/react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { CalendarIcon, Plus, X } from "lucide-react"
import { Calendar } from "react-calendar"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { format } from "date-fns"
import { cn } from "~/lib/utils"
import { toast } from "sonner"
import type { Event, AgendaItem } from "~/types/events"

interface AddEventFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (event: Event) => void
}

export function AddEventForm({ isOpen, onClose, onSuccess }: AddEventFormProps) {
  const fetcher = useFetcher()
  const [date, setDate] = useState<Date>()
  const [agendaItems, setAgendaItems] = useState<Partial<AgendaItem>[]>([
    { time: "", title: "", description: "", presenter: "" },
  ])

  const isSubmitting = fetcher.state === "submitting"

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    // Validate required fields
    const requiredFields = ["title", "time", "venue", "clanName"]
    const missingFields = requiredFields.filter((field) => !formData.get(field))

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(", ")}`)
      return
    }

    if (!date) {
      toast.error("Please select a date")
      return
    }

    // Validate agenda items
    const invalidAgendaItems = agendaItems.filter((item) => !item.time || !item.title || !item.description)

    if (invalidAgendaItems.length > 0) {
      toast.error("Please fill in all agenda item details")
      return
    }

    // Add date and agenda items to form data
    formData.set("date", date.toISOString())
    formData.set("agenda", JSON.stringify(agendaItems))

    fetcher.submit(formData, {
      method: "post",
      action: "/events/create",
    })
  }

  // Handle form submission response
  if (fetcher.data) {
    if (fetcher.data.success) {
      toast.success("Event created successfully!")
      onSuccess(fetcher.data.event)
      onClose()
    } else {
      toast.error(fetcher.data.error || "Failed to create event")
    }
  }

  const addAgendaItem = () => {
    setAgendaItems([...agendaItems, { time: "", title: "", description: "", presenter: "" }])
  }

  const removeAgendaItem = (index: number) => {
    setAgendaItems(agendaItems.filter((_, i) => i !== index))
  }

  const updateAgendaItem = (index: number, field: keyof AgendaItem, value: string) => {
    const newItems = [...agendaItems]
    newItems[index] = { ...newItems[index], [field]: value }
    setAgendaItems(newItems)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add New Event</DialogTitle>
        </DialogHeader>
        <fetcher.Form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Event Details */}
          <div className="grid gap-4">
            <div>
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                name="title"
                required
                className="bg-gray-50 dark:bg-gray-800"
                placeholder="Weekly Bash #42: React Server Components"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  name="time"
                  placeholder="e.g., 19:00 - 21:00 IST"
                  required
                  className="bg-gray-50 dark:bg-gray-800"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="venue">Venue</Label>
              <Input
                id="venue"
                name="venue"
                required
                className="bg-gray-50 dark:bg-gray-800"
                placeholder="Discord Voice Channel / Google Meet"
              />
            </div>
          </div>

          {/* Leading Clan Details */}
          <div className="grid gap-4">
            <h3 className="font-semibold">Leading Clan Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clanName">Clan Name</Label>
                <Input
                  id="clanName"
                  name="clanName"
                  required
                  className="bg-gray-50 dark:bg-gray-800"
                  placeholder="Terminal Tigers"
                />
              </div>
              <div>
                <Label htmlFor="clanScore">Clan Score</Label>
                <Input
                  id="clanScore"
                  name="clanScore"
                  type="number"
                  min="0"
                  required
                  className="bg-gray-50 dark:bg-gray-800"
                  placeholder="1000"
                />
              </div>
            </div>
          </div>

          {/* Agenda Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Agenda</h3>
              <Button
                type="button"
                onClick={addAgendaItem}
                variant="outline"
                size="sm"
                className="hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {agendaItems.map((item, index) => (
                <div key={index} className="grid gap-4 p-4 border rounded-lg relative bg-gray-50 dark:bg-gray-800">
                  {agendaItems.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 hover:bg-gray-200 dark:hover:bg-gray-700"
                      onClick={() => removeAgendaItem(index)}
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
                        className="bg-white dark:bg-gray-900"
                      />
                    </div>
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={item.title}
                        onChange={(e) => updateAgendaItem(index, "title", e.target.value)}
                        placeholder="Introduction & Updates"
                        required
                        className="bg-white dark:bg-gray-900"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateAgendaItem(index, "description", e.target.value)}
                      placeholder="Brief overview of the session"
                      required
                      className="bg-white dark:bg-gray-900"
                    />
                  </div>

                  <div>
                    <Label>Presenter (optional)</Label>
                    <Input
                      value={item.presenter}
                      onChange={(e) => updateAgendaItem(index, "presenter", e.target.value)}
                      placeholder="John Doe"
                      className="bg-white dark:bg-gray-900"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  )
}

