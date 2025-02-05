"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import { Textarea } from "~/components/ui/textarea"
import { Input } from "~/components/ui/input"
import type { Event } from "~/types/events"
import { motion } from "framer-motion"
import { Send } from "lucide-react"

interface AbsenceModalProps {
  event: Event
  isOpen: boolean
  onClose: () => void
}

export function AbsenceModal({ event, isOpen, onClose }: AbsenceModalProps) {
  const [email, setEmail] = useState("")
  const [reason, setReason] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSending(true)

    try {
      // Simulate sending email
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Log the notification
      console.log("Sending absence notification:", {
        email,
        reason,
        eventId: event.id,
        eventTitle: event.title,
        date: event.date,
      })

      setIsSending(false)
      setIsSent(true)

      // Close after showing success message
      setTimeout(() => {
        onClose()
        setIsSent(false)
        setEmail("")
        setReason("")
      }, 2000)
    } catch (error) {
      console.error("Error sending notification:", error)
      setIsSending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-blue-900 to-indigo-900 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Can't Attend?</DialogTitle>
        </DialogHeader>
        {!isSent ? (
          <motion.form onSubmit={handleSubmit} className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div>
              <Input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-blue-800/50 border-blue-700 text-white placeholder:text-blue-300"
              />
            </div>
            <div>
              <Textarea
                placeholder="Please let us know why you can't attend..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                className="min-h-[100px] bg-blue-800/50 border-blue-700 text-white placeholder:text-blue-300"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
              disabled={isSending}
            >
              {isSending ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <Send className="w-4 h-4" />
                </motion.div>
              ) : (
                "Send Notification"
              )}
            </Button>
          </motion.form>
        ) : (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-8"
          >
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }} className="text-5xl mb-4">
              ✉️
            </motion.div>
            <h3 className="text-xl font-semibold mb-2">Notification Sent!</h3>
            <p className="text-blue-200">The organizers have been notified of your absence.</p>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  )
}

