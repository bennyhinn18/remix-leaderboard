'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Textarea } from '~/components/ui/textarea';
import { Star } from 'lucide-react';
import type { Event } from '../../types/events';
import { motion, AnimatePresence } from 'framer-motion';
import { Member } from '~/types/database';

interface FeedbackModalProps {
  event: Event;
  member: Member;
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ event, isOpen, onClose }: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [fullname, setFullName] = useState('');
  const [positives, setPositives] = useState('');
  const [negatives, setNegatives] = useState('');
  const [improvements, setImprovements] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'bashers@stellamaryscoe.edu.in',
          eventId: event.id,
          eventName: event.leading_clan.name,
          rating,
          fullname,
          positives,
          negatives,
          improvements,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        console.error('Failed to send feedback email:', result.error);
        alert('Failed to send feedback. Try again later.');
        setIsSubmitting(false);
        return;
      }

      setIsSubmitted(true);
      setTimeout(() => {
        onClose();
        setIsSubmitted(false);
        setRating(0);
        setFullName('');
        setPositives('');
        setNegatives('');
        setImprovements('');
      }, 2000);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      alert('Unexpected error. Try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-blue-900 to-indigo-900 text-white max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-white">
            Basher {event.name} Feedback
          </DialogTitle>
        </DialogHeader>
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              className="space-y-6 overflow-y-auto flex-1 px-1 py-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Star Rating */}
              <div className="space-y-2">
                <label
                  htmlFor="overall-rating"
                  className="text-sm font-medium text-blue-200"
                >
                  Overall Rating
                </label>
                <div id="overall-rating" className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onHoverStart={() => setHoveredRating(star)}
                      onHoverEnd={() => setHoveredRating(0)}
                      whileHover={{ scale: 1.2 }}
                      className="p-1"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= (hoveredRating || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-blue-300'
                        }`}
                      />
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Feedback Fields */}
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="fullName"
                    className="text-sm font-medium text-blue-200"
                  >
                    Full Name
                  </label>
                  <input
                    id="fullname"
                    type="text"
                    value={fullname}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1 w-full rounded-md bg-blue-800/50 border border-blue-700 text-white placeholder:text-blue-300 px-3 py-2"
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="positives"
                    className="text-sm font-medium text-blue-200"
                  >
                    What went well?
                  </label>
                  <Textarea
                    id="positives"
                    value={positives}
                    onChange={(e) => setPositives(e.target.value)}
                    placeholder="Share the positives..."
                    required
                    className="mt-1 bg-blue-800/50 border-blue-700 text-white placeholder:text-blue-300"
                  />
                </div>
                <div>
                  <label
                    htmlFor="negatives"
                    className="text-sm font-medium text-blue-200"
                  >
                    What could be improved?
                  </label>
                  <Textarea
                    id="negatives"
                    value={negatives}
                    onChange={(e) => setNegatives(e.target.value)}
                    placeholder="Share your concerns..."
                    required
                    className="mt-1 bg-blue-800/50 border-blue-700 text-white placeholder:text-blue-300"
                  />
                </div>
                <div>
                  <label
                    htmlFor="improvements"
                    className="text-sm font-medium text-blue-200"
                  >
                    Suggestions for improvement (optional)
                  </label>
                  <Textarea
                    id="improvements"
                    value={improvements}
                    onChange={(e) => setImprovements(e.target.value)}
                    placeholder="Your suggestions..."
                    className="mt-1 bg-blue-800/50 border-blue-700 text-white placeholder:text-blue-300"
                  />
                </div>
              </div>

              <div className="sticky bottom-0 bg-gradient-to-t from-blue-900 to-transparent pt-4 pb-2">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                  disabled={isSubmitting || rating === 0}
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: 'linear',
                      }}
                    >
                      ⭐
                    </motion.div>
                  ) : (
                    'Submit Feedback'
                  )}
                </Button>
              </div>
            </motion.form>
          ) : (
            <motion.div
              key="success"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-8"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5 }}
                className="text-5xl mb-4"
              >
                🎉
              </motion.div>
              <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
              <p className="text-blue-200">
                Your feedback helps us improve future events.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
