import { createServerSupabase } from '~/utils/supabase.server';

export interface ClanAttendanceStats {
  clan_id?: number;
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

      // Get all clans from the clans table as the primary source
      const { data: allClans, error: clansError } = await supabase
        .from('clans')
        .select('id, clan_name');

      if (clansError) {
        console.error('Error fetching clans:', clansError);
        return null;
      }

      // Get all members with their clan information - only count active members with specific titles
      const { data: allMembers, error: membersError } = await supabase
        .from('members')
        .select('id, clan_id, clan_name, title')
        .not('clan_id', 'is', null)
        .in('title', ['Basher', 'Organiser', 'Captain Bash']);

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

      // Initialize clan stats using clans table as the primary source
      const clanStats = new Map<string, ClanAttendanceStats>();

      // Initialize all clans from clans table
      allClans?.forEach(clan => {
        clanStats.set(clan.clan_name, {
          clan_id: clan.id,
          clan_name: clan.clan_name,
          total_members: 0,
          attended_members: 0,
          attendance_percentage: 0
        });
      });

      // Count members and attendance for each clan
      allMembers?.forEach(member => {
        if (member.clan_id) {
          // Find the clan by clan_id to ensure accuracy
          const clan = allClans?.find(c => c.id === member.clan_id);
          if (clan && clanStats.has(clan.clan_name)) {
            const stats = clanStats.get(clan.clan_name)!;
            stats.total_members++;
            
            if (attendedMemberIds.has(member.id)) {
              stats.attended_members++;
            }
          }
        }
      });

      // Remove clans with no members
      for (const [clanName, stats] of clanStats.entries()) {
        if (stats.total_members === 0) {
          clanStats.delete(clanName);
        }
      }

      // Debug logging
      console.log('Clan Stats Debug:', {
        totalClans: allClans?.length,
        totalActiveMembers: allMembers?.length,
        totalAttendance: attendance?.length,
        memberTitleBreakdown: allMembers?.reduce((acc: any, member) => {
          acc[member.title] = (acc[member.title] || 0) + 1;
          return acc;
        }, {}),
        clanStatsMap: Object.fromEntries(clanStats),
        eventId,
        eventTitle: event.title
      });

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
   * Get attendance details including which members attended for a specific event
   */
  static async getAttendanceDetails(
    request: Request, 
    eventId: string
  ): Promise<any> {
    const response = new Response();
    const supabase = createServerSupabase(request, response);

    try {
      // Get all clans
      const { data: allClans, error: clansError } = await supabase
        .from('clans')
        .select('id, clan_name');

      if (clansError) {
        console.error('Error fetching clans:', clansError);
        return null;
      }

      // Get all active members with their clan information
      const { data: allMembers, error: membersError } = await supabase
        .from('members')
        .select('id, name, clan_id, clan_name, title')
        .not('clan_id', 'is', null)
        .in('title', ['Basher', 'Organiser', 'Captain Bash']);

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

      const attendedMemberIds = new Set(attendance?.map(a => a.member_id) || []);

      // Group members by clan with attendance details
      const clanDetails = allClans?.map(clan => {
        const clanMembers = allMembers?.filter(m => m.clan_id === clan.id) || [];
        const attendedMembers = clanMembers.filter(m => attendedMemberIds.has(m.id));
        const absentMembers = clanMembers.filter(m => !attendedMemberIds.has(m.id));

        return {
          clan_id: clan.id,
          clan_name: clan.clan_name,
          total_members: clanMembers.length,
          attended_count: attendedMembers.length,
          absent_count: absentMembers.length,
          attendance_percentage: clanMembers.length > 0 
            ? Math.round((attendedMembers.length / clanMembers.length) * 100)
            : 0,
          attended_members: attendedMembers.map(m => ({
            id: m.id,
            name: m.name,
            title: m.title
          })),
          absent_members: absentMembers.map(m => ({
            id: m.id,
            name: m.name,
            title: m.title
          }))
        };
      }).filter(clan => clan.total_members > 0);

      return clanDetails;
    } catch (error) {
      console.error('Error in getAttendanceDetails:', error);
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
      // Get all clans from clans table
      const { data: clans, error: clansError } = await supabase
        .from('clans')
        .select('id, clan_name');

      if (clansError) {
        console.error('Error fetching clans:', clansError);
        return null;
      }

      // Get all members with clan info - only count active members with specific titles
      const { data: members, error: membersError } = await supabase
        .from('members')
        .select('id, name, clan_id, clan_name, title')
        .not('clan_id', 'is', null)
        .in('title', ['Basher', 'Organiser', 'Captain Bash']);

      if (membersError) {
        console.error('Error fetching members:', membersError);
        return null;
      }

      // Group members by clan using clan_id as the primary key
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
