import { motion } from 'framer-motion';
import { Link } from '@remix-run/react';
import { 
  Trophy, 
  Sparkles, 
  Users, 
  Clock, 
  MapPin, 
  ExternalLink, 
  Calendar,
  Star,
  Presentation,
  ChevronRight,
  Zap
} from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Card } from '~/components/ui/card';

interface ProjectShowcaseBannerProps {
  isActive?: boolean;
  clanId?: number | null;
  clanName?: string;
  isLive?: boolean;
  eventDate?: string;
  venue?: string;
  totalSlots?: number;
  filledSlots?: number;
  userClanId?: number;
  eventName?: string;
  description?: string;
}

export function ProjectShowcaseBanner({ 
  isActive = false,
  clanId,
  clanName = 'Tech Innovators',
  isLive = false,
  eventDate,
  venue = 'Main Auditorium',
  totalSlots = 25,
  filledSlots = 18,
  userClanId,
  eventName = 'Project Showcase Event',
  description
}: ProjectShowcaseBannerProps) {
  if (!isActive) return null;
  const isToday = eventDate ? new Date(eventDate).toDateString() === new Date().toDateString() : false;
  const isUserClan = userClanId === clanId;
  
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'TBD';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <Card className={`relative overflow-hidden border-2 ${
        isLive 
          ? 'bg-gradient-to-r from-purple-900/40 via-pink-900/30 to-purple-900/40 border-purple-500/50' 
          : 'bg-gradient-to-r from-blue-900/40 via-cyan-900/30 to-blue-900/40 border-blue-500/50'
      }`}>
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute -top-10 -right-10"
          >
            <Trophy className="w-32 h-32 text-yellow-400" />
          </motion.div>
          <motion.div
            animate={{ 
              rotate: -360,
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 25, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute -bottom-10 -left-10"
          >
            <Sparkles className="w-28 h-28 text-purple-400" />
          </motion.div>
        </div>

        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Left side - Event Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Presentation className="w-8 h-8 text-purple-400" />
                </motion.div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
                    🚀 {eventName}
                    {isLive && (
                      <motion.div
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Badge className="bg-red-500 text-white animate-pulse">
                          LIVE NOW
                        </Badge>
                      </motion.div>
                    )}
                  </h2>
                  <p className="text-gray-300 text-lg">
                    Showcasing Innovation • Clan Challenge Event
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <span className="font-medium">
                    {isToday ? 'Today' : formatDate(eventDate)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Clock className="w-5 h-5 text-green-400" />
                  <span className="font-medium">
                    {isLive ? `Live • ${formatTime()}` : '3:00 PM - 6:00 PM'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin className="w-5 h-5 text-orange-400" />
                  <span className="font-medium">{venue}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Users className="w-5 h-5 text-purple-400" />
                  <span className="font-medium">{filledSlots}/{totalSlots} Slots</span>
                </div>
              </div>

              {/* Clan Hosting Info */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1">
                  <Trophy className="w-4 h-4 mr-1" />
                  Hosted by: {clanName}
                </Badge>
                {isUserClan && (
                  <Badge className="bg-green-500/20 text-green-300 border border-green-500/30 px-3 py-1">
                    <Star className="w-4 h-4 mr-1" />
                    Your Clan Event!
                  </Badge>
                )}
                <Badge className={`px-3 py-1 ${
                  filledSlots >= totalSlots 
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                    : 'bg-green-500/20 text-green-300 border border-green-500/30'
                }`}>
                  <Zap className="w-4 h-4 mr-1" />
                  {filledSlots >= totalSlots ? 'Full House!' : `${totalSlots - filledSlots} Spots Left`}
                </Badge>
              </div>

              {/* Description */}
              <p className="text-gray-400 max-w-2xl">
                {description || 'Join us for an exciting showcase of innovative projects! Watch talented developers present their cutting-edge solutions and compete for glory.'}
                {isUserClan && ' Your clan is hosting this prestigious event!'}
              </p>
            </div>

            {/* Right side - Call to Action */}
            <div className="flex flex-col gap-3 min-w-[200px]">
              {isLive ? (
                <>
                  <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                    <Link to="/events/project-showcase" className="flex items-center gap-2">
                      <ExternalLink className="w-5 h-5" />
                      Watch Live
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10">
                    <Link to="/events/project-showcase/manage" className="flex items-center gap-2">
                      <Presentation className="w-4 h-4" />
                      View Schedule
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white">
                    <Link to="/events/project-showcase" className="flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      Join Event
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="border-blue-500/50 text-blue-300 hover:bg-blue-500/10">
                    <Link to="/events" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      All Events
                    </Link>
                  </Button>
                </>
              )}
              
              {/* Progress Bar */}
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Event Progress</span>
                  <span>{Math.round((filledSlots / totalSlots) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(filledSlots / totalSlots) * 100}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// Compact version for smaller spaces
export function CompactProjectShowcaseBanner({ 
  clanName = "Tech Innovators",
  isLive = true,
  userClanId,
  clanId = 1,
  eventName = "Project Showcase Event"
}: Pick<ProjectShowcaseBannerProps, 'clanName' | 'isLive' | 'userClanId' | 'clanId'> & { eventName?: string }) {
  const isUserClan = userClanId === clanId;
  
  return (
    <Link to="/events/project-showcase" className="block">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
          isLive 
            ? 'bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-500/30 hover:border-purple-400/50' 
            : 'bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border-blue-500/30 hover:border-blue-400/50'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Presentation className="w-6 h-6 text-purple-400" />
            <div>
              <h3 className="font-semibold text-white flex items-center gap-2">
                🚀 {eventName}
                {isLive && (
                  <Badge className="bg-red-500 text-white text-xs">LIVE</Badge>
                )}
              </h3>
              <p className="text-sm text-gray-400">
                Hosted by {clanName} {isUserClan && '• Your Clan!'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </motion.div>
    </Link>
  );
}
