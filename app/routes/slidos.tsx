"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Plus, Calendar, Link2, MoreVertical, CheckCircle2, Copy, Repeat, UserPlus, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Label } from "~/components/ui/label"
import CalendarCom from "~/components/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { cn } from "~/lib/utils"

interface Slido {
  id: string
  name: string
  code: string
  startDate: Date
  endDate: Date
  status: "active" | "upcoming" | "past"
  owner: string
}

const mockSlidos: Slido[] = [
  {
    id: "1",
    name: "Nim",
    code: "#122846",
    startDate: new Date(2025, 2, 1),
    endDate: new Date(2025, 2, 4),
    status: "active",
    owner: "Michal Nithesh (You)",
  },
]

export default function Slidos() {
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [slidoName, setSlidoName] = useState("")

  const handleCreateSlido = (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreateFormOpen(false)
    setSlidoName("")
    setStartDate(new Date())
    setEndDate(new Date())
  }

  const filteredSlidos = mockSlidos.filter(
    (slido) =>
      slido.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slido.code.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400"
          >
            Slidos
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button onClick={() => setIsCreateFormOpen(true)} className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="w-5 h-5 mr-2" />
              Create slido
            </Button>
          </motion.div>
        </div>

        {/* Tabs and Search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={setActiveTab}>
            <TabsList className="bg-white/5 border border-white/10">
              <TabsTrigger value="all" className="data-[state=active]:bg-white/10">
                All <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">1</span>
              </TabsTrigger>
              <TabsTrigger value="active" className="data-[state=active]:bg-white/10">
                Active & upcoming <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">1</span>
              </TabsTrigger>
              <TabsTrigger value="past" className="data-[state=active]:bg-white/10">
                Past <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">0</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Column Headers */}
        <div className="grid grid-cols-3 gap-4 px-4 py-2 text-sm font-medium text-gray-400">
          <div>Slido name</div>
          <div>Status</div>
          <div className="text-right">More actions</div>
        </div>

        {/* Slidos List */}
        <motion.div layout className="space-y-2">
          {filteredSlidos.map((slido) => (
            <motion.div
              key={slido.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4"
            >
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="rounded border-gray-600" />
                  <div>
                    <div className="font-medium text-white">{slido.name}</div>
                    <div className="text-sm text-gray-400">{slido.code}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Active now</span>
                </div>

                <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-72 bg-gray-900 border border-white/10">
                      <div className="px-2 py-3 border-b border-white/10">
                        <div className="font-medium text-white">{slido.name}</div>
                        <div className="text-sm text-green-400 flex items-center gap-2 mt-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Active now
                        </div>
                        <div className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                          <Calendar className="w-4 h-4" />
                          {format(slido.startDate, "MMM d")} – {format(slido.endDate, "d, yyyy")}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">{slido.owner}</div>
                      </div>

                      <div className="p-1">
                        <DropdownMenuItem className="flex items-center gap-2">
                          <Link2 className="w-4 h-4" />
                          Copy slido link
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2">
                          <Copy className="w-4 h-4" />
                          Copy slido code
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-white/10" />

                        <DropdownMenuItem className="flex items-center gap-2">
                          <Repeat className="w-4 h-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <div className="px-2 py-1">
                          <p className="text-xs text-gray-400">
                            Create a fresh slido using polls and settings from this slido.
                          </p>
                        </div>

                        <DropdownMenuSeparator className="bg-white/10" />

                        <DropdownMenuItem className="flex items-center gap-2">
                          <UserPlus className="w-4 h-4" />
                          Transfer
                        </DropdownMenuItem>

                        <DropdownMenuItem className="flex items-center gap-2 text-red-400 focus:text-red-400">
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Create Slido Dialog */}
      <Dialog open={isCreateFormOpen} onOpenChange={setIsCreateFormOpen}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">Create slido</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateSlido} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="slido-name" className="text-white">
                Give your slido a name
              </Label>
              <Input
                id="slido-name"
                value={slidoName}
                onChange={(e) => setSlidoName(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
                placeholder="Slido name"
                required
              />
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label className="text-white">Start date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal bg-white/5 border-white/10 text-white",
                        !startDate && "text-gray-400",
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10">
                    <CalendarCom selected={startDate} onSelect={setStartDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label className="text-white">End date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal bg-white/5 border-white/10 text-white",
                        !endDate && "text-gray-400",
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10">
                    <CalendarCom selected={endDate} onSelect={setEndDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Link2 className="w-4 h-4" />
              Anyone with the code or link can participate
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCreateFormOpen(false)}
                className="bg-white/5 hover:bg-white/10 text-white"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                Create slido
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

