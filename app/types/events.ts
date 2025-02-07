export type EventStatus = "upcoming" | "ongoing" | "completed" | "cancelled"

export interface AgendaItem {
  id: string
  eventId: string
  title: string
  duration: number
  presenter?: string
  description?: string
  orderIndex: number
}

export interface Event {
  id: string
  createdAt: Date
  title: string
  description?: string
  date: Date
  location?: string
  leadingClan: string
  status: EventStatus
  attendees: number
  maxCapacity?: number
  imageUrl?: string
  agenda?: AgendaItem[]
}

export interface EventRegistration {
  id: string
  eventId: string
  userId: string
  status: "registered" | "cancelled"
  createdAt: Date
}

export interface Absence {
  id: string
  eventId: string
  userId: string
  reason: string
  createdAt: Date
}

export interface EventFeedback {
  id: string
  eventId: string
  userId: string
  rating: number
  feedback?: string
  createdAt: Date
}

