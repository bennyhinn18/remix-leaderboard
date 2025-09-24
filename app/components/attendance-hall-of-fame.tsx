import { Trophy, Users, TrendingUp, Award, Crown, ExternalLink } from 'lucide-react';
import { Card } from '~/components/ui/card';
import { Link } from '@remix-run/react';
import type { AttendanceHallOfFameData } from '~/services/attendance.server';

interface AttendanceHallOfFameProps {
  attendanceData: AttendanceHallOfFameData | null;
  className?: string;
}

export function AttendanceHallOfFame({ attendanceData, className = '' }: AttendanceHallOfFameProps) {
  // Debug: Log the data we're getting (only in development)
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
   // console.log('AttendanceHallOfFame received data:', attendanceData);
  }
  
  // Show a debug message if no data
  if (!attendanceData || !attendanceData.clanStats || attendanceData.clanStats.length === 0) {
    // For debugging, show a placeholder instead of returning null
    return (
      // <Card className={`bg-gray-800/50 rounded-lg p-4 text-center ${className}`}>
      //   <div className="text-gray-400 text-sm">
      //     <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
      //     <p>No attendance data available</p>
      //     <p className="text-xs mt-1">
      //       Waiting for attendance records...
      //     </p>
      //   </div>
      // </Card>
      null
    );
  }
  // Transform the data to match the expected structure
  const top_clans = attendanceData.clanStats.slice(0, 3).map(clan => ({
    clan_name: clan.clanName,
    clan_id: clan.clanId,
    attendance_percentage: Math.round(clan.attendanceRate),
    attended_members: clan.uniqueAttendees,
    total_members: Math.max(clan.topAttenders.length, clan.uniqueAttendees) // Best approximation
  }));

  const event_title = 'Weekly Bash Attendance';
  // Use a fixed date format to avoid hydration mismatches
  const event_date = '2025-09-24'; // This should ideally come from the server data
  const has_tie = attendanceData.clanStats.length > 1 && 
    attendanceData.clanStats[0].attendanceRate === attendanceData.clanStats[1].attendanceRate;

  const topPercentage = top_clans[0]?.attendance_percentage || 0;
  const isFullAttendance = topPercentage === 100;

  // Format date to be more readable - use a consistent format
  const formatDate = (dateStr: string) => {
    try {
      // Use a more predictable date formatting to avoid hydration mismatches
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      const day = date.getDate();
      return `${month} ${day}, ${year}`;
    } catch {
      return dateStr;
    }
  };

  // Format clan names for display
  const formatClanNames = (clans: typeof top_clans) => {
    if (clans.length === 1) return clans[0].clan_name;
    if (clans.length === 2) return `${clans[0].clan_name} & ${clans[1].clan_name}`;
    if (clans.length <= 4) {
      const lastClan = clans[clans.length - 1].clan_name;
      const otherClans = clans.slice(0, -1).map(c => c.clan_name).join(', ');
      return `${otherClans} & ${lastClan}`;
    }
    return `${clans.slice(0, 3).map(c => c.clan_name).join(', ')} & ${clans.length - 3} others`;
  };

  const totalAttended = top_clans.reduce((sum, clan) => sum + (clan?.attended_members || 0), 0);
  const totalMembers = top_clans.reduce((sum, clan) => sum + (clan?.total_members || 0), 0);

  return (
    <Link to="/attendance-stats" className="block">
      <Card className={`relative overflow-hidden bg-gradient-to-r from-yellow-900/30 via-yellow-800/20 to-orange-900/30 border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer ${className}`}>
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -top-4 -right-4 text-yellow-400">
            <Crown className="h-24 w-24 transform rotate-12" />
          </div>
          <div className="absolute -bottom-4 -left-4 text-yellow-400">
            <Trophy className="h-20 w-20 transform -rotate-12" />
          </div>
        </div>

        <div className="relative p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Left side - Main content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-5 w-5 text-yellow-400" />
                <span className="text-sm font-medium text-yellow-400 uppercase tracking-wide">
                  Attendance Hall of Fame
                </span>
                <ExternalLink className="h-3 w-3 text-yellow-400 opacity-70" />
              </div>
            
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className="text-lg sm:text-xl font-bold text-white">
                🏆 {has_tie ? 'Tied Champions' : formatClanNames(top_clans)}
              </h3>
              {isFullAttendance && (
                <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 rounded-full">
                  <Award className="h-3 w-3 text-yellow-400" />
                  <span className="text-xs font-medium text-yellow-400">Perfect!</span>
                </div>
              )}
            </div>

            <p className="text-sm text-gray-300 mb-2">
              Achieved <span className="font-bold text-yellow-400">{topPercentage}%</span> attendance
              (<span className="text-yellow-300">{totalAttended} of {totalMembers} members</span>)
              at the latest weekly bash
            </p>

            <div className="flex items-center gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{totalAttended}/{totalMembers} clan members attended</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span>{formatDate(event_date)}</span>
              </div>
              {has_tie && (
                <div className="flex items-center gap-1 text-yellow-400">
                  <span>🤝 Tied Result</span>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Percentage display */}
          <div className="flex-shrink-0">
            <div className="relative">
              {/* Circular progress indicator */}
              <div className="w-16 h-16 sm:w-20 sm:h-20">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    className="text-gray-700"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${topPercentage * 2.83} 283`}
                    className="text-yellow-400"
                    strokeLinecap="round"
                  />
                </svg>
                
                {/* Percentage text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-lg sm:text-xl font-bold text-yellow-400">
                      {topPercentage}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Event title footer */}
        <div className="mt-3 pt-3 border-t border-gray-700/50">
          <p className="text-xs text-gray-500 italic">
            📅 {event_title}
          </p>
        </div>
      </div>
    </Card>
    </Link>
  );
}

// Simplified version for smaller spaces
export function CompactAttendanceHallOfFame({ attendanceData, className = '' }: AttendanceHallOfFameProps) {
  if (!attendanceData || !attendanceData.clanStats || attendanceData.clanStats.length === 0) {
    return null;
  }

  // Transform the data to match the expected structure
  const top_clans = attendanceData.clanStats.slice(0, 3).map(clan => ({
    clan_name: clan.clanName,
    clan_id: clan.clanId,
    attendance_percentage: Math.round(clan.attendanceRate),
    attended_members: clan.uniqueAttendees,
    total_members: Math.max(clan.topAttenders.length, clan.uniqueAttendees)
  }));

  const has_tie = attendanceData.clanStats.length > 1 && 
    attendanceData.clanStats[0].attendanceRate === attendanceData.clanStats[1].attendanceRate;

  const topClan = top_clans[0];
  
  // Safety check for topClan
  if (!topClan) {
    return null;
  }
  
  // Format clan names for compact display
  const getDisplayName = () => {
    if (!has_tie) return topClan?.clan_name || 'Unknown Clan';
    if (top_clans.length === 2) return `${top_clans[0]?.clan_name || ''} & ${top_clans[1]?.clan_name || ''}`;
    return `${top_clans.length} Clans Tied`;
  };

  return (
    <Link to="/attendance-stats" className="block">
      <div className={`flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-lg border border-yellow-500/20 hover:border-yellow-400/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer ${className}`}>
        <Crown className="h-5 w-5 text-yellow-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            🏆 {getDisplayName()}
          </p>
          <p className="text-xs text-gray-400">
            {topClan?.attendance_percentage || 0}% attendance {has_tie ? 'tie' : 'champion'}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-yellow-400">
            {topClan?.attendance_percentage || 0}%
          </div>
          <div className="text-xs text-gray-500">
            {has_tie ? `${top_clans.length} clans` : `${topClan?.attended_members || 0}/${topClan?.total_members || 0}`}
          </div>
        </div>
        <ExternalLink className="h-3 w-3 text-yellow-400 opacity-70 flex-shrink-0" />
      </div>
    </Link>
  );
}
