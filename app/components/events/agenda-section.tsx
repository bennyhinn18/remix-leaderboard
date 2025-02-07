"use client"

import { motion, AnimatePresence } from "framer-motion"
import type { Event } from "~/types/events"
import { format } from "date-fns"

interface AgendaSectionProps {
  event: Event
  isVisible: boolean
}

export function AgendaSection({ event, isVisible }: AgendaSectionProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="mt-6 rounded-lg overflow-hidden bg-[#1e3a8a]">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-blue-900 to-blue-800 p-6">
              <div className="flex justify-between items-start">
                <div className="text-3xl font-bold text-gray-200">
                  WEEKLY BASH
                  <div className="text-2xl mt-1">
                    BYTE-BASH-BLITZ <span className="text-2xl">👊</span>
                  </div>
                </div>
                <div className="text-right text-gray-300 space-y-1">
                  <div>Date : {format(event.date, "dd/MM/yy")}</div>
                  <div>Time : {event.time}</div>
                  <div className="max-w-[300px] text-sm">Facilitator : {event.venue}</div>
                </div>
              </div>
              <div
                className="absolute bottom-0 left-0 right-0 h-16 opacity-20"
                style={{
                  backgroundImage: `url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-01-24%20at%2000.49.00-8Q8hni4GI8mrTfZP6fUya29z2NKYuz.jpeg')`,
                  backgroundPosition: "bottom",
                  backgroundSize: "cover",
                }}
              />
            </div>

            {/* Agenda Table */}
            <div className="w-full">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="w-1/4 p-4 text-left bg-pink-400 text-white font-bold">TIME</th>
                    <th className="w-2/5 p-4 text-left bg-purple-400 text-white font-bold">EVENT</th>
                    <th className="w-1/3 p-4 text-left bg-cyan-400 text-white font-bold">BY</th>
                  </tr>
                </thead>
                <tbody>
                  {event.agenda.map((item, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-blue-800"
                    >
                      <td className="p-4 bg-slate-700/50 text-white">{item.time}</td>
                      <td className="p-4 bg-slate-700/50 text-white">
                        <div>{item.title}</div>
                      </td>
                      <td className="p-4 bg-slate-700/50 text-white">{item.speaker || "-"}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Wave */}
            <div className="relative h-32 bg-[#1e3a8a]">
              <div
                className="absolute bottom-0 left-0 right-0 h-16 opacity-20 transform rotate-180"
                style={{
                  backgroundImage: `url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-01-24%20at%2000.49.00-8Q8hni4GI8mrTfZP6fUya29z2NKYuz.jpeg')`,
                  backgroundPosition: "top",
                  backgroundSize: "cover",
                }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

