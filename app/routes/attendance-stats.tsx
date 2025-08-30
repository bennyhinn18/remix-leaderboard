import { LoaderFunctionArgs, json } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import { ArrowLeft, Users, Trophy, TrendingUp, Calendar, Award, Crown, ChevronDown, ChevronRight, UserCheck, UserX } from 'lucide-react';
import { Card } from '~/components/ui/card';
import { AttendanceService } from '~/services/attendance.server';
import { createServerSupabase } from '~/utils/supabase.server';
import { motion } from 'framer-motion';
import { useState } from 'react';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const response = new Response();
    const supabase = createServerSupabase(request, response);
    const attendanceService = new AttendanceService(supabase);

    // Get the attendance hall of fame data
    const attendanceHallOfFame = await attendanceService.getAttendanceHallOfFame();

    // Transform the data to match the expected structure
    const transformedData = {
      clan_stats: attendanceHallOfFame.clanStats.map(clan => ({
        ...clan,
        clan_name: clan.clanName,
        clan_id: clan.clanId,
        attendance_percentage: Math.round(clan.attendanceRate),
        attended_members: clan.uniqueAttendees,
        total_members: clan.topAttenders.length // Use top attenders length as approximation
      })),
      event_title: 'Weekly Bash Attendance',
      event_date: new Date().toISOString().split('T')[0],
      top_clans: attendanceHallOfFame.clanStats.slice(0, 1).map(clan => ({
        clan_name: clan.clanName,
        clan_id: clan.clanId,
        attendance_percentage: Math.round(clan.attendanceRate),
        attended_members: clan.uniqueAttendees,
        total_members: clan.topAttenders.length // Use top attenders length as approximation
      })),
      has_tie: false,
      weekly_attendances: attendanceHallOfFame.weeklyAttendances,
      global_top_attenders: attendanceHallOfFame.globalTopAttenders
    };

    return json({
      attendanceData: transformedData,
      attendanceDetails: null
    });
  } catch (error) {
    console.error('Error loading attendance stats:', error);
    return json({
      attendanceData: null,
      attendanceDetails: null
    });
  }
};

