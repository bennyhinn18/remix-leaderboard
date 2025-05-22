'use client';

import { useState, useEffect } from 'react';
import { useFetcher } from '@remix-run/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Textarea } from '~/components/ui/textarea';
import { Input } from '~/components/ui/input';
import { Alert, AlertDescription } from '~/components/ui/alert';
import type { Event } from '../../types/events';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, AlertCircle } from 'lucide-react';
import cn from 'classnames';

interface AbsenceModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
}

export function AbsenceModal({ event, isOpen, onClose }: AbsenceModalProps) {
  interface FetcherData {
    success?: boolean;
    error?: string;
  }

  const fetcher = useFetcher<FetcherData>();
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [isSent, setIsSent] = useState(false);

  // Reset form when modal is opened/closed
  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setReason('');
      setIsSent(false);
    }
  }, [isOpen]);

  // Handle successful submission
  useEffect(() => {
    if ((fetcher.data as { success?: boolean })?.success && !isSent) {
      setIsSent(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  }, [fetcher.data, isSent, onClose]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@(stellamaryscoe\.edu\.in|gmail\.com)$/;
    return emailRegex.test(email);
  };

  const isValidForm = validateEmail(email) && reason.trim().length >= 10;
  const isSending = fetcher.state === 'submitting';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-blue-900 to-indigo-900 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Can&apos;t Attend?</DialogTitle>
        </DialogHeader>
        <AnimatePresence mode="wait">
          {!isSent ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <fetcher.Form
                method="post"
                action="/api/send-absence-notification"
                className="space-y-4"
              >
                {fetcher.data?.error && (
                  <Alert
                    variant="destructive"
                    className="bg-red-500/10 border-red-500/20 text-red-400"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{fetcher.data.error}</AlertDescription>
                  </Alert>
                )}

                {/* Hidden fields */}
                <input
                  type="hidden"
                  name="to"
                  value="bashers@stellamaryscoe.edu.in"
                />
                <input type="hidden" name="eventId" value={event.id} />
                <input type="hidden" name="eventTitle" value={event.title} />
                <input
                  type="hidden"
                  name="date"
                  value={event.date.toString()}
                />

                <div className="space-y-2">
                  <Input
                    type="email"
                    name="from"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={cn(
                      'bg-blue-800/50 border-blue-700 text-white placeholder:text-blue-300',
                      !validateEmail(email) && email && 'border-red-500'
                    )}
                    aria-invalid={
                      !validateEmail(email) && email ? 'true' : undefined
                    }
                    disabled={isSending}
                  />
                  {!validateEmail(email) && email && (
                    <p className="text-sm text-red-400">
                      Please enter a valid email address
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Textarea
                    name="reason"
                    placeholder="Please let us know why you can't attend..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    className={cn(
                      'min-h-[100px] bg-blue-800/50 border-blue-700 text-white placeholder:text-blue-300',
                      reason && reason.length < 10 && 'border-red-500'
                    )}
                    aria-invalid={
                      reason && reason.length < 10 ? 'true' : undefined
                    }
                    disabled={isSending}
                  />
                  {reason && reason.length < 10 && (
                    <p className="text-sm text-red-400">
                      Please provide a reason (minimum 10 characters)
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                    disabled={isSending || !isValidForm}
                  >
                    {isSending ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: 'linear',
                        }}
                        className="flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        <span>Sending...</span>
                      </motion.div>
                    ) : (
                      'Send Notification'
                    )}
                  </Button>
                  <p className="text-xs text-center text-blue-300">
                    Your notification will be sent to the event organizer
                  </p>
                </div>
              </fetcher.Form>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="text-center py-8"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5 }}
                className="text-5xl mb-4"
              >
                ✉️
              </motion.div>
              <h3 className="text-xl font-semibold mb-2">Notification Sent!</h3>
              <p className="text-blue-200">
                The organizers have been notified of your absence.
              </p>
              <div className="mt-4 text-sm text-blue-300">
                A confirmation has been sent to {email}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
