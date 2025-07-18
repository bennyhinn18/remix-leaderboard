import { motion } from 'framer-motion';
import { Badge } from '~/components/ui/badge';
import { Card } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Star, Crown, Trash2, ExternalLink } from 'lucide-react';
import { getSlotStatusColor, formatSlotNumber } from '~/utils/project-showcase.client';

interface SlotDisplayProps {
  slot: {
    id: number;
    slot_number: number;
    member_name: string;
    member_github_username: string;
    member_title: string;
    status: 'allocated' | 'confirmed' | 'cancelled';
    allocated_at: string;
    avatar_url?: string;
    bash_points?: number;
    clan_name?: string;
    basher_no?: string;
  };
  index: number;
  isOrganiser?: boolean;
  onRemove?: (slotId: number) => void;
  onStatusChange?: (slotId: number, status: string) => void;
}

export function SlotDisplay({ 
  slot, 
  index, 
  isOrganiser = false, 
  onRemove,
  onStatusChange 
}: SlotDisplayProps) {
  const isTopThree = slot.slot_number <= 3;
  const statusColor = getSlotStatusColor(slot.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <Card className={`
        relative overflow-hidden transition-all duration-300 hover:scale-105
        ${isTopThree 
          ? 'bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20 border-yellow-500/40' 
          : 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30'
        }
        ${slot.status === 'cancelled' ? 'opacity-60' : ''}
      `}>
        {/* Top three indicators */}
        {isTopThree && (
          <div className="absolute top-2 right-2">
            {slot.slot_number === 1 && <Crown className="w-5 h-5 text-yellow-400" />}
            {slot.slot_number === 2 && <Star className="w-5 h-5 text-gray-300" />}
            {slot.slot_number === 3 && <Star className="w-5 h-5 text-orange-400" />}
          </div>
        )}

        {/* Organiser controls */}
        {isOrganiser && (
          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onRemove?.(slot.id)}
              className="h-6 w-6 p-0"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        )}

        <div className="p-4">
          {/* Slot number */}
          <div className="flex items-center justify-between mb-3">
            <div className={`
              w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
              ${isTopThree 
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' 
                : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
              }
            `}>
              {formatSlotNumber(slot.slot_number).replace('#', '')}
            </div>
            
            <Badge className={statusColor}>
              {slot.status}
            </Badge>
          </div>

          {/* Member info */}
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-12 h-12 border-2 border-white/20">
              <AvatarImage src={slot.avatar_url} alt={slot.member_name} />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                {slot.member_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white truncate">
                {slot.member_name}
              </h3>
              <p className="text-sm text-gray-300 truncate">
                @{slot.member_github_username}
              </p>
            </div>
          </div>

          {/* Member details */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                {slot.member_title}
              </Badge>
              {slot.bash_points && (
                <span className="text-xs text-amber-400 font-medium">
                  {slot.bash_points} pts
                </span>
              )}
            </div>
            
            {slot.clan_name && (
              <Badge variant="outline" className="text-xs text-purple-300">
                {slot.clan_name}
              </Badge>
            )}
            
            {slot.basher_no && (
              <div className="text-xs text-gray-400">
                ID: {slot.basher_no}
              </div>
            )}
          </div>

          {/* Allocation date */}
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="text-xs text-gray-400">
              Allocated: {new Date(slot.allocated_at).toLocaleDateString()}
            </div>
          </div>

          {/* Profile link */}
          <div className="mt-3">
            <a
              href={`/profile/${slot.member_github_username}`}
              className="inline-flex items-center gap-1 text-xs text-blue-300 hover:text-blue-200 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              View Profile
            </a>
          </div>
        </div>

        {/* Glow effect for top slots */}
        {isTopThree && (
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-500/10 pointer-events-none" />
        )}
      </Card>
    </motion.div>
  );
}
