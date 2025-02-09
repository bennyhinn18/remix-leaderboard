"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Badge } from "~/components/ui/badge"
import { Check, X, Users, Search, Filter } from "lucide-react"
import { Input } from "~/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Skeleton } from "~/components/ui/skeleton"

interface Attendee {
    id: string
    name: string
    avatar: string
    status: "attending" | "not-attending"
    reason?: string
    joinedAt?: string
    role?: string
}

interface LeadingClan {
    id: string
    name: string
}

interface AgendaItem {
    id: string
    title: string
    description: string
    startTime: string
    endTime: string
}

interface AttendeesListProps {
    attendees?: Attendee[]
    isLoading?: boolean
    onStatusChange?: (attendeeId: string, newStatus: "attending" | "not-attending") => void
    onSearch?: (query: string) => void
    onFilter?: (filter: string) => void
    error?: string
    event: {
        id: string
        title: string
        date: string
        time: string
        venue: string
        leading_clan: LeadingClan
        agenda: AgendaItem[]
        status: "upcoming" | "ongoing" | "completed" | "cancelled"
        attendees: number
        absentees: number
        created_at: string
        updated_at: string
    }
}

export function AttendeesList({
  attendees = [],
  isLoading = false,
  onSearch,
  onFilter,
  error,
}: AttendeesListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterValue, setFilterValue] = useState("all")

  const filteredAttendees = attendees.filter((attendee) => {
    const matchesSearch = attendee.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterValue === "all" || attendee.status === filterValue
    return matchesSearch && matchesFilter
  })

  const attending = filteredAttendees.filter((a) => a.status === "attending")
  const notAttending = filteredAttendees.filter((a) => a.status === "not-attending")

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearch?.(value)
  }

  const handleFilter = (value: string) => {
    setFilterValue(value)
    onFilter?.(value)
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search attendees..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
            disabled={isLoading}
          />
        </div>
        <Select value={filterValue} onValueChange={handleFilter} disabled={isLoading}>
          <SelectTrigger className="w-full md:w-[200px] bg-white/5 border-white/10 text-white">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Attendees</SelectItem>
            <SelectItem value="attending">Attending</SelectItem>
            <SelectItem value="not-attending">Not Attending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Attendance Summary */}
      <motion.div
        className="grid grid-cols-2 gap-4"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-lg p-4 text-center">
          {isLoading ? (
            <Skeleton className="h-10 w-20 mx-auto" />
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-center gap-2 text-2xl font-bold text-green-500"
              >
                <Users className="w-6 h-6" />
                {attending.length}
              </motion.div>
              <div className="text-sm text-green-400 mt-1">Attending</div>
            </>
          )}
        </div>
        <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-lg p-4 text-center">
          {isLoading ? (
            <Skeleton className="h-10 w-20 mx-auto" />
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-center gap-2 text-2xl font-bold text-red-500"
              >
                <Users className="w-6 h-6" />
                {notAttending.length}
              </motion.div>
              <div className="text-sm text-red-400 mt-1">Not Attending</div>
            </>
          )}
        </div>
      </motion.div>

      {/* Attendees List */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Attending */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-lg p-4"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Check className="w-5 h-5 text-green-400" />
            Attending
          </h3>
          <div className="space-y-3">
            <AnimatePresence>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))
              ) : attending.length > 0 ? (
                attending.map((attendee, index) => (
                  <motion.div
                    key={attendee.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 bg-white/5 rounded-lg p-3"
                  >
                    <Avatar className="border-2 border-green-500/20">
                      <AvatarImage src={attendee.avatar} alt={attendee.name} />
                      <AvatarFallback>{attendee.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="text-white font-medium">{attendee.name}</div>
                      {attendee.role && <div className="text-gray-400 text-sm">{attendee.role}</div>}
                    </div>
                    <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                      Attending
                    </Badge>
                  </motion.div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-4">No attendees found</div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Not Attending */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-lg p-4"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <X className="w-5 h-5 text-red-400" />
            Not Attending
          </h3>
          <div className="space-y-3">
            <AnimatePresence>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32 mt-1" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))
              ) : notAttending.length > 0 ? (
                notAttending.map((attendee, index) => (
                  <motion.div
                    key={attendee.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 bg-white/5 rounded-lg p-3"
                  >
                    <Avatar className="border-2 border-red-500/20">
                      <AvatarImage src={attendee.avatar} alt={attendee.name} />
                      <AvatarFallback>{attendee.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="text-white font-medium">{attendee.name}</div>
                      {attendee.reason && <div className="text-red-400 text-sm mt-0.5">{attendee.reason}</div>}
                    </div>
                    <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">
                      Not Attending
                    </Badge>
                  </motion.div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-4">No absences found</div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

