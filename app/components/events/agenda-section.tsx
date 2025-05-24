'use client';

import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Skeleton } from '~/components/ui/skeleton';
import {
  Clock,
  Calendar,
  MapPin,
  User,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { Event, AgendaItem } from '~/types/events';

interface AgendaSectionProps {
  event: Event;
  isVisible: boolean;
  isLoading?: boolean;
  onAgendaItemClick?: (item: AgendaItem) => void;
  customHeader?: ReactNode;
  customBackground?: string;
}

export function AgendaSection({
  event,
  isVisible,
  isLoading = false,
  onAgendaItemClick,
  customHeader,
  customBackground,
}: AgendaSectionProps) {
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<AgendaItem | null>(null);

  const handleItemClick = (item: AgendaItem, index: number) => {
    if (onAgendaItemClick) {
      onAgendaItemClick(item);
    } else {
      setSelectedItem(item);
    }
    setExpandedItem(expandedItem === index ? null : index);
  };

  const backgroundStyle = {
    backgroundImage: customBackground
      ? `url('${customBackground}')`
      : `url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-01-24%20at%2000.49.00-8Q8hni4GI8mrTfZP6fUya29z2NKYuz.jpeg')`,
    backgroundPosition: 'bottom',
    backgroundSize: 'cover',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="mt-6 rounded-lg overflow-hidden bg-[#1e3a8a] shadow-xl">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-blue-900 to-blue-800 p-6">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-6 w-1/3" />
                </div>
              ) : (
                <>
                  {customHeader || (
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl font-bold text-gray-200"
                      >
                        WEEKLY BASH
                        <div className="text-2xl mt-1">
                          BYTE-BASH-BLITZ <span className="text-2xl">👊</span>
                        </div>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-right text-gray-300 space-y-2"
                      >
                        <div className="flex items-center justify-end gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {format(new Date(event.date), 'dd/MM/yy')}
                          </span>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center justify-end gap-2 max-w-[300px] text-sm">
                          <MapPin className="w-4 h-4" />
                          <span>{event.venue}</span>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </>
              )}
              <div
                className="absolute bottom-0 left-0 right-0 h-16 opacity-20"
                style={backgroundStyle}
              />
            </div>

            {/* Agenda Table */}
            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="w-1/4 p-4 text-left bg-pink-400 text-white font-bold">
                      TIME
                    </th>
                    <th className="w-2/5 p-4 text-left bg-purple-400 text-white font-bold">
                      EVENT
                    </th>
                    <th className="w-1/3 p-4 text-left bg-cyan-400 text-white font-bold">
                      BY
                    </th>
                    <th className="w-10 p-4 text-left bg-cyan-400 text-white font-bold"></th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading
                    ? Array.from({ length: 5 }).map((_, index) => (
                        <tr key={index} className="border-b border-blue-800">
                          <td className="p-4 bg-slate-700/50">
                            <Skeleton className="h-6 w-24" />
                          </td>
                          <td className="p-4 bg-slate-700/50">
                            <Skeleton className="h-6 w-48" />
                          </td>
                          <td className="p-4 bg-slate-700/50">
                            <Skeleton className="h-6 w-32" />
                          </td>
                          <td className="p-4 bg-slate-700/50">
                            <Skeleton className="h-6 w-6" />
                          </td>
                        </tr>
                      ))
                    : event.agenda.map((item, index) => (
                        <motion.tr
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border-b border-blue-800 cursor-pointer hover:bg-slate-700/70"
                          onClick={() => handleItemClick(item, index)}
                        >
                          <td className="p-4 bg-slate-700/50 text-white">
                            {item.time}
                          </td>
                          <td className="p-4 bg-slate-700/50 text-white">
                            <div>{item.title}</div>
                            {expandedItem === index && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-sm text-gray-300 mt-2"
                              >
                                {item.description}
                              </motion.div>
                            )}
                          </td>
                          <td className="p-4 bg-slate-700/50 text-white">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              {item.speaker || '-'}
                            </div>
                          </td>
                          <td className="p-4 bg-slate-700/50 text-white">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-gray-300 hover:text-white"
                            >
                              {expandedItem === index ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </Button>
                          </td>
                        </motion.tr>
                      ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Wave */}
            <div className="relative h-32 bg-[#1e3a8a]">
              <div
                className="absolute bottom-0 left-0 right-0 h-16 opacity-20 transform rotate-180"
                style={backgroundStyle}
              />
            </div>
          </div>

          {/* Details Dialog */}
          <Dialog
            open={!!selectedItem}
            onOpenChange={() => setSelectedItem(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedItem?.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{selectedItem?.time}</span>
                </div>
                {selectedItem?.speaker && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <User className="w-4 h-4" />
                    <span>{selectedItem.speaker}</span>
                  </div>
                )}
                <p className="text-gray-700">{selectedItem?.description}</p>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
