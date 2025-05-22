'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import type { Event } from '~/types/events';
import { Clock } from 'lucide-react';

interface AgendaModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
}

export function AgendaModal({ event, isOpen, onClose }: AgendaModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Event Agenda</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-6">
          {event.agenda.map(
            (
              item: {
                time: string;
                title: string;
                description: string;
                speaker?: string;
              },
              index: number
            ) => (
              <div key={index} className="relative pl-6 pb-6">
                {/* Timeline */}
                {index !== event.agenda.length - 1 && (
                  <div className="absolute left-[11px] top-[24px] bottom-0 w-[2px] bg-gray-200" />
                )}
                <div className="flex gap-4">
                  <div className="absolute left-0 p-1 bg-white">
                    <div className="w-5 h-5 rounded-full bg-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <Clock className="w-4 h-4" />
                      {item.time}
                    </div>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="text-gray-600 mt-1">{item.description}</p>
                    {item.speaker && (
                      <div className="text-sm text-indigo-600 mt-2">
                        Speaker: {item.speaker}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
