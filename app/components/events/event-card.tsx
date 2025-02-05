"use client"

import { useState } from "react"
import { Card } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Badge } from "~/components/ui/badge"
import { Calendar, Clock, MapPin, Users, Trophy, Check } from "lucide-react"
import type { Event } from "~/types/events"
import { format } from "date-fns"
import { motion } from "framer-motion"

interface EventCardProps {
  event: Event
  onViewAgenda: () => void
  onJoin: () => void
  onCantAttend: () => void
  isJoined: boolean
}

export function EventCard({ event, onViewAgenda, onJoin, onCantAttend, isJoined }: EventCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Card
      className="relative overflow-hidden transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-blue-900 to-indigo-900 text-white"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Leading Clan Banner */}
      <div className="bg-gradient-to-r from-blue-800 to-indigo-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="border-2 border-white">
              <AvatarImage src={event.leadingClan.avatar} />
              <AvatarFallback>{event.leadingClan.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-blue-200">Leading Clan</div>
              <div className="font-bold text-white">{event.leadingClan.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-blue-700 px-3 py-1 rounded-full">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="font-bold">{event.leadingClan.score}</span>
          </div>
        </div>
      </div>

      {/* Event Details */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold">{event.title}</h3>
          <Badge
            variant="outline"
            className={`
              ${
                event.status === "upcoming"
                  ? "bg-green-500 text-white border-green-400"
                  : event.status === "ongoing"
                    ? "bg-yellow-500 text-white border-yellow-400"
                    : "bg-blue-500 text-white border-blue-400"
              }
            `}
          >
            {event.status}
          </Badge>
        </div>

        <div className="space-y-3 text-blue-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{format(event.date, "MMMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{event.venue}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{event.attendees} attending</span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            onClick={onJoin}
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 relative overflow-hidden"
            disabled={isJoined}
          >
            {isJoined ? (
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Joined
              </span>
            ) : (
              "I'm Joining"
            )}
          </Button>
          <Button
            variant="outline"
            onClick={onViewAgenda}
            className="flex-1 border-blue-400 text-blue-100 hover:bg-blue-800"
          >
            View Agenda
          </Button>
          <Button
            variant="ghost"
            onClick={onCantAttend}
            className="flex-1 text-blue-200 hover:text-white hover:bg-blue-800"
          >
            Can't Attend
          </Button>
        </div>
      </div>

      {/* Decorative Elements */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 -z-10"
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 transform rotate-45 translate-x-16 -translate-y-16" />
    </Card>
  )
}