export default function AttendanceStats() {
  const { attendanceData, attendanceDetails } = useLoaderData<typeof loader>();
  const [expandedClans, setExpandedClans] = useState<Set<string>>(new Set());

  const toggleClanDetails = (clanName: string) => {
    setExpandedClans(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clanName)) {
        newSet.delete(clanName);
      } else {
        newSet.add(clanName);
      }
      return newSet;
    });
  };

  // Helper function to get clan details by name (simplified since attendanceDetails is null)
  const getClanDetails = (clanName: string) => {
    // Return empty details structure since attendanceDetails is null
    return {
      attended_count: 0,
      absent_count: 0,
      attended_members: [],
      absent_members: []
    };
  };

  if (!attendanceData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link to="/" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              Back to Dashboard
            </Link>
          </div>
          
          <Card className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No Attendance Data Available</h2>
            <p className="text-gray-400">No completed weekly bash events found to display attendance statistics.</p>
          </Card>
        </div>
      </div>
    );
  }

  const { clan_stats, event_title, event_date, top_clans, has_tie } = attendanceData;

  // Format date
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Get tier colors based on attendance percentage
  const getTierColor = (percentage: number) => {
    if (percentage >= 90) return 'from-yellow-500 to-orange-500'; // Gold
    if (percentage >= 75) return 'from-gray-300 to-gray-400'; // Silver
    if (percentage >= 60) return 'from-amber-600 to-amber-700'; // Bronze
    return 'from-gray-600 to-gray-700'; // Default
  };

  const getTierIcon = (rank: number) => {
    if (rank === 0) return <Crown className="h-6 w-6" />;
    if (rank === 1) return <Trophy className="h-6 w-6" />;
    if (rank === 2) return <Award className="h-6 w-6" />;
    return <div className="h-6 w-6 flex items-center justify-center text-sm font-bold">#{rank + 1}</div>;
  };

  const getTierLabel = (rank: number) => {
    if (rank === 0) return 'Champion';
    if (rank === 1) return '2nd Place';
    if (rank === 2) return '3rd Place';
    return `${rank + 1}th Place`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          {/* Mobile layout - stacked */}
          <div className="flex flex-col gap-4 sm:hidden">
            <Link to="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-white">Clan Attendance Statistics</h1>
          </div>
          
          {/* Desktop layout - inline */}
          <div className="hidden sm:flex sm:items-center sm:gap-4">
            <Link to="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              Back to Dashboard
            </Link>
            <div className="h-6 w-px bg-gray-600" />
            <h1 className="text-3xl font-bold text-white">Clan Attendance Statistics</h1>
          </div>
        </div>

        {/* Event Info Card */}
        <Card className="mb-8 bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-500/30">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="h-6 w-6 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">{event_title}</h2>
            </div>
            <p className="text-gray-300 mb-4">{formatDate(event_date)}</p>
            
            {top_clans && top_clans.length > 0 && (
              <div className="flex items-center gap-4 p-4 bg-yellow-900/20 rounded-lg border border-yellow-500/20">
                <Crown className="h-8 w-8 text-yellow-400" />
                <div>
                  <div className="text-lg font-semibold text-white">
                    🏆 {has_tie ? `${top_clans.length} Clans Tied` : `${top_clans[0].clan_name} - Overall Winner`}
                  </div>
                  <div className="text-yellow-400 text-sm sm:text-base">
                    <div className="font-semibold">{top_clans[0].attendance_percentage}% attendance</div>
                    <div className="text-xs sm:text-sm text-yellow-300 mt-1">
                      {has_tie 
                        ? (
                          <>
                            <span className="block sm:inline">({top_clans.map(c => c.clan_name).join(', ')}</span>
                            <span className="block sm:inline sm:ml-1">all achieved this percentage)</span>
                          </>
                        )
                        : `(${top_clans[0].attended_members}/${top_clans[0].total_members} members)`
                      }
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Clan Rankings */}
        <div className="grid gap-6">
          <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-400" />
            Clan Rankings
          </h2>

          <div className="grid gap-4">
            {clan_stats.map((clan, index) => (
              <motion.div
                key={clan.clan_name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`overflow-hidden bg-gradient-to-r ${getTierColor(clan.attendance_percentage)}/10 border-gray-700/50 hover:border-gray-600/50 transition-colors`}>
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left side - Clan info */}
                      <div className="flex items-center gap-3 sm:gap-4 flex-1">
                        <div className={`p-2 sm:p-3 rounded-full bg-gradient-to-r ${getTierColor(clan.attendance_percentage)} text-white flex-shrink-0`}>
                          {getTierIcon(index)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                            <Link 
                              to={`/clans/${clan.clan_id}`}
                              className="text-lg sm:text-xl font-bold text-white hover:text-blue-400 transition-colors truncate"
                            >
                              {clan.clan_name}
                            </Link>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r ${getTierColor(clan.attendance_percentage)} text-white self-start sm:self-auto`}>
                              {getTierLabel(index)}
                            </span>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span className="sm:hidden">{clan.attended_members}/{clan.total_members} members</span>
                              <span className="hidden sm:inline">{clan.attended_members} of {clan.total_members} members attended</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right side - Percentage display */}
                      <div className="flex sm:block items-center justify-between sm:text-right">
                        <div className="text-2xl sm:text-3xl font-bold text-white mb-0 sm:mb-1">
                          {clan.attendance_percentage}%
                        </div>
                        
                        {/* Progress bar */}
                        <div className="w-20 sm:w-24 h-2 bg-gray-700 rounded-full overflow-hidden ml-4 sm:ml-0">
                          <div 
                            className={`h-full bg-gradient-to-r ${getTierColor(clan.attendance_percentage)} transition-all duration-500`}
                            style={{ width: `${clan.attendance_percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Details Toggle Button */}
                    <div className="mt-4 pt-4 border-t border-gray-700/50">
                      <button
                        onClick={() => toggleClanDetails(clan.clan_name)}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        {expandedClans.has(clan.clan_name) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        View Attendance Details
                      </button>
                    </div>

                    {/* Expandable Attendance Details */}
                    {expandedClans.has(clan.clan_name) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 pt-4 border-t border-gray-700/50"
                      >
                        {(() => {
                          const details = getClanDetails(clan.clan_name);
                          if (!details) {
                            return (
                              <p className="text-gray-400 text-sm">No detailed attendance data available.</p>
                            );
                          }

                          return (
                            <div className="grid md:grid-cols-2 gap-4">
                              {/* Attended Members */}
                              <div>
                                <h4 className="text-green-400 font-medium mb-2 flex items-center gap-2">
                                  <UserCheck className="h-4 w-4" />
                                  Attended ({details.attended_count})
                                </h4>
                                <div className="space-y-2">
                                  {details.attended_members?.length > 0 ? (
                                    details.attended_members.map((member: any) => (
                                      <div key={member.id} className="flex items-center gap-2 p-2 bg-green-900/20 rounded-lg">
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        <span className="text-white text-sm">{member.name}</span>
                                        <span className="text-xs text-green-300 bg-green-900/30 px-2 py-1 rounded">
                                          {member.title}
                                        </span>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-gray-500 text-sm">No members attended</p>
                                  )}
                                </div>
                              </div>

                              {/* Absent Members */}
                              <div>
                                <h4 className="text-red-400 font-medium mb-2 flex items-center gap-2">
                                  <UserX className="h-4 w-4" />
                                  Absent ({details.absent_count})
                                </h4>
                                <div className="space-y-2">
                                  {details.absent_members?.length > 0 ? (
                                    details.absent_members.map((member: any) => (
                                      <div key={member.id} className="flex items-center gap-2 p-2 bg-red-900/20 rounded-lg">
                                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                        <span className="text-white text-sm">{member.name}</span>
                                        <span className="text-xs text-red-300 bg-red-900/30 px-2 py-1 rounded">
                                          {member.title}
                                        </span>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-gray-500 text-sm">All members attended</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </motion.div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Back to top */}
        <div className="mt-12 text-center">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
