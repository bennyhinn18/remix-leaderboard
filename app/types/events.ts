export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type LeadingClan = {
  name: string
  avatar: string
  score: number
}

export type AgendaItem = {
  time: string
  title: string
  description: string
  speaker?: string
}

export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string
          title: string
          date: string
          time: string
          venue: string
          leading_clan: LeadingClan
          agenda: AgendaItem[]
          status: "upcoming" | "ongoing" | "completed" | "cancelled"
          attendees: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          date: string
          time: string
          venue: string
          leading_clan: LeadingClan
          agenda: AgendaItem[]
          status?: "upcoming" | "ongoing" | "completed" | "cancelled"
          attendees?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          date?: string
          time?: string
          venue?: string
          leading_clan?: LeadingClan
          agenda?: AgendaItem[]
          status?: "upcoming" | "ongoing" | "completed" | "cancelled"
          attendees?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export interface Event {
  id: string
  title: string
  date: string
  time: string
  venue: string
  leading_clan: LeadingClan
  agenda: AgendaItem[]
  status: "upcoming" | "ongoing" | "completed" | "cancelled"
  attendees: number
  created_at: string
  updated_at: string
}