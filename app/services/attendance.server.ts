import { createServerSupabase } from '~/utils/supabase.server';

export interface ClanAttendanceStats {
  clan_name: string;
  total_members: number;
  attended_members: number;
  attendance_percentage: number;
  rank?: number;
  is_tied?: boolean;
  tied_clans?: string[];
}

export interface WeeklyBashAttendance {
  event_id: string;
  event_title: string;
  event_date: string;
  clan_stats: ClanAttendanceStats[];
  top_clans: ClanAttendanceStats[]; // For ties
  has_tie: boolean;
}

export class AttendanceService {
  /**
   * Get the most recent completed weekly bash event
   */
  static async getLatestWeeklyBashEvent(request: Request): Promise<string | null> {
    const response = new Response();
    const supabase = createServerSupabase(request, response);

    try {
      const { data: events, error } = await supabase
        .from('events')
        .select('id, title, date, status, type')
        .eq('status', 'completed')
        .ilike('title', '%weekly bash%')
        .order('date', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching latest weekly bash event:', error);
        return null;
      }

      if (!events || events.length === 0) {
        console.log('No completed weekly bash events found');
        return null;
      }

      return events[0].id;
    } catch (error) {
      console.error('Error in getLatestWeeklyBashEvent:', error);
      return null;
    }
  }

  /**
   * Calculate clan attendance statistics for a specific event
   */
  static async getClanAttendanceStats(
    request: Request, 
    eventId: string
  ): Promise<WeeklyBashAttendance | null> {
    const response = new Response();
    const supabase = createServerSupabase(request, response);

    try {
      // Get event details
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('id, title, date')
        .eq('id', eventId)
        .single();

      if (eventError || !event) {
        console.error('Error fetching event details:', eventError);
        return null;
      }

      // Get all members with their clan information - use clan_id for better accuracy
      const { data: allMembers, error: membersError } = await supabase
        .from('members')
        .select(`
          id, 
          clan_name, 
          clan_id
        `)
        .not('clan_id', 'is', null)
        .not('clan_name', 'is', null)
        .neq('clan_name', '');

      if (membersError) {
        console.error('Error fetching members:', membersError);
        return null;
      }

      // Get attendance records for this event
      const { data: attendance, error: attendanceError } = await supabase
        .from('attendance')
        .select('member_id')
        .eq('event_id', eventId);

      if (attendanceError) {
        console.error('Error fetching attendance:', attendanceError);
        return null;
      }

      // Create a set of attended member IDs for quick lookup
      const attendedMemberIds = new Set(attendance?.map(a => a.member_id) || []);

      // Group members by clan using both clan_id and clan_name for accuracy
      const clanStats = new Map<string, ClanAttendanceStats>();

      // Initialize clan stats - ensure we only count active members
      allMembers?.forEach(member => {
        if (member.clan_name && member.clan_id) {
          if (!clanStats.has(member.clan_name)) {
            clanStats.set(member.clan_name, {
              clan_name: member.clan_name,
              total_members: 0,
              attended_members: 0,
              attendance_percentage: 0
            });
          }
          
          const stats = clanStats.get(member.clan_name)!;
          stats.total_members++;
          
          if (attendedMemberIds.has(member.id)) {
            stats.attended_members++;
          }
        }
      });

      // Debug logging
      console.log('Clan Stats Debug:', {
        totalMembers: allMembers?.length,
        totalAttendance: attendance?.length,
        clanStatsMap: Object.fromEntries(clanStats),
        eventId,
        eventTitle: event.title
      });

      // Validate clan member counts against actual database
      for (const [clanName, stats] of clanStats.entries()) {
        const actualMemberCount = allMembers?.filter(m => m.clan_name === clanName).length || 0;
        if (stats.total_members !== actualMemberCount) {
          console.warn(`Clan member count mismatch for ${clanName}: calculated ${stats.total_members}, actual ${actualMemberCount}`);
          stats.total_members = actualMemberCount; // Fix the count
          
          // Recalculate attendance percentage with correct count
          stats.attendance_percentage = stats.total_members > 0 
            ? Math.round((stats.attended_members / stats.total_members) * 100)
            : 0;
        }
      }

      // Calculate percentages and sort by attendance
      const clanStatsArray: ClanAttendanceStats[] = Array.from(clanStats.values())
        .map(stats => ({
          ...stats,
          attendance_percentage: stats.total_members > 0 
            ? Math.round((stats.attended_members / stats.total_members) * 100)
            : 0
        }))
        .sort((a, b) => b.attendance_percentage - a.attendance_percentage);

      // Calculate ranks and handle ties
      let currentRank = 1;
      let previousPercentage = -1;
      const rankedClans = clanStatsArray.map((clan, index) => {
        if (clan.attendance_percentage !== previousPercentage) {
          currentRank = index + 1;
        }
        
        const isFirstPlace = clan.attendance_percentage === clanStatsArray[0]?.attendance_percentage;
        const tiedClans = clanStatsArray
          .filter(c => c.attendance_percentage === clan.attendance_percentage)
          .map(c => c.clan_name);
        
        previousPercentage = clan.attendance_percentage;
        
        return {
          ...clan,
          rank: currentRank,
          is_tied: tiedClans.length > 1,
          tied_clans: tiedClans.length > 1 ? tiedClans : undefined
        };
      });

      // Get the top performing clans (handle ties)
      const topPercentage = rankedClans[0]?.attendance_percentage || 0;
      const topClans = rankedClans.filter(clan => clan.attendance_percentage === topPercentage);
      const hasTie = topClans.length > 1;

      return {
        event_id: event.id,
        event_title: event.title,
        event_date: event.date,
        clan_stats: rankedClans,
        top_clans: topClans,
        has_tie: hasTie
      };

    } catch (error) {
      console.error('Error in getClanAttendanceStats:', error);
      return null;
    }
  }

  /**
   * Get the latest weekly bash attendance hall of fame data
   */
  static async getLatestAttendanceHallOfFame(request: Request): Promise<WeeklyBashAttendance | null> {
    try {
      const latestEventId = await this.getLatestWeeklyBashEvent(request);
      
      if (!latestEventId) {
        return null;
      }

      return await this.getClanAttendanceStats(request, latestEventId);
    } catch (error) {
      console.error('Error in getLatestAttendanceHallOfFame:', error);
      return null;
    }
  }

  /**
   * Debug function to get detailed clan membership information
   */
  static async getDetailedClanStats(request: Request): Promise<any> {
    const response = new Response();
    const supabase = createServerSupabase(request, response);

    try {
      // Get all clans
      const { data: clans, error: clansError } = await supabase
        .from('clans')
        .select('id, clan_name');

      if (clansError) {
        console.error('Error fetching clans:', clansError);
        return null;
      }

      // Get all members with clan info
      const { data: members, error: membersError } = await supabase
        .from('members')
        .select('id, name, clan_id, clan_name')
        .not('clan_id', 'is', null);

      if (membersError) {
        console.error('Error fetching members:', membersError);
        return null;
      }

      // Group members by clan for detailed view
      const clanDetails = clans?.map(clan => {
        const clanMembers = members?.filter(m => m.clan_id === clan.id) || [];
        return {
          clan_id: clan.id,
          clan_name: clan.clan_name,
          member_count: clanMembers.length,
          members: clanMembers.map(m => ({ id: m.id, name: m.name }))
        };
      });

      return {
        total_clans: clans?.length || 0,
        total_members: members?.length || 0,
        clan_details: clanDetails
      };
    } catch (error) {
      console.error('Error in getDetailedClanStats:', error);
      return null;
    }
  }
}
